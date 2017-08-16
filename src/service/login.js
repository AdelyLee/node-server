/**
 * Created by lyc on 17-6-15.
 */
const request = require('request')
const qs = require('querystring')
const deasync = require('deasync')
const base = require('../utils/common')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('login')
/**
 * 用户登录接口 POST /login/login
 * @param params
*/
exports.login = () => {
  logger.info('user login')
  var isReturn = false, renderData = {}
  let params = {
    username: 'node_service',
    password: 'node_service_topcom',
    captcha: 'node'
  }
  request({
    url: `${base}/login/login?` + qs.stringify(params),
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      isReturn = true
      let { token } = JSON.parse(data)
      global.token = token
      renderData.token = token
      logger.info('user login success，token: ', token)
      renderData = data
    } else {
      logger.error('user login error: ', error)
    }
  })
  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}