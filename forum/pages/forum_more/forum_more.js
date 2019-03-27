var app = getApp()
import {request} from '../../../utils/util.js'

Page({
  data: {

    loading_hidden: true,
    loading_msg: '加载中...',
    nomore_data: false,
    scrollTop: '',

    article:[],
    page_size: 15,
    page_index: 0,
    Nlimit:'',
    type:'',
    tid:'',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '板块', //导航栏 中间的标题
    },
  }, 
 
  onLoad: function (options) {
    var that = this;
    var type = options.type;
    that.setData({
       type: type,
    })
    this.reloadIndex();
  },

  onReachBottom: function () {
    var that = this;
    var page_size = that.data.page_size;
    var page_index = that.data.page_index + 1;
    if(that.data.nomore_data == true)
      return
    request('post','get_forum_thread_of_type.php',{
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      type:that.data.type
    }).then((res)=>{
      var tmpArticleList = that.data.article;
      var respArticleList = res.data.list;
      var newArticleList = tmpArticleList.concat(respArticleList)
      that.setData({
        article: newArticleList,
        page_index: page_index,
        have_data: respArticleList.length < page_size ? false:true,
        nomore_data: respArticleList.length < page_size ? true:false,
      })
    });
  },
  reloadIndex: function() {
    var that = this;
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
    request('POST','get_forum_thread_of_type.php',{
      token: wx.getStorageSync("token"),
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      type:that.data.type
    }).then((res)=>{
      let [respArticleList, page_size] = [res.data.list, that.data.page_size]
      that.setData({
        article: respArticleList,
        loading_hidden: true,
        loading_msg: '加载完毕...',
        nomore_data: respArticleList < page_size ? true : false
      })
    });
  },

  toDetail: function (e) {
    var tid = e.currentTarget.dataset.tid;
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },
  backToForum: function () {
    var that = this
    wx.switchTab({
      url: '/pages/forum/forum',
    })
  },
  /* 下拉刷新 */
  onPullDownRefresh: function () {
    this.reloadIndex();
    wx.stopPullDownRefresh();
  },

  /* 返回顶 */
  onPageScroll: function (e) {
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
