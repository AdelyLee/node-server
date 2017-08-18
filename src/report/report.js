/**
 * Created by lyc on 17-5-18.
 */
const articleService = require('../service/article')
const descriptionService = require('../service/description')
const utils = require('../utils/utils')
const dateUtil = require('../utils/dateUtil')
const pieChart = require('../options/pie-chart')
const lineChart = require('../options/line-chart')
const barChart = require('../options/bar-chart')
const mapChart = require('../options/map-chart')
const jQuery = require('../utils/jqueryUtil')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('report')
/**
 * 获取报告标题
 * @param report
 * @return title
 */
exports.getBriefingTitle = function (report) {
  var title = '',
    reportTime = ''
  if (report.type === 'MONTHLY') {
    reportTime = dateUtil.formatDate(dateUtil.parseDate(report.startDate), 'yyyy年MM月')
    title = '报告' + reportTime
  } else if (report.type === 'WEEKLY') {
    reportTime = dateUtil.formatDate(dateUtil.parseDate(report.startDate), 'yyyy年MM月dd日')
    title = '周报' + reportTime
  } else if (report.type === 'SPECIAL') {
    title = report.name
  }

  return title
}
/**
 * 报告子标题
 */
exports.getBriefingSubTitle = function () {
  return ''
}
/**
 * 报告期号
 */
exports.getBriefingIssue = function () {
  return ''
}
/**
 * 报告作者
 */
exports.getBriefingAuthor = function () {
  return ''
}
/**
 * 报告概述
 */
exports.getBriefingOutline = function () {
  return ''
}
/**
 * 舆情综述
 * @param report
 * @return renderData
 */
exports.getReportSummarize = function (report) {
  let {
    data,
    renderData = {},
    description = '',
    option = {}
  } = {}
  let params = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    keyword: {
      mustWord: report.mustWord,
      shouldWord: report.shouldWord,
      mustNotWord: report.mustNotWord,
      expression: report.expression
    }
  }
  data = descriptionService.getReportOutline(params)
  logger.info('getReportSummarize data \n', data)

  let {
    keywords = '', total = 0
  } = {}
  if (report.mode === 'NORMAL') {
    let mustWordArray = []
    let shouldWordArray = []

    if (report.mustWord) {
      mustWordArray = report.mustWord.split('@')
    }
    if (report.shouldWord) {
      shouldWordArray = report.shouldWord.split('@')
    }
    if (mustWordArray.length > 2) {
      mustWordArray = mustWordArray.slice(0, 2)
    }
    if (shouldWordArray.length > 2) {
      shouldWordArray = shouldWordArray.slice(0, 2)
    }

    keywords = mustWordArray.join('、') + '、' + shouldWordArray.join('、')
    keywords = keywords.substring(0, keywords.length)
  } else if (report.mode === 'ADVANCED') {
    // TODO: 当选择高级模式时关键词如何处理,暂时用一般模式的方式
    let mustWordArray = []
    let shouldWordArray = []

    if (report.mustWord) {
      mustWordArray = report.mustWord.split('@')
    }
    if (report.shouldWord) {
      shouldWordArray = report.shouldWord.split('@')
    }
    if (mustWordArray.length > 2) {
      mustWordArray = mustWordArray.slice(0, 2)
    }
    if (shouldWordArray.length > 2) {
      shouldWordArray = shouldWordArray.slice(0, 2)
    }

    keywords = mustWordArray.join('、') + '、' + shouldWordArray.join('、')
    keywords = keywords.substring(0, keywords.length)
  }
  if (data.monthCount > 0) {
    total = data.monthCount
  }
  let {
    typeItemStr = '', siteItemStr = '', titleItemStr = '', emotionItemStr = '', reportTypeStr = ''
  } = {}
  jQuery.each(data.maxType, function (i, item) {
    if (i < 3) {
      typeItemStr += '<span class="describe-redText">' + utils.resetArticleTypeName(item.key) + '（' +
        item.value + '）</span>条、'
    }
  })
  typeItemStr = typeItemStr.substring(0, typeItemStr.length - 1)
  jQuery.each(data.maxSite, function (i, item) {
    if (i < 3) {
      siteItemStr += '<span class="describe-redText">' + item.key + '（' +
        item.value + '）</span>条、'
    }
  })
  siteItemStr = siteItemStr.substring(0, siteItemStr.length - 1)
  jQuery.each(data.maxTitle, function (i, item) {
    if (i < 3) {
      titleItemStr += '以<span class="describe-redText">“' + item.key + '”</span>标题的报道具有（' +
        item.value + '）条、'
    }
  })
  titleItemStr = titleItemStr.substring(0, titleItemStr.length - 1)
  jQuery.each(data.label, function (i, item) {
    emotionItemStr += '<span class="describe-redText">' + utils.resetEmotionTypeName(item.key) + '</span>报道具有<span class="describe-redText">（' +
      item.value + '）</span>条，所占比例为<span class="describe-redText">' + (item.value * 100 / total).toFixed(2) + '%</span>,'
  })
  emotionItemStr = emotionItemStr.substring(0, emotionItemStr.length - 1)
  if (report.type === 'SPECIAL') {
    reportTypeStr = '从<span class="describe-redText">' + report.startDate + '</span>至<span class="describe-redText">' +
      report.endDate + '</span>，对以<span class="describe-redText">“' + report.name + '”</span>为主题进行数据爬取，监控发现对该主题进行报道具有'
  } else {
    let reportTime = ''
    if (report.type === 'MONTHLY') {
      reportTime = '本月'
    } else if (report.type === 'WEEKLY') {
      reportTime = '本周'
    }
    reportTypeStr = '<span class="describe-redText">' + reportTime + '</span>，监控发现对该系列关键词进行报道具有'
  }
  description = '<div class="describe-text"><div class="paragraph">根据以<span class="describe-redText">“' + keywords + '”</span>等关键字的进行互联网监控，' + reportTypeStr + '<span class="describe-redText">' + total + '</span>条，其中包含' + typeItemStr +
    '</span>。根据报道数量排序，对该主题报道最多的新闻媒体为' + siteItemStr + '。</div><div class="paragraph">对该主题，媒体采用不同的标题方式进行报道，包括' + titleItemStr + '。</div><div class="paragraph">通过对以上所有报道进行正负面舆情分析，其中' + emotionItemStr + '。</div></div>'

  renderData.description = description
  renderData.option = option

  logger.info('getReportSummarize description \n', description)

  return renderData
}

