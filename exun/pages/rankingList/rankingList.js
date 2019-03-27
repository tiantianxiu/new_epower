var app = getApp()
import {request} from '../../../utils/util.js'

Page({
  data: {
    have_data: false,
    nomore_data: false,
    loading_hidden: true,
    loading_msg: '加载中...',
    type:1, //1：媒体推荐号 2：大咖排行榜
    ranklist:'',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '媒体排行榜', //导航栏 中间的标题
    },
  }, 
  
  onLoad: function (options) {
    const that = this
    that.getEInfoRanklistFun();
  },

  getEInfoRanklistFun: function() {
    var that = this
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
    request('post','get_einfo_ranklist.php',{
      token: wx.getStorageSync("token"),
      type:that.data.type
    }).then((res)=>{
      that.setData({
        loading_hidden: true,
        loading_msg: '加载完毕...',
        ranklist:res.data.rank_data
      })
    });
  },
  
})