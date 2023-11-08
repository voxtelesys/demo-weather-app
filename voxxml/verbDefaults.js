const conf = require('../conf.js')
const { Say, Gather } = require('./verbs.js')

// XML wrapper for <Say>, Returns an array of
// <Say> verbs if > 1 <Say> verbs generated.
const sayDefaultOptions = {
  voice: conf.tts.voice,
  language: conf.tts.language
}
module.exports.say = function(tts) {
  return (Array.isArray(tts))
    ? tts.map(s => Say(s, sayDefaultOptions))
    : Say(tts, sayDefaultOptions)
}

// XML wrapper for <Gather> verb.
const gatherDefaultOptions = {
  finishOnKey: '#',
  input: 'dtmf',
  timeout: '5'
}
module.exports.gather = function(actions, options) {
  return Gather(actions, { ...options, ...gatherDefaultOptions })
}
