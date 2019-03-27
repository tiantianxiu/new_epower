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
      title: '口碑推荐', //导航栏 中间的标题
    }

  },

  onLoad: function(options) {
    const that = this
    that.reloadIndex()
  },

  
  reloadIndex: function() {
    const that = this
    that.setData({
      loading_hidden: false,
    })
    that.getForumArticle();

  },

  getForumArticle: function() {
    const that = this
    that.setData({
      loading_hidden: false,
    })
    request('POST', 'get_price_recommend_thread.php', {})
      .then((res) => {
        let respArticleList = res.data.recommend_data
        that.setData({
          article: respArticleList,
          loading_hidden: true,
          loading_msg: '加载完毕...',
        })
      });
  },

  toDetail: function(e) {
    let tid = e.currentTarget.dataset.tid
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },

})