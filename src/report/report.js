/**
 * Created by lyc on 17-5-18.
 */
const articleServer = require('../service/article')
const descriptionServer = require('../service/description')
const utils = require('../utils/utils')
const dateUtil = require('../utils/dateUtil')
const pieChart = require('../options/pie-chart')
const lineChart = require('../options/line-chart')
const barChart = require('../options/bar-chart')
const jQuery = require('../utils/jqueryUtil')
const log4js = require('../utils/logUtil')

const logger = log4js.getLogger('report')
/**
 * 获取报告标题
 * @param report
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
      mustNotWord: report.mustNotWord
    }
  }
  data = descriptionServer.getReportOutline(params)
  logger.info('getReportSummarize data \n', data)
  var keywords = '',
    mustWordArray = [],
    shouldWordArray = []
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
  var total = 0
  if (data.monthCount > 0) {
    total = data.monthCount
  }
  var typeItemStr = '',
    siteItemStr = '',
    titleItemStr = '',
    emotionItemStr = ''
  if (data.maxType.length > 0) {
    data.maxType.forEach(function (item, i) {
      if (i < 3) {
        typeItemStr += '<span class="describe-redText">' + utils.resetArticleTypeName(item.key) + '（' +
          item.value + '）</span>条、'
      }
    })
  }
  typeItemStr = typeItemStr.substring(0, typeItemStr.length - 1)
  if (data.maxSite.length > 0) {
    data.maxSite.forEach(function (item, i) {
      if (i < 3) {
        siteItemStr += '<span class="describe-redText">' + item.key + '（' +
          item.value + '）</span>条、'
      }
    })
  }
  siteItemStr = siteItemStr.substring(0, siteItemStr.length - 1)
  if (data.maxTitle.length > 0) {
    data.maxTitle.forEach(function (item, i) {
      if (i < 3) {
        titleItemStr += '以<span class="describe-redText">“' + item.key + '”</span>标题的报道具有（' +
          item.value + '）条、'
      }
    })
  }
  titleItemStr = titleItemStr.substring(0, titleItemStr.length - 1)
  if (data.label.length > 0) {
    data.label.forEach(function (item) {
      emotionItemStr += '<span class="describe-redText">' + utils.resetEmotionTypeName(item.key) + '</span>报道具有<span class="describe-redText">（' +
        item.value + '）</span>条，所占比例为<span class="describe-redText">' + (item.value * 100 / total).toFixed(2) + '%</span>'
    })
  }
  emotionItemStr = emotionItemStr.substring(0, emotionItemStr.length - 1)
  description = '<div class="describe-text"><div class="paragraph">根据以<span class="describe-redText">“' + keywords + '”</span>等关键字的进行互联网监控，从<span class="describe-redText">' + report.startDate + '</span>至<span class="describe-redText">' +
    report.endDate + '</span>，对以<span class="describe-redText">“' + report.name + '”</span>为主题进行数据爬取，监控发现对该主题进行报道具有<span class="describe-redText">' + total + '</span>条，其中包含' + typeItemStr +
    '</span>。根据报道数量排序，对该主题报道最多的为' + siteItemStr + '。</div><div class="paragraph">对该主题，媒体采用不同的标题方式进行报道，包括' + titleItemStr + '。</div><div class="paragraph">通过对以上所有报道进行正负面舆情分析，其中' + emotionItemStr + '。</div></div>'


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
  data = articleServer.getFilterAndGroupBy(params)
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
    var itemsStr = ''
    jQuery.each(data, function (item) {
      itemsStr += '<span class="describe-redText">' + item.name + '</span>类媒体发现报道了<span class="describe-redText">' + item.value + '</span>次，所占比例<span class="describe-redText">' + (item.value * 100 / total).toFixed(2) + '%</span>；'
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
  let {
    data,
    description = '',
    renderData = {}
  } = {}
  let params = {
    date: {
      startDate: report.trendStartData,
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
  data = articleServer.filterAndGroupByTime(params, gapParams)
  logger.info('filterAndGroupByTime data \n', data)
  let renderDataTemp = []
  if (report.type === 'MONTHLY' || report.type === 'WEEKYLY') {
    let lastTimeStart = dateUtil.parseDate(report.trendStartData).getTime()
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
        thisRenderItem.data.push(node)
      }
    })
    renderDataTemp.push(lastRenderItem)
    renderDataTemp.push(thisRenderItem)
  } else if (report.type === 'SEPCIAL') {
    for (let name in data) {
      let renderItem = {}
      renderItem.name = utils.resetArticleTypeName(name)
      jQuery.each(data[name], function (i, item) {
        let node = {}
        node.name = item.key
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

  // 处理报告坐标轴
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

  renderData.option = option
  renderData.option = description
  return renderData
}

/**
 * 播舆论热度
 * @param report
 * @return renderData
 */
