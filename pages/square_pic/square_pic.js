var app = getApp()
import {
  request,
  transformPHPTime
} from '../../utils/util.js'

Page({
  data: {

    loading_hidden: true,
    loading_msg: '加载中...',
    nomore_data: false,
    page_size: 9,
    page_index: 0,
    showCoverId: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '广场专题', //导航栏 中间的标题
    }
  },
  onLoad: function(options) {
    const that = this
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      console.log(scene)
      var tidVal = scene.split('=')
      var id = tidVal[1].split('&')[0]
      var subject = tidVal[2]
    } else {
      var id = options.id
      var subject = options.subject
    }
    that.setData({
      id: id,
      subject: subject
    })
    if (subject)
      that.setData({
        'navbarData.title': subject
      })
    that.reloadIndex();
  },

  reloadIndex: function() {
    const that = this;
    that.setData({
      loading_hidden: false,
    })
    that.data.page_index = 0
    that.getSquare()
  },

  //最新贴子
  getSquare: function() {
    const that = this
    let page_size = that.data.page_size,
      page_index = 0
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
    request('post', 'get_square.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      typeid: that.data.id
    }).then((res) => {
      if (res.err_code != 0)
        return
      let thread = res.data.thread
      for (let i in thread) {
        var extcredits2 = thread[i].extcredits2 + ''
        var extcredits2_arr = extcredits2.split('')
        thread[i].extcredits2_arr = extcredits2_arr
        thread[i].timestamped = transformPHPTime(thread[i].timestamp)
        if (thread[i].message.length > 40) {
          thread[i].message_more = thread[i].message.substring(0, 40) + '...'
        }
        if (thread[i].video) {
          that['videoContext' + thread[i].pid] = wx.createVideoContext('myVideo' + thread[i].pid)
        }
      }
      that.setData({
        banner: res.data.banner,
        thread: thread,
        page_topicIndex: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕',
        have_data: thread.length < page_size ? false : true,
        nomore_data: thread.length < page_size ? true : false
      })
    })
  },
  dd: function() {

  },

  onReachBottom: function() {
    const that = this

    let page_size = that.data.page_size
    let page_index = that.data.page_index + 1

    if (that.data.nomore_data == true)
      return
    request('post', 'get_square.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      typeid: that.data.id
    }).then((res) => {
      let tmpThread = that.data.thread
      let thread = res.data.thread;
      for (let i in thread) {
        var extcredits2 = thread[i].extcredits2 + ''
        var extcredits2_arr = extcredits2.split('')
        thread[i].extcredits2_arr = extcredits2_arr
        thread[i].timestamped = transformPHPTime(thread[i].timestamp)
        if (thread[i].video) {
          that['videoContext' + thread[i].pid] = wx.createVideoContext('myVideo' + thread[i].pid)
        }
        if (thread[i].message.length > 40) {
          thread[i].message_more = thread[i].message.substring(0, 40) + '...'
        }
      }
      let newThread = tmpThread.concat(thread)
      that.setData({
        have_data: thread.length < page_size ? false : true,
        thread: newThread,
        page_index: page_index,
        nomore_data: thread.length < page_size ? true : false,
      })
    })
  },
  play: function(e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    that.setData({
      showCoverId: pid
    }, () => {
      that['videoContext' + pid].play()
      that['videoContext' + pid].requestFullScreen({
        direction: 0
      })

    })
  },
  exitFullScreen: function(e) {
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
  fullscreenchange: function(e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    if (e.detail.fullScreen != true) {
      that.setData({
        showCoverId: 0
      })
      that['videoContext' + pid].stop()
    }
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
              this.setData({
                [`thread[${i}]is_zan`]: 1,
                [`thread[${i}]zan`]: parseInt(that.data.thread[i].zan) + parseInt(1)
              })
            } else {
              this.setData({
                [`thread[${i}]is_zan`]: 2,
                [`thread[${i}]cai`]: parseInt(that.data.thread[i].cai) + parseInt(1)
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
  toZone: function(e) {
    var fid = e.currentTarget.dataset.fid;
    wx.navigateTo({
      url: '../zone/zone?id=' + fid,
    })
  },
  toDetail: function(e) {
    var tid = e.currentTarget.dataset.tid;
    if (tid == 0) {
      return
    }
    if (e.currentTarget.dataset.action)
      wx.navigateTo({
        url: `../detail/detail?tid=${tid}&action=reply`,
      })

    wx.navigateTo({
      url: `../detail/detail?tid=${tid}`,
    })
  },
  /* 下拉刷新 */
  onPullDownRefresh: function() {
    console.log('onPullDownRefresh')
    this.reloadIndex()
    wx.stopPullDownRefresh();
  },
  onShareAppMessage: function() {
    const that = this
    const id = that.data.id
    const subject = that.data.subject
    return {
      title: subject || '广场专题',
      path: `/pages/index/index?shareName=square_pic&shareId=${id}`
    }
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
  toUserDetail: function(e) {
    app.toUserDetail(e)
  },
  squareTap: function() {
    const that = this
    app.canAddThread(true).then((re) => {
      if (re) {
        that.isShowAuthorization().then((res) => {
          that.setData({
            witchAdd: !that.data.witchAdd
          })
        })
      }
    })
  },
  squareLong: function(e) {
    const that = this
    let type = e.currentTarget.dataset.type
    let id = that.data.id
    app.canAddThread(true).then((re) => {
      if (re) {
        that.isShowAuthorization().then((res) => {
          wx.navigateTo({
            url: `/pages/add_square/add_square?type=${type}&typeid=${id}`
          })
          that.setData({
            witchAdd: false
          })
        })
      }
    })
  },

})