/**
 * Created by lyc on 17-5-23.
 *
 * report 实体类
 */

const BriefingBody = {
    constructor(briefingCells) { //构造函数
        this.briefingCells = briefingCells;
    },

    getBriefingCells() {
        return this.briefingCells;
    },

    setBriefingCells(briefingCells) {
        this.briefingCells = briefingCells;
    }
};

module.exports = BriefingBody;
// export {BriefingBody}
