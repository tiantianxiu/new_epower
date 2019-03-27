const app = getApp()
import {
  request
} from '../../../utils/util.js'
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
      title: '回答记录', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    that.setData({
      loading_hidden: true
    })
    that.getComment()
  },

  getComment: function () {
    const that = this
    request('post', 'get_my_question_reply.php', {
      token: wx.getStorageSync('token')
    }).then((res) => {
      let articleList = res.data.my_question_reply
      that.setData({
        articleList: articleList,
        loading_hidden: true
      })

    })
  },
  todetail: function (e) {
    const that = this
    let tid = e.currentTarget.dataset.tid
    wx.navigateTo({
      url: `../quest_detail/quest_detail?id=${tid}`,
    })
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