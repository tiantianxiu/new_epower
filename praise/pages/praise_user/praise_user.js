var app = getApp()
import {
  wxParseImgTap
} from '../../../wxParse/wxParse.js'
import {
  request,
  uTS
} from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAuthorization: false,
    idtype: 'tid',
    pid: 0,
    page_size: 5,
    page_index: 0,
    editViews: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      shareImg: 1,
      showCapsule: 1, //是否显示左上角图标,
      title: '车型口碑', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    let id = options.id
    that.setData({
      id: id
    })
    that.reloadIndex()
  },
  reloadIndex: function() {
    const that = this
    that.setLoding()
    that.reputationDetail()
    that.setData({
      page_index: 0
    })
  },
  reputationDetail: function() {
    const that = this
    let id = that.data.id
    request('post', 'get_reputation_detail.php', {
      token: wx.getStorageSync("token"),
      id: id
    }).then((res) => {
      if (res.err_code != 0)
        return
      if (res.data.status == -1) {
        that.setData({
          loading_hidden: true,
        })
        app.wxShowToast(res.data.msg, 1500, 'none')
          .then(() => {
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
            }, 1600)
          })
        return
      }
      let reputation_data = res.data.reputation_data
      if (reputation_data.power_consumption != '0.00' && reputation_data.fuel_consumption == '0.00') {
        reputation_data.rmb = parseInt(reputation_data.power_consumption * 1.2)
      }

      that.setData({
        reputation_data: res.data.reputation_data,
        tid: res.data.reputation_data.tid,
        subject: res.data.reputation_data.subject,
        is_admin: res.data.reputation_data.is_admin,
        loading_hidden: true,
        loading_msg: '加载完毕...',
      })
      that.getComment()
    })
  },
  // 管理员点开所有设置
  toSet: function() {
    const that = this
    let is_share = that.data.is_share ? 0 : 1
    that.setData({
      is_share: is_share,
      editViews: !that.data.editViews
    })
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  inputViews: function(e) {
    const that = this
    that.setData({
      views: e.detail.value //设置数
    });
  },
  submitViews: function() {
    const that = this
    let views = that.data.views
    let reg = "^[0-9]*[1-9][0-9]*$"
    if (!views) {
      app.showErrModal('设置不能为空')
      return
    }
    if (!views.match(reg)) {
      app.showErrModal('只能正整数')
      return
    }
    if (views.length > 6) {
      app.showErrModal('长度不能超过6位')
      return
    }

    request('post', 'add_thread_views.php', {
      token: wx.getStorageSync('token'),
      tid: that.data.tid,
      views: views
    }).then((res) => {
      if (res.err_code == 0) {
        app.wxShowToast(res.data.message).then(() => {
          if (res.data.status < 0)
            return
          setTimeout(() => {
            that.setData({
              'reputation_data.views': views,
              editViews: false
            })
          }, 1000)
        })

      } else {
        app.wxShowToast('修改失败')
      }
    })

  },
  addPost: function(e) {
    const that = this
    const message = e.detail.message
    const aidList = e.detail.aidList
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    request('post', 'add_post.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.reputation_data.tid,
      pid: that.data.pid,
      message: message
    }).then((res) => {
      wx.showToast({
        title: res.data.credits ? '已回复，电量+' + res.data.credits : '回复成功！',
        icon: 'success',
        duration: 2000
      })
      that.setData({
        textContent: '',
        loading_msg: '加载完毕...',
        loading_hidden: true,
        pid: 0
      })
      if (that.data.nomore_data == true) {
        that.setData({
          nomore_data: false,
          page_index: 0
        })
      }
      let add_post_reply = res.data.reply
      let articleList = that.data.articleList || []
      add_post_reply["zan"] = 0
      add_post_reply["cai"] = 0
      add_post_reply["is_zan"] = 0
      add_post_reply["is_add_post"] = 1

      let extcredits2 = add_post_reply.extcredits2 + ''
      add_post_reply.extcredits2_arr = extcredits2.split('')

      articleList.splice(0, 0, add_post_reply)

      that.setData({
        articleList: articleList
      })
      setTimeout(() => {
        that.setData({
          'articleList[0]is_add_post': 0
        })
      }, 3000)
      that.scrollToBottom()
      that.setData({
        addPosts: add_post_reply
      })
      that.selectComponent("#moreFunctions").addPost()
      that.selectComponent("#replyTail").resetData()
    });
  },
  getComment: function() { //获得评论数
    const that = this
    let page_index = that.data.page_index,
      page_size = that.data.page_size

    request('post', 'get_post_detail_comment.php', {
      token: wx.getStorageSync('token'),
      tid: that.data.tid,
      page_size: page_size,
      page_index: page_index,
      pid: 0
    }).then((res) => {
      if (res.err_code != 0)
        return
      let post_list_length = res.data.post_list.length
      let temArticle = that.data.articleList
      let post_list = res.data.post_list
      for (let i in post_list) {
        var extcredits2 = post_list[i].extcredits2 + ''
        post_list[i].extcredits2_arr = extcredits2.split('')
      }
      let articleList = that.data.page_index ? temArticle.concat(post_list) : post_list
      that.setData({
        articleList: articleList,
        total_num: res.data.total_num,
        have_data: false,
        nomore_data: post_list_length < page_size ? true : false
      })
    })
  },
  onReachBottom: function() {
    const that = this
    if (that.data.nomore_data == true)
      return
    that.data.page_index = that.data.page_index + 1
    that.setData({
      have_data: true
    }, that.getComment())

  },
  //从子组件来的回复
  myReply: function(e) {
    const that = this,
      pid = e.detail.pid
    that.setData({
      pid: pid
    })
    that.isShowAuthorization().then((res) => {
      if (res == true) {
        that.selectComponent("#replyTail").showreplyFormFun()
      }
    })
  },
  // 评论回复
  replyComment: function(e) {
    const that = this
    const pid = e.currentTarget.dataset.pid

    that.setData({
      pid: pid
    })
    that.isShowAuthorization().then((res) => {
      if (res == true) {
        that.selectComponent("#replyTail").showreplyFormFun()
      }
    })
  },
  // 点赞
  clickZhan: function(e) {
    console.log(e)
    const that = this
    const type = e.currentTarget.dataset.type //1赞 2踩
    const is_zan = e.currentTarget.dataset.iszan
    const pid = e.currentTarget.dataset.pid
    const index = e.currentTarget.dataset.index
    const number = e.currentTarget.dataset.number
    that.isShowAuthorization().then((res) => {
      if (res == true) {
        if (is_zan == 0) {
          request('post', 'add_zan_post.php', {
            token: wx.getStorageSync("token"),
            tid: that.data.tid,
            type: type,
            pid: pid
          }).then((res) => {
            let articleListIndex, indexNum,
              artIndexIs = 'articleList[' + index + '].is_zan'
            if (type == 1) {
              articleListIndex = 'articleList[' + index + '].zan'
              indexNum = 1
            } else {
              articleListIndex = 'articleList[' + index + '].cai'
              indexNum = 2
            }
            that.setData({
              [artIndexIs]: indexNum,
              [articleListIndex]: parseInt(number) + parseInt(1)
            })
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
  wxParseImgTap: function(e) {
    const that = this
    e.urls = that.data.reputation_data.image_list
    wxParseImgTap(e)
  },
  toUserDetail: function(e) {
    app.toUserDetail(e)
  },
  setLoding: function() {
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
  },
  showAuthorization: function() {
    const that = this
    that.setData({
      showAuthorization: true
    })
  },
  rejectAuthorizeFun: function() {
    // console.log('不同意授权')
    const that = this
    that.setData({
      showAuthorization: true
    })
  },
  onShareAppMessage: function() {
    const that = this
    const id = that.data.id
    const subject = that.data.subject
    return {
      title: subject,
      path: `/pages/index/index?shareName=praise_user&shareId=${id}&root=praise`
    }
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
  headerShare: function() {
    const that = this
    that.selectComponent('#praiseRight').showShareBox()
  },
  scrollToBottom: function () {
    const that = this
    setTimeout(function () {
      wx.createSelectorQuery().select('#articleWrap').boundingClientRect(function (rect) {
        const pageH = rect.height
        const st = pageH
        wx.pageScrollTo({
          scrollTop: st,
        })
      }).exec()
    }, 500);
  },
  //回复删除
  replyDel: function (e) {
    const that = this
    let index = e.currentTarget.dataset.index,
      pid = e.currentTarget.dataset.pid,
      data = {
        token: wx.getStorageSync("token"),
        pid: pid
      }
    app.deleteNormal(data, 'del_reply.php').then((res) => {
      if (res.status < 0)
        return
      that.data.articleList.splice(index, 1)
      that.setData({
        articleList: that.data.articleList
      })
    })
  },
})