var app = getApp()
import {
  request
} from '../../../utils/util.js'
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '关于我们', //导航栏 中间的标题
    }
  },
  onLoad: function(options) {

  },


})