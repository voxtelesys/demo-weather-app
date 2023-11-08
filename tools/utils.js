// matches any of the regexes in the array
module.exports.matchRegexes = function (input, regexes) {
  for (let regex of regexes) {
    if (regex.test(input)) return true
  }
}
