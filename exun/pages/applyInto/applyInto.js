// add_article.js
var app = getApp()
import {request} from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',

    textUsername:'',
    textID:'',
    textPhone:'',
    textName:'',
    textIdcard:'',
    flag:'',
    certificationPic:'',
    certificationUrl:'',
    vid:'',

    showProgress:false,
    progress:'',
    base_url:app.globalData.base_url,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '申请入驻', //导航栏 中间的标题
    },
  },

  onLoad: function(options) {
    const that = this
    that.getEinfoVerifyFun()
  },
  inputUsername: function (e) {
    this.setData({
      textUsername: e.detail.value
    })
  },
  inputID: function(e) {
    this.setData({
      textID: e.detail.value
    })
  },
  inputIdcard: function(e) {
    this.setData({
      textIdcard: e.detail.value
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
  // 
  chooseImage: function () {
    var that = this
    if(that.data.flag == 1){
      return
    }
    wx.chooseImage({
      count: 1,
      success: function (res) {
        const tempFilePaths = res.tempFilePaths
        const uploadTask = wx.uploadFile({
          url: app.globalData.svr_url + 'add_daka_verify_image.php',
          filePath: tempFilePaths[0],
          name: 'myfile',
          method: 'POST',
          formData:{
            token: wx.getStorageSync("token"),
          },
          success: function(res){
            var res = JSON.parse(res.data)
            if (res.err_code == 0){
              that.setData({
                certificationPic: `${that.data.base_url}${res.data.real_file_url}`,
                certificationUrl: res.data.file_url,
                showProgress:false,
                progress:0
              })
            }

          }
        })
        uploadTask.onProgressUpdate((res) => {
            that.setData({
              showProgress:true,
              progress:res.progress
            })          
        })
      },
    })
  },
  delPic: function() {
    const that = this
    that.setData({
      certificationPic:'',
      certificationUrl:'',
    })
  },
  // 获取公众号申请信息
  getEinfoVerifyFun: function(){
    const that = this
    request('post','get_einfo_verify.php',{
      token: wx.getStorageSync("token"),
    }).then((res)=>{
      if(res.data !=''){
        that.setData({
          textUsername:wx.getStorageSync("username"),
          textID:res.data.field4,
          textPhone:res.data.mobile,
          textName:res.data.realname,
          textIdcard:res.data.idcard,
          flag:res.data.flag,
          certificationPic:res.data.base_url,
          certificationUrl:res.data.field3,
          vid:res.data.vid,
        })
      }else{
        that.setData({
          flag:-2,
          textUsername:wx.getStorageSync("username"),
        })
      }      
    })
  },
  submitFun: function(){
    const that = this
    const textID = that.data.textID; 
    if (textID == null || textID == undefined || textID == ''){
      getApp().showErrModal('公众号ID不能为空')
      return
    }
    const textIdcard = that.data.textIdcard; 
    if (textIdcard == null || textIdcard == undefined || textIdcard == ''){
      getApp().showErrModal('身份证号不能为空')
      return
    }       
    const textPhone = that.data.textPhone; 
    if (textPhone == null || textPhone == undefined || textPhone == ''){
      getApp().showErrModal('手机号不能为空')
      return
    }    
    const textName = that.data.textName; 
    if (textName == null || textName == undefined || textName == ''){
      getApp().showErrModal('真实姓名不能为空')
      return
    }
    const certificationUrl = that.data.certificationUrl;
    if (certificationUrl == null || certificationUrl == undefined || certificationUrl == ''){
      getApp().showErrModal('请上传营业执照')
      return
    }
    request('post','add_einfo_verify.php',{
      token: wx.getStorageSync("token"),
      vid: that.data.vid,
      field3: certificationUrl,
      wechatnum: textID,
      idcard: textIdcard,
      mobile: textPhone,
      realname: textName
    }).then((res)=>{
        wx.showToast({
          title: '申请成功',
          icon: 'success',
          duration: 2000,
        }) 
        that.getEinfoVerifyFun()

    })    
  },

})