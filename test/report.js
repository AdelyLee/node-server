/**
 * 测试monthly report js 相关接口
 */

const monthlyService = require('../src/report/report')
let report = {
  trendStartData: '2017-05-01',
  startDate: '2017-06-01',
  endDate: '2017-07-01',
  mustWord: '安徽',
  shouldWord: '煤监局',
  mustNotWord: '',
  expression: '',
  // type: 'MONTHLY'
  type: 'SEPCIAL',
  mode: 'NORMAL'
}

monthlyService.getReportSummarize(report)
// monthlyService.getArticleTypeChart(report)
// monthlyService.getArticleTrendChart(report)
// monthlyService.getArticleHotPointChart(report)
// monthlyService.getNewsEmotionPieChart(report)

