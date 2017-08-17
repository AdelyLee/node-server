/**
 * Created by lyc on 17-5-18.
 */
const loginService = require('../service/login')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('api utils')

exports.getRequestHeader = function () {
  let headers = { 'content-type': 'application/json' }
  if (global.token === undefined) {
    let data = loginService.login()
    let { token } = JSON.parse(data)
    logger.info('token', token)
  }
  if (global.token !== undefined) {
    headers.Authorization = global.token
  }

  return headers
}
