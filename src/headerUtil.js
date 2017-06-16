/**
 * Created by lyc on 17-6-15.
 */
var url = require('./report/common.js');
var request = require('request');
var deasync = require('deasync');
var querystring = require('querystring');

var action = {
    login: function () {
        var renderData = {}, isReturn = false;
        var param = {
            username: "node_service",
            password: "node_service_topcom",
            captcha: "test"
        };

        var urlPath = url.webserviceUrl + '/login/login?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "post",
            headers: {
                "content-type": "application/json",
            }
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                isReturn = true;
                console.log('login success!');
                data = JSON.parse(data);
                global.token = data.token;

                renderData.token = data.token;
            } else {
                isReturn = true;
                console.log("login error", response);
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    getRequestHeader: function () {
        var self = this;
        var headers = {"content-type": "application/json"};
        if (global.token == undefined) {
            var renderData = self.login();
            console.log('token', renderData.token);
        }
        if (global.token != undefined) {
            headers.Authorization = global.token;
        }

        return headers;
    }
};

module.exports = action;