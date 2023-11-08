const _ = require('lodash')
const compactHistory = {
  history: 'compact'
}

// Answer formatter
module.exports.Answer = function (attrs = {}) {
  return {
    Answer: [
      {
        _attr: _.pick(attrs, ['history'])
      }
    ]
  }
}

// Dial formatter
module.exports.Dial = function (nouns = [], attrs = {}) {
  const Dial = [{
    _attr: {
      ..._.pick(attrs, ['action', 'answerOnBridge', 'callerID', 'hangupOnStar', 'method', 'output', 'record', 'recordingTrack', 'ringTone', 'timeout', 'timeLimit', 'trim', 'history']),
      ...compactHistory
    }
  }]
  if (Array.isArray(nouns)) {
    Dial.push(...nouns)
  } else {
    Dial.push(nouns)
  }
  return { Dial }
}

// Gather formatter
module.exports.Gather = function (verbs = [], attrs = {}) {
  const Gather = [{
    _attr: {
      ..._.pick(attrs, ['action', 'actionOnEmptyResult', 'finishOnKey', 'input', 'language', 'method', 'numDigits', 'output', 'profanityFilter', 'speechTimeout', 'timeout', 'history']),
      ...compactHistory
    }
  }]
  if (Array.isArray(verbs)) {
    Gather.push(...verbs)
  } else {
    Gather.push(verbs)
  }
  return { Gather }
}

// Hangup formatter
module.exports.Hangup = function (attrs = {}) {
  return {
    Hangup: [
      {
        _attr: {
          ..._.pick(attrs, ['history']),
          ...compactHistory
        }
      }
    ]
  }
}

// Pause formatter
module.exports.Pause = function (attrs = {}) {
  return {
    Pause: [
      {
        _attr: {
          ..._.pick(attrs, ['length', 'history']),
          ...compactHistory
        }
      }
    ]
  }
}

// Play formatter
module.exports.Play = function (url = '', attrs = {}) {
  return {
    Play: [
      {
        _attr: {
          ..._.pick(attrs, ['loop', 'digits', 'history']),
          ...compactHistory
        }
      },
      url
    ]
  }
}

// Redirect formatter
module.exports.Redirect = function (url = '', attrs = {}) {
  return {
    Redirect: [
      {
        _attr: _.pick(attrs, ['method', 'history'])
      },
      url
    ]
  }
}

// Reject formatter
module.exports.Reject = function (attrs = {}) {
  return {
    Reject: [
      {
        _attr: {
          ..._.pick(attrs, ['reason', 'history']),
          ...compactHistory
        }
      }
    ]
  }
}

// Say formatter
module.exports.Say = function (text = '', attrs = {}) {
  return {
    Say: [
      {
        _attr: {
          ..._.pick(attrs, ['voice', 'language', 'loop', 'history']),
          ...compactHistory
        }
      },
      text
    ]
  }
}

// Set formatter
module.exports.Set = function (output = '', value = '', attrs = {}) {
  return {
    Set: [
      {
        _attr: { output, ..._.pick(attrs, ['history']) }
      },
      value
    ]
  }
}

// Unset formatter
module.exports.Unset = function (output = '', attrs = {}) {
  return {
    Unset: [
      {
        _attr: { output, ..._.pick(attrs, ['history']) }
      },
    ]
  }
}
