/**
 * Created by lyc on 17-5-18.
 */
var url = require('./common.js');
var dateUtil = require('../DateUtil.js');
var request = require('request');
var deasync = require('deasync');
var headers = require('../headerUtil');

var action = {
    getReportParam: function (req) {
        var param = {
            type: "MONTHLY",
            mustWord: "",  // 关键词
            mustNotWord: "",　// 排除词
            shouldWord: "",    //　同现词
            startDate: '2017-02',
            endDate: '2017-03'
        };

        // 获取页面请求参数，解析参数,获得报告关键词和时间．
        var reportType = req.query.reportType;
        var reportId = req.query.id;
        var startTime = req.query.startTime;
        var endTime = req.query.endTime;

        var isReturn = false;
        if (reportType === "SPECIAL") {
            // 如果是专报，　通过专报Id获取关键词信息
            var urlPath = url.webserviceUrl + '/customSubject/' + reportId;
            request({
                url: urlPath,
                method: "get",
                json: true,
                headers: headers.getRequestHeader()
            }, function (error, response, data) {
                if (!error && response.statusCode == 200) {
                    console.log('http request return!');
                    isReturn = true;
                    param = data;
                    param.type = reportType;

                    // 将获取的时间戳转换为Date
                    var startDate = dateUtil.formatDate(new Date(data.startDate), "yyyy-MM-dd");
                    var endDate = dateUtil.formatDate(new Date(data.endDate), "yyyy-MM-dd");

                    param.startDate = startDate;
                    param.endDate = endDate;
                }
            });
        } else {
            // 获取基础关键词
            var urlPath = url.webserviceUrl + '/keywords/findByType/?type=BASIC';
            request({
                url: urlPath,
                method: "get",
                json: true,
                headers: headers.getRequestHeader()
            }, function (error, response, data) {
                if (!error && response.statusCode == 200) {
                    console.log('http request return!');
                    isReturn = true;

                    param = data;
                    param.type = reportType;

                    // 封装时间相关的参数
                    // 将获取的时间戳转换为Date
                    var startDate = dateUtil.formatDate(new Date(parseFloat(startTime)), "yyyy-MM-dd");
                    var endDate = dateUtil.formatDate(new Date(parseFloat(endTime)), "yyyy-MM-dd");
                    var trendStartData = "";
                    switch (reportType) {
                        case "WEEKLY":
                            trendStartData = dateUtil.formatDate(dateUtil.addDate(new Date(parseFloat(startTime)), "d", -7), "yyyy-MM-dd");
                            break;
                        case "MONTHLY":
                            trendStartData = dateUtil.formatDate(dateUtil.addDate(new Date(parseFloat(startTime)), "M", -1), "yyyy-MM-dd");
                            break;
                    }

                    param.startDate = startDate;
                    param.endDate = endDate;
                    param.trendStartData = trendStartData;
                }
            });
        }

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return param;
    }

};

module.exports = action;
