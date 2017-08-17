const request = require('request')
const qs = require('querystring')
const deasync = require('deasync')
const base = require('../utils/common')
const api = require('../utils/api')
var dateUtil = require('../utils/dateUtil')
var log4js = require('../utils/logUtil')

const logger = log4js.getLogger('report')
/**
 * 用户登录接口 GET /briefing/detail/type
 * @param params
*/
exports.getReport = (params) => {
  let { isReturn = false, renderData } = {}
  request({
    url: `${base}/briefing/detail/type?` + qs.stringify(params),
    method: 'get',
    json: true,
    headers: api.getRequestHeader(),
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      logger.info('getReport get report success!')
      isReturn = true
      renderData = data
    } else {
      logger.error('getReport get report error: ', error)
    }
  })
  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}

exports.getReportParam = function (reportParam) {
  var param = {
    type: '',
    mustWord: '', // 同现词
    mustNotWord: '', // 排除词
    shouldWord: '', // 关键词
    expression: '', // 关键词表达式
    startDate: '',
    endDate: '',
    mode: '' // 关键词模式
  }

  // 获取页面请求参数，解析参数,获得报告关键词和时间．
  param.type = reportParam.type
  if (reportParam.type === 'SPECIAL') {
    param.name = reportParam.name
  }
  param.startDate = dateUtil.formatDate(new Date(parseFloat(reportParam.startTime)), 'yyyy-MM-dd')
  param.endDate = dateUtil.formatDate(new Date(parseFloat(reportParam.endTime)), 'yyyy-MM-dd')
  param.shouldWord = reportParam.shouldWord
  param.mustWord = reportParam.mustWord
  param.mustNotWord = reportParam.mustNotWord
  param.mode = reportParam.mode

  if (reportParam.type === 'MONTHLY') {
    param.trendStartData = dateUtil.formatDate(dateUtil.addDate(new Date(parseFloat(reportParam.startTime)), 'M', -1), 'yyyy-MM-dd')
  } else if (reportParam.type === 'WEEKLY') {
    param.trendStartData = dateUtil.formatDate(dateUtil.addDate(new Date(parseFloat(reportParam.startTime)), 'd', -7), 'yyyy-MM-dd')
  }

  logger.info('getReportParam success: \n', param)

  return param
}
