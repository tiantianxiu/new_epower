// user.js
var app = getApp()
import {
  request
} from '../../../utils/util.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasLogin: '',
    avatarUrl: "http://cdn.e-power.vip/resources/image/user_icon.png",
    nickName: "游客",
    bio: '',
    bioPlaceholder: '',
    loading_hidden: true,
    loading_msg: '加载中...',
    pageShow: true,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '修改资料', //导航栏 中间的标题
    }
  },
  onLoad: function() {
    const that = this;
    that.setData({
      hasLogin: wx.getStorageSync("has_login"),
    })
    that.reloadIndex()
  },
  reloadIndex: function() {
    const that = this
    if (that.data.hasLogin == 1) {
      getApp().getUserInfo().then((res) => {
        var bioPlaceholder
        res.bio != '' ? bioPlaceholder = res.bio : bioPlaceholder = '请编辑你的个人资料吧'
        that.setData({
          avatarUrl: res.avatar,
          nickName: res.username,
          bioPlaceholder: bioPlaceholder,
          bio: res.bio
        })
      });
    } else {
      getApp().wxGetUserInfo().then((res) => {
        var bioPlaceholder
        res.bio != '' ? bioPlaceholder = res.bio : bioPlaceholder = '请编辑你的个人资料吧'
        that.setData({
          avatarUrl: res.avatar,
          nickName: res.username,
          bioPlaceholder: bioPlaceholder,
          bio: res.bio
        })
      });
    }
  },
  
  chooseImage: function() {
    var that = this
    that.selectComponent('#avatarCopper').upEwm();
    that.setData({
      pageShow: false
    })
  },

  //剪裁图片功能
  uploadImg: function(e) {
    const that = this
    const imgUrl = e.detail.imgUrl
    that.setData({
      pageShow: true,
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    wx.uploadFile({
      url: app.globalData.svr_url + 'save_my_avatar.php',
      filePath: imgUrl,
      name: 'myfile',
      method: 'POST',
      formData: {
        token: wx.getStorageSync("token"),
      },
      success: function(res) {
        var res = JSON.parse(res.data)
        if (res.err_code == 0) {
          that.setData({
            avatarUrl: res.data.file_url,
            loading_hidden: true,
          })
          wx.reLaunch({
            url: '/pages/user/user'
          })
        } else {
          getApp().showErrModal(res.err_msg);
          that.setData({
            loading_hidden: true,
          })
        }
      }
    })
  },
  inputName: function(e) {
    this.setData({
      nickName: e.detail.value
    });
  },
  inputContent: function(e) {
    this.setData({
      bio: e.detail.value
    });
  },
  infoSubmit: function() {
    var that = this
    request('post', 'save_my_info.php', {
      token: wx.getStorageSync("token"),
      newusername: that.data.nickName,
      bio: this.data.bio
    }).then((res) => {
      wx.showToast({
        title: '修改成功',
        icon: 'success',
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/user/user'
        })
      }, 500)
    });
  },

})