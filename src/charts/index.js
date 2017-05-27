/**
 * Created by lyc on 17-5-19.
 */
var echarts = require("echarts");
var d3 = require('d3');
var d3LayoutCloud = require("d3.layout.cloud");
var Canvas = require("canvas");
var fs = require('fs');
var path = require('path');
var MapChartUtil = require("./mapChartUtil");
var jsdom = require('jsdom');

/**
 * @param config = {
        width: 图表宽度
        height: 图表高度
        option: echarts配置
        path:  生成文件路径
    }
 *
 */

const chart = {
    renderEcharts: function (config) {
        if (config.canvas) {
            Canvas = config.canvas;
        }
        echarts.setCanvasCreator(function () {
            return ctx;
        });
        var ctx = new Canvas(128, 128);
        var chart, option = {
            title: {
                text: 'test'
            },
            tooltip: {},
            legend: {
                data: ['test']
            },
            xAxis: {
                data: ["a", "b", "c", "d", "f", "g"]
            },
            yAxis: {},
            series: [{
                name: 'test',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20]
            }]
        };
        config.width = config.width || 500;
        config.height = config.height || 500;
        config.option = config.option || option;
        config.path = config.path || process.cwd() + '/test.png';
        if (config.font) {
            ctx.font = config.font;
        }

        config.option.animation = false;
        // if the chart type is map should call the geo json to render the map chart.
        if (config.option.series[0] && config.option.series[0].type === 'map') {
            var mapType = config.option.series[0].mapType;
            var mapJson = getMapJson(mapType);
            echarts.registerMap(mapType, mapJson);
        }

        chart = echarts.init(new Canvas(parseInt(config.width, 10), parseInt(config.height, 10)));
        chart.setOption(config.option);
        try {
            fs.writeFileSync(config.path, chart.getDom().toBuffer());
            console.log("Create Img:" + config.path)
        } catch (err) {
            console.error("Error: Write File failed" + err.message)
        }
    },

    renderKeywordsCloud: function (config) {
        var data = config.option.data;
        var height = config.height || 400;
        var width = config.width || 400;
        var fill = d3.scale.category20();
        var scale = d3.scale.linear().domain(
            [0, data[0].score / 3, data[0].score]).range([10, 20, 50]);
        var document = jsdom.jsdom();

        var layout = d3LayoutCloud()
            .size([width, height])
            .words(data.map(function (d) {
                return {
                    text: d.keyword,
                    size: scale(d.score)
                };
            })).padding(2).rotate(function () {
                return ~~(Math.random() * 2) * 90;
            }).font("Impact").fontSize(function (d) {
                return d.size;
            }).on("end", draw);

        layout.start();

        function draw(words) {
            var svg = d3.select(document.body).append("svg")
                .attr("width", '100%')
                .attr("height", '100%')
                .style("border-radius", width + "px")
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("font-size", function (d) {
                    return d.size + "px";
                }).style("font-family", "黑体")
                .style("fill", function (d, i) {
                    return fill(i);
                }).attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                }).text(function (d) {
                    return d.text;
                });

            // svgToPng(svg, 400, 400)
        }

        //svg 保存成Png  fuction
        function svgToPng(svg, pngWidth, pngHeight) {
            var serializer = new XMLSerializer();
            var source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svg.node());
            var image = new Image;
            image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            var canvas = document.createElement("canvas");
            canvas.width = pngWidth;
            canvas.height = pngHeight;
            var context = canvas.getContext("2d");
            context.fillStyle = '#fff';//设置保存后的PNG 是白色的
            context.fillRect(0, 0, 10000, 10000);
            context.drawImage(image, 0, 0);
            return canvas.toDataURL("image/png");
        }
    }
};

module.exports = chart;

function getMapJson(mapTypeStr) {
    var mapType = mapTypeStr == undefined ? "china" : mapTypeStr;
    var provinces = [];
    for (var province in MapChartUtil._provinceMap) {
        provinces.push(province);
    }

    var geoJsonName = "";
    var filePath = path.resolve('./');
    var mapJsonUrl = filePath + '/static/geoJson/china.json';
    if (mapType === 'china') {
        mapJsonUrl = filePath + '/static/geoJson/china.json';
    } else if (provinces.indexOf(mapType) !== -1) {
        geoJsonName = MapChartUtil._provinceMap[mapType];
        mapJsonUrl = filePath + '/static/geoJson/geometryProvince/' + geoJsonName + '.json';
    } else {
        geoJsonName = MapChartUtil.cityMap[mapType];
        if (geoJsonName == undefined) {
            mapJsonUrl = filePath + '/static/geoJson/china.json';
        } else {
            mapJsonUrl = filePath + '/static/geoJson/geometryCounties/' + geoJsonName + '.json';
        }
    }

    return fs.readFileSync(mapJsonUrl, 'utf8');
}
