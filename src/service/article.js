const request = require('request')
const deasync = require('deasync')
const api = require('../utils/api')
const base = require('../utils/common')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('login')
/**
 * 统计查询接口 POST /es/filterAndGroupBy
 * @param params
*/
exports.getFilterAndGroupBy = params => {
  logger.info('getFilterAndGroupBy')
  var isReturn = false, renderData = {}
  request({
    url: `${base}/es/filterAndGroupBy`,
    method: 'post',
    json: true,
    headers: api.getRequestHeader(),
    body: params
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      isReturn = true
      logger.error('getFilterAndGroupBy success!')
      renderData = data
    } else {
      logger.error('getFilterAndGroupBy error: ', error)
    }
  })
  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
/**
 * 时间间隔统计查询接口 POST /es/filterAndGroupByTime
 * @param params
*/
exports.filterAndGroupByTime = params => {
  logger.info('filterAndGroupByTime')
  var isReturn = false, renderData = {}
  request({
    url: `${base}/es/filterAndGroupByTime`,
    method: 'post',
    json: true,
    headers: api.getRequestHeader(),
    body: params
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      isReturn = true
      logger.error('filterAndGroupByTime success!')
      renderData = data
    } else {
      logger.error('filterAndGroupByTime error: ', error)
    }
  })
  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
