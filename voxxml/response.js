const _ = require('lodash')
const xml = require('xml')

module.exports = class VoxXML {
  constructor() {
    this.response = []
  }

  setResponse(response) {
    this.response = response
  }

  // push 1+ elements to XML payload
  pushElem() {
    for (let i = 0; i < arguments.length; i++) {
      const arg = arguments[i]
      if (Array.isArray(arg)) {
        this.response.push(..._.flattenDeep(arg))
      } else {
        this.response.push(arg)
      }
    }
  }

  // Convert to VoxXML payload
  toString() {
    return xml({
      Response: this.response
    })
  }
}
