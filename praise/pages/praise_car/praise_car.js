const app = getApp()
import {
  request
} from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: true,
    loading_msg: '加载完毕...',
    page_size: 3,
    page_index: 0,
    evaluate_list: [],
    showAuthorization: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '车型口碑', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    let car_2 = options.id
    that.setData({
      car_2: car_2
    })
    that.reloadIndex()
  },
  reloadIndex: function() {
    const that = this
    that.setLoding()
    that.getReputationList()
    that.setData({
      page_index: 0
    })
  },
  getReputationList: function() {
    const that = this
    let page_size = that.data.page_size,
      page_index = that.data.page_index
    request('post', 'get_reputation_list.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      car_2: that.data.car_2
    }).then((res) => {
      if (res.err_code != 0)
        return
      let evaluate_list_res = res.data.evaluate_list,
        evaluate_list_data = that.data.evaluate_list,
        evaluate_list = page_index == 0 ? evaluate_list_res : evaluate_list_data.concat(evaluate_list_res)
      for (let i in evaluate_list) {
        if (evaluate_list[i].power_consumption != '0.00' && evaluate_list[i].fuel_consumption == '0.00') {
          evaluate_list[i].rmb = parseInt(evaluate_list[i].power_consumption * 1.2)
        }

      }
      that.setData({
        evaluate_list: evaluate_list,
        header: res.data.header,
        loading_hidden: true,
        loading_msg: '加载完毕...',
        have_data: false,
        nomore_data: evaluate_list_res.length >= page_size ? false : true
      })
    })
  },
  setLoding: function() {
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const that = this
    if (that.data.nomore_data)
      return
    that.data.page_index = that.data.page_index + 1
    that.setData({
      have_data: true
    }, that.getReputationList())
  },
  toDetail: function(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../praise_user/praise_user?id=' + id,
    })
  },
  toUserDetail: function(e) {
    app.toUserDetail(e)
  },
  showAuthorization: function() {
    const that = this
    that.setData({
      showAuthorization: true
    })
  },
  rejectAuthorizeFun: function() {
    // console.log('不同意授权')
    const that = this
    that.setData({
      showAuthorization: true
    })
  },
  rejectAuthorizeFun: function() {
    // console.log('不同意授权')
    const that = this
    that.setData({
      showAuthorization: true
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const that = this
    const id = that.data.car_2
    const title = that.data.header.name + '口碑'
    return {
      title: title,
      path: `/pages/index/index?shareName=praise_car&shareId=${id}&root=praise`
    }
  },
  toBack: function() {
    const that = this
    let shape = that.data.header.type_vehicle
    wx.navigateTo({
      url: `../praise_index/praise_index?shape=${shape}`
    })
  },
  onNODone: function() {
    app.wxShowToast('该功能开发中...', 1500, 'none')
  }
})