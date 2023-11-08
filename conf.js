if (!['production', 'staging'].includes(process.env.NODE_ENV)) {
  const dotenv = require('dotenv') // fill process.env with settings from .env
  const join = require('path').join
  dotenv.config({ path: join(__dirname, 'env.development') })
}

module.exports = {
  // Listening port
  port: process.env.PORT || 4000,

  // Text-To-Speech credentials for
  // AWS Polly integration
  tts: {
    voice: process.env.TTS_VOICE || 'Polly.Matthew-Neural',
    language: process.env.TTS_LANGUAGE || 'en-US'
  },

  // Tomorrow API credentials
  tomorrow: {
    url: process.env.TOMORROW_URL || 'https://api.tomorrow.io/v4',
    token: process.env.TOMORROW_TOKEN
  },

  // Voxtelesys SMS credentials
  sms: {
    url: process.env.SMS_URL || 'https://smsapi.voxtelesys.net/api/v1',
    token: process.env.SMS_TOKEN
  }
}
