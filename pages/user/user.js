// user.js
var app = getApp()
import {
  request
} from '../../utils/util.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasLogin: '',
    userInfo: {
      avatarUrl: "http://cdn.e-power.vip/resources/image/user_icon.png",
      nickName: "游客",
      uid: '',
      level: 0,
      extcredits2: 0,
      following: 0,
      follower: 0,
      bio: '',
    },
    loading_hidden: true,
    loading_msg: '加载中...',
    msg_status: '',
    showAuthorization: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 0, //是否显示左上角图标,
      title: '个人中心', //导航栏 中间的标题
    }
  },
  onLoad: function() {

  },
  onShow: function() {
    const that = this;
    if (wx.getStorageSync("has_login") == 1) {
      that.reloadIndex()
    } else {
      that.setData({
        showAuthorization: true
      })
    }
    that.setData({
      hasLogin: wx.getStorageSync("has_login")
    })
  },
  reloadIndex: function() {
    const that = this
   
    // if (that.data.hasLogin == 1) {
    app.getUserInfo().then((res) => {
      var bio
      res.bio != '' ? bio = res.bio : bio = '该用户很懒，什么都没有留下'
      let msg_status = parseInt(res.msg_status)

      that.setData({
        userInfo: {
          avatarUrl: res.avatar,
          nickName: res.username,
          uid: res.uid,
          level: res.level,
          extcredits2: res.extcredits2,
          following: res.following,
          follower: res.follower,
          bio: bio,
          msg_status: msg_status
        },
      })
      msg_status = msg_status + ''
      if (msg_status != 0) { //tarba"我的"消息提示
        wx.setTabBarBadge({
          index: 4,
          text: msg_status
        })
      } else {
        wx.removeTabBarBadge({
          index: 4,
        })
      }

    });
    // }
  },

  selfLink: function(e) {
    const that = this
    const item = e.currentTarget.dataset.item
    const root = e.currentTarget.dataset.root
    const authorization = e.currentTarget.dataset.auth

    if (that.data.hasLogin == 1 || authorization == 0) {
      if (item) {
        if (item == 'carOwner') {
          wx.switchTab({
            url: `/pages/${item}/${item}`
          })
          return
        }
        if (root){
          wx.navigateTo({
            url: `/${root}/pages/${item}/${item}?id=${that.data.userInfo.uid}`
          })
          return
        }
        wx.navigateTo({
          url: `/user/pages/${item}/${item}?id=${that.data.userInfo.uid}`
        })
      } else {
        return
      }
    } else {
      that.setData({
        showAuthorization: true,
      })
    }
  },

  rejectAuthorizeFun: function() {
    // console.log('不同意授权')
    const that = this
    return
  },
  agreeAuthorizeFun: function() {
    // console.log('同意授权')
    const that = this
    wx.switchTab({
      url: '../index/index'
    })
  },
  
})