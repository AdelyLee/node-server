module.exports = {
  "parser": 'babel-eslint',
  "env": {
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 6,
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "react"
  ],
  "rules": {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // 禁止使用console
    "no-console": 2,
    // 命名检测
    "id-match": 2,
    // 函数定义时括号前面要不要有空格
    "space-before-function-paren": [0, "always"],
    // 必须使用全等
    "eqeqeq": 2,
    // 禁止混用tab和空格
    "no-mixed-spaces-and-tabs": [2, false],
    // 不能用多余的空格
    "no-multi-spaces": 1,
    // 语句强制分号结尾
    "semi": [2, "never"],
    // 注释风格要不要有空格什么的
    "spaced-comment": 2,
    // 引号类型 `` "" ''
    "quotes": [2, "single"],
  }
}
