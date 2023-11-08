const conf = require('./conf.js')
const express = require('express')
const app = express()

process.on('SIGINT', () => dieGracefully()) //  on ctrl-c
process.on('SIGTERM', () => dieGracefully()) // when killed by docker

main()

async function main() {
  try {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use((req, res, next) => {
      console.log({ message: 'request url', data: req.originalUrl })
      console.log({ message: 'request body', data: req.body })
      next()
    })

    app.use('/weather-demo', require('./routes/weather.js'))

    // catch-all error handling
    app.use((error, req, res, next) => {
      console.error({ message: 'catch-all error', error })
      res.sendStatus(500)
    })

    app.listen(conf.port, () => console.log(`Listening on ${conf.port}`))
  } catch (e) {
    console.error({ message: 'failed in main', data: e })
    process.exit(1)
  }
}

async function dieGracefully(exitCode = 0) {
  process.exit(exitCode)
}
