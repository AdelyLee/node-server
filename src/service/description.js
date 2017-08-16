const request = require('request')
const deasync = require('deasync')
const api = require('../utils/api')
const base = require('../utils/common')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('description')
/**
 * 获取报告概要 POST /description/specialOutline/
 * @param params
 */
exports.getReportOutline = params => {
  logger.info('getReportOutline')
  let {
    isReturn = false, renderData = {}
  } = {}
  request({
    url: `${base}/description/specialOutline/`,
    method: 'post',
    json: true,
    headers: api.getRequestHeader(),
    body: params
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      isReturn = true
      renderData = data
      logger.info('getReportOutline success!')
    } else {
      logger.error('getReportOutline error: ', error)
    }
  })
  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
