var app = getApp()
import {
  request
} from '../../../utils/util.js'
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    myCarVerify: '', //已经认证的车型
    base_url: getApp().globalData.base_url,
    type: '', //certified如果从“用户页面”传入只显示已经认证车辆，且页面不可操作
    uid: '',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '认证车辆', //导航栏 中间的标题
    }
  },
  onLoad: function (options) {
    const that = this
    const type = options.type;
    const uid = options.uid;
    that.setData({
      type: type,
      uid: uid
    })
  },
  onShow: function(options) {
    const that = this
    that.reloadIndex()   
  },
  reloadIndex: function() {
    const that = this
    that.getMyCarVerify() 
  },

  getMyCarVerify: function() {
    const that = this
    let uid = that.data.uid
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    request('post', 'get_my_car_verify.php', {
      token: wx.getStorageSync("token"),
      uid: uid
    }).then((res) => {
      that.setData({
        loading_hidden: true,
        loading_msg: '加载完毕...',
        myCarVerify: res.data.list
      })
    });
  },

 

})