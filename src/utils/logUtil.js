var log4js = require('log4js')

log4js.configure({
  appenders: [{
      // 控制台输出
      type: 'console'
    },
    {
      type: 'file', // 文件输出
      filename: 'logs/access.log',
      maxLogSize: 1024,
      backups: 3,
      category: 'normal'
    }
  ]
})
var logger = log4js.getLogger('normal')
logger.setLevel('INFO')

module.exports = logger