/**
 * 报告总结
 */
exports.getBriefingSummary = function () {
  return ''
}
/**
 * 载体分布情况
 * @param report
 * @return renderData
 */
exports.getArticleTypeChart = function (report) {
  let {
    data,
    renderData = {},
    description = '',
    total = 0
  } = {}
  let params = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    groupName: 'type',
    keyword: {
      mustWord: report.mustWord,
      shouldWord: report.shouldWord,
      mustNotWord: report.mustNotWord,
      expression: report.expression
    }
  }
  data = articleService.getFilterAndGroupBy(params)
  logger.info('getArticleTypeChart data \n', data)
  let chartConfig = {
    legendData: {
      show: false
    },
  }
  let renderDataTemp = []
  let renderItem = {
    name: '载体类型',
    data: []
  }
  jQuery.each(data, function (i, item) {
    let node = {}
    node.name = utils.resetArticleTypeName(item.key)
    node.value = item.value
    renderItem.data.push(node)
  })
  renderDataTemp.push(renderItem)
  let option = pieChart.getOption(renderDataTemp, chartConfig)

  if (data.length > 0) {
    // make ArticleTypeChart description
    let itemsStr = ''
    jQuery.each(data, function (i, item) {
      total += item.value
    })
    jQuery.each(renderDataTemp[0].data, function (i, item) {
      itemsStr += '<span class="describe-redText">' + item.name + '</span>类媒体发现报道了<span class="describe-redText">' +
        item.value + '</span>次，所占比例<span class="describe-redText">' + (item.value * 100 / total).toFixed(2) + '%</span>；'
    })
    itemsStr = itemsStr.substring(0, itemsStr.length - 1) + '。'
    description = '<div class="describe-text">根据互联网实时监控的所有抓取的数据按媒体报道载体分析，一共具有媒体报道<span class="describe-redText">' + total + '</span>次，' + itemsStr + '</div>'
  } else {
    description = '暂无相关数据'
  }
  renderData.option = option
  renderData.description = description

  return renderData
}
/**
 * 安全生产與情趋势
 * @param report
 * @return renderData
 */
