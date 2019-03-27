// add_article.js
var app = getApp()
import {request} from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    articleTitle: "",
    textContent:'',
    textContentL:0,
    textContentMaxL:150,
    maxLength:150,

    feedbackType:'',//反馈类型
    winTypeShow:false,
    selectType:'',

    loading_hidden: true,
    loading_msg: '加载中...',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '意见反馈', //导航栏 中间的标题
    }
  },

  onLoad: function() {
    var that = this
    that.getOpinionType()
  }, 
  getOpinionType: function() {
    const that = this
    request('post','get_opinion_type.php',{
      token: wx.getStorageSync("token"),
    }).then((res)=>{
      that.setData({
        feedbackType:res.data.type_lists
      })
    })
  },
  changeType: function(e) {
    var that = this
    var type = e.currentTarget.dataset.type;
    that.setData({
      selectType:type
    })
  },
  showFeedbackWind: function(){
    var that = this
    that.setData({
      winTypeShow:true
    })
  },
  hideFeedbackWind:function() {
    var that = this
    that.setData({
      winTypeShow:false
    })    
  },
  // 内容
  inputContent: function(e) {
    var that = this
    that.setData({
      textContent: e.detail.value,
      textContentL:e.detail.value.length,
      maxLength:that.data.textContentMaxL - e.detail.value.length
    });
  },

  feedbackSubmit: function() {
    var that = this;
    var textContent = that.data.textContent; 
    var selectType = that.data.selectType
    if (textContent == null || textContent == undefined || textContent == ''){
      getApp().showErrModal('内容不能为空');
      return;
    }
    if (selectType == null || selectType == undefined || selectType == ''){
      getApp().showErrModal('请选择反馈类型');
      return;
    }    
    request('post','add_opinion.php',{
      token: wx.getStorageSync("token"),
      message: textContent,
      type: selectType,
    }).then((res)=>{
        that.setData({
          textContent:'',
          selectType:'',
          textContentL:0,
          textContentMaxL:150,
          maxLength:150,
        })
        wx.showToast({
          title: '感谢您的反馈',
          icon: 'success',
          duration: 2000
        })  
    }) 
  },

  onShow: function() {
  },
})