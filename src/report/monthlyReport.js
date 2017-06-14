/**
 * Created by lyc on 17-5-18.
 */
var request = require('request');
var querystring = require('querystring');
var deasync = require('deasync');

var url = require('./common.js');
var utils = require('./utils.js');
var dateUtil = require('../DateUtil.js');
var descriptionUtil = require('./descriptionUtil.js');


const actions = {
    // 月报标题
    getBriefingTitle: function (report) {
        var reportMonth = dateUtil.formatDate(dateUtil.parseDate(report.startDate), 'yyyy年MM月');
        return '安全生产月报－' + reportMonth;
    },
    // 月报子标题
    getBriefingSubTitle: function (report) {
        return "";
    },
    // 月报期号
    getBriefingIssue: function (report) {
        return "";
    },

    // 月报作者
    getBriefingAuthor: function (report) {
        return "";
    },

    // 月报创建时间
    getBriefingCreateTime: function () {
        return dateUtil.formatDate(new Date(), "yyyy年MM月dd日");
    },

    // 月报概述
    getBriefingOutline: function (report) {
        return "";
    },

    // 月报总结
    getBriefingSummary: function (report) {
        return "";
    },

    // 获取载体类别数据
    getArticleTypeChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            groupName: "type",
            mustWord: report.mustWord,
            mustNotWord: report.mustNotWord,
            shouldWord: report.shouldWord,
            s_date: report.startDate,
            e_date: report.endDate
        };

        var urlPath = url.webserviceUrl + '/es/filterAndGroupBy.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: {
                "content-type": "application/json",
            }
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getArticleTypeChart http request return!');
                isReturn = true;

                // 拼装 chart option
                var total = 0;
                var seriesData = [];
                for (var item of data) {
                    total += item.value;
                    var node = {};
                    node.name = utils.resetArticleTypeName(item.key);
                    node.value = item.value;
                    seriesData.push(node);
                }

                var option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    legend: {},
                    series: [
                        {
                            name: '媒体类型',
                            type: 'pie',
                            radius: ['40%', '55%'],
                            label: {
                                normal: {
                                    show: true,
                                    textStyle: {
                                        fontSize: 20
                                    }
                                }
                            },
                            data: seriesData
                        }
                    ]
                };

                // make ArticleTypeChart description
                var itemsStr = "";
                seriesData.forEach(function (item, i) {
                    if (i < 3) {
                        itemsStr += "<span class='describe-redText'>" + item.name + item.value + "(" + (item.value * 100 / total).toFixed(2) + "%)</span>、";
                    }
                });
                itemsStr = itemsStr.substring(0, itemsStr.length - 1) + "。";
                var description = "<div class='describe-text'>根据互联网抓取的数据，对数据载体进行分析，共抓取数据<span class='describe-redText'>" + total + "</span>条，其中排名前三的为" + itemsStr + "</div>";

                renderData.option = option;
                renderData.description = description;
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    //　事故地域分布排行榜
    getAccidentAreaChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            "date": {
                "startDate": report.startDate,
                "endDate": report.endDate
            },
            "page": {
                "orders": [
                    {
                        "direction": "DESC",
                        "orderBy": "count"
                    }
                ]
            },
            "types": [
                "province"
            ]
        };

        var urlPath = url.webserviceUrl + '/accident/aggByTypes';
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
                console.log('getAccidentAreaChart http request return!');
                isReturn = true;

                // 拼装 chart option
                var total = 0, seriesData = [], yAxisData = [];
                data = data.sort(function (a, b) {
                    return b.count - a.count;
                });
                data.forEach(function (item, i) {
                    total += item.count;
                    if (i < 6) {
                        seriesData.push(item.count);
                        yAxisData.push(item.id);
                    }
                });

                var option = {
                    legend: {},
                    yAxis: {
                        data: yAxisData,
                        axisLabel: {
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 20
                            }
                        }
                    },
                    xAxis: {
                        axisLabel: {
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 20
                            }
                        }
                    },
                    series: [
                        {
                            name: '事故起数',
                            type: 'bar',
                            data: seriesData,
                            barMaxWidth: 45,
                            itemStyle: {
                                normal: {
                                    color: function (params) {
                                        // build a color map as your need.
                                        var colorList = [
                                            '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
                                            '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                                            '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                                        ];
                                        return colorList[params.dataIndex % 15]
                                    }
                                }
                            }
                        }
                    ]
                };

                // make ArticleTypeChart description
                var itemsStr = "";
                data.forEach(function (item, i) {
                    if (i < 6) {
                        itemsStr += "<span class='describe-redText'>" + item.id + item.count + "(" + (item.count * 100 / total).toFixed(2) + "%)</span>、";
                    }
                });
                itemsStr = itemsStr.substring(0, itemsStr.length - 1) + "。";
                var provinces = yAxisData.join(",");
                var provinceArray = descriptionUtil.getProvinceLocality(provinces);
                var provinceStr = "";
                provinceArray.forEach(function (item) {
                    provinceStr += "以<span class='describe-redText'>" + item.value + "</span>为代表的<span class='describe-redText'>" + item.key + "</span>地区,"
                });

                provinceStr = provinceStr.substring(0, provinceStr.length - 1) + "事故发生率较高";

                // 实现数据反转
                seriesData.reverse();
                yAxisData.reverse();

                var description = "<div class='describe-text'>根据互联网抓取的数据，对本月事故情况进行分析，共发生事故<span class='describe-redText'>" + total + "</span>起，其中" + provinceStr + "。发生较多的省份为" + itemsStr + "</div>";
                renderData.option = option;
                renderData.description = description;

            } else {
                console.log("get getAccidentAreaChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    //趋势图
    getArticleTrendChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            dateType: 'day',
            mustWord: report.mustWord,
            mustNotWord: report.mustNotWord,
            shouldWord: report.shouldWord,
            s_date: report.trendStartData,
            e_date: report.endDate
        };

        var urlPath = url.webserviceUrl + '/es/filterAndGroupByTime.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: {
                "content-type": "application/json",
            }
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getArticleTrendChart http request return!');
                isReturn = true;
                var total_a = 0, total_b = 0, seriesData_a = [], seriesData_b = [], xAxisData = [], xAxisData_a = [], xAxisData_b = [], indexOfMax_a = 0, indexOfMin_a = 0, indexOfMax_b = 0, indexOfMin_b = 0, legendData = [];
                var startDate, startTempDate, startDateStr, endDateStr;
                if (report.type == "MONTHLY") {
                    startDate = dateUtil.parseDate(param.s_date);
                    startTempDate = dateUtil.addDate(startDate, "M", 1);
                    startDateStr = dateUtil.formatDate(startDate, 'yyyy年MM月');
                    endDateStr = dateUtil.formatDate(startTempDate, 'yyyy年MM月');

                    legendData.push(startDateStr);
                    legendData.push(endDateStr);

                    var lastMonthNum = [], monthNum = [];
                    for (var item of data) {
                        var itemDate = dateUtil.parseDate(item.key);
                        var itemDateStr = dateUtil.formatDate(itemDate, 'yyyy-MM');
                        if (itemDateStr == dateUtil.formatDate(startDate, 'yyyy-MM')) {
                            xAxisData_a.push(itemDate.getDate());
                            seriesData_a.push(item.value);

                            lastMonthNum.push(item);
                        } else if (itemDateStr == dateUtil.formatDate(startTempDate, 'yyyy-MM')) {
                            xAxisData_b.push(itemDate.getDate());
                            seriesData_b.push(item.value);

                            monthNum.push(item);
                        }
                    }
                    // 以天数长的月份作为横轴坐标
                    if (xAxisData_a.length > xAxisData_b.length) {
                        xAxisData = xAxisData_a;
                    } else {
                        xAxisData = xAxisData_b;
                    }
                    // 获取数据的最高点和最地点
                    indexOfMax_a = seriesData_a.indexOf(Math.max.apply(Math, seriesData_a));
                    indexOfMin_a = seriesData_a.indexOf(Math.min.apply(Math, seriesData_a));

                    indexOfMax_b = seriesData_b.indexOf(Math.max.apply(Math, seriesData_b));
                    indexOfMin_b = seriesData_b.indexOf(Math.min.apply(Math, seriesData_b));
                    // 获取所有数据总数
                    seriesData_a.forEach(function (value) {
                        total_a += value;
                    });
                    seriesData_b.forEach(function (value) {
                        total_b += value;
                    });
                }

                var option = {
                    legend: {
                        x: 'right',
                        y: 'middle',
                        orient: 'vertical',
                        data: legendData
                    },
                    grid: {
                        left: '4%',
                        right: '150px',
                        bottom: '3%',
                        containLabel: true
                    },
                    color: ['#e7ba09', '#30a8dd'],
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: xAxisData,
                        axisLabel: {
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 16
                            }
                        }
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontWeight: 600,
                                fontSize: 18
                            }
                        }
                    },
                    series: [
                        {
                            name: startDateStr,
                            type: 'line',
                            data: seriesData_a
                        },
                        {
                            name: endDateStr,
                            type: 'line',
                            data: seriesData_b
                        }
                    ]
                };

                var waveResultStr = "";
                var wave = descriptionUtil.getTrendOfOpinion(lastMonthNum, monthNum);
                if (wave) {
                    waveResultStr = '波动更大,个别话题引起舆情热度较大起伏';
                } else {
                    waveResultStr = '更平稳一些,但是个别话题引起舆情热度较大起伏';
                }
                var waveStr = '从舆情热度趋势来看, <span class="describe-redText">' + parseInt(startTempDate.getMonth() + 1)
                    + '</span>月份的舆情热度与<span class="describe-redText">' + parseInt(startDate.getMonth() + 1)
                    + '</span>月份相比' + waveResultStr + "。";

                var hotStartDateTemp = startTempDate.getFullYear() + "-" + parseInt(startTempDate.getMonth() + 1) + "-" + parseInt(indexOfMax_b + 1);
                var hotStartDate = dateUtil.formatDate(dateUtil.parseDate(hotStartDateTemp), 'yyyy-MM-dd');
                var hotEndDate = dateUtil.formatDate(dateUtil.addDate(dateUtil.parseDate(hotStartDate), 'd', 1), 'yyyy-MM-dd');
                var heightData = descriptionUtil.getHotArticle(report, hotStartDate, hotEndDate);
                var heightStr = "";
                if (heightData.key){
                    heightStr = '<span class="describe-redText">' + parseInt(indexOfMax_b + 1) + '</span>日，<span class="describe-redText">＂' + heightData.key
                        + '＂</span>话题产生<span class="describe-redText">' + heightData.value + '</span>篇相关报道，促使当日出现本月的舆情高峰。';
                }

                // make ArticleTypeChart description
                var description = '<div class="describe-text">' + waveStr + '<span class="describe-redText">'
                    + parseInt(startTempDate.getMonth() + 1) + '</span>月份中，共抓取互联网数据<span class="describe-redText">' + total_b
                    + '</span>条，其中<span class="describe-redText">' + parseInt(indexOfMax_b + 1)
                    + '</span>日热度最高，共有数据<span class="describe-redText">' + seriesData_b[indexOfMax_b] + '</span>条。'
                    + heightStr + '<span class="describe-redText">' + parseInt(indexOfMin_b + 1)
                    + '</span>日最低，共有数据<span class="describe-redText">' + seriesData_b[indexOfMin_b] + '</span>条。'
                    + '环比<span class="describe-redText">' + parseInt(startDate.getMonth() + 1) + '</span>月份，共抓取互联网数据'
                    + '<span class="describe-redText">' + total_a + '</span>条，其中<span class="describe-redText">' + parseInt(indexOfMax_a + 1)
                    + '</span>日热度最高，共有数据<span class="describe-redText">' + seriesData_a[indexOfMax_a] + '</span>条。'
                    + '<span class="describe-redText">' + parseInt(indexOfMin_a + 1)
                    + '</span>日最低，共有数据<span class="describe-redText">' + seriesData_a[indexOfMin_a] + '</span>条。</div>';

                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getArticleTrendChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    // 安全生产新闻传播舆论热度
    getArticleHotPointChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            groupName: 'title.raw',
            mustWord: report.mustWord,
            mustNotWord: report.mustNotWord,
            shouldWord: report.shouldWord,
            s_date: report.startDate,
            e_date: report.endDate
        };

        var urlPath = url.webserviceUrl + '/es/filterAndGroupBy.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: {
                "content-type": "application/json",
            }
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getArticleHotPointChart http request return!');
                isReturn = true;

                // 拼装 chart option
                if (data.length > 6) {
                    data = data.slice(0, 6);
                }
                data = data.sort(function (a, b) {
                    return a.value - b.value;
                });

                var seriesData = [];
                var yAxisData = [];
                for (var item of data) {
                    seriesData.push(item.value);
                    if (item.key.length > 18) {
                        item.label = item.key.substring(0, 18) + '...';
                    } else {
                        item.label = item.key;
                    }
                    yAxisData.push(item.label);
                }
                var option = {
                    yAxis: {
                        type: 'category',
                        data: yAxisData,
                        axisLabel: {
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 18
                            }
                        }
                    },
                    grid: {
                        left: '10',
                        right: '30',
                        bottom: '10',
                        top: '10',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value',
                        axisLabel: {
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 18
                            }
                        }
                    },
                    series: [
                        {
                            name: '舆论热点',
                            type: 'bar',
                            data: seriesData,
                            barMaxWidth: 45,
                            itemStyle: {
                                normal: {
                                    color: function (params) {
                                        // build a color map as your need.
                                        var colorList = [
                                            '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
                                            '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                                            '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                                        ];
                                        return colorList[params.dataIndex % 15]
                                    }
                                }
                            }
                        }
                    ]
                };

                // make description
                var dataMonth = parseInt(param.s_date.split("-")[1]);
                var itemStr = "";
                data = data.reverse();
                data.forEach(function (item, i) {
                    if (i < 3) {
                        itemStr += '<span class="describe-redText">“' + item.key + '” (' + item.value + ')</span>、';
                    }
                });
                itemStr = itemStr.substring(0, itemStr.length - 1);
                var description = '<div class="describe-text">' + dataMonth + '月份媒体报道情况，从其具体内容方面也可以发现，主要话题集中在'
                    + itemStr + '等几个方面。</div>';
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getArticleHotPointChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    //新闻情感类型
    getNewsEmotionPieChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            groupName: 'nlp.sentiment.label',
            mustWord: report.mustWord,
            mustNotWord: report.mustNotWord,
            shouldWord: report.shouldWord,
            s_date: report.startDate,
            e_date: report.endDate
        };

        var urlPath = url.webserviceUrl + '/news/filterAndGroupBy.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: {
                "content-type": "application/json",
            }
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getNewsEmotionPieChart http request return!');
                isReturn = true;

                // 拼装 chart option
                var seriesData = [], legendData = [];
                for (var item of data) {
                    var node = {};
                    node.name = utils.resetEmotionTypeName(item.key);
                    node.value = item.value;
                    seriesData.push(node);
                    legendData.push(node.name)
                }

                var option = {
                    title: {
                        text: '情感分析',
                        left: 'center',
                        top: 'center',
                        textStyle: {
                            fontSize: 20,
                            fontWeight: 600
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    legend: {
                        x: 'right',
                        textStyle: {
                            fontSize: 15,
                            fontWeight: 500
                        },
                        data: legendData
                    },
                    series: [
                        {
                            name: '情感类型',
                            type: 'pie',
                            radius: ['40%', '60%'],
                            label: {
                                normal: {
                                    show: false,
                                    textStyle: {
                                        fontSize: 20
                                    }
                                },
                                emphasis: {
                                    show: true,
                                    textStyle: {
                                        fontSize: '30',
                                        fontWeight: 'bold'
                                    }
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            data: seriesData
                        }
                    ]
                };

                var total = 0;
                for (var item of seriesData) {
                    total += item.value;
                }

                var itemStr = "";
                seriesData.forEach(function (item, i) {
                    if (i == 0) {
                        itemStr += "<span class='describe-redText'>" + item.name
                            + "</span>情感最多有<span class='describe-redText'>" + item.value
                            + "(" + (item.value * 100 / total).toFixed(2) + "%)" + "</span>，";
                    }
                    if (i > 0) {
                        itemStr += "<span class='describe-redText'>" + item.name + item.value + "(" + (item.value * 100 / total).toFixed(2) + "%)" + "</span>，"
                    }
                });

                itemStr = itemStr.substring(0, itemStr.length - 1);

                var description = "<div class='describe-text'>根据互联网抓取的数据，对数据情感进行分析，" + itemStr + "。</div>";
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getNewsEmotionPieChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    //主流媒体
    getMediaBarChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            groupName: 'site',
            mustWord: report.mustWord,
            mustNotWord: report.mustNotWord,
            shouldWord: report.shouldWord,
            s_date: report.startDate,
            e_date: report.endDate
        };

        var urlPath = url.webserviceUrl + '/news/filterAndGroupBy.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: {
                "content-type": "application/json",
            }
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getMediaBarChart http request return!');
                isReturn = true;

                var seriesData = [];
                var xAxisData = [];
                data = data.sort(function (a, b) {
                    return b.value - a.value;
                });
                for (var item of data) {
                    var node = {};
                    node.name = item.key;
                    node.value = item.value;
                    seriesData.push(node);
                    xAxisData.push(item.key);
                }
                var option = {
                    legend: {},
                    grid: {
                        bottom: 120
                    },
                    yAxis: {
                        axisLabel: {
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 18
                            }
                        }

                    },
                    xAxis: {
                        data: xAxisData,
                        axisLabel: {
                            interval: 0,
                            rotate: 35,
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 18
                            }
                        }
                    },
                    series: [
                        {
                            name: '媒体名称',
                            type: 'bar',
                            data: seriesData,
                            barMaxWidth: 45,
                            itemStyle: {
                                normal: {
                                    color: function (params) {
                                        // build a color map as your need.
                                        var colorList = [
                                            '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
                                            '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                                            '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                                        ];
                                        return colorList[params.dataIndex % 15]
                                    }
                                }
                            }
                        }
                    ]
                };

                var itemStr = "";
                seriesData.forEach(function (item, i) {
                    if (i < 4) {
                        itemStr += "<span class='describe-redText'>" + item.name + "(" + item.value + ")" + "</span>、";
                    }
                });

                itemStr = itemStr.substring(0, itemStr.length - 1);

                var description = "<div class='describe-text'>根据互联网抓取的数据，主流媒体报道较多的是" + itemStr + "等。</div>";
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getMediaBarChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    // 获取热点关键词词云
    getArticleHotKeywordsChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            limit: 50,
            mustWord: report.mustWord,
            mustNotWord: report.mustNotWord,
            shouldWord: report.shouldWord,
            s_date: report.startDate,
            e_date: report.endDate
        };

        var urlPath = url.webserviceUrl + '/es/hotWords.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: {
                "content-type": "application/json",
            }
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getArticleHotKeywordsChart http request return!');
                isReturn = true;
                var keywords = [];
                for (var item of data) {
                    var keyword = {};
                    keyword.keyword = item.key;
                    keyword.score = item.value;
                    keywords.push(keyword);
                }

                var option = {
                    data: keywords
                };

                var itemStr = "";
                data.forEach(function (item, i) {
                    if (i < 5) {
                        itemStr += "<span class='describe-redText'>" + item.key + "(" + item.value + ")" + "</span>、";
                    }
                });

                itemStr = itemStr.substring(0, itemStr.length - 1);

                var description = "<div class='describe-text'>根据互联网抓取的数据，热点关键词词频较高的是" + itemStr + "等。</div>";
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getArticleHotKeywordsChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    // 本月事故情况
    getMonthAccidentChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            startDate: report.startDate,
            endDate: report.endDate
        };

        var urlPath = url.webserviceUrl + '/accidentYuqing/hotAccident';
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
                console.log('getMonthAccidentChart http request return!');
                isReturn = true;

                // 拼装 chart option
                if (data.length > 6) {
                    data = data.slice(0, 6);
                }
                data = data.sort(function (a, b) {
                    return a.value - b.value;
                });

                var seriesData = [];
                var yAxisData = [];
                for (var item of data) {
                    var node = {};
                    node.name = item.key;
                    node.value = item.value;
                    if (item.key.length > 18) {
                        node.key = item.key.substring(0, 18) + '...';
                    }
                    seriesData.push(node);
                    yAxisData.push(node.key);
                }
                var option = {
                    yAxis: {
                        type: 'category',
                        data: yAxisData,
                        axisLabel: {
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 18
                            }
                        }
                    },
                    grid: {
                        left: '10',
                        right: '30',
                        bottom: '10',
                        top: '10',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value',
                        axisLabel: {
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 18
                            }
                        }
                    },
                    series: [
                        {
                            name: '舆论热点',
                            type: 'bar',
                            data: seriesData,
                            barMaxWidth: 45,
                            itemStyle: {
                                normal: {
                                    color: function (params) {
                                        // build a color map as your need.
                                        var colorList = [
                                            '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
                                            '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                                            '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                                        ];
                                        return colorList[params.dataIndex % 15]
                                    }
                                }
                            }
                        }
                    ]
                };

                // make description
                var dataMonth = parseInt(param.startDate.split("-")[1]);
                var itemStr = "";
                data = data.reverse();
                data.forEach(function (item, i) {
                    if (i < 3) {
                        itemStr += '<span class="describe-redText">“' + item.key + '” (' + item.value + ')</span>、';
                    }
                });
                itemStr = itemStr.substring(0, itemStr.length - 1);
                var description = '<div class="describe-text">' + dataMonth + '月份媒体报道情况，事故與情报道主要话题集中在'
                    + itemStr + '等几个事故。</div>';
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getMonthAccidentChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    //事故类型饼图
    getAccidentTypeChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            "date": {
                "startDate": report.startDate,
                "endDate": report.endDate
            },
            "page": {
                "orders": [{
                    "direction": "DESC",
                    "orderBy": "count"
                }],
                "page": 1
            },
            "types": [
                "atype"
            ]
        };

        var urlPath = url.webserviceUrl + '/accident/aggByTypes';
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
                console.log('getAccidentTypeChart http request return!');
                isReturn = true;

                // 拼装 chart option
                var total = 0, seriesData = [];
                for (var item of data) {
                    var node = {};
                    node.name = item.id;
                    node.value = item.count;
                    seriesData.push(node);
                    total += item.count;
                }
                var option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    legend: {},
                    series: [
                        {
                            name: '事故类型',
                            type: 'pie',
                            radius: ['0%', '55%'],
                            label: {
                                normal: {
                                    show: true,
                                    textStyle: {
                                        fontSize: 20
                                    }
                                }
                            },
                            data: seriesData,
                            itemStyle: {
                                normal: {
                                    color: function (params) {
                                        // build a color map as your need.
                                        var colorList = [
                                            '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
                                            '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                                            '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                                        ];
                                        return colorList[params.dataIndex % 15]
                                    }
                                }
                            }
                        }
                    ]
                };
                var itemStr = "";
                seriesData.forEach(function (item, i) {
                    if (i < 5) {
                        itemStr += "<span class='describe-redText'>" + item.name + "(" + (item.value * 100 / total).toFixed(2) + "%)</span>、";
                    }
                });
                itemStr = itemStr.substring(0, itemStr.length - 1) + "。";
                var description = "<div class='describe-text'>从本月安全生产事故类型来看，多发事故的类型为" + itemStr + "</div>";
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getAccidentTypeChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    // 事故地图分布情况
    getAccidentMapChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            "date": {
                "startDate": report.startDate,
                "endDate": report.endDate,
            },
            "page": {
                "limit": 40,
                "orders": [{
                    "direction": "DESC",
                    "orderBy": "count"
                }],
                "page": 1
            },
            "types": [
                "province"
            ]
        };

        var urlPath = url.webserviceUrl + '/accident/aggByTypes';
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
                console.log('getAccidentMapChart http request return!');
                isReturn = true;

                // 拼装 chart option
                var total = 0, maxCount = 0, seriesData = [];
                for (var item of data) {
                    total += item.count;
                    var node = {};
                    node.name = item.id;
                    node.value = item.count;
                    seriesData.push(node);
                }
                seriesData.sort(function (a, b) {
                    return b.value - a.value
                });
                maxCount = seriesData[0].value == undefined ? 10 : seriesData[0].value;
                var option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c}"
                    },
                    visualMap: {
                        min: 0,
                        max: maxCount,
                        left: 'left',
                        top: 'bottom',
                        text: ['高', '低'],           // 文本，默认为数值文本
                        calculable: true
                    },
                    series: [
                        {
                            name: '事故起数',
                            type: 'map',
                            mapType: 'china',
                            label: {
                                normal: {
                                    show: true,
                                }
                            },
                            data: seriesData
                        }
                    ]
                };

                // make ArticleTypeChart description
                var itemsStr = "";
                data.forEach(function (item, i) {
                    if (i < 6) {
                        itemsStr += "<span class='describe-redText'>" + item.id + item.count + "(" + (item.count * 100 / total).toFixed(2) + "%)</span>、";
                    }
                });
                itemsStr = itemsStr.substring(0, itemsStr.length - 1) + "。";

                var description = "<div class='describe-text'>根据互联网抓取的数据，对本月事故情况进行分析，共发生事故<span class='describe-redText'>" + total + "</span>起，其中发生较多的省份为" + itemsStr + "</div>";
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getAccidentMapChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    //相关评论
    getCommentPieChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            startDate: report.startDate,
            endDate: report.endDate
        };

        var urlPath = url.webserviceUrl + '/accidentYuqing/hotAccidentComment';
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
                console.log('getCommentPieChart http request return!');
                isReturn = true;

                // 拼装 chart option
                var seriesItems = [], legendData = [];
                // 条数最多的占圆环的 80% 环的宽度为20
                var maxItemValue = parseInt(data[0].value / 0.8);
                data.forEach(function (item, i) {
                    var seriesItem = {
                        name: '相关品论分析',
                        type: 'pie',
                        clockWise: false,
                        radius: [160 - 20 * i, 180 - 20 * i],
                        itemStyle: {
                            normal: {
                                label: {show: false},
                                labelLine: {show: false},
                                shadowBlur: 40,
                                shadowColor: 'rgba(40, 40, 40, 0.5)',
                            }
                        },
                        hoverAnimation: false,
                        data: [
                            {
                                value: item.value,
                                name: item.key
                            },
                            {
                                value: maxItemValue - item.value,
                                name: 'invisible',
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0,0,0,0)',
                                        label: {show: false},
                                        labelLine: {show: false}
                                    },
                                    emphasis: {
                                        color: 'rgba(0,0,0,0)'
                                    }
                                }
                            }
                        ]
                    };
                    if (i < 5) {
                        seriesItems.push(seriesItem);
                        legendData.push(item.key);
                    }
                });

                var option = {
                    color: ['#85b6b2', '#6d4f8d', '#cd5e7e', '#e38980', '#f7db88'],
                    title: {
                        text: "相关言论",
                        left: "center",
                        top: "center",
                        textStyle: {
                            fontSize: 20,
                            fontWeight: 700
                        }
                    },
                    tooltip: {
                        show: true,
                        formatter: "{a} <br/>{b} : {c}"
                    },
                    legend: {
                        show: false,
                        itemGap: 12,
                        right: 'right',
                        data: legendData
                    },
                    series: seriesItems
                };

                var itemStr = "";
                data.forEach(function (item, i) {
                    if (i < 3) {
                        itemStr += "<span class='describe-redText'>" + item.key + "(" + item.value + ")</span>、";
                    }
                });
                itemStr = itemStr.substring(0, itemStr.length - 1);
                var description = "<div class='describe-text'>对互联网事故相关言论进行分析，网民关注一下几个方面：" + itemStr + "</div>";
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getCommentPieChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    // 相关品论关键词云
    getCommentHotKeywordsChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            limit: 50,
            mustWord: report.mustWord,
            mustNotWord: report.mustNotWord,
            shouldWord: report.shouldWord,
            s_date: report.startDate,
            e_date: report.endDate,
        };

        var urlPath = url.webserviceUrl + '/es/hotWords.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: {
                "content-type": "application/json",
            }
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getCommentHotKeywordsChart http request return!');
                isReturn = true;

                var keywords = [];
                for (var item of data) {
                    var keyword = {};
                    keyword.keyword = item.key;
                    keyword.score = item.value;
                    keywords.push(keyword);
                }

                var option = {
                    data: keywords
                };

                var itemStr = "";
                data.forEach(function (item, i) {
                    if (i < 5) {
                        itemStr += "<span class='describe-redText'>" + item.key + "(" + item.value + ")" + "</span>、";
                    }
                });

                itemStr = itemStr.substring(0, itemStr.length - 1);

                var description = "<div class='describe-text'>根据互联网抓取的数据，热点关键词词频较高的是" + itemStr + "等。</div>";
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getArticleHotKeywordsChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    }
};

module.exports = actions;
