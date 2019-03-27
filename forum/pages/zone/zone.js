var app = getApp()
import {
  request
} from '../../../utils/util.js'

Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',

    fid: 0,
    topImg: '',
    topicList: [],
    page_size: 9,
    page_index: 0,
    total_page: '',
    type: 0,
    is_show_post: '',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '板块专区', //导航栏 中间的标题
    }
  },

  onLoad: function(options) {
    var fid = options.id;
    this.setData({
      fid: fid,
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    this.reloadIndex();
  },
  toDetail: function(e) {
    const tid = e.currentTarget.dataset.tid;
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },
  changeType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      type: type,
      topicList: [],
      page_index: 0
    })
    this.reloadIndex()
  },
  toAddArtice: function() {
    const that = this
    const fid = that.data.is_show_post.fid
    const post_type = that.data.is_show_post.post_type
    wx.navigateTo({
      url: `/question/pages/add_article/add_article?fid=${fid}&post_type=${post_type}`,
    })
  },
  reloadIndex: function() {
    var that = this;
    var fid = that.data.fid;
    var page_size = that.data.page_size;
    var page_index = that.data.page_index;
    var type = that.data.type;

    request('post', 'get_forum_topic_thread.php', {
      token: wx.getStorageSync("token"),
      fid: fid,
      page_size: page_size,
      page_index: page_index,
      type: type
    }).then((res) => {
      let that_topicList = that.data.topicList,
        temp_topicList = res.data.forum_thread_data,
        res_topicList = that_topicList.length == 0 ? temp_topicList : that_topicList.concat(temp_topicList)
      that.setData({
        topicList: res_topicList,
        topImg: res.data.forum_forum_data,
        page_index: page_index,
        is_show_post: res.data.is_show_post,
        loading_hidden: true,
        loading_msg: '加载完毕...',
        have_data: false,
        nomore_data: temp_topicList.length < page_index ? true : false
      })
    });
  },
  applyModerator: function() {
    const that = this
    if (wx.getStorageSync("has_login") == 1) {
      that.getForumVerifyFun()
    } else {
      that.setData({
        showAuthorization: true
      })
    }
  },
  rejectAuthorizeFun: function() {
    // console.log('不同意授权')
    const that = this
    return
  },
  agreeAuthorizeFun: function() {
    // console.log('同意授权')
    const that = this
    that.getForumVerifyFun();
  },
  getForumVerifyFun: function() {
    const that = this
    const fid = that.data.fid
    request('post', 'get_forum_verify.php', {
      token: wx.getStorageSync("token"),
      fid: fid,
    }).then((res) => {
      if (res.err_code != 0)
        return
      const realname = res.data.realname
      const qq = res.data.qq
      const weixin = res.data.weixin
      const mobile = res.data.mobile
      const gender = res.data.gender
      const forumName = res.data.forum_name
      wx.navigateTo({
        url: `../applyModerator/applyModerator?fid=${fid}&qq=${qq}&weixin=${weixin}&mobile=${mobile}&gender=${gender}&realname=${realname}&forumName=${forumName}`,
      })
    })
  },

  onReachBottom: function() {
    const that = this
    if (that.data.nomore_data == true)
      return
    that.setData({
      have_data: true
    })
    setTimeout(() => {
      let page_index = that.data.page_index
      that.setData({
        page_index: page_index + 1
      })
      that.reloadIndex()
    }, 300)
  },
  /* 下拉刷新 */
  onPullDownRefresh: function() {
    console.log('onPullDownRefresh');
    this.reloadIndex();
    wx.stopPullDownRefresh();
  },
  /* 分享 */
  onShareAppMessage: function(res) {
    return {
      title: app.globalData.shareTitle,
      path: `/pages/index/index?shareName=zone&shareId=${fid}&root=forum`
    }
  },

})