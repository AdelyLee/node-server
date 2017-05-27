/**
 * Created by lyc on 17-5-22.
 */

var node_echarts = require('index.js');
var service = require('./../../../report/decisionReport.js');
var path = require('path');
var http = require('http');
var option = {};

http.get('http://localhost:8090/static/api/echarts.json', (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
        error = new Error(`Request Failed.\n` +
            `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.\n` +
            `Expected application/json but received ${contentType}`);
    }
    if (error) {
        console.log(error.message);
        // consume response data to free up memory
        res.resume();
        return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
        try {
            let parsedData = JSON.parse(rawData);
            console.log(parsedData);
            let renderData = parsedData.data;
            for(let itme of renderData) {
                service[itme.method]().then(function (json) {
                    option =  json;

                    node_echarts({
                        path: __dirname + '/' + itme.name + '.png',
                        option: option,
                        width:  800,
                        height: 500
                    })
                }, function (error) {
                    console.error('出错了', error);
                });
            }
        } catch (e) {
            console.log(e.message);
        }
    });
}).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
});



