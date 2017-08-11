/**
 * Created by lyc on 17-5-19.
 */
var logger = require('../utils/logUtil')
var echarts = require("echarts")
var d3 = require("d3")
var d3LayoutCloud = require("d3-cloud")
var Canvas = require("canvas")
var fs = require('fs')
var svg2png = require('svg2png')
var path = require('path')
var MapChartUtil = require("./mapChartUtil")

// 引用d3-node后台生成png图片
const D3Node = require('d3-node')
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
      Canvas = config.canvas
    }
    echarts.setCanvasCreator(function () {
      return ctx
    })
    var ctx = new Canvas(128, 128)
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
    }
    config.width = config.width || 500
    config.height = config.height || 500
    config.option = config.option || option
    config.path = config.path || process.cwd() + '/test.png'
    if (config.font) {
      ctx.font = config.font
    }

    config.option.animation = false
    // if the chart type is map should call the geo json to render the map chart.
    if (config.option.series && config.option.series[0] && config.option.series[0].type === 'map') {
      var mapType = config.option.series[0].mapType
      var mapJson = getMapJson(mapType)
      echarts.registerMap(mapType, mapJson)
    }

    chart = echarts.init(new Canvas(parseInt(config.width, 10), parseInt(config.height, 10)))
    chart.setOption(config.option)
    try {
      fs.writeFileSync(config.path, chart.getDom().toBuffer())
      logger.log("Create Img:" + config.path)
    } catch (err) {
      logger.error("Error: Write File failed" + err.message)
    }
  },

  renderKeywordsCloud: function (config) {
    var height = config.height || 400
    var width = config.width || 400
    const markup = '<div id="container"><div id="chart"></div></div>'
    var options = {
      selector: '#chart',
      container: markup
    }
    var d3n = new D3Node(options)

    if (config.option.data.length === 0) {
      var projectPath = process.cwd()
      var filename = projectPath + "/static/images/default.svg"
      var svgBuffer = fs.readFileSync(filename)
      var outputBuffer = svg2png.sync(svgBuffer, {
        width: 400,
        height: 400
      })
      fs.writeFileSync(config.path, outputBuffer)
      return
    }
    var data = config.option.data
    var fill = d3.scale.category20()
    var scale = d3.scale.linear().domain(
      [0, data[0].score / 3, data[0].score]).range([10, 20, 50])

    // 调用d3LayoutCloud必须传递canvas，主要是后台生成图片d3-cloud中document未定义
    var layout = d3LayoutCloud()
      .size([width, height])
      .canvas(d3n.createCanvas())
      .words(data.map(function (d) {
        return {
          text: d.keyword,
          size: scale(d.score)
        }
      })).padding(2).rotate(function () {
        return ~~(Math.random() * 2) * 90
      }).font("Impact").fontSize(function (d) {
        return d.size
      }).on("end", draw)

    layout.start()

    function draw(words) {
      var height = config.height || 400
      var width = config.width || 400
      d3n.createSVG(width, height)
        .style("border-radius", width + "px")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", function (d) {
          return d.size + "px"
        }).style("font-family", "微软雅黑")
        .style("fill", function (d, i) {
          return fill(i)
        }).attr("text-anchor", "middle")
        .attr("transform", function (d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"
        }).text(function (d) {
          return d.text
        })

      // 生成png图片
      try {
        // 使用同步方法生成图片svg2png.sync
        var svgBuffer = new Buffer(d3n.svgString(), 'utf-8')
        var outputBuffer = svg2png.sync(svgBuffer)
        fs.writeFileSync(config.path, outputBuffer)
        logger.log("Create Img:" + config.path)
      } catch (err) {
        logger.error("Error: Write File failed" + err.message)
      }

    }
  }
}

module.exports = chart

function getMapJson(mapTypeStr) {
  var mapType = mapTypeStr === undefined ? "china" : mapTypeStr
  var provinces = []
  for (var province in MapChartUtil._provinceMap) {
    provinces.push(province)
  }

  var geoJsonName = ""
  var filePath = path.resolve('./')
  var mapJsonUrl = filePath + '/static/geoJson/china.json'
  if (mapType === 'china') {
    mapJsonUrl = filePath + '/static/geoJson/china.json'
  } else if (provinces.indexOf(mapType) !== -1) {
    geoJsonName = MapChartUtil._provinceMap[mapType]
    mapJsonUrl = filePath + '/static/geoJson/geometryProvince/' + geoJsonName + '.json'
  } else {
    geoJsonName = MapChartUtil.cityMap[mapType]
    if (geoJsonName === undefined) {
      mapJsonUrl = filePath + '/static/geoJson/china.json'
    } else {
      mapJsonUrl = filePath + '/static/geoJson/geometryCounties/' + geoJsonName + '.json'
    }
  }

  return fs.readFileSync(mapJsonUrl, 'utf8')
}