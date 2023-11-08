const _ = require('lodash')
const wrap = require('../tools/wrap.js')
const { respond } = require('../tools/respond.js')
const { matchRegexes } = require('../tools/utils.js')
const numbers = require('../constants/numbers.js')

const { weatherForecast } = require('../tools/apis/weather.js')
const { sendSMS } = require('../tools/apis/sms.js')

const VoxXML = require('../voxxml/response.js')
const { Answer, Pause, Set, Gather, Redirect, Hangup } = require('../voxxml/verbs.js')
const { say } = require('../voxxml/verbDefaults.js')
const { Do, If } = require('../voxxml/conditionals.js')

const express = require('express')
const router = express.Router()
module.exports = router

/*
  Entrypoint for the IVR. This will provide the captcha
  question to the caller and then redirect to the captcha-answer route.
*/
router.post('/entrypoint', wrap(async (req, res, next) => {
  const xml = new VoxXML()
  let captcha = {
    first: Math.floor(Math.random() * 10),
    second: Math.floor(Math.random() * 10),
  }
  captcha.answer = captcha.first + captcha.second

  xml.pushElem(
    Answer(),
    Pause({ length: 1 }),
    say('Hello!'),
    say('Please verify that you are a human by entering or saying the answer to this simple question.'),
    Set('captchaAnswer', captcha.answer),
    Do([
      Gather(
        say(`What is ${captcha.first} plus ${captcha.second}?`),
        { output: '_captcha', input: 'dtmf speech', numDigits: captcha.answer < 10 ? '1' : '2', timeout: '5', speechTimeout: 'auto' }
      ),
      If({ expression: '${_captcha.digits}!="" || ${_captcha.speech}!=""' }, Redirect('captcha-answer')),
      say('Sorry, I didn\'t understand that.'),
      If({ expression: '${do.n}==0' }, Pause({ length: 1 })), // skip pause on last iteration
    ], { expression: '${_captcha.digits}=="" && ${_captcha.speech}==""', maxLoops: '2' }),
    say('Please call back at a later time, thanks!'),
    Hangup()
  )
  return respond(res, xml, next)
}))

/*
  Checks the answer to the captcha question. If correct, the caller
  progresses to the next step. If incorrect, the call is terminated.
*/
router.post('/captcha-answer', wrap(async (req, res, next) => {
  const xml = new VoxXML()
  const vars = JSON.parse(req.body?.Vars || {})
  const captchaDigits = _.get(vars, '_captcha.digits')
  const captchaSpeech = _.get(vars, '_captcha.speech')
  const captchaAnswer = _.get(vars, 'captchaAnswer')

  // process DTMF
  if (captchaDigits) {
    (captchaAnswer === captchaDigits)
      ? xml.pushElem(Redirect('main'))
      : xml.pushElem([
        say('Sorry, your math doesn\'t add up. Goodbye.'),
        Hangup()
      ])
    return respond(res, xml, next)
  }

  // process ASR
  if (captchaSpeech) {
    (captchaAnswer === captchaSpeech)
      ? xml.pushElem(Redirect('main'))
      : xml.pushElem([
        say('Sorry, your math doesn\'t add up. Goodbye.'),
        Hangup()
      ])
    return respond(res, xml, next)
  }

  // fail-safe
  xml.pushElem([
    say('Sorry, your math doesn\'t add up. Goodbye.'),
    Hangup()
  ])
  return respond(res, xml, next)
}))

/*
  Main menu for the IVR.
*/
router.post('/main', wrap(async (req, res, next) => {
  const xml = new VoxXML()
  xml.pushElem([
    say('Nice job, you got the answer right! You are now in the demo weather app.'),
    say('I can help you lookup real time weather conditions or I can help you lookup the weather forecast. Which would you like to do?'),
    Do([
      Gather(
        say(','),
        { output: '_main', input: 'speech', speechTimeout: 'auto' }
      ),
      If({ expression: '${_main.speech}!=""' }, Redirect('main-answer')),
      say('Sorry, I didn\'t understand that.'),
      If({ expression: '${do.n}==0' }, [
        say('Please say something like "I want tomorrow\'s forecast" or "what is the current weather?"')
      ]), // skip pause on last iteration
    ], { expression: '${_main.speech}==""', maxLoops: '2' }),
    say('Please call back at a later time, thanks!'),
    Hangup()
  ])
  return respond(res, xml, next)
}))

/*
  Answer for the main menu.
*/
router.post('/main-answer', wrap(async (req, res, next) => {
  const xml = new VoxXML()
  const vars = JSON.parse(req.body?.Vars || {})
  const mainSpeech = _.get(vars, '_main.speech')
  const forecastPatterns = [
    /tomorrow/i,
    /next/i,
    /following/i,
    /week/i,
    /forecast/i,
    /fore\\-cast/i,
    /fore cast/i,
    /for cast/i
  ]
  xml.pushElem([
    matchRegexes(mainSpeech, forecastPatterns)
      ? [Set('redirect', 'forecast'), say('Great, I can help you find the weather forecast for tomorrow.')]
      : [Set('redirect', 'realtime'), say('Great, I can get the current weather for you.')],
    zipcodeXML()
  ])
  return respond(res, xml, next)
}))

