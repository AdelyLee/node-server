/**
 * Created by lyc on 17-6-15.
 */
var url = require('./report/common.js');
var request = require('request');

var action = {
    login: function () {
        var param = {
            username: "node_service",
            password: "node_service_topcom"
        };

        var urlPath = url.webserviceUrl + '/login/login';
        request({
            url: urlPath,
            method: "post",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: param
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('login success!');
                global.token = data.token;

            }
        });
    },

    getRequestHeader: function () {
        var self = this;
        var headers = {"content-type": "application/json"};
        if (global.token == undefined) {
            self.login();
        }
        headers.Authorization = global.token;

        return headers;
    }
};

module.exports = action;