exports.getArticleTrendChart = function (report) {
  // 当报告类型为专报时，修改趋势图开始时间
  if (report.type === 'SPECIAL') {
    report.trendStartDate = report.startDate
  }
  let {
    data,
    description = '',
    renderData = {}
  } = {}
  let params = {
    date: {
      startDate: report.trendStartDate,
      endDate: report.endDate
    },
    groupName: 'type',
    keyword: {
      mustWord: report.mustWord,
      shouldWord: report.shouldWord,
      mustNotWord: report.mustNotWord,
      expression: report.expression
    },
    type: ['article']
  }
  let gapParams = {
    gap: '1',
    dateType: 'day'
  }
  data = articleService.filterAndGroupByTime(params, gapParams)
  logger.info('getArticleTrendChart data \n', data)
  let renderDataTemp = []
  if (report.type === 'MONTHLY' || report.type === 'WEEKLY') {
    let lastTimeStart = dateUtil.parseDate(report.trendStartDate).getTime()
    let lastTimeEnd = dateUtil.parseDate(report.startDate).getTime()
    let thisTimeStart = lastTimeEnd
    let thisTimeEnd = dateUtil.parseDate(report.endDate).getTime()
    let lastRenderItem = {
      name: '',
      data: []
    }
    let thisRenderItem = {
      name: '',
      data: []
    }
    jQuery.each(data.article, function (i, item) {
      let node = {}
      let itemDate = dateUtil.parseDate(item.key)
      let itemTime = itemDate.getTime()
      if (itemTime >= lastTimeStart && itemTime < lastTimeEnd) {
        if (report.type === 'MONTHLY') {
          lastRenderItem.name = '上月'
          node.name = itemDate.getDate()
        } else if (report.type === 'WEEKLY') {
          lastRenderItem.name = '上周'
          node.name = utils.resetDate(itemDate.getDay())
        }
        node.value = item.value
        node.date = item.key
        lastRenderItem.data.push(node)
      } else if (itemTime >= thisTimeStart && itemTime < thisTimeEnd) {
        if (report.type === 'MONTHLY') {
          thisRenderItem.name = '本月'
          node.name = itemDate.getDate()
        } else if (report.type === 'WEEKLY') {
          thisRenderItem.name = '本周'
          node.name = utils.resetDate(itemDate.getDay())
        }
        node.value = item.value
        node.date = item.key
        thisRenderItem.data.push(node)
      }
    })
    renderDataTemp.push(lastRenderItem)
    renderDataTemp.push(thisRenderItem)
  } else if (report.type === 'SPECIAL') {
    for (let name in data) {
      let renderItem = {
        name: '舆情数目',
        data: []
      }
      jQuery.each(data[name], function (i, item) {
        let node = {}
        node.name = item.key
        node.date = item.key
        node.value = item.value
        renderItem.data.push(node)
      })
      renderDataTemp.push(renderItem)
    }
  }

  let chartConfig = {
    xAxisData: {
      data: []
    },
    legendData: {
      show: true
    },
  }

  // 处理报告趋势图横轴坐标显示的lable
  let categoryAxis = []
  jQuery.each(renderDataTemp, function (i, item) {
    if (item.data.length > categoryAxis.length) {
      categoryAxis = item.data
    }
  })
  jQuery.each(categoryAxis, function (i, item) {
    chartConfig.xAxisData.data.push(item.name)
  })

  let option = lineChart.getOption(renderDataTemp, chartConfig)

  data = data.article
  if (data.length > 0) {
    if (report.type === 'MONTHLY' || report.type === 'WEEKLY') {
      let {
        lastTotal = 0, thisTotal = 0
      } = {}
      let {
        waveResultStr = '', timeType = '', lastTimeStr = '', thisTimeStr = '', hotStartDateTemp = '', heightStr = '',
          thisMaxDay = '', thisMaxData = '', thisMinDay = '', thisMinData = '', lastMaxDay = '', lastMaxData = '',
          lastMinDay = '', lastMinData = ''
      } = {}
      let lastTimeItems = []
      let thisTimeItems = []
      jQuery.extend(true, lastTimeItems, renderDataTemp[0].data)
      jQuery.extend(true, thisTimeItems, renderDataTemp[1].data)
      jQuery.each(lastTimeItems, function (i, item) {
        lastTotal += item.value
      })
      jQuery.each(thisTimeItems, function (i, item) {
        thisTotal += item.value
      })
      let wave = descriptionService.getTrendOfOpinion(lastTimeItems, thisTimeItems)
      if (wave) {
        waveResultStr = '波动更大,个别话题引起舆情热度较大起伏'
      } else {
        waveResultStr = '更平稳一些,但是个别话题引起舆情热度较大起伏'
      }
      // 获取趋势图中，当月、当周或上月、上周时段内最大最小值的Index
      lastTimeItems = lastTimeItems.sort(function (a, b) {
        return b.value - a.value
      })
      thisTimeItems = thisTimeItems.sort(function (a, b) {
        return b.value - a.value
      })

      if (report.type === 'MONTHLY') {
        timeType = '月'
        let lastDate = dateUtil.parseDate(report.trendStartDate)
        let thisDate = dateUtil.addDate(dateUtil.parseDate(report.trendStartDate), 'M', 1)
        thisTimeStr = parseInt(thisDate.getMonth() + 1) + timeType
        lastTimeStr = parseInt(lastDate.getMonth() + 1) + timeType
        hotStartDateTemp = thisTimeItems[0].date

        thisMaxDay = thisTimeItems[0].name + '日'
        thisMaxData = thisTimeItems[0].value
        thisMinDay = thisTimeItems[thisTimeItems.length - 1].name + '日'
        thisMinData = thisTimeItems[thisTimeItems.length - 1].value
        lastMaxDay = lastTimeItems[0].name + '日'
        lastMaxData = lastTimeItems[0].value
        lastMinDay = lastTimeItems[lastTimeItems.length - 1].name + '日'
        lastMinData = lastTimeItems[lastTimeItems.length - 1].value
      } else if (report.type === 'WEEKLY') {
        timeType = '周'
        thisTimeStr = '本' + timeType
        lastTimeStr = '上' + timeType
        hotStartDateTemp = thisTimeItems[0].date

        thisMaxDay = thisTimeItems[0].name
        thisMaxData = thisTimeItems[0].value
        thisMinDay = thisTimeItems[thisTimeItems.length - 1].name
        thisMinData = thisTimeItems[thisTimeItems.length - 1].value
        lastMaxDay = lastTimeItems[0].name
        lastMaxData = lastTimeItems[0].value
        lastMinDay = lastTimeItems[lastTimeItems.length - 1].name
        lastMinData = lastTimeItems[lastTimeItems.length - 1].value
      }

      let waveStr = '从舆情热度趋势来看, <span class="describe-redText">' + thisTimeStr +
        '</span>的舆情热度与<span class="describe-redText">' + lastTimeStr +
        '</span>相比' + waveResultStr + '。'

      let hotStartDate = dateUtil.formatDate(dateUtil.parseDate(hotStartDateTemp), 'yyyy-MM-dd')
      let hotEndDate = dateUtil.formatDate(dateUtil.addDate(dateUtil.parseDate(hotStartDate), 'd', 1), 'yyyy-MM-dd')
      let params = {
        date: {
          startDate: hotStartDate,
          endDate: hotEndDate
        },
        groupName: 'title.raw',
        keyword: {
          mustWord: report.mustWord,
          shouldWord: report.shouldWord,
          mustNotWord: report.mustNotWord,
          expression: report.expression
        }
      }
      let heightData = articleService.getFilterAndGroupBy(params)
      let heightTempStr = ''
      jQuery.each(heightData, function (i, item) {
        if (i < 3) {
          heightTempStr += '<span class="describe-redText">＂' + item.key +
            '＂</span>话题产生<span class="describe-redText">' + item.value + '</span>篇相关报道，'
        }
      })
      heightStr = '<span class="describe-redText">' + thisMaxDay + '</span>，' + heightTempStr +
        '促使当日出现本' + timeType + '的舆情高峰。'
      // make ArticleTypeChart description
      description = '<div class="describe-text">' + waveStr + '<span class="describe-redText">' +
        thisTimeStr + '</span>中，共抓取互联网数据<span class="describe-redText">' + thisTotal +
        '</span>条，其中<span class="describe-redText">' + thisMaxDay +
        '</span>热度最高，共有数据<span class="describe-redText">' +
        thisMaxData + '</span>条。' + heightStr + '<span class="describe-redText">' +
        thisMinDay + '</span>最低，共有数据<span class="describe-redText">' + thisMinData + '</span>条。' +
        '环比<span class="describe-redText">' + lastTimeStr + '</span>，共抓取互联网数据' +
        '<span class="describe-redText">' + lastTotal + '</span>条，其中<span class="describe-redText">' + lastMaxDay +
        '</span>热度最高，共有数据<span class="describe-redText">' + lastMaxData + '</span>条。' +
        '<span class="describe-redText">' + lastMinDay +
        '</span>日最低，共有数据<span class="describe-redText">' + lastMinData + '</span>条。</div>'
      logger.info('getArticleTrendChart description \n', description)

    } else if (report.type === 'SPECIAL') {
      let renderItems = []
      jQuery.extend(true, renderItems, renderDataTemp[0].data)
      let {
        total = 0, maxDate = '', minDate = '', maxData = 0, minData = 0, heightStr = ''
      } = {}
      jQuery.each(renderItems, function (i, item) {
        total += item.value
      })
      // 获取趋势图中，当月、当周或上月、上周时段内最大最小值的Index
      renderItems = renderItems.sort(function (a, b) {
        return b.value - a.value
      })
      maxDate = renderItems[0].date
      maxData = renderItems[0].value
      minDate = renderItems[renderItems.length - 1].date
      minData = renderItems[renderItems.length - 1].value
      let hotStartDate = dateUtil.formatDate(dateUtil.parseDate(maxDate), 'yyyy-MM-dd')
      let hotEndDate = dateUtil.formatDate(dateUtil.addDate(dateUtil.parseDate(hotStartDate), 'd', 1), 'yyyy-MM-dd')
      let params = {
        date: {
          startDate: hotStartDate,
          endDate: hotEndDate
        },
        groupName: 'title.raw',
        keyword: {
          mustWord: report.mustWord,
          shouldWord: report.shouldWord,
          mustNotWord: report.mustNotWord,
          expression: report.expression
        }
      }
      let heightData = articleService.getFilterAndGroupBy(params)
      let heightTempStr = ''
      jQuery.each(heightData, function (i, item) {
        if (i < 3) {
          heightTempStr += '<span class="describe-redText">＂' + item.key +
            '＂</span>话题产生<span class="describe-redText">' + item.value + '</span>篇相关报道，'
        }
      })
      heightStr = '<span class="describe-redText">在' + maxDate + '</span>日，' + heightTempStr +
        '促使当日出现本时间段的舆情高峰。'

      // make ArticleTypeChart description
      description = '<div class="describe-text">对所有报道的' +
        '<span class="describe-redText">' + total + '</span>条数据进行按时间段走势进行分析（按天），得出<span class="describe-redText">' + maxDate +
        '</span>日热度最高，共有数据<span class="describe-redText">' + maxData + '</span>条。' +
        heightStr + '<span class="describe-redText">' + minDate +
        '</span>日最低，共有数据<span class="describe-redText">' + minData + '</span>条。</div>'

      logger.info('getArticleTrendChart description \n', description)
    }
  } else {
    description = '暂无相关数据'
  }
  renderData.option = option
  renderData.description = description

  return renderData
}
/**
 * 播舆论热度
 * @param report
 * @return renderData
 */
