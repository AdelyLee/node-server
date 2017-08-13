const request = require('request')
const deasync = require('deasync')
const api = require('../utils/api')
const base = require('../utils/common')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('description')
/**
 * 获取报告概要 POST /description/monthLyOutline/,
 * /description/weeklyOutline/,
 * /description/specialOutline/
 * 专题的预估量也是调用该接口
 * @param params
*/
exports.getReportOutline = params => {
  logger.info('getReportOutline')
  var isReturn = false, renderData = {}, urlPath = ''
  let { type } = params
  if (type === 'MONTHLY') {
    urlPath = `${base}/description/monthLyOutline/`
  } else if (type === 'WEEKLY') {
    urlPath = `${base}/description/weeklyOutline/`
  } else if (type === 'SPECIAL') {
    urlPath = `${base}/description/specialOutline/`
  }
  request({
    url: urlPath,
    method: 'post',
    json: true,
    headers: api.getRequestHeader(),
    body: params
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      isReturn = true
      renderData = data
      logger.error('getReportOutline success ', data)
    } else {
      logger.error('getReportOutline error: ', error)
    }
  })
  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
