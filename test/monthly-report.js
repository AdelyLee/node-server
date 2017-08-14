/**
 * 测试monthly report js 相关接口
 */

const monthlyService = require('../src/report/monthly-report')
let report = {
  startDate: '2017-06-01',
  endDate: '2017-07-01',
  mustWord: '安徽',
  shouldWord: '煤监局',
  mustNotWord: '',
  expression: '',
}
monthlyService.getArticleTypeChart(report)
