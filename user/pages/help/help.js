var app = getApp()
import {request} from '../../../utils/util.js'
var WxParse = require('../../../wxParse/wxParse.js');
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    scrollTop:'',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '使用帮助', //导航栏 中间的标题
    },

    helpList:[],
    isShow:true
  }, 
 
  onLoad: function (options) {
    this.reloadIndex();
  },

  onReachBottom: function () {
  },

  reloadIndex: function() {
    var that = this
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
    request('post','get_forum_faq.php',{
      token: wx.getStorageSync("token"),
    }).then((res)=>{
      that.setData({
        helpList: res.data,
        loading_hidden: true,
        loading_msg: '加载完毕...',
      })

      var postArr = []
      var tmpArticleList = res.data[0].sub_group
      for (var i = 0; i < tmpArticleList.length; i++) {
        postArr.push(tmpArticleList[i].message)
      }

      for (let j = 0; j < postArr.length; j++) {
        WxParse.wxParse('reply' + j, 'html', postArr[j], that);
        if (j === postArr.length - 1) {
          WxParse.wxParseTemArray("replyTemArray", 'reply', postArr.length, that)
        }
      }
    });
  },
  foldFun: function(e) {
    var idx = e.currentTarget.dataset.idx;
    this.setData({
      isShow : !this.data.isShow
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
