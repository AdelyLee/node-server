/**
 * Created by lyc on 17-5-18.
 */

const utils = {
  resetArticleTypeName: function (source) {
    var target = ''
    switch (source) {
      case 'news':
        target = '新闻'
        break
      case 'weibo':
        target = '微博'
        break
      case 'bbs':
        target = '论坛'
        break
      case 'bar':
        target = '贴吧'
        break
      case 'comments':
        target = '评论'
        break
      case 'weixin':
        target = '微信'
        break
      case 'article':
        target = '文章'
        break
    }

    return target
  },

  resetEmotionTypeName: function (source) {
    var type = ''
    source = source.toLowerCase()
    switch (source) {
      case 'pos':
        type = '正面'
        break
      case 'neg':
        type = '负面'
        break
      case 'neu':
        type = '中性'
        break
    }

    return type
  },

  resetDate: function (dateNum) {
    var date = ''
    switch (dateNum) {
      case 1:
        date = '星期一'
        break
      case 2:
        date = '星期二'
        break
      case 3:
        date = '星期三'
        break
      case 4:
        date = '星期四'
        break
      case 5:
        date = '星期五'
        break
      case 6:
        date = '星期六'
        break
      case 0:
        date = '星期日'
        break
    }

    return date
  },
  replaceLabelLength: function (option, labelLength) {
    // 将对象转为json格式，在此处设置labelLength
    option = JSON.stringify(option, function (key, val) {
      if (typeof val === 'function') {
        return val + ''
      }
      return val
    })
    option = option.replace(/labelLength/g, labelLength)

    option = JSON.parse(option, function (k, v) {
      if (v.indexOf && v.indexOf('function') > -1) {
        return eval('(function(){return ' + v + ' })()')
      }
      return v
    })
    return option
  }
}

module.exports = utils
