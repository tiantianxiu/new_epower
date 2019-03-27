// add_article.js
var app = getApp()
import {
  request
} from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    textForumName: '',
    textUsername: '',
    textWX: '',
    textPhone: '',
    textName: '',
    textQQ: '',
    textReason: '',
    // gender: ['男', '女'],
    gIndex: 0,
    fid: '',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '申请版主', //导航栏 中间的标题
    }
  },

  onLoad: function(options) {
    const that = this
    const fid = options.fid
    const realname = options.realname
    const qq = options.qq
    const weixin = options.weixin
    const mobile = options.mobile
    // const gender = options.gender
    const forumName = options.forumName

    that.setData({
      fid: fid,
      textWX: weixin,
      textPhone: mobile,
      textName: realname,
      textQQ: qq,
      // gIndex: gender - 1,
      textForumName: forumName
    })
  },
  inputForumName: function(e) {
    this.setData({
      textForumName: e.detail.value
    })
  },
  inputUsername: function(e) {
    this.setData({
      textUsername: e.detail.value
    })
  },
  inputWX: function(e) {
    this.setData({
      textWX: e.detail.value
    })
  },
  inputPhone: function(e) {
    this.setData({
      textPhone: e.detail.value
    })
  },
  inputName: function(e) {
    this.setData({
      textName: e.detail.value
    })
  },
  inputQQ: function(e) {
    this.setData({
      textQQ: e.detail.value
    })
  },
  inputReason: function(e) {
    this.setData({
      textReason: e.detail.value
    })
  },
  // genderPicker: function(e) {
  //   this.setData({
  //     gIndex: e.detail.value
  //   })
  // },


  submitFun: function() {
    const that = this
    const textUsername = that.data.textUsername
    
    
    // if (textUsername == null || textUsername == undefined || textUsername == ''){
    //   getApp().showErrModal('用户名不能为空')
    //   return
    // }
    const textWX = that.data.textWX;
    if (textWX == null || textWX == undefined || textWX == '') {
      getApp().showErrModal('微信号不能为空')
      return
    }
    const textPhone = that.data.textPhone;
    if (textPhone == null || textPhone == undefined || textPhone == '') {
      getApp().showErrModal('手机号不能为空')
      return
    }
    if (!(/^1[34578]\d{9}$/.test(textPhone))) {
      getApp().showErrModal('手机号码有误，请重填')
      return
    } 
    const textName = that.data.textName;
    if (textName == null || textName == undefined || textName == '') {
      getApp().showErrModal('真实姓名不能为空')
      return
    }
    const textQQ = that.data.textQQ;
    if (textQQ == null || textQQ == undefined || textQQ == '') {
      getApp().showErrModal('QQ不能为空')
      return
    }
    const textReason = that.data.textReason;
    if (textReason == null || textReason == undefined || textReason == '') {
      getApp().showErrModal('申请理由不能为空')
      return
    }
    request('post', 'add_forum_verify.php', {
      token: wx.getStorageSync("token"),
      fid: that.data.fid,
      // gender: parseInt(this.data.gIndex) + 1,
      mobile: that.data.textPhone,
      realname: that.data.textName,
      qq: that.data.textQQ,
      weixin: that.data.textWX,
      content: that.data.textReason
    }).then((res) => {
      if (res.err_code != 0)
        return
      wx.showToast({
        title: '申请成功',
        icon: 'success',
        duration: 2000,
      })
      setTimeout(function() {
        wx.navigateTo({
          url: '../zone/zone?id=' + that.data.fid
        })
      }, 2000)
    })
  },

  onShow: function() {},
})