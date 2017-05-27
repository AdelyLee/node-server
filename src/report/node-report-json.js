/**
 * Created by lyc on 17-5-22.
 */
var http = require('http');
var builder = require('./BriefingBuilder.js');
var service = require('./decisionReport.js');
var fs = require('fs');
var node_echarts = require('../charts/index.js');

exports.getBriefingJson = function (file) {
    // get the default briefing json data
    var briefingData = fs.readFileSync(file, 'utf8');
    let briefingObj = JSON.parse(briefingData);

    // 处理数据
    briefingObj = mikeBriefing(briefingObj);

    builder.briefingDirector.createBriefing(briefingObj);
    var briefingBuilder = builder.briefingBuilder;
    var briefing = briefingBuilder.briefing;

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
        renderData = service[method]();
        briefingCellObj.option = renderData.option;
        briefingCellObj.description = renderData.description;

        console.log("briefingCellObj.description", briefingCellObj.description);
        // according to the option create the image
        // if the chart type is not keywordsCloud use echarts to draw chart
        if (briefingCellObj.chartType != 'keywordsCloud') {
            node_echarts({
                path: __dirname + '/images/' + briefingCellObj.chartId + '.png',
                option: JSON.parse(briefingCellObj.option),
                width: 800,
                height: 500
            });

            // get the image switch to base64
            var file = __dirname + '/images/' + briefingCellObj.chartId + '.png';
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