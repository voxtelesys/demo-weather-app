const _ = require('lodash')
const compactHistory = {
  history: 'compact'
}

// Number formatter
module.exports.Number = function (number = '', attrs = {}) {
  return {
    Number: [
      {
        _attr: {
          ..._.pick(attrs, ['method', 'sendDigits', 'url', 'history']),
          ...compactHistory
        }
      },
      number
    ]
  }
}
