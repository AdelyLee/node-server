/**
 * 专题模块Json数据生成，
 *
 *
 */
var url = require('./common.js')
var utils = require('../utils/utils.js')
var request = require('request')
var querystring = require('querystring')
var deasync = require('deasync')
var dateUtil = require('../utils/dateUtil.js')
var descriptionUtil = require('./descriptionUtil.js')
var headers = require('../utils/headerUtil')
var chartOption = require('../options/chart-options')

const actions = {
  // 专报标题
  getBriefingTitle: function (report) {
    return report.name
  },
  // 专报子标题
  getBriefingSubTitle: function () {
    return ''
  },
  // 专报期号
  getBriefingIssue: function () {
    return ''
  },

  // 专报概述
  getBriefingOutline: function () {
    return ''
  },

  // 专报总结
  getBriefingSummary: function () {
    return ''
  },

  // 與情综述描述
  getSpecialSummarize: function (report) {
    var renderData = {}, isReturn = false, description = ''
    var option = {}
    var urlPath = url.webserviceUrl + '/description/specialOutline/'
    var param = {
      'date': {
        'startDate': report.startDate,
        'endDate': report.endDate
      },
      'keyword': {
        'mustWord': report.mustWord,
        'shouldWord': report.shouldWord,
        'mustNotWord': report.mustNotWord
      }
    }
    request({
      url: urlPath,
      method: 'post',
      json: true,
      headers: headers.getRequestHeader(),
      body: param
    }, function (error, response, data) {
      if (!error && response.statusCode === 200) {
        isReturn = true
        var keywords = '', mustWordArray = [], shouldWordArray = []
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
        var typeItemStr = '', siteItemStr = '', titleItemStr = '', emotionItemStr = ''
        if (data.maxType.length > 0) {
          data.maxType.forEach(function (item, i) {
            if (i < 3) {
              typeItemStr += '<span class="describe-redText">' + utils.resetArticleTypeName(item.key) + '（'
                + item.value + '）</span>条、'
            }
          })
        }
        typeItemStr = typeItemStr.substring(0, typeItemStr.length - 1)
        if (data.maxSite.length > 0) {
          data.maxSite.forEach(function (item, i) {
            if (i < 3) {
              siteItemStr += '<span class="describe-redText">' + item.key + '（'
                + item.value + '）</span>条、'
            }
          })
        }
        siteItemStr = siteItemStr.substring(0, siteItemStr.length - 1)
        if (data.maxTitle.length > 0) {
          data.maxTitle.forEach(function (item, i) {
            if (i < 3) {
              titleItemStr += '以<span class="describe-redText">“' + item.key + '”</span>标题的报道具有（'
                + item.value + '）条、'
            }
          })
        }
        titleItemStr = titleItemStr.substring(0, titleItemStr.length - 1)
        if (data.label.length > 0) {
          data.label.forEach(function (item) {
            emotionItemStr += '<span class="describe-redText">' + utils.resetEmotionTypeName(item.key) + '</span>报道具有<span class="describe-redText">（'
              + item.value + '）</span>条，所占比例为<span class="describe-redText">' + (item.value * 100 / total).toFixed(2) + '%</span>'
          })
        }
        emotionItemStr = emotionItemStr.substring(0, emotionItemStr.length - 1)
        description = '<div class="describe-text"><div class="paragraph">根据以<span class="describe-redText">“' + keywords + '”</span>等关键字的进行互联网监控，从<span class="describe-redText">' + report.startDate + '</span>至<span class="describe-redText">'
          + report.endDate + '</span>，对以<span class="describe-redText">“' + report.name + '”</span>为主题进行数据爬取，监控发现对该主题进行报道具有<span class="describe-redText">' + total + '</span>条，其中包含' + typeItemStr
          + '</span>。根据报道数量排序，对该主题报道最多的为' + siteItemStr + '。</div><div class="paragraph">对该主题，媒体采用不同的标题方式进行报道，包括' + titleItemStr + '。</div><div class="paragraph">通过对以上所有报道进行正负面舆情分析，其中' + emotionItemStr + '。</div></div>'

      }
    })
    while (!isReturn) {
      deasync.runLoopOnce()
    }

    renderData.description = description
    renderData.option = option

    return renderData
  },
  // 获取专题與情载体类型
  getArticleTypeChart: function (report) {
    var renderData = {}, isReturn = false
    var param = {
      groupName: 'type',
      mustWord: report.mustWord,
      mustNotWord: report.mustNotWord,
      shouldWord: report.shouldWord,
      s_date: report.startDate,
      e_date: report.endDate
    }

    var urlPath = url.webserviceUrl + '/es/filterAndGroupBy.json?' + querystring.stringify(param)
    request({
      url: urlPath,
      method: 'get',
      json: true,
      headers: headers.getRequestHeader()
    }, function (error, response, data) {
      if (!error && response.statusCode === 200) {
        // console.log('getArticleTypeChart http request return!')
        isReturn = true

        var total = 0, seriesData = [], description = ''
        // 拼装 chart option
        if (data.length > 0) {
          for (var item of data) {
            total += item.value
            var node = {}
            node.name = utils.resetArticleTypeName(item.key)
            node.value = item.value
            seriesData.push(node)
          }
        }
        var option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {},
          series: [
            {
              name: '媒体类型',
              type: 'pie',
              radius: ['40%', '55%'],
              label: {
                normal: {
                  show: true,
                  textStyle: {
                    fontSize: 20
                  }
                }
              },
              data: seriesData
            }
          ]
        }
        if (data.length > 0) {
          // make ArticleTypeChart description
          var itemsStr = ''
          seriesData.forEach(function (item, i) {
            if (i < 3) {
              itemsStr += '<span class="describe-redText">' + item.name + '</span>类媒体发现报道了<span class="describe-redText">' + item.value + '</span>次，所占比例<span class="describe-redText">' + (item.value * 100 / total).toFixed(2) + '%</span>；'
            }
          })
          itemsStr = itemsStr.substring(0, itemsStr.length - 1) + '。'
          description = '<div class="describe-text">根据互联网实时监控的所有抓取的数据按媒体报道载体分析，一共具有媒体报道<span class="describe-redText">' + total + '</span>次，' + itemsStr + '</div>'
        } else {
          description = '暂无相关数据'
        }
        renderData.option = option
        renderData.description = description
      }
    })

    while (!isReturn) {
      deasync.runLoopOnce()
    }

    return renderData
  },

  // 主流媒体
  getMediaBarChart: function (report) {
    var renderData = {}, isReturn = false
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
          legendData: { show: false },
          gridData: { top: 10, bottom: 60 },
          xAxisData: { type: 'category', axisLabel: { rotate: 45, textStyle: { fontWeight: 700, fontSize: 18 } } },
          yAxisData: { type: 'value', axisLabel: { textStyle: { fontWeight: 700, fontSize: 18 } } }
        }
        var renderItem = { data: [] }
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

          description = '<div class="describe-text">上图反映了主流媒体对<span class="describe-redText">”' + report.name + '“</span>该主题进行报道（或者转载）的一个排行榜，关注和报道该活动最多的分别为' + itemStr + '等。</div>'
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
  },

  // 趋势图
  getArticleTrendChart: function (report) {
    var renderData = {}, isReturn = false
    var param = {
      dateType: 'day',
      mustWord: report.mustWord,
      mustNotWord: report.mustNotWord,
      shouldWord: report.shouldWord,
      s_date: report.startDate,
      e_date: report.endDate,
      articleType: 'article'
    }
    var urlPath = url.webserviceUrl + '/es/filterAndGroupByTime.json?' + querystring.stringify(param)
    request({
      url: urlPath,
      method: 'get',
      json: true,
      headers: headers.getRequestHeader()
    }, function (error, response, data) {
      if (!error && response.statusCode === 200) {
        // console.log('getArticleTrendChart http request return!')
        isReturn = true

        data = data.article
        var total = 0, seriesData = [], xAxisData = [], indexOfMax = 0, maxDate = '', indexOfMin = 0, minDate = '', legendData = [], description = ''
        if (report.type === 'SPECIAL') {
          if (data.length > 0) {
            legendData.push('與情数目')
            for (var item of data) {
              var itemDate = dateUtil.parseDate(item.key)
              var itemDateStr = dateUtil.formatDate(itemDate, 'yyyy-MM-dd')
              xAxisData.push(itemDateStr)
              seriesData.push(item.value)
            }

            // 获取数据的最高点和最地点
            indexOfMax = seriesData.indexOf(Math.max.apply(Math, seriesData))
            maxDate = xAxisData[indexOfMax]
            indexOfMin = seriesData.indexOf(Math.min.apply(Math, seriesData))
            minDate = xAxisData[indexOfMin]

            // 获取所有数据总数
            seriesData.forEach(function (value) {
              total += value
            })
          }
        }

        var option = {
          tooltip: { trigger: 'axis' },
          legend: {
            x: 'right',
            y: 'middle',
            orient: 'vertical',
            data: legendData
          },
          grid: {
            left: '4%',
            right: '150px',
            bottom: '3%',
            containLabel: true
          },
          color: ['#e7ba09', '#30a8dd'],
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
            axisLabel: {
              textStyle: {
                fontWeight: 700,
                fontSize: 16
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              interval: 0,
              textStyle: {
                fontWeight: 600,
                fontSize: 18
              }
            }
          },
          series: [
            {
              name: '與情数目',
              type: 'line',
              data: seriesData
            }
          ]
        }
        if (data.length > 0) {
          var hotStartDate = dateUtil.formatDate(dateUtil.parseDate(maxDate), 'yyyy-MM-dd')
          var hotEndDate = dateUtil.formatDate(dateUtil.addDate(dateUtil.parseDate(hotStartDate), 'd', 1), 'yyyy-MM-dd')
          var heightData = descriptionUtil.getHotArticle(report, hotStartDate, hotEndDate)
          var heightStr = ''
          if (heightData.key) {
            heightStr = '<span class="describe-redText">在' + maxDate + '</span>日，<span class="describe-redText">“' + heightData.key
              + '”</span>话题产生<span class="describe-redText">' + heightData.value + '</span>篇相关报道，促使当日出现本月的舆情高峰，之后，媒体报道逐渐减少。'
          }

          // make ArticleTypeChart description
          description = '<div class="describe-text">对所有报道的'
            + '<span class="describe-redText">' + total + '</span>条数据进行按时间段走势进行分析（按天），得出<span class="describe-redText">' + maxDate
            + '</span>日热度最高，共有数据<span class="describe-redText">' + seriesData[indexOfMax] + '</span>条。'
            + heightStr + '<span class="describe-redText">' + minDate
            + '</span>日最低，共有数据<span class="describe-redText">' + seriesData[indexOfMin] + '</span>条。</div>'
        } else {
          description = '暂无相关数据'
        }
        renderData.option = option
        renderData.description = description
      } else {
        // console.log('get getArticleTrendChart data error')
      }
    })

    while (!isReturn) {
      deasync.runLoopOnce()
    }

    return renderData
  },

  // 网民舆论热点
  getArticleHotPointChart: function (report) {
    var titleMust = ''
    titleMust = report.mustWord.split('@')[0]
    var renderData = {}, isReturn = false
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
          legendData: { show: false },
          gridData: { top: 10, bottom: 20 },
          xAxisData: { type: 'value', axisLabel: { textStyle: { fontWeight: 700, fontSize: 20 } } },
          yAxisData: { type: 'category', axisLabel: { textStyle: { fontWeight: 700, fontSize: 20 } } }
        }
        var renderItem = { data: [] }
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
          var itemStr = ''
          data = data.reverse()
          data.forEach(function (item, i) {
            if (item.title.length > 30) {
              item.title = item.title.substring(0, 30) + '...'
            }
            if (i < 3) {
              itemStr += '<span class="describe-redText">“' + item.title + '” （' + item.docTotal + '次）</span>、'
            }
          })
          itemStr = itemStr.substring(0, itemStr.length - 1)
          description = '<div class="describe-text">针对该主题报道，从其具体内容方面也可以发现，舆论主要话题集中在'
            + itemStr + '方面的话题。</div>'
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
  },

  // 热议网民
  getHotAuthorChart: function (report) {
    var renderData = {}, isReturn = false
    var param = {
      groupName: 'author',
      mustWord: report.mustWord,
      mustNotWord: report.mustNotWord,
      shouldWord: report.shouldWord,
      s_date: report.startDate,
      e_date: report.endDate,
      articleType: 'weibo@bbs@bar'
    }

    var urlPath = url.webserviceUrl + '/es/filterAndGroupBy.json?' + querystring.stringify(param)
    request({
      url: urlPath,
      method: 'get',
      json: true,
      headers: headers.getRequestHeader()
    }, function (error, response, data) {
      if (!error && response.statusCode === 200) {
        // console.log('getHotAuthorChart http request return!')
        isReturn = true
        var description = ''
        var renderDataTemp = []
        var chartConfig = {
          legendData: { show: false },
          gridData: { top: 10, bottom: 60 },
          xAxisData: { type: 'category', axisLabel: { rotate: 45, textStyle: { fontWeight: 700, fontSize: 18 } } },
          yAxisData: { type: 'value', axisLabel: { textStyle: { fontWeight: 700, fontSize: 18 } } }
        }
        var renderItem = { data: [] }
        renderItem.name = '热议网民'
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
      } else {
        // console.log('get getHotAuthorChart data error')
      }
    })

    while (!isReturn) {
      deasync.runLoopOnce()
    }

    return renderData
  },

  // 话题关注人群地域分布图
  getFocusPeopleMapChart: function (report) {
    var renderData = {}, isReturn = false
    var param = {
      groupName: 'area',
      mustWord: report.mustWord,
      mustNotWord: report.mustNotWord,
      shouldWord: report.shouldWord,
      s_date: report.startDate,
      e_date: report.endDate
    }

    var urlPath = url.webserviceUrl + '/es/filterAndGroupBy.json?' + querystring.stringify(param)
    request({
      url: urlPath,
      method: 'get',
      json: true,
      headers: headers.getRequestHeader()
    }, function (error, response, data) {
      if (!error && response.statusCode === 200) {
        // console.log('getFocusPeopleMapChart http request return!')
        isReturn = true
        // 拼装 chart option
        var maxCount = 10, seriesData = [], description = ''
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
        var option = {
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
          series: [
            {
              name: '关注人数',
              type: 'map',
              mapType: 'china',
              label: {
                normal: {
                  show: true,
                }
              },
              data: seriesData
            }
          ]
        }
        if (data.length > 0) {
          var itemStr = ''
          seriesData.forEach(function (item, i) {
            if (i < 3) {
              itemStr += '<span class="describe-redText">“' + item.name + '” (' + item.value + ')</span>、'
            }
          })
          itemStr = itemStr.substring(0, itemStr.length - 1)
          description = '<div class="describe-text">从关注人群的地域分布来看，对参与话题讨论的网民言论样本进行分析发现,关注地域主要集中在'
            + itemStr + '等几个地区。</div>'
        } else {
          description = '暂无相关数据'
        }
        renderData.option = option
        renderData.description = description
      } else {
        // console.log('get getFocusPeopleMapChart data error')
      }
    })

    while (!isReturn) {
      deasync.runLoopOnce()
    }

    return renderData
  },

  // 网民评论热点词词云分析
  getCommentHotKeywordsChart: function (report) {
    var renderData = {}, isReturn = false
    var param = {
      limit: 50,
      mustWord: report.mustWord,
      mustNotWord: report.mustNotWord,
      shouldWord: report.shouldWord,
      s_date: report.startDate,
      e_date: report.endDate
    }

    var urlPath = url.webserviceUrl + '/es/hotWords.json?' + querystring.stringify(param)
    request({
      url: urlPath,
      method: 'get',
      json: true,
      headers: headers.getRequestHeader()
    }, function (error, response, data) {
      if (!error && response.statusCode === 200) {
        // console.log('getCommentHotKeywordsChart http request return!')
        isReturn = true
        var keywords = [], description = ''
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
  },

  // 获取推荐阅读文章
  getSpecialRecommendArticles: function (report) {
    var titleMust = ''
    titleMust = report.mustWord.split('@')[0]
    var renderData = {}, isReturn = false
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
        limit: 4,
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
        // console.log('getSpecialRecommendArticles http request return!')
        isReturn = true
        data = data.content
        var description = '', option = {}
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
      } else {
        // console.log('get getSpecialRecommendArticles data error')
      }
    })

    while (!isReturn) {
      deasync.runLoopOnce()
    }

    return renderData
  }
}

module.exports = actions
