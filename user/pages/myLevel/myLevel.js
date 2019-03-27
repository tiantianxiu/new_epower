// user.js
var app = getApp()
import {request} from '../../../utils/util.js'
Page({
  data: { 
    loading_hidden: true,
    loading_msg: '加载中...',
    my_level:'',
    car:'',
    avatar:'',
    medal:[],
    username:'',
    all_credits:'',
    my_credits:'',
    credit_rule:'',
    bili_credits:'',
    is_carvip: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '我的等级', //导航栏 中间的标题
    }
  },
  onLoad: function () {
    var that = this
    that.reloadIndex()
  },
  reloadIndex: function () {

    const that = this;
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })    
    request('post','get_my_level.php',{
      token: wx.getStorageSync("token"),
    }).then((res)=>{
      that.setData({
        is_carvip: res.data.is_carvip,
        my_level:res.data.my_level,
        car: res.data.car || '',
        medal:res.data.medal,
        avatar:res.data.avatar,
        username:res.data.username,
        all_credits:res.data.all_credits,
        my_credits:res.data.my_credits,
        credit_rule:res.data.credit_rule,
        bili_credits:res.data.bili_credits,    
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    });
  },
  doTask: function(e) {
    var url = e.currentTarget.dataset.url
    var linktype = e.currentTarget.dataset.linktype
    if(linktype == 2){
      console.log(url)
      wx.switchTab({
        url: url,
      }) 
    }else if(linktype == 1) {
      wx.reLaunch({
        url: '/question' + url,
      }) 
    }else{
      wx.navigateTo({
        url: url,
      })     
    }

  },
  onShow: function() {
  },
})
