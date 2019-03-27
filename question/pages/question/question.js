// pages/question/question.js
var WxParse = require('../../../wxParse/wxParse.js');
const app = getApp()
import {
  request,
  contains,
  transformPHPTime
} from '../../../utils/util.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: false,
    loading_msg: '加载中...',
    page_index: 0,
    page_size: 6,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '问答首页', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    that.reloadIndex()
  },
  reloadIndex: function() {
    const that = this
    that.setData({
      loading_hidden: false,
      page_index: 0
    })
    that.getComment()
  },
  getComment: function() {
    const that = this
    let page_size = that.data.page_size,
      page_index = that.data.page_index

    request('post', 'get_question.php', {
      page_size: page_size,
      page_index: page_index,
      token: wx.getStorageSync('token')
    }).then((res) => {

      let respArticleList = res.data.forum_thread_data

      for (let i in respArticleList) {
        respArticleList[i].time = transformPHPTime(respArticleList[i].dateline)

        var extcredits2 = respArticleList[i].extcredits2 + ''
        respArticleList[i].extcredits2_arr = extcredits2.split('')
        
        if (respArticleList[i].subject.length > 40){
          respArticleList[i].subject = respArticleList[i].subject.substring(0, 40) + ' . . .'
        }
      }

      let tmpArticleList = that.data.articleList

      let newArticleList = page_index ? tmpArticleList.concat(respArticleList) : respArticleList
      let post_list_length = res.data.forum_thread_data.length

      

      that.setData({
        articleList: newArticleList,
        have_data: false,
        loading_hidden: true,
        nomore_data: post_list_length < page_size ? true : false
      })

    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const that = this

    let page_index = that.data.page_index + 1
    if (that.data.nomore_data == true)
      return
    that.setData({
      page_index: page_index
    })
    that.setData({
      have_data: true
    }, that.getComment())
  
  },
  /* 下拉刷新 */
  onPullDownRefresh: function() {
    const that = this
    that.reloadIndex()
    wx.stopPullDownRefresh();
  },

  toDetail: function(e) {
    const that = this
    var tid = e.currentTarget.dataset.tid
    if (e.currentTarget.dataset.item && e.currentTarget.dataset.item == 'poll'){
      wx.navigateTo({
        url: '../poll/poll?id=' + tid,
      })
      return
    }
    wx.navigateTo({
      url: '../quest_detail/quest_detail?id=' + tid,
    })
  },
  toUserDetail: function(e) {
    app.toUserDetail(e)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const that = this
    return {
      title: '问答首页',
      path: '/pages/index/index?shareName=question&root=question'
    }
  }

})