/**
 * Created by lyc on 17-5-18.
 */
const request = require('request')
const querystring = require('querystring')
const deasync = require('deasync')

const articleServer = require('../service/article')
const descriptionServer = require('../service/description')
const utils = require('../utils/utils')
const dateUtil = require('../utils/dateUtil')
const pieChart = require('../options/pie-chart')
const jQuery = require('../utils/jqueryUtil')

// const jQuery = jqueryUtil.jQuery

/**
 * 获取月报标题
 * @param report
 */
exports.getBriefingTitle = function (report) {
  var title = '',
    reportTime = ''
  if (report.type === 'MONTHLY') {
    reportTime = dateUtil.formatDate(dateUtil.parseDate(report.startDate), 'yyyy年MM月')
    title = '月报' + reportTime
  } else if (report.type === 'WEEKLY') {
    reportTime = dateUtil.formatDate(dateUtil.parseDate(report.startDate), 'yyyy年MM月dd日')
    title = '周报' + reportTime
  }

  return title
}
/**
 * 月报子标题
 */
exports.getBriefingSubTitle = function () {
  return ''
}
/**
 * 月报期号
 */
exports.getBriefingIssue = function () {
  return ''
}
/**
 * 月报作者
 */
exports.getBriefingAuthor = function () {
  return ''
}
/**
 * 月报概述
 */
exports.getBriefingOutline = function (report) {
  let {
    outline = '', data
  } = {}
  let params = {
    'date': {
      'startDate': report.startDate,
      'endDate': report.endDate
    },
    'keyword': {
      'mustWord': report.mustWord,
      'shouldWord': report.shouldWord,
      'mustNotWord': report.mustNotWord,
      'expression': report.expression
    }
  }
  data = descriptionServer.getReportOutline(params)

  var total = 0,
    count = 0,
    comparePercent = 0,
    compareLast = '',
    time = ''
  if (report.type === 'MONTHLY') {
    count = data.monthCount
    comparePercent = data.mom
    time = '月'
  } else if (report.type === 'WEEKLY') {
    count = data.weekCount
    comparePercent = data.wow
    time = '周'
  }

  if (count > 0) {
    total = count
  }
  if (comparePercent > 0) {
    compareLast = '增加' + comparePercent.toFixed(2) + '％'
  } else {
    compareLast = '减少' + comparePercent.toFixed(2) + '％'
  }

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

  var itemStr = '',
    itemCompareLast = ''
  if (data.maxType && data.maxType.length > 0) {
    data.maxType.forEach(function (item) {
      data.compare.forEach(function (obj) {
        if (item.key === obj.key) {
          if (obj.value > 0) {
            itemCompareLast = '增加' + obj.value.toFixed(2) + '％'
          } else {
            itemCompareLast = '减少' + obj.value.toFixed(2) + '％'
          }
          itemStr += '<span class="describe-redText">' + utils.resetArticleTypeName(item.key) +
            '（' + item.value + '）</span>条,同比上' + time + '<span class="describe-redText">' + itemCompareLast + '</span>，'
        }
      })
    })

    itemStr = itemStr.substring(0, itemStr.length - 1)
  }

  var siteStr = ''
  if (data.maxSite && data.maxSite.length > 0) {
    siteStr = '其中较为活跃的站点有'
    data.maxSite.forEach(function (item, i) {
      if (i < 3) {
        siteStr += '<span class="describe-redText">' + item.key + '（' + item.value + '）</span>条，'
      }
    })
    siteStr = siteStr.substring(0, siteStr.length - 1)
  }

  outline = '<div class="describe-text">本' + time + '共抓取数据<span class="describe-redText">' + total +
    '</span>条，同比上' + time + '<span class="describe-redText">' + compareLast +
    '</span>，本' + time + '共抓取<span class="describe-redText">' + keywords + '</span>相关' +
    itemStr + '，' + siteStr + '</div>'
  return outline
}
/**
 * 月报总结
 */
