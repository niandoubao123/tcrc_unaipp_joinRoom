import Vue from 'vue';
let HOST = '';
let FILESERVER = ''
Vue.prototype.$config = {
  version: '',
  host: HOST,
  fileServer:FILESERVER,
  // 开发模式配置
  dev: {
    // 进入的第一个页面
    firstPage: ''
  }
};

