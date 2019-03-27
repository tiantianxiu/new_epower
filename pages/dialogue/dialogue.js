var app = getApp()
import {request,addClass,myTrim} from '../../utils/util.js'
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    showReply:false, //是否显示回复框
    focus:false,
    message:'',
    scrollTop:0,
    windowHeight:'',
    otherHeight:240,

    plid:'',
    uid:'',
    dialogueList:'',
    type:2, //1:post 2:msg 3:system
    focus:false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '消息通知', //导航栏 中间的标题
    }
  }, 
 
  onLoad: function (options) {
    const that = this
    const plid = options.plid
    const uid = options.uid  
    this.setData({
      plid: plid,
      uid: uid
    })
    this.reloadIndex()
  },

  reloadIndex: function() {
    const that = this;
      this.setData({
        loading_hidden: false,
        loading_msg: '加载中...',
      });
    request('post','get_chat_msg.php',{
      token: wx.getStorageSync("token"),
      plid: that.data.plid,
    }).then((res)=>{
      that.setData({
        dialogueList:res.data,
        loading_hidden: true,
        loading_msg: '加载完毕',
      })
      that.scrollTobuttom()
    })
  },

  scrollTobuttom:function(){
    const that = this
    // wx.getSystemInfo({
    //   success: function (res) {
        // 可使用窗口宽度、高度
        // 计算主体部分高度,单位为px
        that.setData({
          windowHeight: app.globalData.windowHeight - (app.globalData.heightMt + 20 * 2)
        })
    //   }
    // })
    wx.createSelectorQuery().select('#dialogueList').boundingClientRect(function(rect){
      rect.height  // 节点的高度
      that.setData({
        scrollTop:rect.height
      })
    }).exec()

  },

  changeTab: function(e) {
    var that = this
    var type = e.currentTarget.dataset.type
    console.log(type)
    wx.navigateTo({
      url: '../message/message?type=' + type,
    })
  },

  // 发送私信
  addPost: function(e){
    const that = this
    const message = e.detail.message
    console.log(message)
    request('post','add_send_msg.php',{
      token: wx.getStorageSync("token"),
      uid: that.data.uid,
      message: message,
    }).then((r)=>{
      
      that.setData({
        message:''
      })
      that.reloadIndex()     
    })
  },

  // 是否弹出授权框
  isShowAuthorization: function (){
    const that = this
    const hasLogin = wx.getStorageSync("has_login")
    return new Promise (function(resolve, reject){
      if(hasLogin == 1){
        resolve(true)
      }else{       
        resolve(false)
        that.showAuthorization()
      }
    })
  },  
  showAuthorization: function () {
    const that = this
    console.log("showAuthorization")
    that.setData({
      showAuthorization:true
    })   
  },
  /* 下拉刷新 */   
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh');
    this.reloadIndex();
    wx.stopPullDownRefresh();
  },

})
