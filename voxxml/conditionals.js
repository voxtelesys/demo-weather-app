const _ = require('lodash')

// If formatter
module.exports.If = function (attrs = {}, actions = []) {
  const If = [{
    _attr: _.pick(attrs, ['expression'])
  }]
  if (Array.isArray(actions)) {
    If.push(..._.flattenDeep(actions))
  } else {
    If.push(actions)
  }
  return { If }
}

// Do formatter
module.exports.Do = function (actions = [], attrs = {}) {
  const Do = [{
    _attr: _.pick(attrs, ['expression', 'maxLoops'])
  }]
  if (Array.isArray(actions)) {
    Do.push(..._.flattenDeep(actions))
  } else {
    Do.push(actions)
  }
  return { Do }
}
