/**
 * Created by lyc on 17-6-12.
 */
var request = require('request');
var querystring = require('querystring');
var deasync = require('deasync');
var url = require('./common.js');
var headers = require('../headerUtil');

const actions = {
    getProvinceLocality: function (provinces) {
        var renderData = {}, isReturn = false;
        var param = {
            province: provinces
        };

        var urlPath = url.webserviceUrl + '/description/getProvinceLocality.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getProvinceLocality http request return!');
                isReturn = true;

                renderData = data;
            } else {
                console.log("get getProvinceLocality data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    getOutOFAve: function(lastMonthNum, monthNum){
        var renderData = {}, isReturn = false;
        var param = {
            lastMonthNum: lastMonthNum,
            monthNum: monthNum
        };

        var urlPath = url.webserviceUrl + '/description/outOFAve';
        request({
            url: urlPath,
            method: "post",
            json: true,
            headers: headers.getRequestHeader(),
            body: param
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getOutOFAve http request return!');
                isReturn = true;

                renderData = data;
            } else {
                console.log("get getOutOFAve data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    getTrendOfOpinion: function(lastMonthNum, monthNum){
        var renderData = {}, isReturn = false;
        var param = {
            lastMonthNum: lastMonthNum,
            monthNum: monthNum
        };

        var urlPath = url.webserviceUrl + '/description/trendOfOpinion';
        request({
            url: urlPath,
            method: "post",
            json: true,
            headers: headers.getRequestHeader(),
            body: param
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getTrendOfOpinion http request return!');
                isReturn = true;

                renderData = data;
            } else {
                console.log("get getTrendOfOpinion data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    getHotArticle: function(keywords, startDate, endDate){
        var renderData = {}, isReturn = false;
        var param = {
            groupName: 'title.raw',
            mustWord: keywords.mustWord,
            mustNotWord: keywords.mustNotWord,
            shouldWord: keywords.shouldWord,
            s_date: startDate,
            e_date: endDate,
        };

        var urlPath = url.webserviceUrl + '/es/filterAndGroupBy.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getHotArticle http request return!');
                isReturn = true;

                if (data.length > 0) {
                    renderData = data[0];
                }
            } else {
                console.log("get getHotArticle data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    }
};

module.exports = actions;