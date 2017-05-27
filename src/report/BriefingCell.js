/**
 * Created by lyc on 17-5-23.
 *
 * BriefingCell 实体类
 */
const BriefingCell = {
    constructor(level, title, imageUrl, option, description, children, chartType, chartId, method) { //构造函数
        this.level = level;
        this.title = title;
        this.imageUrl = imageUrl;
        this.option = option; // chart option
        this.description = description;
        this.children = children;
        this.chartType = chartType;
        this.chartId = chartId;
        this.method = method;
    },

    getLevel() {
        return this.level;
    },

    setLevel(level) {
        this.level = level;
    },

    getTitle() {
        return this.title;
    },

    setTitle(title) {
        this.title = title;
    },

    getImageUrl() {
        return this.imageUrl;
    },

    setImageUrl(imageUrl) {
        this.imageUrl = imageUrl;
    },

    getOption() {
        return this.option;
    },

    setOption(option) {
        this.option = option;
    },

    getDescription() {
        return this.description;
    },

    setDescription(description) {
        this.description = description;
    },

    getChildren() {
        return this.children;
    },

    setChildren(children) {
        this.children = children;
    },

    getChartType() {
        return this.chartType;
    },

    setChartType(chartType) {
        this.chartType = chartType;
    },

    getChartId() {
        return this.chartId;
    },

    setChartId(chartId) {
        this.chartId = chartId;
    },

    getMethod() {
        return this.method;
    },

    setMethod(method) {
        this.method = method;
    }
};

module.exports = BriefingCell;