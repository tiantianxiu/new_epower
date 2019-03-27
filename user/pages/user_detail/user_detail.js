// user.js
var app = getApp()
import {
  wxParseImgTap
} from '../../../wxParse/wxParse.js'
import {
  uploadFile,
  request,
  myTrim,
  transformPHPTime
} from '../../../utils/util.js'
Page({
  data: {
    hasUserInfo: false,
    uid: '',
    userInfo: {
      avatarUrl: "http://cdn.e-power.vip/resources/image/user_icon.png",
      nickName: "游客",
      level: 0,
      extcredits2: 0,
      following: 0,
      follower: 0,
      bio: '该用户很懒，什么都没有留下。'
    },
    showCoverId: 0,
    loading_hidden: true,
    loading_msg: '加载中...',
    scrollTop: '',
    have_data: false,
    nomore_data: false,
    pageShow: true,
    message: '', //私信内容
    medalList: '',
    showReply: false, //是否显示私信框
    focus: false,
    followStatus: '', //0未关注 1已关注 2互相关注
    postList: '', //他的贴子
    page_size: 10,
    page_index: 0,
    userStatus: 0, //是否已被禁言
    showAuthorization: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '用户资料', //导航栏 中间的标题
    }
  },

  onLoad: function(options) {
    var that = this
    var uid = options.id
    that.setData({
      uid: uid,
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    that.wxlogin()
    that.getMyThread()
  },
  // 放大用户头像
  uilTap: function(e) {
    const that = this
    if (that.data.userInfo.is_self == 1) {
      wx.navigateTo({
        url: `../editInfo/editInfo?uid=${that.data.uid}`
      })
      return
    }
    wxParseImgTap(e)
  },
  // 点赞文章
  toZan: function(e) {
    const that = this
    const i = e.currentTarget.dataset.index //1赞 2踩
    const type = e.currentTarget.dataset.type //1赞 2踩
    const tid = e.currentTarget.dataset.tid //1赞 2踩
    const is_zan = e.currentTarget.dataset.is_zan

    that.isShowAuthorization().then((res) => {
      if (res == true) {

        if (is_zan == 0) {
          request('post', 'add_zan.php', {
            token: wx.getStorageSync("token"),
            tid: tid,
            type: type
          }).then((res) => {
            if (res.err_code != 0)
              return

            if (type == 1) {
              that.setData({
                [`postList[${i}]is_zan`]: 1,
                [`postList[${i}]zan`]: parseInt(that.data.postList[i].zan) + parseInt(1)
              })
            } else {
              that.setData({
                [`postList[${i}]is_zan`]: 2,
                [`postList[${i}]cai`]: parseInt(that.data.postList[i].cai) + parseInt(1)
              })
            }
            wx.showToast({
              title: res.data.credits ? '已评价，电量+' + res.data.credits : '评价成功！',
              icon: 'success',
            })
          })
        } else {
          wx.showToast({
            title: '你已经评价过啦！',
            icon: 'none',
          })
        }
      }
    })
  },
 
  //管理员禁言或解禁
  statusBtn: function(e) {
    const that = this
    let status = that.data.userInfo.is_forbidden ? 2 : 1
    request('post', 'set_user_status.php', {
      token: wx.getStorageSync("token"),
      uid: that.data.uid,
      status: status
    }).then((res) => {
      if (res.data.status == 1) {
        wx.showToast({
          title: res.data.message,
          icon: 'success',
        })
        if (status == 1) {
          that.setData({
            'userInfo.is_forbidden': 1
          })
          return
        }
        that.setData({
          'userInfo.is_forbidden': 0
        })
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  // 图片预览
  imagesFor: function(e) {
    const that = this
    let image = e.currentTarget.dataset.image
    if (image) {
      let arr = []
      arr.push(image)
      wx.previewImage({
        urls: arr // 需要预览的图片http链接列表
      })
      return
    }
    let images = e.currentTarget.dataset.images,
      url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: images, // 需要预览的图片http链接列表
      current: url
    })
  },
 
  toDetail: function(e) {
    var tid = e.currentTarget.dataset.tid
    var hidden = e.currentTarget.dataset.hidden
    if (hidden == 1) {
      let reputation_id = e.currentTarget.dataset.reputation_id
      wx.navigateTo({
        url: '/praise/pages/praise_user/praise_user?id=' + reputation_id,
      })
      return
    }
    if (e.currentTarget.dataset.action)
      wx.navigateTo({
        url: `/pages/detail/detail?tid=${tid}&action=reply`,
      })

    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },
  toCarOwner: function() {
    const that = this
    const uid = that.data.uid
    wx.navigateTo({
      url: `../carMaster/carMaster?uid=${uid}&type=certified`,
    })
  },

  // 获取用户基本信息
  wxlogin: function() {
    var that = this;
    request('post', 'get_user_info.php', {
      token: wx.getStorageSync('token'),
      uid: that.data.uid
    }).then((res) => {

      var extcredits2 = res.data.extcredits2 + ''
      var extcredits2_arr = extcredits2.split('')

      that.setData({
        hasUserInfo: true,
        followStatus: res.data.follow_status,

        userInfo: {
          avatarUrl: res.data.avatar,
          nickName: res.data.username,
          level: res.data.level,
          extcredits2_arr: extcredits2_arr,
          following: res.data.following,
          follower: res.data.follower,
          bio: res.data.bio,
          is_admin: res.data.is_admin,
          is_forbidden: res.data.is_forbidden,
          user_is_admin: res.data.user_is_admin,
          is_self: res.data.is_self,
          cover_image: res.data.cover_image,
          plid: res.data.plid,
          is_auth_car: res.data.is_auth_car,
          is_auth_car_icon: res.data.is_auth_car_icon,
          is_carvip: res.data.is_carvip,
          position: res.data.position
        }
      })
    })
  },
  picTap: function(e) {
    const that = this
    let id = parseInt(e.currentTarget.dataset.typeid)
    let subject = e.currentTarget.dataset.class_name
    wx.navigateTo({
      url: `/pages/square_pic/square_pic?id=${id}&subject=${subject}`
    })
  },
  changeBg: function(e) {
    const that = this
    if (that.data.userInfo.is_self != 1){
      wxParseImgTap(e)
      return
    } 
    that.selectComponent('#avatarCopper').upEwm();
    that.setData({
      pageShow: false
    })
  },
  uploadImg: function(e) {
    const that = this
    const imgUrl = e.detail.imgUrl
    that.setData({
      pageShow: true,
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    wx.uploadFile({
      url: app.globalData.svr_url + 'add_image_of_user_cover.php',
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
            'userInfo.cover_image': res.data.read_file_url,
            loading_hidden: true,
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
  
  // 他的贴子
  getMyThread: function() {
    var that = this
    var page_index = that.data.page_index
    var page_size = that.data.page_size
    var uid = that.data.uid
    request('post', 'get_my_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      uid: uid,
    }).then((res) => {

      let respArticleList = res.data.my_thread_data
      for (let i in respArticleList) {
        respArticleList[i].timestamped = transformPHPTime(respArticleList[i].timestamp)
        if (respArticleList[i].video) {
          that['videoContext' + respArticleList[i].pid] = wx.createVideoContext('myVideo' + respArticleList[i].pid)
          console.log(that['videoContext' + respArticleList[i].pid])
        }
        if (respArticleList[i].message.length > 40) {
          respArticleList[i].message_more = respArticleList[i].message.substring(0, 40) + '...'
        }
      }
      that.setData({
        postList: respArticleList,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    })
  },
  onReachBottom: function () {
    var that = this
    var page_index = that.data.page_index + 1
    var page_size = that.data.page_size
    if (that.data.nomore_data == true) 
      return
    
    request('post', 'get_my_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      uid: that.data.uid,
    }).then((res) => {
      var tmpArticleList = that.data.postList;
      var respArticleList = res.data.my_thread_data
      for (let i in respArticleList) {
        respArticleList[i].timestamped = transformPHPTime(respArticleList[i].timestamp)
        if (respArticleList[i].video) {
          that['videoContext' + respArticleList[i].pid] = wx.createVideoContext('myVideo' + respArticleList[i].pid)
        }
        if (respArticleList[i].message.length > 40) {
          respArticleList[i].message_more = respArticleList[i].message.substring(0, 40) + '...'
        }
      }
      var newArticleList = tmpArticleList.concat(respArticleList)
      that.setData({
        articleList: newArticleList,
        page_index: page_index,
        have_data: respArticleList.length < page_size ? false : true,
        nomore_data: respArticleList.length >= page_size ? false : true,
      })
      that.setData({
        postList: newArticleList,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    })
  },
  // 显示回复框
  sendMsg: function(e) {
    const that = this
    let plid = e.currentTarget.dataset.plid
    that.isShowAuthorization().then((res) => {
      if (!res)
        return
      if (plid) {
        const uid = that.data.uid
        wx.navigateTo({
          url: `/pages/dialogue/dialogue?plid=${plid}&uid=${uid}`
        })
        return
      }
      that.setData({
        showReply: !that.data.showReply,
        focus: !that.data.focus
      })
    })
  },
  // 发送私信
  addPost: function(e) {
    const that = this
    const message = e.detail.message
    request('post', 'add_send_msg.php', {
      token: wx.getStorageSync("token"),
      uid: that.data.uid,
      message: message,
    }).then((r) => {
      wx.showToast({
        title: '发送成功',
        icon: 'success',
      })
      that.wxlogin()
      that.setData({
        showReply: false,
        focus: false,
        message: ''
      })
    })
  },
  // 关注与取消关注
  followBtn: function() {
    const that = this
    that.isShowAuthorization().then((res) => {
      if (!res)
        return
      var followStatus = that.data.followStatus //0未关注 1已关注 2互相关注
      request('post', 'add_follow.php', {
        token: wx.getStorageSync("token"),
        followuid: that.data.uid,
      }).then((r) => {
        if (followStatus == 0) {
          wx.showToast({
            title: '关注成功',
            icon: 'success',
          })
          that.setData({
            followStatus: 1
          })
        } else {
          wx.showToast({
            title: '已取消关注',
            icon: 'success',
          })
          that.setData({
            followStatus: 0
          })
        }
      })
    })
  },
  // 是否弹出授权框
  isShowAuthorization: function() {
    const that = this
    const hasLogin = wx.getStorageSync("has_login")
    return new Promise(function(resolve, reject) {
      if (hasLogin == 1) {
        resolve(true)
      } else {
        resolve(false)
        that.showAuthorization()
      }
    })
  },
  showAuthorization: function() {
    const that = this
    that.setData({
      showAuthorization: true
    })
  },
  onPullDownRefresh: function() {
    this.reloadIndex();
    wx.stopPullDownRefresh();
  },
  /* 返回顶 */
  onPageScroll: function(e) {
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
  /* 分享 */
  onShareAppMessage: function(res) {
    const that = this
    const uid = that.data.uid
    return {
      title: "用户资料",
      path: `/pages/index/index?shareName=user_detail&shareId=${uid}&root=user`
    }
  },
  play: function (e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    that.setData({
      showCoverId: pid
    }, () => {
      console.log(that['videoContext' + pid])
      that['videoContext' + pid].play()
      that['videoContext' + pid].requestFullScreen({
        direction: 0
      })
    })
  },
  exitFullScreen: function (e) {
    const that = this
    that.setData({
      showCoverId: 0
    })
    let pid = e.currentTarget.dataset.pid
    if (e.detail.fullScreen != true) {
      that['videoContext' + pid].stop()
      return
    }
    that['videoContext' + pid].stop()
    that['videoContext' + pid].exitFullScreen()
  },
  fullscreenchange: function (e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    if (e.detail.fullScreen != true) {
      that.setData({
        showCoverId: 0
      })
      that['videoContext' + pid].stop()
    }
  },
})