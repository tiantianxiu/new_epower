var app = getApp()
import {request} from '../../utils/util.js'

Page({
  data: {

    loading_hidden: true,
    loading_msg: '加载中...',
    nomore_data: false,
    scrollTop: false,
    // swiper设置
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 500,
    swiperCurrent:0,
    swiperIndex:0,

    newArticle:[],

    qualityArticle:[],

    formDataSource:[],
    formData:[],
    formDatadaka:[],
    imgDaka:[],
    more:true,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 0, //是否显示左上角图标,
      title: '论坛', //导航栏 中间的标题
    }
  }, 
  onLoad: function (options) {
    const that = this
    that.reloadIndex();
  },

  reloadIndex: function() {
    const that = this;
    that.setData({
      loading_hidden: false,
    }) 
    that.getForumNewArticle();
    that.getForumQualityArticle();
    that.getForumfield();
    that.getForumfieldDaka();;
    that.getBannerDaka()
  },  
  swiperChange: function(e){  
    let current = e.detail.current  
    this.setData({  
        swiperIndex: current  
    })  
  },
  //最新贴子
  getForumNewArticle: function() {
    const that = this;
    const Nlimit = that.data.Nlimit;
    that.setData({
      loading_hidden: false,
    })
    request('POST','get_forum_thread_of_type.php',{
      token: wx.getStorageSync("token"),
      page_index: 0,
      page_size: 10,
      type:1
    }).then((res)=>{
      that.setData({
        newArticle:res.data.list,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    });
  },
  //精华贴子
  getForumQualityArticle: function() {    
    const that = this
    const Nlimit = that.data.Nlimit
    
    let qualityArticleSt = app.getSt('qualityArticle')  //精华帖子列表详情

    if (qualityArticleSt) {
      that.setData({
        qualityArticle: qualityArticleSt
      })
      return
    }
    request('POST','get_forum_thread_of_type.php',{
      token: wx.getStorageSync("token"),
      page_index: 0,
      page_size: 10,
      type:2
    }).then((res)=>{
      let qualityArticle = res.data.list
      app.putSt('qualityArticle', qualityArticle, 86400)
      that.setData({
        qualityArticle: qualityArticle
      })
    });
  },
  // 新能源杂谈
  getForumfield: function() {  
    const that = this;
    const Nlimit = that.data.Nlimit
    that.setData({
      loading_hidden: false
    })  
    request('POST','get_forumfield.php',{
      token: wx.getStorageSync("token"),
      fup:1 // 1新能源杂谈 82大咖 
    }).then((res)=>{
      let formDataSource = res.data.forum_forum_data
      that.setData({
        formDataSource: formDataSource,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    });
  },
  
  getForumfieldDaka: function() {  
    const that = this;
    const Nlimit = that.data.Nlimit;
    let formDatadakaSt = app.getSt('formDatadaka')
    if (formDatadakaSt){
      that.setData({
        formDatadaka: formDatadakaSt
      })
      return
    }
    that.setData({
      loading_hidden: false,
    })  
    request('POST','get_forumfield.php',{
      token: wx.getStorageSync("token"),
      fup:82 // 1新能源杂谈 82大咖
    }).then((res)=>{
      let formDatadaka = res.data.forum_forum_data
      that.setData({
        formDatadaka: formDatadaka,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
      app.putSt('formDatadaka', formDatadaka, 14400)
    });
  },
  getBannerDaka: function() {
    const that = this
    let imgDakaSt = app.getSt('imgDaka') //banner缓存get
    if (app.getSt('imgDaka')){   
      that.setData({
        imgDaka: imgDakaSt
      })
      return
    }
    request('post','get_banner.php',{
      token: wx.getStorageSync("token"),
      type:2
    }).then((res)=>{
      let imgDaka = res.data.banner_data
      app.putSt('imgDaka', imgDaka, 14400)  //banner做缓存
      that.setData({
        imgDaka: imgDaka
      })
    });
  },

  toDetail: function (e) {
    var tid = e.currentTarget.dataset.tid;
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },
  moreForum: function(e) {
    var that = this
    var type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/forum/pages/forum_more/forum_more?type=${type}`,
    })
  },
  toZone:function (e) {
    var fid = e.currentTarget.dataset.fid;
    wx.navigateTo({
      url: '/forum/pages/zone/zone?id=' + fid,
    })    
  },
  linkToForum: function (e) {
    var tid = e.currentTarget.dataset.tid;
    if(tid == 0){
      return
    }    
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },
  /* 下拉刷新 */
  onPullDownRefresh: function () {
    this.reloadIndex()
    wx.stopPullDownRefresh()
  },
  onShareAppMessage: function (res) {
    var that = this
    return {
      title: app.globalData.shareTitle,
      path: '/pages/forum/forum'
    }
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
