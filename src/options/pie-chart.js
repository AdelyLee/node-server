/**
 * Created by lyc on 17-7-24.
 */
var jQuery = require('../utils/jqueryUtil')
const {
  legendLabelColor
} = {
  legendLabelColor: '#333'
}
/**
 * get pie chart option by the data and chartConfig.
 * @param data
 * data format as:
 * [{
 *    name: 'pieOne',
 *    data: [{name: 'a', value: 29},
 *    {'name': 'b', 'value': 7},
 *    {'name': 'a', 'value': 29},
 *    {'name': 'b', 'value': 7}]
 * },
 * {
 *    name: 'pieTwo',
 *    data: [{'name': 'e', 'value': 29},
 *    {'name': 'f', 'value': 7}]
 * }]
 * @param chartConfig
 * config of the chart
 * @returns option
 */
exports.getOption = function (data, chartConfig) {
  let color = ['#21b6b9', '#eba954', '#0092ff', '#d74e67', '#27727B', '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD', '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0']
  chartConfig = chartConfig || {}
  let defaultTooltipData = {
    trigger: 'item',
    formatter: '{a}<br/>{b} : {c} ({d}%)'
  }
  let defaultLegendData = {
    x: 'center',
    y: 'top',
    data: [],
    textStyle: {
      fontSize: 14,
      color: legendLabelColor
    }
  }
  let {
    tooltipData = defaultTooltipData, legendData = defaultLegendData, seriesData
  } = chartConfig
  let seriesRenderData = []
  let defaultSeriesItem = {
    name: '',
    type: 'pie',
    radius: ['40%', '55%'],
    avoidLabelOverlap: false,
    data: []
  }
  jQuery.extend(true, defaultLegendData, legendData)
  legendData = defaultLegendData
  if (data.length > 0) {
    data.forEach(function (item, i) {
      let seriesItem = {}
      if (seriesData) {
        jQuery.extend(true, seriesItem, defaultSeriesItem, seriesData[i])
        seriesRenderData.push(seriesItem)
      } else {
        jQuery.extend(true, seriesItem, defaultSeriesItem)
        seriesItem.name = item.name
        seriesItem.data = item.data
        seriesRenderData.push(seriesItem)
      }
      if (item.data.length > 0) {
        item.data.forEach(function (obj) {
          legendData.data.push(obj.name)
        })
      }
    })
  }

  return {
    color: color,
    tooltip: tooltipData,
    legend: legendData,
    series: seriesRenderData
  }
}
