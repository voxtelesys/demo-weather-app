// XML response wrapper
module.exports.respond = function (res, xml, next) {
  console.log({ message: 'response', data: xml.toString() })
  res.contentType('application/xml')
  res.status(200).send(xml.toString())
  next()
}