exports.getArticleHotPointChart = function (report) {
  let {
    data,
    description = '',
    renderData = {}
  } = {}
  let params = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    filed: 'title',
    keyword: {
      mustWord: report.mustWord,
      mustNotWord: report.mustNotWord,
      shouldWord: report.shouldWord,
      expression: report.expression
    },
    page: {
      limit: 6,
      page: 1
    },
    type: ['news']
  }

  data = articleService.titleTimeAxis(params)
  logger.info('getArticleHotPointChart data \n', data)

  data = data.content
  data = data.reverse()
  let renderDataTemp = []
  let chartConfig = {
    labelLength: 20,
    legendData: {
      show: false
    },
    gridData: {
      top: 10,
      bottom: 20
    },
    xAxisData: {
      type: 'value',
      axisLabel: {
        textStyle: {
          fontWeight: 700,
          fontSize: 20
        }
      }
    },
    yAxisData: {
      type: 'category',
      axisLabel: {
        textStyle: {
          fontWeight: 700,
          fontSize: 20
        }
      }
    }
  }
  let renderItem = {
    name: '舆论热点',
    data: []
  }
  jQuery.each(data, function (i, item) {
    var node = {}
    node.name = item.title
    node.value = item.docTotal
    renderItem.data.push(node)
  })
  renderDataTemp.push(renderItem)
  var option = barChart.getOption(renderDataTemp, chartConfig)
  // 将对象转为json格式，在此处设置labelLength, option为json
  option = utils.replaceLabelLength(option, 20)

  if (data.length > 0) {
    // make description
    let dataMonth = ''
    if (report.type === 'MONTHLY') {
      dataMonth = '本月'
    } else if (report.type === 'WEEKLY') {
      dataMonth = '本周'
    } else if (report.type === 'SPECIAL') {
      dataMonth = '针对该专题舆情'
    }
    var itemStr = ''
    data = data.reverse()
    jQuery.each(data, function (i, item) {
      if (item.title.length > 35) {
        item.title = item.title.substring(0, 35) + '...'
      }
      if (i < 3) {
        itemStr += '<span class="describe-redText">“' + item.title + '” （' + item.docTotal + '次）</span>、'
      }
    })
    itemStr = itemStr.substring(0, itemStr.length - 1)
    description = '<div class="describe-text">' + dataMonth + '媒体报道情况，从其具体内容方面也可以发现，主要话题主要集中在' +
      itemStr + '等几个方面。</div>'
  } else {
    description = '暂无相关数据'
  }
  renderData.option = option
  renderData.description = description

  return renderData
}
/**
 * 新闻情感正负面分析
 * @param report
 * @return renderData
 */