exports.getArticleHotPointChart = function (report) {
  var titleMust = ''
  if (report.mode === 'NORMAL') {
    if (report.mustWord && report.mustWord !== '') {
      titleMust = report.mustWord.split('@')[0]
    } else {
      titleMust = report.shouldWord.split('@')[0]
    }
  } else if (report.mode === 'ADVANCED') {
    // TODO: 需要与后台确认高级模式时如何处理
    if (report.mustWord && report.mustWord !== '') {
      titleMust = report.mustWord.split('@')[0]
    } else {
      titleMust = report.shouldWord.split('@')[0]
    }
  }

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
    filed: '',
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
    searchKv: [{
      key: 'title.cn',
      value: titleMust
    }],
    type: ['news']
  }

  data = articleServer.titleTimeAxis(params)
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
    data: []
  }
  renderItem.name = '舆论热点'
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
    var dataMonth = ''
    if (report.type === 'MONTHLY') {
      dataMonth = '本月'
    } else if (report.type === 'WEEKLY') {
      dataMonth = '本周'
    }
    var itemStr = ''
    data = data.reverse()
    data.forEach(function (item, i) {
      if (item.title.length > 30) {
        item.title = item.title.substring(0, 30) + '...'
      }
      if (i < 3) {
        itemStr += '<span class="describe-redText">“' + item.title + '” (' + item.docTotal + ')</span>、'
      }
    })
    itemStr = itemStr.substring(0, itemStr.length - 1)
    description = '<div class="describe-text">' + dataMonth + '媒体报道情况，从其具体内容方面也可以发现，主要话题集中在' +
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
    data,
    description = '',
    renderData = {}
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
    }
  }
  data = articleServer.getFilterAndGroupBy(params)
  logger.info('getNewsEmotionPieChart data \n', data)
  let renderDataTemp = []
  let chartConfig = {
    legendData: {
      show: true
    }
  }
  let total = 0
  let renderItem = {
    name: '',
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
    for (let item of data) {
      total += item.value
    }
    var itemStr = ''
    data.forEach(function (item, i) {
      if (i === 0) {
        itemStr += '<span class="describe-redText">' + item.name +
          '</span>情感最多有<span class="describe-redText">' + item.value +
          '(' + (item.value * 100 / total).toFixed(2) + '%)' + '</span>，'
      }
      if (i > 0) {
        itemStr += '<span class="describe-redText">' + item.name + item.value + '(' + (item.value * 100 / total).toFixed(2) + '%)' + '</span>，'
      }
    })

    itemStr = itemStr.substring(0, itemStr.length - 1)

    description = '<div class="describe-text">根据互联网抓取的数据，对数据情感进行分析，' + itemStr + '。</div>'
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

  data = articleServer.getFilterAndGroupBy(params)
  logger.info('getMediaBarChart data \n', data)
  var renderDataTemp = []
  var chartConfig = {
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
  var renderItem = {
    name: '媒体名称',
    data: []
  }
  jQuery.each(data, function (i, item) {
    var node = {}
    node.name = item.key
    node.value = item.value
    renderItem.data.push(node)
  })
  renderDataTemp.push(renderItem)
  var option = barChart.getOption(renderDataTemp, chartConfig)
  // 将对象转为json格式，在此处设置labelLength, option为json
  option = utils.replaceLabelLength(option, 8)

  if (data.length > 0) {
    var itemStr = ''
    data.forEach(function (item, i) {
      if (i < 4) {
        itemStr += '<span class="describe-redText">' + item.key + '(' + item.value + ')' + '</span>、'
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

  data = articleServer.getFilterAndGroupBy(params)
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
    var itemStr = ''
    data.forEach(function (item, i) {
      if (i < 5) {
        itemStr += '<span class="describe-redText">' + item.key + '(' + item.value + ')' + '</span>、'
      }
    })

    var length = data.length > 5 ? 5 : data.length
    itemStr = itemStr.substring(0, itemStr.length - 1)
    description = '<div class="describe-text">对该主题的监测过程中，在论坛的参与话题讨论的网民中，讨论最为激烈的前<span class="describe-redText">' + length + '</span>名网民分别为' + itemStr + '。</div>'
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

  data = articleServer.getFilterAndGroupBy(params)
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

  var maxCount = 10,
    seriesData = []
  if (data.length > 0) {
    for (let item of data) {
      var node = {}
      node.name = item.key
      node.value = item.value
      seriesData.push(node)
    }
    seriesData.sort(function (a, b) {
      return b.value - a.value
    })
    if (seriesData.length > 0) {
      maxCount = seriesData[0].value
    }
  }
  option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}'
    },
    visualMap: {
      min: 0,
      max: maxCount,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'], // 文本，默认为数值文本
      calculable: true,
      inRange: {
        color: ['#B7EEEB', '#FEFDC7', '#FCC171', '#F27449', '#DB3B29'],
      },
    },
    series: [{
      name: '关注人数',
      type: 'map',
      mapType: 'china',
      label: {
        normal: {
          show: true,
        }
      },
      data: seriesData
    }]
  }
  if (data.length > 0) {
    var itemStr = ''
    seriesData.forEach(function (item, i) {
      if (i < 3) {
        itemStr += '<span class="describe-redText">“' + item.name + '” (' + item.value + ')</span>、'
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
  data = articleServer.hotWords(params)
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
    var itemStr = ''
    data.forEach(function (item, i) {
      if (i < 5) {
        itemStr += '<span class="describe-redText">' + item.key + '(' + item.value + ')' + '</span>、'
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
  var titleMust = ''
  if (report.mode === 'NORMAL') {
    if (report.mustWord && report.mustWord !== '') {
      titleMust = report.mustWord.split('@')[0]
    } else {
      titleMust = report.shouldWord.split('@')[0]
    }
  } else if (report.mode === 'ADVANCED') {
    // TODO: 需要与后台确认高级模式时如何处理
    if (report.mustWord && report.mustWord !== '') {
      titleMust = report.mustWord.split('@')[0]
    } else {
      titleMust = report.shouldWord.split('@')[0]
    }
  }

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
    filed: '',
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
    searchKv: [{
      key: 'title.cn',
      value: titleMust
    }],
    type: ['news']
  }

  data = articleServer.titleTimeAxis(params)
  logger.info('getSpecialRecommendArticles data \n', data)

  data = data.content
  let option = {}
  if (data.length > 0) {
    // make description
    var itemStr = ''
    data.forEach(function (article, i) {
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