/*
  Lookup and say the realtime weather.
*/
router.post('/forecast', wrap(async (req, res, next) => {
  const xml = new VoxXML()
  const vars = JSON.parse(req.body?.Vars || {})
  const zipcode = _.get(vars, 'zipcode')
  const { city, descriptor, temperature, wind } = await weatherForecast(zipcode)

  xml.pushElem([
    Set('type', 'forecast'),
    Set('city', city),
    Set('descriptor', descriptor),
    Set('temperature', temperature),
    Set('wind', wind),
    say(`Tomorrow's forecast for ${city} is ${descriptor} with a high of ${temperature} degrees and winds of ${wind} miles per hour.`),
    smsXML()
  ])
  return respond(res, xml, next)
}))

/*
  Lookup and say the weather forecast.
*/
router.post('/realtime', wrap(async (req, res, next) => {
  const xml = new VoxXML()
  const vars = JSON.parse(req.body?.Vars || {})
  const zipcode = _.get(vars, 'zipcode')
  const { city, descriptor, temperature, wind } = await weatherForecast(zipcode)

  xml.pushElem([
    Set('type', 'realtime'),
    Set('city', city),
    Set('descriptor', descriptor),
    Set('temperature', temperature),
    Set('wind', wind),
    say(`The current weather in ${city} is ${descriptor} with a temperature of ${temperature} degrees and winds of ${wind} miles per hour.`),
    smsXML()
  ])
  return respond(res, xml, next)
}))

/*
  Answer for the zipcode menu.
*/
router.post('/zipcode-answer', wrap(async (req, res, next) => {
  const xml = new VoxXML()
  const vars = JSON.parse(req.body?.Vars || {})
  const redirect = _.get(vars, 'redirect')
  const zipcodeDigits = _.get(vars, '_zipcode.digits')
  const zipcodeSpeech = _.get(vars, '_zipcode.speech')
  let zipcode = ''

  if (!zipcodeDigits && !zipcodeSpeech) {
    xml.pushElem([
      say('Sorry, there was a technical issue. Goodbye.'),
      Hangup()
    ])
    return respond(res, xml, next)
  }

  if (zipcodeDigits) {
    zipcode = (zipcodeDigits.match(/^\d{5}$/)) ? zipcodeDigits : ''
  } else {
    zipcode = zipcodeSpeech.split(' ').reduce((acc, word) => { return acc + (numbers[word] || word) }, '').replace(/\s/g, '')
    zipcode = (zipcode.match(/^\d{5}$/)) ? zipcode : ''
  }

  if (zipcode) {
    xml.pushElem([
      Set('zipcode', zipcode),
      Redirect(redirect),
    ])
  } else {
    xml.pushElem([
      say('Sorry, but that\'s not a valid zipcode.'),
      zipcodeXML(),
    ])
  }
  return respond(res, xml, next)
}))

/*
  Answer for the SMS menu
*/
router.post('/sms-answer', wrap(async (req, res, next) => {
  const xml = new VoxXML()
  const vars = JSON.parse(req.body?.Vars || {})
  const smsSpeech = _.get(vars, '_sms.speech')
  const type = _.get(vars, 'type')
  const city = _.get(vars, 'city')
  const descriptor = _.get(vars, 'descriptor')
  const temperature = _.get(vars, 'temperature')
  const wind = _.get(vars, 'wind')
  let message = ''

  if (type === 'forecast') {
    message = `Tomorrow's Weather:\n\nCity: ${city}\nWeather: ${descriptor}\nTemperature: ${temperature} F\nWinds: ${wind} MPH`
  } else {
    message = `Current Weather:\n\nCity: ${city}\nWeather: ${descriptor}\nTemperature: ${temperature} F\nWinds: ${wind} MPH`
  }

  if (!smsSpeech) {
    xml.pushElem([
      say('Sorry, there was a technical issue. Goodbye.'),
      Hangup()
    ])
    return respond(res, xml, next)
  }

  const smsPatterns = [
    /yes/i,
    /yep/i,
    /sure/i,
    /ok/i,
    /okay/i
  ]
  if (matchRegexes(smsSpeech, smsPatterns)) {
    await sendSMS(req.body.From, req.body.To, message)
    xml.pushElem([
      say('Okay, I just sent you the details and you should receive the text shortly. Thanks for calling in and have a great day!'),
      Hangup()
    ])
  } else {
    xml.pushElem([
      say('Okay, I won\'t send you the details. Thanks for calling in and have a great day!'),
      Hangup()
    ])
  }

  return respond(res, xml, next)
}))

/*
  XML for zipcode menu.
*/
function zipcodeXML() {
  return [
    Do([
      Gather(
        say('Please say or enter your five digit zipcode.'),
        { output: '_zipcode', input: 'dtmf speech', numDigits: '5', timeout: '5', speechTimeout: 'auto' }
      ),
      If({ expression: '${_zipcode.digits}!="" || ${_zipcode.speech}!=""' }, Redirect('zipcode-answer')),
      say('Sorry, I didn\'t understand that.'),
      If({ expression: '${do.n}==0' }, Pause({ length: 1 })), // skip pause on last iteration
    ], { expression: '${_zipcode.digits}=="" && ${_zipcode.speech}==""', maxLoops: '2' }),
    say('Please call back at a later time, thanks!'),
    Hangup()
  ]
}

/*
  XML for SMS menu.
*/
function smsXML() {
  return [
    Do([
      Gather(
        say('Would you like me to text you with the details of the weather report?'),
        { output: '_sms', input: 'speech', timeout: '5', speechTimeout: 'auto' }
      ),
      If({ expression: '${_sms.speech}!=""' }, Redirect('sms-answer')),
      say('Sorry, I didn\'t understand that.'),
      If({ expression: '${do.n}==0' }, Pause({ length: 1 })), // skip pause on last iteration
    ], { expression: '${_sms.speech}==""', maxLoops: '2' }),
    Hangup()
  ]
}