exports.getNewsEmotionPieChart = function (report) {
  let {
    total = 0, data, description = '', renderData = {}
  } = {}
  let params = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    groupName: 'nlp.sentiment.label',
    keyword: {
      mustWord: report.mustWord,
      shouldWord: report.shouldWord,
      mustNotWord: report.mustNotWord,
      expression: report.expression
    },
    type: ['news']
  }
  data = articleService.getFilterAndGroupBy(params)
  logger.info('getNewsEmotionPieChart data \n', data)
  let renderDataTemp = []
  let chartConfig = {
    legendData: {
      show: true
    }
  }
  let renderItem = {
    name: '情感分析',
    data: []
  }
  jQuery.each(data, function (i, item) {
    var node = {}
    node.name = utils.resetEmotionTypeName(item.key)
    node.value = item.value
    renderItem.data.push(node)
  })
  renderDataTemp.push(renderItem)

  let option = pieChart.getOption(renderDataTemp, chartConfig)

  if (data.length > 0) {
    let itemStr = ''
    jQuery.each(data, function (i, item) {
      total += item.value
    })
    jQuery.each(renderDataTemp[0].data, function (i, item) {
      if (i === 0) {
        itemStr += '<span class="describe-redText">' + item.name +
          '</span>情感最多有<span class="describe-redText">' + item.value +
          '</span>条， 所占比例为<span class="describe-redText">' + (item.value * 100 / total).toFixed(2) + '%</span>，'
      }
      if (i > 0) {
        itemStr += '<span class="describe-redText">' + item.name + '</span>情感数据有<span class="describe-redText">' +
          item.value + '</span>条,所占比例为<span class="describe-redText">' + (item.value * 100 / total).toFixed(2) + '%' + '</span>，'
      }
    })
    itemStr = itemStr.substring(0, itemStr.length - 1)

    description = '<div class="describe-text">根据互联网抓取的数据，对相关数据情感进行分析，' + itemStr + '。</div>'
  } else {
    description = '暂无相关数据'
  }
  renderData.option = option
  renderData.description = description

  return renderData
}
/**
 * 主流媒体报道统计
 * @param report
 * @return renderData
 */
