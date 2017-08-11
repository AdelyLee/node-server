/**
 * Created by lyc on 17-5-23.
 *
 * Briefing 实体类
 */
const Briefing = {
    constructor(type, title, subTitle, author, outline, issue, briefingBody, summary) { // 构造函数
        this.type = type;
        this.title = title;
        this.subTitle = subTitle;
        this.author = author;
        this.issue = issue;
        this.outline = outline;
        this.briefingBody = briefingBody;
        this.summary = summary;
    },

    getType() {
        return this.type;
    },

    setType(type) {
        this.type = type;
    },

    getTitle() {
        return this.title;
    },

    setTitle(title) {
        this.title = title;
    },

    getSubTitle() {
        return this.subTitle;
    },

    setSubTitle(subTitle) {
        this.subTitle = subTitle;
    },

    getAuthor() {
        return this.author;
    },

    setAuthor(author) {
        this.author = author;
    },

    getIssue() {
        return this.issue;
    },

    setIssue(issue) {
        this.issue = issue;
    },

    getOutline() {
        return this.outline;
    },

    setOutline(outline) {
        this.outline = outline;
    },

    getBriefingBody() {
        return this.briefingBody;
    },

    setBriefingBody(briefingBody) {
        this.briefingBody = briefingBody;
    },

    getSummary() {
        return this.summary;
    },

    setSummary(summary) {
        this.summary = summary;
    }
};

module.exports = Briefing;
