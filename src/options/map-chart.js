/**
 * Created by lyc on 17-7-24.
 */
var jQuery = require('../utils/jqueryUtil')
/**
 * get map chart option by the data and chartConfig.
 * @param data
 * data format as:
 * [{
 *    name: 'mapOne',
 *    data: [{name: 'a', value: 29},
 *    {'name': 'b', 'value': 7},
 *    {'name': 'a', 'value': 29},
 *    {'name': 'b', 'value': 7}]
 * },
 * {
 *    name: 'mapTwo',
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
  let { tooltipData = {}, legendData = {}, gridData = {}, seriesData } = chartConfig
  let defaultTooltipData = { trigger: 'axis', axisPointer: { type: 'shadow' } }
  let defaultLegendData = { x: 'center', y: 'top', data: [] }
  let defaultGridData = { top: '8%', bottom: '20%', left: '5%', containLabel: true }
  jQuery.extend(true, tooltipData, defaultTooltipData)
  jQuery.extend(true, legendData, defaultLegendData)
  jQuery.extend(true, gridData, defaultGridData)
  let seriesRenderData = []
  let defaultSeriesItem = {
    name: '',
    type: 'bar',
    data: [],
    barMaxWidth: '40',
    itemStyle: {
      normal: {
        color: function (params) {
          return color[params.dataIndex % 15]
        }
      }
    }
  }

  if (data.length > 0) {
    data.forEach(function (item, i) {
      let seriesItem = {}
      jQuery.extend(true, seriesItem, defaultSeriesItem)
      jQuery.extend(true, seriesItem, seriesData[i])
      seriesItem.name = item.name
      seriesItem.data = item.data
      legendData.data.push(item.name)
      seriesRenderData.push(seriesItem)
    })
  }

  return {
    color: color,
    tooltip: tooltipData,
    legend: legendData,
    grid: gridData,
    series: seriesRenderData
  }
}