exports.getMediaBarChart = function (report) {
  let {
    data,
    description = '',
    renderData = {}
  } = {}
  let params = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    groupName: 'site',
    keyword: {
      mustWord: report.mustWord,
      shouldWord: report.shouldWord,
      mustNotWord: report.mustNotWord,
      expression: report.expression
    },
    type: ['news']
  }

  data = articleService.getFilterAndGroupBy(params)
  logger.info('getMediaBarChart data \n', data)
  let renderDataTemp = []
  let chartConfig = {
    labelLength: 8,
    legendData: {
      show: false
    },
    gridData: {
      top: 10,
      bottom: 60
    },
    xAxisData: {
      type: 'category',
      axisLabel: {
        rotate: 45,
        textStyle: {
          fontWeight: 700,
          fontSize: 18
        }
      }
    },
    yAxisData: {
      type: 'value',
      axisLabel: {
        textStyle: {
          fontWeight: 700,
          fontSize: 18
        }
      }
    }
  }
  let renderItem = {
    name: '媒体名称',
    data: []
  }
  jQuery.each(data, function (i, item) {
    let node = {}
    node.name = item.key
    node.value = item.value
    renderItem.data.push(node)
  })
  renderDataTemp.push(renderItem)
  let option = barChart.getOption(renderDataTemp, chartConfig)
  // 将对象转为json格式，在此处设置labelLength, option为json
  option = utils.replaceLabelLength(option, 8)

  if (data.length > 0) {
    let itemStr = ''
    jQuery.each(data, function (i, item) {
      if (i < 4) {
        itemStr += '<span class="describe-redText">' + item.key + '</span>共有相关数据<span class="describe-redText">(' + item.value + ')条</span>、'
      }
    })

    itemStr = itemStr.substring(0, itemStr.length - 1)

    description = '<div class="describe-text">根据互联网抓取的数据，主流媒体报道较多的是' + itemStr + '等。</div>'

  } else {
    description = '暂无相关数据'
  }
  renderData.option = option
  renderData.description = description

  return renderData
}