exports.getBriefingSummary = function () {
  return ''
}
// 载体分布情况
exports.getArticleTypeChart = function (report) {
  let {
    data,
    renderData = {},
    description = '',
    total = 0
  } = {}
  let params = {
    'date': {
      'startDate': report.startDate,
      'endDate': report.endDate
    },
    'groupName': 'type',
    'keyword': {
      'mustWord': report.mustWord,
      'shouldWord': report.shouldWord,
      'mustNotWord': report.mustNotWord,
      'expression': report.expression
    }
  }
  data = articleServer.getFilterAndGroupBy(params)

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
// 安全生产與情趋势
exports.getArticleTrendChart = function (report) {
  let {
    data,
    renderData
  } = {}
  let params = {
    'date': {
      'startDate': report.startDate,
      'endDate': report.endDate
    },
    'groupName': 'type',
    'keyword': {
      'mustWord': report.mustWord,
      'shouldWord': report.shouldWord,
      'mustNotWord': report.mustNotWord,
      'expression': report.expression
    }
  }
  data = articleServer.getFilterAndGroupBy(params)

  return renderData
}
// 播舆论热度
exports.getArticleHotPointChart = function (report) {
  var titleMust = ''
  titleMust = report.mustWord.split('@')[0]
  var renderData = {},
    isReturn = false
  var param = {
    date: {
      startDate: report.startDate,
      endDate: report.endDate
    },
    filed: '',
    keyword: {
      mustWord: report.mustWord,
      mustNotWord: report.mustNotWord,
      shouldWord: report.shouldWord,
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

  var urlPath = url.webserviceUrl + '/es/titleTimeAxis'
  request({
    url: urlPath,
    method: 'post',
    json: true,
    headers: headers.getRequestHeader(),
    body: param
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      // console.log('getArticleHotPointChart http request return!')
      isReturn = true
      data = data.content
      data = data.reverse()
      var description = ''
      var renderDataTemp = []
      var chartConfig = {
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
      var renderItem = {
        data: []
      }
      renderItem.name = '舆论热点'
      if (data.length > 0) {
        data.forEach(function (item) {
          var node = {}
          node.name = item.title
          node.value = item.docTotal
          renderItem.data.push(node)
        })
      }
      renderDataTemp.push(renderItem)
      var option = chartOption.barChartOption.getOption(renderDataTemp, chartConfig)
      // 将对象转为json格式，在此处设置labelLength, option为json
      option = utils.replaceLabelLength(option, 25)

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
    } else {
      // console.log('get getArticleHotPointChart data error')
    }
  })

  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
// 新闻情感正负面分析
exports.getNewsEmotionPieChart = function (report) {
  var renderData = {},
    isReturn = false
  var param = {
    groupName: 'nlp.sentiment.label',
    mustWord: report.mustWord,
    mustNotWord: report.mustNotWord,
    shouldWord: report.shouldWord,
    s_date: report.startDate,
    e_date: report.endDate
  }

  var urlPath = url.webserviceUrl + '/news/filterAndGroupBy.json?' + querystring.stringify(param)
  request({
    url: urlPath,
    method: 'get',
    json: true,
    headers: headers.getRequestHeader()
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      // console.log('getNewsEmotionPieChart http request return!')
      isReturn = true
      var total = 0,
        seriesData = [],
        legendData = [],
        description = ''
      if (data.length > 0) {
        // 拼装 chart option
        for (var item of data) {
          var node = {}
          node.name = utils.resetEmotionTypeName(item.key)
          node.value = item.value
          seriesData.push(node)
          legendData.push(node.name)
        }
      }
      var option = {
        title: {
          text: '情感分析',
          left: 'center',
          top: 'center',
          textStyle: {
            fontSize: 20,
            fontWeight: 600
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          x: 'right',
          textStyle: {
            fontSize: 15,
            fontWeight: 500
          },
          data: legendData
        },
        series: [{
          name: '情感类型',
          type: 'pie',
          radius: ['40%', '60%'],
          label: {
            normal: {
              show: false,
              textStyle: {
                fontSize: 20
              }
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: '30',
                fontWeight: 'bold'
              }
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: seriesData
        }]
      }

      if (data.length > 0) {
        for (let item of seriesData) {
          total += item.value
        }
        var itemStr = ''
        seriesData.forEach(function (item, i) {
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
    } else {
      // console.log('get getNewsEmotionPieChart data error')
    }
  })

  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
// 主流媒体报道统计
exports.getMediaBarChart = function (report) {
  var renderData = {},
    isReturn = false
  var param = {
    groupName: 'site',
    mustWord: report.mustWord,
    mustNotWord: report.mustNotWord,
    shouldWord: report.shouldWord,
    s_date: report.startDate,
    e_date: report.endDate,
    articleType: 'news'
  }

  var urlPath = url.webserviceUrl + '/es/filterAndGroupBy.json?' + querystring.stringify(param)
  request({
    url: urlPath,
    method: 'get',
    json: true,
    headers: headers.getRequestHeader()
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      // console.log('getMediaBarChart http request return!')
      isReturn = true
      var description = ''
      var renderDataTemp = []
      var chartConfig = {
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
        data: []
      }
      renderItem.name = '媒体名称'
      if (data.length > 0) {
        data.forEach(function (item) {
          var node = {}
          node.name = item.key
          node.value = item.value
          renderItem.data.push(node)
        })
      }
      renderDataTemp.push(renderItem)
      var option = chartOption.barChartOption.getOption(renderDataTemp, chartConfig)
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
    } else {
      // console.log('get getMediaBarChart data error')
    }
  })

  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
// 热点词词云分析
exports.getArticleHotKeywordsChart = function (report) {
  var renderData = {},
    isReturn = false
  var param = {
    limit: 50,
    mustWord: report.mustWord,
    mustNotWord: report.mustNotWord,
    shouldWord: report.shouldWord,
    s_date: report.startDate,
    e_date: report.endDate
  }

  var urlPath = url.webserviceUrl + '/es/hotWords.json?' + querystring.stringify(param)
  // console.log('getArticleHotKeywordsChart', urlPath)
  request({
    url: urlPath,
    method: 'get',
    json: true,
    headers: headers.getRequestHeader()
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      // console.log('getArticleHotKeywordsChart http request return!')
      isReturn = true
      var keywords = [],
        description = ''
      if (data.length > 0) {
        for (var item of data) {
          var keyword = {}
          keyword.keyword = item.key
          keyword.score = item.value
          keywords.push(keyword)
        }
      }
      var option = {
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
    } else {
      // console.log('get getArticleHotKeywordsChart data error')
    }
  })

  while (!isReturn) {
    deasync.runLoopOnce()
  }

  return renderData
}
