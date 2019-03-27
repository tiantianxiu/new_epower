var app = getApp()
import {
  request
} from '../../../utils/util.js'
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    scrollTop: '',
    have_data: false,
    nomore_data: false,

    einfoList: [],
    carid: '',
    page_eSize: 10,
    page_eIndex: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '大咖媒体号推荐', //导航栏 中间的标题
    }

  },
  onLoad: function(options) {
    const that = this;
    const fid = options.fid
    that.setData({
      fid: fid
    })
    this.reloadIndex()
  },
  onShow: function(options) {

  },
  reloadIndex: function() {
    const that = this;
    that.getEinfoList()
  },
  onReachBottom: function() {
    var that = this
    that.EnewsOnRB()
  },
  getEinfoList: function() {
    const that = this;
    const page_size = that.data.page_eSize;
    const page_index = that.data.page_eIndex;
    const fid = that.data.fid;
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...',
    })
    request('post', 'get_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      fid: fid
    }).then((res) => {
      that.setData({
        einfoList: res.data.forum_thread_data,
        page_topicIndex: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    });
  },
  //E讯下拉加载
  EnewsOnRB: function() {
    var that = this;
    var page_size = that.data.page_eSize;
    var page_index = that.data.page_eIndex + 1;
    var fid = that.data.fid;
    if (that.data.nomore_data == true) {
      return
    }
    request('post', 'get_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      fid: fid
    }).then((res) => {
      var tmpArticleList = that.data.einfoList;
      var respArticleList = res.data.forum_thread_data;
      var newArticleList = tmpArticleList.concat(respArticleList)
      that.setData({
        einfoList: newArticleList,
        page_eIndex: page_index,
        have_data: respArticleList.length <= 0 ? false : true,
        nomore_data: respArticleList.length > 0 ? false : true,
      })
    });
  },
  toEindex: function(e) {
    var carid = e.currentTarget.dataset.carid
    wx.reLaunch({
      url: `/pages/index/index?tab=Enews`
    })
  },
  toDetail: function(e) {
    var tid = e.currentTarget.dataset.tid;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${tid}`,
    })
  },
  /* 返回顶 */
  onPageScroll: function(e) {
    const that = this
    let eScrollTop = e.scrollTop
    let dataScrollTop = that.data.scrollTop
    if (e.scrollTop >= 600 && dataScrollTop < 600) {
      this.setData({
        scrollTop: eScrollTop
      })
    } else if (eScrollTop < 600 && dataScrollTop >= 600) {
      this.setData({
        scrollTop: eScrollTop
      })
    }
  },

})