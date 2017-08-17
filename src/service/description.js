const request = require('request')
const deasync = require('deasync')
const api = require('../utils/api')
const base = require('../utils/common')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('description')
/**
 * 获取报告概要 POST /description/specialOutline/
 * @param params
 * @return renderData
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

/**
 * 获取趋势图描述，当月报或周报时，与上一时间段趋势形成对比，比较两个时间段趋势的波动性 POST /description/trendOfOpinion
 * @param params
 * @return renderData
 */
exports.getTrendOfOpinion = (lastMonthNum, monthNum) => {
  logger.info('getTrendOfOpinion')
  let {
    isReturn = false, renderData = {}
  } = {}
  let params = {
    lastMonthNum: lastMonthNum,
    monthNum: monthNum
  }

  request({
    url: `${base}/description/trendOfOpinion`,
    method: 'post',
    json: true,
    headers: api.getRequestHeader(),
    body: params
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      isReturn = true
      renderData = data
      logger.info('getTrendOfOpinion success!')
    } else {
      logger.error('getTrendOfOpinion error: ', error)
    }
  })

  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
