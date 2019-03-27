// pages/quest_my/quest_my.js
const app = getApp()
import { request } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: false,
    loading_msg: '加载中...',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '我的问答', //导航栏 中间的标题
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
    const  that = this
    request('post', 'get_user_budget_log.php', {
      token: wx.getStorageSync('token')
    }).then((res) => {
      if (res.err_code != 0)
        rerurn
      let balance = res.data.balance,
        budget = res.data.budget
      that.setData({
        balance: balance,
        loading_hidden: true
      })
    })
  },

  todetail: function(e){
    const that = this
    let item = e.currentTarget.dataset.item,
      key = e.currentTarget.dataset.key
      if(key){
        wx.navigateTo({
          url: `../${item}/${item}?key=${key}`
        })
        return
      }
    wx.navigateTo({
      url: `../${item}/${item}`,
    })
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