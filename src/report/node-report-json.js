/**
 * Created by lyc on 17-5-22.
 */
var http = require('http');
var fs = require('fs');
var request = require('request');
var deasync = require('deasync');

var url = require('./common.js');
var builder = require('./BriefingBuilder.js');
var monthlyReportService = require('./monthlyReport.js');
var specialReportService = require('./specialReport.js');
var node_charts = require('../charts/index.js');
var headers = require('../headerUtil');


var service = monthlyReportService;
exports.getBriefingJson = function () {
    var param = global.reportParam;
    var baseReportType = "";
    // if type is "monthly" the service is decisionReportService, or the type is "special" this service is specialReportService.
    if (param.type === "MONTHLY") {
        service = monthlyReportService;
        baseReportType = "BASE_MONTHLY";
    } else if (param.type === "SPECIAL") {
        service = specialReportService;
        baseReportType = "BASE_SPECIAL";
    } else if (param.type === "WEEKLY") {
        service = monthlyReportService;
        baseReportType = "BASE_WEEKLY";
    }

    var briefing = {}, isReturn = false;
    // get the default briefing json data
    var urlPath = url.webserviceUrl + '/briefing/detail/type?type=' + baseReportType;
    request({
        url: urlPath,
        method: "get",
        json: true,
        headers: headers.getRequestHeader()
    }, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('http request return!');
            isReturn = true;

            var briefingData = data[0];
            if (briefingData._id) {
                delete briefingData._id;
            }
            var briefingObj = briefingData;
            // 处理数据
            briefingObj = mikeBriefing(briefingObj);

            builder.briefingDirector.createBriefing(briefingObj);
            var briefingBuilder = builder.briefingBuilder;
            briefing = briefingBuilder.briefing;

            if (param.type === "MONTHLY") {
                briefing.type = "MONTHLY";
            } else if (param.type === "SPECIAL") {
                briefing.type = "SPECIAL";
            } else if (param.type === "WEEKLY") {
                briefing.type = "WEEKLY";
            }

            // 获取报告 title, outline, summary, author, createTime, issue 信息．
            briefing.title = service.getBriefingTitle(param);
            briefing.subTitle = service.getBriefingSubTitle(param);
            briefing.issue = service.getBriefingIssue(param);
            briefing.author = service.getBriefingAuthor(param);
            briefing.createTime = service.getBriefingCreateTime(param);
            briefing.outline = service.getBriefingOutline(param);
            briefing.summary = service.getBriefingSummary(param);

        }
    });

    while (!isReturn) {
        deasync.runLoopOnce();
    }

    return JSON.stringify(briefing);
};

function mikeBriefing(briefingObj) {
    var briefingBodyArray = briefingObj.briefingBody;
    var briefingBody = [];
    for (var item of briefingBodyArray) {
        briefingBody.push(mikeBriefingCell(item));
    }

    briefingObj.briefingBody = briefingBody;
    return briefingObj;
}

function mikeBriefingCell(briefingCellObj) {
    // 获取数据
    var renderData = {};
    var method = briefingCellObj.method;

    if (method != "" && method != undefined) {
        renderData = service[method](global.reportParam);
        briefingCellObj.option = renderData.option;
        briefingCellObj.description = renderData.description;
        // according to the option create the image
        // if the chart type is not keywordsCloud use echarts to draw chart
        var file = __dirname + '/images/' + briefingCellObj.chartId + '.png';
        if (briefingCellObj.chartType && briefingCellObj.chartType != '' && briefingCellObj.chartType != 'keywordsCloud') {
            node_charts.renderEcharts({
                path: __dirname + '/images/' + briefingCellObj.chartId + '.png',
                option: briefingCellObj.option,
                width: 800,
                height: 500
            });
        } else if (briefingCellObj.chartType == 'keywordsCloud') {
            node_charts.renderKeywordsCloud({
                path: __dirname + '/images/' + briefingCellObj.chartId + '.png',
                option: briefingCellObj.option,
                width: 400,
                height: 400
            });
        }

        if (briefingCellObj.chartType && briefingCellObj.chartType != '') {
            // get the image switch to base64
            briefingCellObj.imageUrl = base64_encode(file);
        }
    }

    var briefingCellChildren = briefingCellObj.children;
    var briefingCells = [];

    if (briefingCellChildren.length > 0) {
        for (var item of briefingCellChildren) {
            briefingCells.push(mikeBriefingCell(item));
        }
    }

    return briefingCellObj;
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}