/**
 * 热议网民
 * @param report
 * @return renderData
 */
exports.getHotAuthorChart = function (report) {
  let {
    data,
    description = '',
    renderData = {}
  } = {}
  let params = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    groupName: 'author',
    keyword: {
      mustWord: report.mustWord,
      shouldWord: report.shouldWord,
      mustNotWord: report.mustNotWord,
      expression: report.expression
    },
    type: ['weibo', 'bbs', 'bar']
  }

  data = articleService.getFilterAndGroupBy(params)
  logger.info('getMediaBarChart data \n', data)
  let renderDataTemp = []
  let chartConfig = {
    legendData: {
      show: false
    },
    gridData: {
      top: 10,
      bottom: 60
    },
    xAxisData: {
      type: 'category',
      axisLabel: {
        rotate: 45,
        textStyle: {
          fontWeight: 700,
          fontSize: 18
        }
      }
    },
    yAxisData: {
      type: 'value',
      axisLabel: {
        textStyle: {
          fontWeight: 700,
          fontSize: 18
        }
      }
    }
  }
  let renderItem = {
    name: '热议网民',
    data: []
  }
  jQuery.each(data, function (i, item) {
    let node = {}
    node.name = item.key
    node.value = item.value
    renderItem.data.push(node)
  })
  renderDataTemp.push(renderItem)
  let option = barChart.getOption(renderDataTemp, chartConfig)
  // 将对象转为json格式，在此处设置labelLength, option为json
  option = utils.replaceLabelLength(option, 8)

  if (data.length > 0) {
    let itemStr = ''
    jQuery.each(data, function (i, item) {
      if (i < 5) {
        itemStr += '<span class="describe-redText">' + item.key + '</span>发表观点有<span class="describe-redText">(' + item.value + ')条</span>、'
      }
    })
    let length = data.length > 5 ? 5 : data.length
    itemStr = itemStr.substring(0, itemStr.length - 1)
    description = '<div class="describe-text">对该主题的监测过程中，在微博、论坛、贴吧等自媒体参与话题讨论的网民中，讨论最为激烈的前<span class="describe-redText">' + length + '</span>名网民分别为' + itemStr + '。</div>'
  } else {
    description = '暂无相关数据'
  }
  renderData.option = option
  renderData.description = description

  return renderData
}
/**
 * 微博关注人群地域分布图
 * @param report
 * @return renderData
 */
