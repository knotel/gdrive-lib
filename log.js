const ENV = process.env.NODE_ENV || process.env.env
exports.log = (ENV === 'prod' ? () => { return true } : console.log)
exports.warn = (ENV === 'prod' ? () => { return true } : console.warn)
