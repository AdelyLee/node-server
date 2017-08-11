/**
 * Created by lyc on 17-5-18.
 */
var logger = require('../utils/logUtil')
var dateUtil = require('../DateUtil.js')

var action = {
  getReportParam: function (req) {
    var param = {
      type: "",
      mustWord: "", // 同现词
      mustNotWord: "", // 排除词
      shouldWord: "", // 关键词
      startDate: "",
      endDate: ""
    }

    // 获取页面请求参数，解析参数,获得报告关键词和时间．
    param.type = req.query.type
    if (req.query.type === "SPECIAL") {
      param.name = req.query.name
    }
    param.startDate = dateUtil.formatDate(new Date(parseFloat(req.query.startTime)), "yyyy-MM-dd")
    param.endDate = dateUtil.formatDate(new Date(parseFloat(req.query.endTime)), "yyyy-MM-dd")
    param.shouldWord = req.query.shouldWord
    param.mustWord = req.query.mustWord
    param.mustNotWord = req.query.mustNotWord

    if (req.query.type === "MONTHLY") {
      param.trendStartData = dateUtil.formatDate(dateUtil.addDate(new Date(parseFloat(req.query.startTime)), "M", -1), "yyyy-MM-dd")
    } else if (req.query.type === "WEEKLY") {
      param.trendStartData = dateUtil.formatDate(dateUtil.addDate(new Date(parseFloat(req.query.startTime)), "d", -7), "yyyy-MM-dd")
    }

    logger.log("getReportParam", param)

    return param
  }

}

module.exports = action