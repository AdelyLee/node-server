/**
* nodejs 日志
* @author lyc
* @time 2017-08
*
*/
const log4js = require('log4js')
log4js.configure({
  appenders: {
    console: { type: 'console' },
    dateFile: { type: 'dateFile', filename: 'logs/log', pattern: '_yyyyMMdd.log', alwaysIncludePattern: true, }
  },
  categories: {
    default: { appenders: ['dateFile', 'console'], level: 'debug' }
  },
})

module.exports = log4js
