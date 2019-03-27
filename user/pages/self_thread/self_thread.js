var app = getApp()
import {request} from '../../../utils/util.js'

Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    scrollTop: '',
    have_data: false,
    nomore_data: false,
    uid:'',

    articleList:[],
    page_size: 10,
    page_index: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '帖子/口碑', //导航栏 中间的标题
    }
  }, 
 
  onLoad: function (options) {
    var uid = options.uid;
    this.setData({
      uid: uid,
      // uid: 1555,
    })
    this.reloadIndex();
  },

  toDetail: function (e) {
    let tid = e.currentTarget.dataset.tid
    let hidden = e.currentTarget.dataset.hidden
    if (hidden==1){
      let reputation_id = e.currentTarget.dataset.reputation_id
      wx.navigateTo({
        url: '/praise/pages/praise_user/praise_user?id=' + reputation_id,
      })
      return
    }
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },
  onReachBottom: function () {
    const that = this;
    const page_size = that.data.page_size;
    const page_index = that.data.page_index + 1;
    const uid = that.data.uid;
    if(that.data.nomore_data == true){
      return
    }     
    request('post','get_my_thread.php',{
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      uid:uid
    }).then((res)=>{
      let tmpArticleList = that.data.articleList;
      let respArticleList = res.data.my_thread_data;
      let newArticleList = tmpArticleList.concat(respArticleList)
      that.setData({
        articleList: newArticleList,
        page_index: page_index,
        have_data: respArticleList.length <= 0 ? false:true,
        nomore_data: respArticleList.length > 0 ? false:true,
      })
    });
  },

  reloadIndex: function() {
    const that = this;
    const page_size = that.data.page_size;
    const page_index = that.data.page_index;
    const uid = that.data.uid;
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
    request('post','get_my_thread.php',{
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      uid:uid
    }).then((res)=>{
      that.setData({
        articleList: res.data.my_thread_data,
        page_index: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    });

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
