// Voxtelesys SMS API
// Docs: smsapi.voxtelesys.com
// Notes: This API is used to send SMS messages.
const axios = require('axios')
const https = require('https')
const conf = require('../../conf.js')
const _ = require('lodash')

const $http = axios.create({
  baseURL: conf.sms.url,
  timeout: 30000, // increased since some lookups are slow
  httpsAgent: new https.Agent({
    keepAlive: true,
    rejectUnauthorized: process.env.NODE_ENV !== 'production'
  })
})

$http.interceptors.request.use(
  config => {
    _.merge(config, {
      headers: {
        Authorization: `Bearer ${conf.sms.token}`,
        'Content-Type': 'application/json'
      }
    })
    return config
  },
  error => {
    console.error({ message: 'SMS API request failure', error })
    return Promise.reject(error)
  }
)

$http.interceptors.response.use(
  response => {
    if (_.has(response, 'data.error')) {
      console.error({ message: 'SMS API response failure', data: response.data })
    }
    return response
  },
  error => {
    console.error({ message: 'SMS API response failure', error })
    return Promise.reject(error)
  }
)

async function sendSMS(to, from, message) {
  return $http.post('/sms', {
    to: [to],
    from,
    body: message
  })
}

module.exports = {
  sendSMS
}
