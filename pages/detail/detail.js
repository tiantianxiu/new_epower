// detail.js
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp()
import {
  request,
  myTrim,
  contains
} from '../../utils/util.js'
Page({
  data: { 
    loading_hidden: true,
    loading_msg: '加载中...',

    scrollTop: 0, //滑动高度
    page_index: 0,
    page_size: 5,
    new_reader: 0,

    pid: 0, //0表示评论，回复评论用评论的pid
    articleList: '',
    message: '',
    // 显示点赞需要的参数
    is_zan: '', //0没有 1赞 2踩
    type: 1,
    showZhan: true,
    tid: 0,
    // 显示收藏需要的参数
    showFavorite: true,
    is_favorite: '',
    idtype: 'tid',
    // showAuthorization: false,
    // 显示评论数
    showReplies: true,
    showCai: true,
    reply: 0,
    stamp_index: 0, //图章index
    focus: false,
    getTops: [
      '普通帖子',
      '本版置顶',
      '分类置顶',
      '全局置顶'
    ],
    //精华
    digestLevel: [
      '解除',
      '设置精华'
    ],
    //缓存
    cleanCacheSel: [
      '轮播图',
      '表情',
      '帖子',
      '评论',
      '帖子和评论'
    ],
    praises: [
      '取消',
      '10万内',
      '10-15万',
      '15-20万',
      '20-30万',
      '30-50万',
      '50万以上'
    ],
    showShareBox: false,
    is_share: 0, //分享页面前后，管理员按钮是否存在 1是存在 0是分享中不存在
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      shareImg: 1,
      showCapsule: 1, //是否显示左上角图标,
      title: '帖子详情', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this

    let tid
    if (options.id) {
      tid = options.id
    } else {
      tid = options.tid
    }

    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      const tidVal = scene.split('=')
      tid = tidVal[1]
    }

    let reply = 0
    if (options.reply) {
      reply = options.reply
    }
    this.setData({
      tid: tid,
      new_reader: 1,
      reply: reply
    })

    if (options.messagePid) {
      this.setData({
        messagePid: options.messagePid
      })
    }
    if (options.action)
      that.setData({
        action: options.action
      })
    that.reloadIndex()

  },

  reloadIndex: function() {
    var that = this
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    that.getPostDetail()
    wx.onUserCaptureScreen(function (res) {
      console.log('用户截屏了')
      that.setData({
        showShareBox: true
      })
    })
  },

  // 管理员点开所有设置
  toSet: function() {
    const that = this
    let is_share = that.data.is_share ? 0 : 1
    if (that.data.is_admin == 1 && is_share)
      that.getStamp() // 获得图章列表
    that.setData({
      is_share: is_share
    })
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })


  },
  //管理员设置图章
  setStamp: function(e) {
    const that = this
    let index = parseInt(e.detail.value) - 1,
      tid = that.data.tid,
      displayorder, stampCode
    if (index != -1) {
      displayorder = that.data.common_stamp[index].displayorder
      stampCode = that.data.common_stamp[index].code
    } else {
      displayorder = -1
      stampCode = '取消'
    }
    request('post', 'set_stamp.php', {
      token: wx.getStorageSync("token"),
      tid: tid,
      displayorder: displayorder
    }).then((res) => {

      if (res.data.status == 1) {
        app.wxShowToast(stampCode + res.data.message, 1500)
        that.setData({
          'thread_data.stamp': index >= 0 ? that.data.common_stamp[index].url : ''
        })
      }
    })

  },
  //管理员设置精华
  setDigest: function(e) {
    const that = this
    let digest = parseInt(e.detail.value) + 1,
      tid = that.data.tid
    if (digest - 1 == that.data.thread_data.digest) {
      app.wxShowToast('没有修改', 1500)
      return
    }
    request('post', 'set_digest.php', {
      token: wx.getStorageSync("token"),
      tid: tid,
      digest: digest
    }).then((res) => {
      if (res.data.status == 1) {
        app.wxShowToast(that.data.digestLevel[digest - 1] + res.data.message, 1500)
        that.setData({
          'thread_data.digest': digest - 1
        })
      }

    })
  },
  //清除缓存
  cleanCache: function(e) {
    const that = this
    let type = parseInt(e.detail.value) + 1
    let data = {
      token: wx.getStorageSync("token"),
      type: type
    }
    if (type > 2) {
      data.typeid = that.data.tid
    }
    request('post', 'del_syscache.php', data)
      .then((res) => {
        if (res.data.status == 1) {
          app.wxShowToast(that.data.cleanCacheSel[type - 1] + res.data.message, 1500)
        }
      })
  },
  //置顶
  threadTopChange: function(e) {
    const that = this
    let type = parseInt(e.detail.value) + 1
    if (type - 1 == that.data.thread_data.displayorder) {
      app.wxShowToast('没有修改', 1500)
      return
    }
    request('post', 'add_thread_top.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      type: type
    }).then((res) => {
      let message = that.data.getTops[type - 1] //改了什么
      that.setData({
        'thread_data.displayorder': type - 1
      })
      app.wxShowToast(message + '成功', 1500)
    })
  },
  setPraises: function(e) {
    const that = this
    let index = parseInt(e.detail.value),
      tid = that.data.tid,
      praiseName = that.data.praises[index]

    request('post', 'set_price_recommend.php', {
      token: wx.getStorageSync("token"),
      tid: tid,
      type_price: index
    }).then((res) => {
      if (res.data.status == 1) {
        app.wxShowToast(praiseName + '设置成功', 1500)
      }

    })
  },
  // 获取帖子信息
  getPostDetail: function() {
    var that = this
    request('post', 'get_post_detail.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      new_reader: that.data.new_reader
    }).then((res) => {

      that.setData({
        loading_hidden: true,
        loading_msg: '加载完毕...',
        fontS: 34
      })

      //帖子已被删除
      if (res.data.status == -1) {
        app.wxShowToast(res.data.msg, 1500, 'none')
        setTimeout(function() {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
        return
      }
      let thread_data = res.data.thread_data

      let extcredits2 = thread_data.extcredits2 + ''
      thread_data.extcredits2_arr = extcredits2.split('')

      if (!thread_data.is_admin && thread_data.this_moderator) {
        that.data.getTops.splice(2, 2)
        let getTops = that.data.getTops
        that.setData({
          getTops: getTops
        })
      }

      that.setData({
        thread_data: thread_data,
        is_zan: thread_data.is_zan,
        is_favorite: thread_data.is_favorite,
        authorId: thread_data.authorid,
        new_reader: 0,
        is_admin: thread_data.is_admin,
        // is_admin: 0,
        this_moderator: thread_data.this_moderator
      })
      WxParse.wxParse('thread_data.message', 'html', thread_data.message, that, 5)
      let share_img = 'http://cdn.e-power.vip/default_logo_none.jpg'
      if (thread_data.attachment == 2) {
        share_img = thread_data.message.imageUrls[0]
      } else if (thread_data.attachment == 1) {
        share_img = 'http://cdn.e-power.vip/default_logo.jpg'
      }
      that.setData({
        share_img: share_img
      })

      if (res.data.poll) {
        let expiration = res.data.poll.expiration,
          timestamp = Date.parse(new Date()) / 1000,
          //当前时间
          remainder = 1
        if (expiration != 0)
          remainder = parseInt(expiration) - timestamp //是否为负数

        res.data.poll.remainder = remainder

        that.setData({
          poll: res.data.poll
        })
      }
      if (res.data.polloption) {
        for (let i = 0; i < res.data.polloption.length; i++) {
          let vote_rate = res.data.polloption[i].vote_rate,
            vote_rate_str = vote_rate.replace("%", "")
          res.data.polloption[i].vote_rate_str = vote_rate_str
        }
        that.setData({
          polloption: res.data.polloption,
          optionids: []
        })
      }
      if (that.data.messagePid) {
        that.selectComponent('#moreFunctions').toReply()
      }
      that.getComment()
    });
  },
  getComment: function() {
    const that = this
    let page_size = that.data.page_size
    request('post', 'get_post_detail_comment.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      page_size: page_size,
      page_index: 0,
      pid: 0
    }).then((res) => {
      if (that.data.reply == 1) {
        that.scrollToBottom()
      }

      if (that.data.action && that.data.action == 'reply') {
        that.selectComponent('#replyTail').showreplyFormFun()
        that.setData({
          focus: true
        })
      }
      let post_list = res.data.post_list
      let post_list_length = post_list.length
      for (let i in post_list) {
        var extcredits2 = post_list[i].extcredits2 + ''
        post_list[i].extcredits2_arr = extcredits2.split('')
      }
      that.setData({
        articleList: res.data.post_list,
        total_num: res.data.total_num,
        have_data: post_list_length < page_size ? false : true,
        nomore_data: post_list_length < page_size ? true : false
      })


    })
  },
  // 投票
  checkboxTap: function(e) { //多选
    const that = this
    let optionid = e.currentTarget.dataset.optionid,
      index = e.currentTarget.dataset.index,
      optionids = that.data.optionids,
      polloption = that.data.polloption,
      acontains = contains(optionids, optionid) //判断是否中是否存在某个元素
    if (acontains) {
      optionids.splice(acontains - 1, 1)
      that.setData({
        ['polloption[' + index + '].checked']: false
      })
    } else {
      optionids.push(optionid)
      that.setData({
        ['polloption[' + index + '].checked']: true
      })
    }
    that.setData({
      optionids: optionids
    })
  },
  radioTap: function(e) {
    const that = this
    let optionid = e.currentTarget.dataset.optionid,
      index = e.currentTarget.dataset.index,
      optionids = [],
      polloption = that.data.polloption
    for (let i = 0; i < polloption.length; i++) {
      that.setData({
        ['polloption[' + i + '].checked']: false
      })
    }
    that.setData({
      ['polloption[' + index + '].checked']: true
    })
    optionids.push(optionid)
    that.setData({
      optionids: optionids
    })
  },
  pollBtn: function(e) {
    const that = this
    let tid = that.data.tid,
      optionids = that.data.optionids, //已选选项
      maxchoices = that.data.poll.maxchoices, //最多选项
      optionidsStr = optionids.join(","),
      voters = parseInt(that.data.poll.voters) + optionids.length, //总投票人数
      polloption = that.data.polloption

    if (optionids.length < 1) {
      app.wxShowToast('没有选择', 1500, 'none')
      return
    } else if (maxchoices < optionids.length) {
      app.wxShowToast('选择超过最多选项', 1500, 'none')
      return
    }


    request('post', 'add_vote.php', {
      token: wx.getStorageSync("token"),
      tid: tid,
      optionid: optionidsStr
    }).then((res) => {
      if (!res.data) {
        let polloptionid = '',
          votes
        for (let i = 0; i < polloption.length; i++) {
          polloptionid = polloption[i].polloptionid
          votes = parseInt(polloption[i].votes)
          if (contains(optionids, polloptionid))
            votes = votes + 1
          polloption[i].votes = votes
          polloption[i].vote_rate_str = (votes / voters * 100).toFixed(2)
          polloption[i].vote_rate = polloption[i].vote_rate_str + '%'
        }
        that.setData({
          'poll.is_vote': 1,
          'poll.voters': parseInt(that.data.poll.voters) + 1,
          polloption: polloption
        })
        return
      }
      wx.showToast({
        title: res.data.msg,
        icon: 'none',
        duration: 1000,
      })

    })
  },
  getStamp: function(e) { //获得图章列表
    const that = this
    if (that.data.stamps && that.data.common_stamp)
      return

    request('post', 'get_stamp.php', { //获取图章列表
      token: wx.getStorageSync("token")
    }).then((res) => {
      let common_stamp = res.data.common_stamp,
        stamps = ['取消'],
        stampid = that.data.thread_data.stampid,
        stamp_index = -1
      for (let i = 0; i < common_stamp.length; i++) {
        stamps.push(common_stamp[i].code)
        if (stampid == common_stamp[i].displayorder && stampid >= 0)
          stamp_index = i
      }
      that.setData({
        stamps: stamps,
        common_stamp: common_stamp,
        stamp_index: stamp_index + 1
      })
    })
  },

  addPost: function(e) {
    const that = this
    const message = e.detail.message
    const aidList = e.detail.aidList
    const attachment = e.detail.attachment
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    request('post', 'add_post.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      uppid: that.data.uppid || 0,
      reply_pid: that.data.reply_pid || 0,
      aid_list: aidList,
      message: message,
      attachment: attachment
    }).then((r) => {
      if (r.err_code != 0)
        return
      that.setData({
        textContent: '',
        loading_msg: '加载完毕...',
        loading_hidden: true,
        uppid: 0,
        reply_pid: 0,
        total_num: that.data.total_num + 1
      })
      wx.showToast({
        title: r.data.credits ? '已评价，电量+' + r.data.credits : '评价成功！',
        icon: 'success',
        duration: 2000,
      })
      let add_post_reply = r.data.reply
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

  // 评论回复
  replyComment: function(e) {
    const that = this
    const uppid = e.currentTarget.dataset.uppid
    const reply_pid = e.currentTarget.dataset.pid

    that.setData({
      uppid: uppid,
      reply_pid: reply_pid
    })
    that.isShowAuthorization().then((res) => {
      if (res == true) {
        that.selectComponent("#replyTail").showreplyFormFun()
      }
    })
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
  //弹出修改管理员浏览数input
  postViews: function(e) {
    const that = this
    if (that.data.editViews) {
      that.setData({
        editViews: false
      })
      return
    }
    that.setData({
      editViews: true
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
              'thread_data.views': views,
              editViews: false
            })
          }, 1000)
        })

      } else {
        app.wxShowToast('修改失败')
      }
    })

  },
  //管理员删帖
  postDel: function(e) {
    var tid = e.currentTarget.dataset.tid,
      data = {
        token: wx.getStorageSync("token"),
        tid: tid
      }
    app.deleteNormal(data, 'del_thread.php', true)
  },
  toUserDetail: function(e) {
    app.toUserDetail(e)
  },

  scrollToBottom: function() {
    const that = this
    setTimeout(function() {
      wx.createSelectorQuery().select('#articleWrap').boundingClientRect(function(rect) {
        const pageH = rect.height
        const st = pageH
        wx.pageScrollTo({
          scrollTop: st,
        })
      }).exec()
    }, 500);
  },

  // 当前发布的时间
  getNowFormatDate: function() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate
  },
  onReachBottom: function() {
    const that = this
    that.setData({
      scrollTop: 300
    })
    let page_size = that.data.page_size
    let page_index = that.data.page_index + 1
    if (that.data.nomore_data == true)
      return

    request('post', 'get_post_detail_comment.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      page_size: page_size,
      page_index: page_index
    }).then((res) => {

      let tmpArticleList = that.data.articleList;
      let respArticleList = res.data.post_list;
      for (let i in respArticleList) {
        var extcredits2 = respArticleList[i].extcredits2 + ''
        respArticleList[i].extcredits2_arr = extcredits2.split('')
      }
      let newArticleList = tmpArticleList.concat(respArticleList)
      let post_list_length = res.data.post_list.length
      that.setData({
        have_data: post_list_length < page_size ? false : true,
        articleList: newArticleList,
        page_index: page_index,
        nomore_data: post_list_length < page_size ? true : false,
      })
    })
  },
  //回复删除
  replyDel: function(e) {
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
  // 点赞
  clickZhan: function(e) {
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

  //子组件点赞的返回
  myZan: function(e) {
    const that = this
    let artIndexIs = e.detail.artIndexIs,
      articleListIndex = e.detail.articleListIndex,
      indexNum = e.detail.indexNum,
      number = e.detail.number
    that.setData({
      [artIndexIs]: indexNum,
      [articleListIndex]: parseInt(number) + parseInt(1)
    })
  },
  onShareAppMessage: function(res) {
    const that = this
    return {
      title: that.data.thread_data.subject,
      path: `/pages/index/index?shareName=detail&shareId=${that.data.tid}`,
      imageUrl: app.globalData.is_android ? that.data.share_img : ''
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
    that.selectComponent('#moreFunctions').showShareBox()
  },
  //跳转广场话题
  picTap: function(e) {
    const that = this
    let id = parseInt(e.currentTarget.dataset.typeid)
    wx.navigateTo({
      url: `/pages/square_pic/square_pic?id=${id}`
    })
  },
  getClipboard: function() {
    wx.setClipboardData({
      data: 'http://www.e-power.vip/mobile/#/detail/' + this.data.tid,
      success(res) {
        wx.showToast({
          title: '复制成功'
        })
      }
    })
  },
  activeTap: function(e) {
    const that = this
    let typeid = e.currentTarget.dataset.typeid
    let subject = e.currentTarget.dataset.subject
    let url = e.currentTarget.dataset.url
    wx: wx.navigateTo({
      url: url || `/pages/square_pic/square_pic?id=${typeid}&subject=${subject}`
    })
  },
  /* 返回顶 */
  onPageScroll: function(e) {
    const that = this
    let eScrollTop = e.scrollTop
    let dataScrollTop = that.data.scrollTop
    if (e.scrollTop >= 300 && dataScrollTop < 300) {
      this.setData({
        scrollTop: eScrollTop
      })
    } else if (eScrollTop < 300 && dataScrollTop >= 300) {
      this.setData({
        scrollTop: eScrollTop
      })
    }
  }
})