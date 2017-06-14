/**
 * Created by lyc on 17-5-18.
 */

const utils = {
    resetArticleTypeName: function (source) {
        var target = '';
        switch (source) {
            case 'news':
                target = '新闻';
                break;
            case 'weibo':
                target = '微博';
                break;
            case 'bbs':
                target = '论坛';
                break;
            case 'bar':
                target = '贴吧';
                break;
            case 'comments':
                target = '评论';
                break;
            case 'weixin':
                target = '微信';
                break;
        }

        return target;
    },

    resetEmotionTypeName: function (source) {
        var type = '';
        source = source.toLowerCase();
        switch (source) {
            case 'pos':
                type = '正面';
                break;
            case 'neg':
                type = '负面';
                break;
            case 'neu':
                type = '中性';
                break;
        }

        return type;
    }
};

module.exports = utils;
