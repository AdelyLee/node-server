/**
 * 测试monthly report js 相关接口
 */
var fs = require('fs')
const loginService = require('../src/service/login')
var reportService = require('../src/service/report')
var report = require('../src/report/node-report-json')
const monthlyService = require('../src/report/report')
const log4js = require('../src/utils/logUtil')

const logger = log4js.getLogger('article service')

let reportParam1 = {
  trendStartDate: '2017-05-01',
  startDate: '2017-06-01',
  endDate: '2017-07-01',
  mustWord: '安徽',
  shouldWord: '煤监局',
  mustNotWord: '',
  expression: '',
  // type: 'MONTHLY',
  // type: 'WEEKLY',
  type: 'SPECIAL',
  mode: 'NORMAL'
}

// monthlyService.getReportSummarize(reportParam1)
// monthlyService.getArticleTypeChart(reportParam1)
monthlyService.getArticleTrendChart(reportParam1)
// monthlyService.getArticleHotPointChart(reportParam1)
// monthlyService.getNewsEmotionPieChart(reportParam1)
// monthlyService.getFocusPeopleMapChart(reportParam1)

let reportParam2 = {
  startTime: 1495987200000,
  endTime: 1496592000000,
  mustWord: '安徽',
  shouldWord: '煤监局',
  mustNotWord: '',
  expression: '',
  name: '安徽煤监局',
  // type: 'MONTHLY'
  type: 'SPECIAL',
  // mode: 'NORMAL'
  mode: 'ADVANCED'
}

function debugMethod() {
  // 将参数设置为全局变量
  logger.info('get briefing json')
  logger.info('get briefing json param:', JSON.stringify(reportParam2))
  loginService.login()
  global.reportParam = reportService.getReportParam(reportParam2)
  logger.info('global.reportParam \n', global.reportParam)
  let briefingJson = report.getBriefingJson()

  fs.writeFile('briefing.json', briefingJson, (err) => {
    if (err) {
      logger.error('Write brifeing json error: \n', err)
      throw err
    }
    logger.info('The file has been saved!')
  })

}

// debugMethod()
