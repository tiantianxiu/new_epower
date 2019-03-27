var app = getApp()
import {
  request
} from '../../utils/util.js'

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
    is_show_post: '',
    heightMt: app.globalData.heightMt + 20 * 2,
    order: 1,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '话题', //导航栏 中间的标题
    }
  },

  onLoad: function(options) {
    var fid = options.id
    this.setData({
      fid: fid,
    })
  },
  onShow: function(){
    this.reloadIndex()
  },
  toDetail: function(e) {
    var tid = e.currentTarget.dataset.tid;
    wx.navigateTo({
      url: '../detail/detail?tid=' + tid,
    })
  },

  reloadIndex: function() {
    var that = this;
    var fid = that.data.fid;
    var page_size = that.data.page_size;
    var page_index = that.data.page_index;
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
    request('post', 'get_forum_topic_thread.php', {
      token: wx.getStorageSync("token"),
      fid: fid,
      type: 3,
      page_size: page_size,
      page_index: page_index,
      order: that.data.order
    }).then((res) => {
      let data = res.data

      that.setData({
        thread: data.thread,
        topImg: data.forum_forum_data,
        page_topicIndex: page_index,
        total_page: data.total_page,
        is_show_post: data.is_show_post,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    })
  },
  // 点赞文章
  toZan: function(e) {
    const that = this
    const i = e.currentTarget.dataset.index //1赞 2踩
    const type = e.currentTarget.dataset.type //1赞 2踩
    const tid = e.currentTarget.dataset.tid //1赞 2踩
    const is_zan = e.currentTarget.dataset.is_zan

    that.isShowAuthorization().then((res) => {
      if (res == true) {

        if (is_zan == 0) {
          request('post', 'add_zan.php', {
            token: wx.getStorageSync("token"),
            tid: tid,
            type: type
          }).then((res) => {
            if (res.err_code != 0)
              return

            if (type == 1) {
              this.setData({
                [`thread[${i}]is_zan`]: 1,
                [`thread[${i}]zan`]: parseInt(that.data.thread[i].zan) + parseInt(1)
              })
            } else {
              this.setData({
                [`thread[${i}]is_zan`]: 2,
                [`thread[${i}]cai`]: parseInt(that.data.thread[i].cai) + parseInt(1)
              })
            }
            wx.showToast({
              title: res.data.credits ? '已评价，电量+' + res.data.credits : '评价成功！',
              icon: 'success',
            })
          })
        } else {
          wx.showToast({
            title: '你已经评价过啦！',
            icon: 'none',
          })
        }
      }
    })
  },

  orderTap: function(e) {
    const that = this
    let order = e.currentTarget.dataset.order
    if (order == that.data.order)
      return

    that.setData({
      order: order,
      page_index: 0
    })
    that.reloadIndex()
  },
  onChangePage: function(e) {
    const that = this
    this.setData({
      page_index: e.detail
    })
    that.reloadIndex();
  },
  toAddArtice: function() {
    const that = this
    const fid = that.data.is_show_post.fid
    const post_type = that.data.is_show_post.post_type
    wx.navigateTo({
      url: `/question/pages/add_article/add_article?fid=${fid}&post_type=${post_type}`
    })
  },
  /* 下拉刷新 */
  onPullDownRefresh: function() {
    this.reloadIndex()
    wx.stopPullDownRefresh()
  },

  // 是否弹出授权框
  isShowAuthorization: function() {
    const that = this
    const hasLogin = wx.getStorageSync("has_login")
    return new Promise(function(resolve, reject) {
      if (hasLogin == 1) {
        resolve(true)
      } else {
        resolve(false)
        that.showAuthorization()
      }
    })
  },
  showAuthorization: function() {
    const that = this
    that.setData({
      showAuthorization: true
    })
  },

  /* 分享 */
  onShareAppMessage: function(res) {
    const that = this
    const fid = that.data.fid
    return {
      title: app.globalData.shareTitle,
      path: `/pages/index/index?shareName=topic_zone&shareId=${fid}`
    }
  },
  onPageScroll: function(e) {
    const that = this
    let eScrollTop = e.scrollTop
    const query = wx.createSelectorQuery()
    query.select('#topic-body-titel').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function(res) {
      if (res[0].top + res[1].scrollTop <= eScrollTop + that.data.heightMt ) {
        if (that.data.fixed != 1){
          that.setData({
            fixed: 1
          })
        }
      } else {
        if (that.data.fixed != 0){
          that.setData({
            fixed: 0
          })
        }
      }
    })
  },
})