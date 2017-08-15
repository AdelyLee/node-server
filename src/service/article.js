const request = require('request')
const qs = require('querystring')
const deasync = require('deasync')
const api = require('../utils/api')
const base = require('../utils/common')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('article service')
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
      logger.info('getFilterAndGroupBy success!')
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
exports.filterAndGroupByTime = (params, gapParams) => {
  logger.info('filterAndGroupByTime')
  var isReturn = false, renderData = {}
  debugger
  request({
    url: `${base}/es/filterAndGroupByTime?` + qs.stringify(gapParams),
    method: 'post',
    json: true,
    headers: api.getRequestHeader(),
    body: params
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      isReturn = true
      logger.info('filterAndGroupByTime success!')
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
/**
 * 新闻标题聚类 POST /es/titleTimeAxis
 * @param params
*/
exports.titleTimeAxis = params => {
  logger.info('titleTimeAxis')
  var isReturn = false, renderData = {}
  request({
    url: `${base}/es/titleTimeAxis`,
    method: 'post',
    json: true,
    headers: api.getRequestHeader(),
    body: params
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      isReturn = true
      logger.error('titleTimeAxis success!')
      renderData = data
    } else {
      logger.error('titleTimeAxis error: ', error)
    }
  })
  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
/**
 * 获取文章关键次 GET /es/hotWords.json
 * @param params
*/
exports.hotWords = params => {
  logger.info('hotWords')
  var isReturn = false, renderData = {}
  request({
    url: `${base}/es/hotWords.json?` + qs.stringify(params),
    method: 'get',
    json: true,
    headers: api.getRequestHeader(),
    body: params
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      isReturn = true
      logger.error('hotWords success!')
      renderData = data
    } else {
      logger.error('hotWords error: ', error)
    }
  })
  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
