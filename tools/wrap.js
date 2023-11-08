// pass in an asynchronous route handler to have it's promise rejection handled like a synchronous handler
// express 5.x.x does this for us if we ever upgrade
module.exports = handler => (req, res, next) => handler(req, res, next).catch(next)