exports.getFocusPeopleMapChart = function (report) {
  let {
    data,
    description = '',
    renderData = {}
  } = {}
  let params = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    groupName: 'area',
    keyword: {
      mustWord: report.mustWord,
      shouldWord: report.shouldWord,
      mustNotWord: report.mustNotWord,
      expression: report.expression
    },
    type: ['weibo']
  }

  data = articleService.getFilterAndGroupBy(params)
  logger.info('getFocusPeopleMapChart data \n', data)
  let renderDataTemp = []
  let chartConfig = {
    legendData: {
      show: false
    },
    gridData: {
      top: 10,
      bottom: 60
    },
    xAxisData: {
      type: 'category',
      axisLabel: {
        rotate: 45,
        textStyle: {
          fontWeight: 700,
          fontSize: 18
        }
      }
    },
    yAxisData: {
      type: 'value',
      axisLabel: {
        textStyle: {
          fontWeight: 700,
          fontSize: 18
        }
      }
    }
  }
  let renderItem = {
    name: '关注人数',
    data: []
  }
  jQuery.each(data, function (i, item) {
    let node = {}
    node.name = item.key
    node.value = item.value
    renderItem.data.push(node)
  })
  renderDataTemp.push(renderItem)
  let option = mapChart.getOption(renderDataTemp, chartConfig)

  if (data.length > 0) {
    var itemStr = ''
    jQuery.each(renderDataTemp[0].data, function (i, item) {
      if (i < 3) {
        itemStr += '<span class="describe-redText">“' + item.name + '”</span>关注人数<span class="describe-redText">(' + item.value + ')</span>人、'
      }
    })
    itemStr = itemStr.substring(0, itemStr.length - 1)
    description = '<div class="describe-text">从关注人群的地域分布来看，对参与话题讨论的网民言论样本进行分析发现,关注地域主要集中在' +
      itemStr + '等几个地区。</div>'
  } else {
    description = '暂无相关数据'
  }
  renderData.option = option
  renderData.description = description

  return renderData
}
/**
 * 热点词词云分析
 * @param report
 * @return renderData
 */
exports.getKeywordsChart = function (report) {
  let {
    data,
    description = '',
    renderData = {}
  } = {}
  let params = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    page: {
      page: 50
    },
    keyword: {
      mustWord: report.mustWord,
      shouldWord: report.shouldWord,
      mustNotWord: report.mustNotWord,
      expression: report.expression
    },
    type: ['article']
  }
  data = articleService.hotWords(params)
  logger.info('getArticleHotKeywordsChart data \n', data)
  let keywords = []
  jQuery.each(data, function (i, item) {
    var keyword = {}
    keyword.keyword = item.key
    keyword.score = item.value
    keywords.push(keyword)
  })
  let option = {
    data: keywords
  }

  if (data.length > 0) {
    let itemStr = ''
    jQuery.each(data, function (i, item) {
      if (i < 5) {
        itemStr += '<span class="describe-redText">' + item.key + '</span>出现<span class="describe-redText">(' + item.value + ')次</span>、'
      }
    })
    itemStr = itemStr.substring(0, itemStr.length - 1)

    description = '<div class="describe-text">根据互联网抓取的数据，热点关键词词频较高的是' + itemStr + '等。</div>'
  } else {
    description = '暂无相关数据'
  }
  renderData.option = option
  renderData.description = description

  return renderData
}
/**
 * 获取推荐阅读文章
 * @param report
 * @return renderData
 */
exports.getSpecialRecommendArticles = function (report) {
  let {
    description = '', data, renderData = {}
  } = {}
  let params = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    filed: 'title',
    keyword: {
      mustWord: report.mustWord,
      mustNotWord: report.mustNotWord,
      shouldWord: report.shouldWord,
      expression: report.expression
    },
    page: {
      limit: 4,
      page: 1
    },
    type: ['news']
  }
  data = articleService.titleTimeAxis(params)
  logger.info('getSpecialRecommendArticles data \n', data)

  data = data.content
  let option = {}
  if (data.length > 0) {
    // make description
    let itemStr = ''
    jQuery.each(data, function (i, article) {
      if (i < 4) {
        if (article.title.length > 30) {
          article.title = article.title.substring(0, 30) + '...'
        }
        if (article.content.length > 300) {
          article.content = article.content.substring(0, 300) + '...'
        }
        article.pubTime = dateUtil.formatDate(new Date(article.pubTime), 'yyyy-MM-dd')
        itemStr += '<div class="article-item"><div class="article-title">' + article.title + '</div>' +
          '<div class="article-source">信息来源：' + article.site + '</div>' +
          '<div class="article-pubTime">发布时间：' + article.pubTime + '</div>' +
          '<div class="article-link">原文链接：<a href="' + article.url + '" target="_blank">' + article.url + '</a></div>' +
          '<div class="article-content">' + article.content + '</div></div>'
      }
    })
    description = '<div class="describe-text">' + itemStr + '</div>'
  } else {
    description = '暂无相关数据'
  }
  renderData.option = option
  renderData.description = description

  return renderData
}
