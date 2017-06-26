var express = require('express');
var app = express();
var fs = require('fs');
var report = require('./src/report/node-report-json.js');
var action = require('./src/report/reportParam.js');

// 跨域请求设置
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//  http://localhost:8081/briefingJson?id=1&reportType=SPECIAL
//  http://localhost:8081/briefingJson?type=MONTHLY&startTime=1493568000000&endTime=1496246400000&mustWord=安徽&shouldWord=安全生产@安徽煤炭@安徽煤矿@煤矿@煤炭@煤业@煤窑@安徽煤矿@矿井@煤企@矿业@矿难@矿工@矿长@矿主@煤窑@黑煤矿@煤矿事故@瓦斯爆炸@煤尘爆炸@爆炸@透水@溃水@火灾@煤层自燃@煤尘@煤尘爆炸自燃@塌方@冲击@垮塌@崩塌@顶板@冒顶@塌陷@中毒@事故@缺氧@通风不畅@突出@窒息@遇难@爆燃@爆裂@被埋@违规@违章@违反@管理不当@失职@渎职@@伤亡@死亡@受伤@救援@抢险@隐患@危险@整改@冒险@擅自@贪污@腐败@受贿@混乱@监管不力@瞒报@超限超标@非法@拖欠工资@职业危害@职业病@事故@应急救援&mustNotWord=
//  http://localhost:8081/briefingJson?type=WEEKLY&startTime=1495987200000&endTime=1496592000000&mustWord=安徽&shouldWord=事故@煤矿&mustNotWord=
//  http://localhost:8081/briefingJson?type=WEEKLY&startTime=1496592000000&endTime=1497196800000&mustWord=安徽&shouldWord=事故@煤矿&mustNotWord=

app.get('/briefingJson', function (req, res) {
    // 将参数设置为全局变量
    console.log("get briefing json", JSON.stringify(req.query));
    global.reportParam = action.getReportParam(req);
    var briefingJson = report.getBriefingJson();

    fs.writeFile('briefing.json', briefingJson, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });

    res.end(briefingJson);
});

app.get('/briefingJson1', function (req, res) {
    var projectPath = process.cwd();
    var file = projectPath + "/data/" + "briefing.json";
    // get the default briefing json data
    var briefingData = fs.readFileSync(file, 'utf8');
    var briefingObj = JSON.parse(briefingData);

    res.end(JSON.stringify(briefingObj));
});


app.get('/briefingJson2', function (req, res) {
    var projectPath = process.cwd();
    var file = projectPath + "/data/" + "specialBriefing.json";

    // get the default briefing json data
    var briefingData = fs.readFileSync(file, 'utf8');
    var briefingObj = JSON.parse(briefingData);

    res.end(JSON.stringify(briefingObj));
});

app.get('/briefingJson.json', function (req, res) {
    var file = __dirname + "/" + "briefing.json";

    fs.readFile(file, (err, briefingJson) => {
        if (err) throw err;
        res.end(briefingJson);
    });
});

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)
});
