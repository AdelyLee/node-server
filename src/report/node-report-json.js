/**
 * Created by lyc on 17-5-22.
 */
var fs = require('fs')
var Canvas = require('canvas')
var builder = require('./BriefingBuilder')
var node_charts = require('../charts/index')
var reportService = require('../service/report')
var report = require('./report')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('build report')

exports.getBriefingJson = function () {
  var param = global.reportParam
  let {baseReportType = '', data, briefing} = {}
  // if type is 'monthly' the service is decisionReportService, or the type is 'special' this service is specialReportService.
  if (param.type === 'MONTHLY') {
    baseReportType = 'BASE_MONTHLY'
  } else if (param.type === 'SPECIAL') {
    baseReportType = 'BASE_SPECIAL'
  } else if (param.type === 'WEEKLY') {
    baseReportType = 'BASE_WEEKLY'
  }

  var params = { type: baseReportType }
  data = reportService.getReport(params)
  logger.info('get report data \n', data)
  data = data[0]
  if (data._id) {
    delete data._id
  }
  var briefingObj = data
  // 处理数据
  briefingObj = mikeBriefing(briefingObj)

  builder.briefingDirector.createBriefing(briefingObj)
  var briefingBuilder = builder.briefingBuilder
  briefing = briefingBuilder.briefing

  // console.log('get briefing content success')

  if (param.type === 'MONTHLY') {
    briefing.type = 'MONTHLY'
  } else if (param.type === 'SPECIAL') {
    briefing.type = 'SPECIAL'
  } else if (param.type === 'WEEKLY') {
    briefing.type = 'WEEKLY'
  }

  // 获取报告 title, outline, summary, author, createTime, issue 信息．
  briefing.title = report.getBriefingTitle(param)
  // briefing.subTitle = report.getBriefingSubTitle(param)
  // briefing.issue = report.getBriefingIssue(param)
  // briefing.author = report.getBriefingAuthor(param)
  // briefing.createTime = report.getBriefingCreateTime(param)
  briefing.outline = report.getBriefingOutline(param)
  briefing.summary = report.getBriefingSummary(param)

  // 此处将对象转换为json需要支持function的转换
  return JSON.stringify(briefing, function (key, val) {
    if (typeof val === 'function') {
      return val + ''
    }
    return val
  })
}

function mikeBriefing(briefingObj) {
  var briefingBodyArray = briefingObj.briefingBody
  var briefingBody = []
  for (var item of briefingBodyArray) {
    briefingBody.push(mikeBriefingCell(item))
  }

  briefingObj.briefingBody = briefingBody
  return briefingObj
}

function mikeBriefingCell(briefingCellObj) {
  debugger
  // 获取数据
  var renderData = {}
  var method = briefingCellObj.method

  if (method !== '' && method !== undefined) {
    renderData = report[method](global.reportParam)
    briefingCellObj.option = renderData.option
    briefingCellObj.description = renderData.description
    // according to the option create the image
    // if the chart type is not keywordsCloud use echarts to draw chart

    // set font
    var projectPath = process.cwd()
    // Canvas.registerFont(path.join(projectPath + '/static/font', 'msyh.ttf'), { family: '微软雅黑'})
    var file = projectPath + '/static/images/' + briefingCellObj.chartId + '.png'
    if (briefingCellObj.chartType && briefingCellObj.chartType !== '' && briefingCellObj.chartType !== 'table' && briefingCellObj.chartType !== 'keywordsCloud') {
      node_charts.renderEcharts({
        canvas: Canvas,
        font: '14px 微软雅黑',
        path: projectPath + '/static/images/' + briefingCellObj.chartId + '.png',
        option: briefingCellObj.option,
        width: 800,
        height: 500
      })
    } else if (briefingCellObj.chartType === 'keywordsCloud') {
      node_charts.renderKeywordsCloud({
        path: projectPath + '/static/images/' + briefingCellObj.chartId + '.png',
        option: briefingCellObj.option,
        width: 400,
        height: 400
      })
    }

    if (briefingCellObj.chartType && briefingCellObj.chartType !== 'table') {
      // get the image switch to base64
      briefingCellObj.imageUrl = base64_encode(file)
    }
  }

  var briefingCellChildren = briefingCellObj.children
  var briefingCells = []

  if (briefingCellChildren.length > 0) {
    for (var item of briefingCellChildren) {
      briefingCells.push(mikeBriefingCell(item))
    }
  }

  return briefingCellObj
}

function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file)
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64')
}
