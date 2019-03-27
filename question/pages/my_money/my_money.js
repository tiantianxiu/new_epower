var app = getApp()
import { request } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    budget1: [],
    budget2: [],
    budget3: [],
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '我的余额', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    that.setData({
      loading_hidden: false
    })
    that.getBudgetLog()
  },
  getBudgetLog: function(){
    const that = this
    request('post', 'get_user_budget_log.php', {
      token: wx.getStorageSync('token')
    }).then((res)=>{
      if (res.err_code != 0)
        rerurn
      let balance = res.data.balance,
        budget = res.data.budget
      that.setData({
        balance: balance,
        budget: budget,
        loading_hidden: true
      })    
    })
  },
  budgetap: function(e){
    const that = this
    let item = e.currentTarget.dataset.item,
      id = e.currentTarget.dataset.id
    that.setData({
      [item]: that.data[item].length == 0 ? that.data.budget[id] : ''
    })  
  },
  cashTap: function(){
    wx.showToast({
      title: '2019年5月份上线提现功能',
      icon: 'none'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})