// pages/order_sale/order_sale.js
var app = getApp()
import { request } from '../../../utils/util.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    scrollTop: '',
    have_data: false,
    nomore_data: false,
    hotKeywords: [],  //热门帖子关键词
    searchText: '',
    searchType: 1,
    page_size: 5,
    page_index: 0,
    articleList: [],
    articleHotlist: [],
    noList: false, //没有更多帖子
    showHot: true,//是否显示热门帖子
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '搜索', //导航栏 中间的标题
    }
  },
  onLoad: function () {
    const that = this
    that.hotList()
    that.setData({
      nomore_data: true
    })
  },
  //热门关键词，以及热门帖子
  hotList: function () {
    const that = this
    request('post', 'search_index.php', {
      token: wx.getStorageSync("token")
    }).then((res) => {
      that.setData({
        hotKeywords: res.data.srchhotkeywords,
        articleHotlist: res.data.thread_data,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    })
  },
  toUserDetail: function (e) {
    app.toUserDetail(e)
  },
  onReachBottom: function () {
    const that = this
    let [type, name, page_size, page_index] =
     [that.data.searchType, that.data.searchText, that.data.page_size, that.data.page_index + 1],
      [page_Hsize, page_Hindex]= [that.data.page_Hsize, that.data.page_Hindex + 1] 
    if (that.data.nomore_data)  
      return
    
    //下拉加载搜索列表
    request('post', 'search.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      type: type,
      name: name
    }).then((res) => {
      let [tmpArticleList, respArticleList] = [that.data.articleList, res.data.thread_data],
          newArticleList = tmpArticleList.concat(respArticleList)
      that.setData({
        articleList: newArticleList,
        page_index: page_index,
        have_data: respArticleList.length < page_size ? false : true,
        nomore_data: respArticleList.length >= page_size ? false : true,
      })
    })

  },
  searchInput: function (e) {
    const that = this
    that.setData({
      searchText: e.detail.value
    });
    that.searchArticle()
  },
  searchWhat: function (e) {
    const [that, text] = [this, e.currentTarget.dataset.text];
    that.setData({
      searchText: text
    })
    that.searchArticle()
  },
  searchArticle: function () {
    const that = this
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
    let [page_size, page_index, type, name] = [that.data.page_size, 0, that.data.searchType, that.data.searchText]
    if (name != '') {
      request('post', 'search.php', {
        token: wx.getStorageSync("token"),
        page_size: page_size,
        page_index: page_index,
        type: type,
        name: name
      }).then((res) => {
        let respArticleList = res.data.thread_data
        that.setData({
          showHot: respArticleList.length >= page_size ?  false : true, //热门帖子消失
          articleList: respArticleList,
          loading_hidden: true,
          loading_msg: '加载完毕...',
          page_index: 0,
          nomore_data: respArticleList.length >= page_size ? false : true,  //已经拉到底啦
          have_data: respArticleList.length < page_size ? false : true          //loading消失
        })
        if (that.data.articleList.length <= 0) {
          that.setData({
            noList: true
          })
        } else {
          that.setData({
            noList: false
          })
        }
      })
    } else {
      that.setData({
        articleList: [],
        EarticleList: [],
        have_data: false,
        nomore_data: false,
        noList: false,
        showHot: true
      })
    }
  },
  searchBtn: function () {
    this.searchArticle();
  },
  toDetail: function (e) {
    var tid = e.currentTarget.dataset.tid;
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },
  toIndex: function () {  //热门帖子更多 跳转到首页
    wx.switchTab({
      url: '/pages/index/index'
    })
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