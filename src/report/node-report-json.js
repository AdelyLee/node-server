/**
 * Created by lyc on 17-5-22.
 */
var fs = require('fs')
var Canvas = require('canvas')
var builder = require('./BriefingBuilder')
var monthlyReportService = require('./monthlyReport.js')
var specialReportService = require('./specialReport.js')
var node_charts = require('../charts/index')
var reportService = require('../service/report')

var service = monthlyReportService
exports.getBriefingJson = function () {
  var param = global.reportParam
  var baseReportType = ''
  // if type is 'monthly' the service is decisionReportService, or the type is 'special' this service is specialReportService.
  if (param.type === 'MONTHLY') {
    service = monthlyReportService
    baseReportType = 'BASE_MONTHLY'
  } else if (param.type === 'SPECIAL') {
    service = specialReportService
    baseReportType = 'BASE_SPECIAL'
  } else if (param.type === 'WEEKLY') {
    service = monthlyReportService
    baseReportType = 'BASE_WEEKLY'
  }

  // var briefing = {}
  var params = { type: baseReportType }
  var briefing = reportService.getReport(params)

  var briefingData = briefing
  if (briefingData._id) {
    delete briefingData._id
  }
  var briefingObj = briefingData
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
  briefing.title = service.getBriefingTitle(param)
  // briefing.subTitle = service.getBriefingSubTitle(param)
  // briefing.issue = service.getBriefingIssue(param)
  // briefing.author = service.getBriefingAuthor(param)
  // briefing.createTime = service.getBriefingCreateTime(param)
  briefing.outline = service.getBriefingOutline(param)
  briefing.summary = service.getBriefingSummary(param)

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
  // 获取数据
  var renderData = {}
  var method = briefingCellObj.method

  if (method !== '' && method !== undefined) {
    renderData = service[method](global.reportParam)
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
