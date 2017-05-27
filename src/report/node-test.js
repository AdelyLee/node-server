/**
 * Created by lyc on 17-5-24.
 *
 * nodejs 同步请求测试
 */

var url = require('./common.js');
var http = require('http');
var request = require('request');
var querystring = require('querystring');
var deasync = require('deasync');

// var get_http_status = function(url){
//     var status, isReturn = false;
//
//     http.get(url, function(res){
//         console.log('http request return!');
//         isReturn = true;
//         status = res.statusCode;
//     });
//
//     while(!isReturn){
//         deasync.runLoopOnce();
//     }
//
//     return status;
// }
//
// var reqUrl = 'http://www.taobao.com';
// console.log('begin to request: %s', reqUrl);
// console.log('http respons status is: %s', get_http_status(reqUrl));
// console.log('programe end');

var renderData = {}, isReturn = false;
var param = {
    s_date: '2017-02',
    e_date: '2017-04',
    dateType: 'day'
};

var urlPath = url.webserviceUrl + '/es/filterAndGroupByTime.json?'+ querystring.stringify(param);
console.log(urlPath);
request({
    url: urlPath,
    method: "get",
    json: true,
    headers: {
        "content-type": "application/json",
    }
}, function(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log('http request return!');
        console.log('body', body);
        isReturn = true;
        var seriesData_a = [];
        var seriesData_b = [];
        var xAxisData = [];
        var heatMax_a = [], heatMax_b = [];
        for (var item of body) {
            var node = {};
            var nodes = {};
            var month_name = item.key.substr(0, 7);
            if (month_name == "2017-02") {
                node.name = item.key.substr(8);
                node.value = item.value;
                heatMax_a = item.value;
                seriesData_a.push(node);
            } else if (month_name == "2017-03") {
                xAxisData.push(item.key.substr(8));
                nodes.name = item.key.substr(8);
                nodes.value = item.value;
                heatMax_b = item.value;
                seriesData_b.push(nodes);
            }
        }

        var option = {
            legend: {
                x: 'right',
                y: 'middle',
                orient: 'vertical',
                data: ['2017年2月', '2017年3月']
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
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    interval: 0,
                    rotate: 35,
                    textStyle: {
                        fontWeight: 600,
                        fontSize: 14
                    }
                }
            },
            series: [
                {
                    name: '2017年2月',
                    type: 'line',
                    data: seriesData_a
                },
                {
                    name: '2017年3月',
                    type: 'line',
                    data: seriesData_b

                }
            ]
        };

        renderData = option;
    } else {
        console.log("get getArticleTrendChart data error");
    }
});

while (!isReturn) {
    deasync.runLoopOnce();
}