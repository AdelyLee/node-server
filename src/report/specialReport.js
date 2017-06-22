/**
 * 专题模块Json数据生成，
 *
 *
 */
var url = require('./common.js');
var utils = require('./utils.js');
var request = require('request');
var querystring = require('querystring');
var deasync = require('deasync');
var dateUtil = require('../DateUtil.js');
var descriptionUtil = require('./descriptionUtil.js');
var headers = require('../headerUtil');

const actions = {
    // 专报标题
    getBriefingTitle: function (report) {
        return report.name + '专报';
    },
    // 专报子标题
    getBriefingSubTitle: function (report) {
        return "";
    },
    // 专报期号
    getBriefingIssue: function (report) {
        return "";
    },

    // 专报作者
    getBriefingAuthor: function (report) {
        var author = "", isReturn = false;
        var userId = report.userId;
        var urlPath = url.webserviceUrl + '/admin/user/' + userId;

        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                isReturn = true;
                author = data.username;
            }
        });
        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return author;
    },

    // 专报创建时间
    getBriefingCreateTime: function () {
        return dateUtil.formatDate(new Date(), "yyyy年MM月dd日");
    },

    // 专报概述
    getBriefingOutline: function (report) {
        return "";
    },

    // 专报总结
    getBriefingSummary: function (report) {
        return "";
    },

    // 與情综述描述
    getSpecialSummarize: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            mustWord: report.mustWord,
            mustNotWord: report.mustNotWord,
            shouldWord: report.shouldWord,
            s_date: report.startDate,
            e_date: report.endDate
        };
        var option = {};

        var description = "调查报告发布至今,共产生相关话题的报道3375篇,其中新闻媒体报道3362篇,成为本次话题最主要的舆论传播阵地";
        renderData.description = description;
        renderData.option = option;

        return renderData;
    },
    // 获取专题與情载体类型
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
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getArticleTypeChart http request return!');
                isReturn = true;

                var total = 0, seriesData = [], description = '';
                // 拼装 chart option
                if (data.length > 0) {
                    for (var item of data) {
                        total += item.value;
                        var node = {};
                        node.name = utils.resetArticleTypeName(item.key);
                        node.value = item.value;
                        seriesData.push(node);
                    }
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
                if (data.length > 0) {
                    // make ArticleTypeChart description
                    var itemsStr = "";
                    seriesData.forEach(function (item, i) {
                        if (i < 3) {
                            itemsStr += "<span class='describe-redText'>" + item.name + item.value + "(" + (item.value * 100 / total).toFixed(2) + "%)</span>、";
                        }
                    });
                    itemsStr = itemsStr.substring(0, itemsStr.length - 1) + "。";
                    description = "<div class='describe-text'>根据互联网抓取的数据，对数据载体进行分析，共抓取数据<span class='describe-redText'>" + total + "</span>条，其中排名前三的为" + itemsStr + "</div>";
                } else {
                    description = "暂无相关数据";
                }
                renderData.option = option;
                renderData.description = description;
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
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getMediaBarChart http request return!');
                isReturn = true;

                var seriesData = [], xAxisData = [], description = '';
                if (data.length > 0) {
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

                if (data.length > 0) {
                    var itemStr = "";
                    seriesData.forEach(function (item, i) {
                        if (i < 4) {
                            itemStr += "<span class='describe-redText'>" + item.name + "(" + item.value + ")" + "</span>、";
                        }
                    });

                    itemStr = itemStr.substring(0, itemStr.length - 1);

                    description = "<div class='describe-text'>根据互联网抓取的数据，主流媒体报道较多的是" + itemStr + "等。</div>";
                } else {
                    description = "暂无相关数据";
                }
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

    //趋势图
    getArticleTrendChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            dateType: 'day',
            mustWord: report.mustWord,
            mustNotWord: report.mustNotWord,
            shouldWord: report.shouldWord,
            s_date: report.startDate,
            e_date: report.endDate,
            articleType: 'article'
        };
        var urlPath = url.webserviceUrl + '/es/filterAndGroupByTime.json?' + querystring.stringify(param);
        request({
            url: urlPath,
            method: "get",
            json: true,
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getArticleTrendChart http request return!');
                isReturn = true;

                data = data.article;
                var total = 0, seriesData = [], xAxisData = [], indexOfMax = 0, maxDate = "", indexOfMin = 0, minDate = "", legendData = [], description = '';
                if (report.type == "SPECIAL") {
                    if (data.length > 0) {
                        legendData.push("與情数目");
                        for (var item of data) {
                            var itemDate = dateUtil.parseDate(item.key);
                            var itemDateStr = dateUtil.formatDate(itemDate, 'yyyy-MM-dd');
                            xAxisData.push(itemDateStr);
                            seriesData.push(item.value);
                        }

                        // 获取数据的最高点和最地点
                        indexOfMax = seriesData.indexOf(Math.max.apply(Math, seriesData));
                        maxDate = xAxisData[indexOfMax];
                        indexOfMin = seriesData.indexOf(Math.min.apply(Math, seriesData));
                        minDate = xAxisData[indexOfMin];

                        // 获取所有数据总数
                        seriesData.forEach(function (value) {
                            total += value;
                        });
                    }
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
                            name: "與情数目",
                            type: 'line',
                            data: seriesData
                        }
                    ]
                };
                if (data.length > 0) {
                    var hotStartDate = dateUtil.formatDate(dateUtil.parseDate(maxDate), 'yyyy-MM-dd');
                    var hotEndDate = dateUtil.formatDate(dateUtil.addDate(dateUtil.parseDate(hotStartDate), 'd', 1), 'yyyy-MM-dd');
                    var heightData = descriptionUtil.getHotArticle(report, hotStartDate, hotEndDate);
                    var heightStr = "";
                    if (heightData.key) {
                        heightStr = '<span class="describe-redText">' + maxDate + '</span>日，<span class="describe-redText">＂' + heightData.key
                            + '＂</span>话题产生<span class="describe-redText">' + heightData.value + '</span>篇相关报道，促使当日出现本月的舆情高峰。';
                    }

                    // make ArticleTypeChart description
                    description = '<div class="describe-text">根据最新舆情分析, 共抓取互联网数据'
                        + '<span class="describe-redText">' + total + '</span>条，其中<span class="describe-redText">' + maxDate
                        + '</span>日热度最高，共有数据<span class="describe-redText">' + seriesData[indexOfMax] + '</span>条。'
                        + heightStr + '<span class="describe-redText">' + minDate
                        + '</span>日最低，共有数据<span class="describe-redText">' + seriesData[indexOfMin] + '</span>条。</div>';
                } else {
                    description = "暂无相关数据";
                }
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

    //　网民舆论热点
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
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getArticleHotPointChart http request return!');
                isReturn = true;
                var seriesData = [], yAxisData = [], description = '';
                if (data.length > 0) {
                    // 拼装 chart option
                    if (data.length > 6) {
                        data = data.slice(0, 6);
                    }
                    data = data.sort(function (a, b) {
                        return a.value - b.value;
                    });

                    for (var item of data) {
                        seriesData.push(item.value);
                        if (item.key.length > 18) {
                            item.key = item.key.substring(0, 18) + '...';
                        }
                        yAxisData.push(item.key);
                    }
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
                if (data.length > 0) {
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
                    description = '<div class="describe-text">' + dataMonth + '月份媒体报道情况，从其具体内容方面也可以发现，主要话题集中在'
                        + itemStr + '等几个方面。</div>';
                } else {
                    description = "暂无相关数据";
                }
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

    //　热议网民
    getHotAuthorChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            groupName: 'author',
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
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getHotAuthorChart http request return!');
                isReturn = true;

                var seriesData = [], xAxisData = [], description = '';
                if (data.length > 0) {
                    data = data.sort(function (a, b) {
                        return b.value - a.value;
                    });
                    for (let item of data) {
                        if (item.key && item.key !== "") {
                            seriesData.push(item.value);
                            if (item.key.length > 10) {
                                item.key = item.key.substring(0, 10) + "...";
                            }
                            xAxisData.push(item.key);
                        }
                    }
                }
                var option = {
                    grid: {
                        left: 20,
                        right: 30,
                        bottom: 80,
                        top: 20,
                        containLabel: true
                    },
                    yAxis: {
                        axisLabel: {
                            textStyle: {
                                fontWeight: 700,
                                fontSize: 20
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
                                fontSize: 20
                            }
                        }
                    },
                    series: [
                        {
                            name: '舆论热点',
                            type: 'bar',
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
                if (data.length > 0) {
                    var itemStr = "";
                    data.forEach(function (item, i) {
                        if (i < 5) {
                            itemStr += "<span class='describe-redText'>" + item.key + "(" + item.value + ")" + "</span>、";
                        }
                    });

                    var length = data.length > 5 ? 5 : data.length;

                    itemStr = itemStr.substring(0, itemStr.length - 1);
                    description = "<div class='describe-text'>参与话题讨论的网民中，讨论最为激烈的前<span class='describe-redText'>" + length + "</span>名网民分别为" + itemStr + "。</div>";
                } else {
                    description = "暂无相关数据";
                }
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getHotAuthorChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    // 话题关注人群地域分布图
    getFocusPeopleMapChart: function (report) {
        var renderData = {}, isReturn = false;
        var param = {
            groupName: 'area',
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
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getFocusPeopleMapChart http request return!');
                isReturn = true;
                // 拼装 chart option
                var maxCount = 0, seriesData = [], description = '';
                if (data.length > 0) {
                    for (let item of data) {
                        var node = {};
                        node.name = item.key;
                        node.value = item.value;
                        seriesData.push(node);
                    }
                    seriesData.sort(function (a, b) {
                        return b.value - a.value
                    });
                    if (seriesData.length > 0) {
                        maxCount = seriesData[0].value;
                    } else {
                        maxCount = 10;
                    }
                }
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
                        calculable: true,
                        inRange: {
                            color: ['#B7EEEB', '#FEFDC7', '#FCC171', '#F27449', '#DB3B29'],
                        },
                    },
                    series: [
                        {
                            name: '关注人数',
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
                if (data.length > 0) {
                    var itemStr = "";
                    seriesData.forEach(function (item, i) {
                        if (i < 3) {
                            itemStr += '<span class="describe-redText">“' + item.name + '” (' + item.value + ')</span>、';
                        }
                    });
                    itemStr = itemStr.substring(0, itemStr.length - 1);
                    description = '<div class="describe-text">从关注人群的地域分布来看，对参与话题讨论的网民言论样本进行分析发现,关注地域主要集中在'
                        + itemStr + '等几个地区。</div>';
                } else {
                    description = "暂无相关数据";
                }
                renderData.option = option;
                renderData.description = description;
            } else {
                console.log("get getFocusPeopleMapChart data error");
            }
        });

        while (!isReturn) {
            deasync.runLoopOnce();
        }

        return renderData;
    },

    // 网民评论热点词词云分析
    getCommentHotKeywordsChart: function (report) {
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
            headers: headers.getRequestHeader()
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('getCommentHotKeywordsChart http request return!');
                isReturn = true;
                var keywords = [], description = '';
                if (data.length > 0) {
                    for (var item of data) {
                        var keyword = {};
                        keyword.keyword = item.key;
                        keyword.score = item.value;
                        keywords.push(keyword);
                    }
                }
                var option = {
                    data: keywords
                };
                if (data.length > 0) {
                    var itemStr = "";
                    data.forEach(function (item, i) {
                        if (i < 5) {
                            itemStr += "<span class='describe-redText'>" + item.key + "(" + item.value + ")" + "</span>、";
                        }
                    });

                    itemStr = itemStr.substring(0, itemStr.length - 1);

                    description = "<div class='describe-text'>根据互联网抓取的数据，热点关键词词频较高的是" + itemStr + "等。</div>";
                } else {
                    description = "暂无相关数据";
                }
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