/**
 * Created by lyc on 17-5-22.
 * Test to create svg and switch svg to png.
 */

var node_charts = require('./index.js');
var path = require('path');
var http = require('http');

var keywordsOption = {
    "data": [
        {
            "score": "65.67776573189687",
            "keyword": "祖保"
        },
        {
            "score": "64.21964108902947",
            "keyword": "事故"
        },
        {
            "score": "57.05990895158183",
            "keyword": "爆炸"
        },
        {
            "score": "45.49878630661866",
            "keyword": "煤矿"
        },
        {
            "score": "38.46322192033739",
            "keyword": "台海网"
        },
        {
            "score": "36.71511953052736",
            "keyword": "湖南"
        },
        {
            "score": "36.541292698908165",
            "keyword": "3名"
        },
        {
            "score": "36.36852313381715",
            "keyword": "涟源煤矿"
        },
        {
            "score": "35.34591962919512",
            "keyword": "谢汉生"
        },
        {
            "score": "35.147995674201965",
            "keyword": "马学富"
        },
        {
            "score": "34.95007171920881",
            "keyword": "广品"
        },
        {
            "score": "29.315124605613615",
            "keyword": "受伤"
        },
        {
            "score": "26.30739235117416",
            "keyword": "湖南娄底涟源市"
        },
        {
            "score": "25.96102542993613",
            "keyword": "斗笠山镇"
        },
        {
            "score": "24.82296268872546",
            "keyword": "中新社"
        },
        {
            "score": "24.67751222199061",
            "keyword": "腾飞煤业有限公司"
        },
        {
            "score": "24.57555774498401",
            "keyword": "钟欣"
        },
        {
            "score": "20.837812200843757",
            "keyword": "资料"
        },
        {
            "score": "20.774664893672387",
            "keyword": "2月"
        },
        {
            "score": "20.7430684451649",
            "keyword": "14日"
        },
        {
            "score": "20.158490044182436",
            "keyword": "记者"
        },
        {
            "score": "18.79984817885331",
            "keyword": "发生"
        },
        {
            "score": "18.37333480710341",
            "keyword": "10"
        },
        {
            "score": "18.341698229855645",
            "keyword": "小时"
        },
        {
            "score": "18.08892719481888",
            "keyword": "伤员"
        },
        {
            "score": "18.05733081543928",
            "keyword": "生命体"
        },
        {
            "score": "17.930945297920893",
            "keyword": "涟源"
        },
        {
            "score": "17.504394176296344",
            "keyword": "矿工"
        },
        {
            "score": "17.472829554813877",
            "keyword": "分别"
        },
        {
            "score": "17.235824951569775",
            "keyword": "伤情"
        },
        {
            "score": "17.20443452626186",
            "keyword": "主要"
        },
        {
            "score": "15.16629528359353",
            "keyword": "144"
        },
        {
            "score": "10.967132834867341",
            "keyword": "平稳"
        },
        {
            "score": "10.910231220433694",
            "keyword": "遇难"
        }
    ]
};

node_charts.renderKeywordsCloud({
    path: __dirname + '/images/test',
    option: keywordsOption,
    width: 400,
    height: 400
});
