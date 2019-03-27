var app = getApp()
import {
  request,
  addClass
} from '../../../utils/util.js'
var WxParse = require('../../../wxParse/wxParse.js');
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    have_data: false,
    nomore_data: false,
    noList: false,
    scrollTop: '',
    noListText: "暂无回复通知",

    postList: '',
    msgList: '',
    systemListy: '',
    systemType: 1,
    msgType: 2,

    dotPost: '',
    dotMsg: '',
    dotSystem: '',

    page_size: 10,
    page_index: 0,
    page_Msize: 10,
    page_Mindex: 0,
    page_Ssize: 10,
    page_Sindex: 0,
    type: 1 ,//1:post 2:msg 3:system
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '消息通知', //导航栏 中间的标题
    }
  },

  onLoad: function(options) {
    const that = this;
    if (options.type) {
      const type = options.type
      this.setData({
        type: type
      })
    }
    this.reloadIndex()
  },
  onShow: function() {},

  onReachBottom: function() {
    const that = this;
    let page_size
    let page_index
    let type = that.data.type
    
    if (type == 1) {
      page_size = that.data.page_size;
      page_index = that.data.page_index + 1;
    } else if (type == 2) {
      page_size = that.data.page_Msize;
      page_index = that.data.page_Mindex + 1;
    } else if (type == 3) {
      page_size = that.data.page_Ssize;
      page_index = that.data.page_Sindex + 1;
    }
    if (that.data.nomore_data === false) {
      request('post', 'get_user_msg.php', {
        token: wx.getStorageSync("token"),
        page_size: page_size,
        page_index: page_index,
        type: type
      }).then((res) => {
        if (type == 1) {
          let tmpFollowList = that.data.postList;
          let respFollowList = res.data.notification_data;
          let newFollowList = tmpFollowList.concat(respFollowList)
          that.setData({
            postList: newFollowList,
            page_index: page_index,
            have_data: respFollowList.length <= page_size ? false : true,
            nomore_data: page_size > respFollowList.length ? true : false
          })
        } else if (type == 2) {
          let tmpFollowList = that.data.msgList;
          let respFollowList = res.data.messages_data;
          let newFollowList = tmpFollowList.concat(respFollowList)
          that.setData({
            msgList: newFollowList,
            page_Mindex: page_index,
            have_data: respFollowList.length <= page_size ? false : true,
            nomore_data: page_size > respFollowList.length ? true : false
          })
        } else if (type == 3) {
          let tmpFollowList = that.data.systemListy;
          let respFollowList = res.data.notification_data;
          let newFollowList = tmpFollowList.concat(respFollowList)
          
          that.setData({
            systemListy: newFollowList,
            page_Sindex: page_index,
            have_data: respFollowList.length <= page_size ? false : true,
            nomore_data: page_size > respFollowList.length ? true : false
          })
        }
      })
    }
  },

  reloadIndex: function() {
    const that = this;
    let [type, page_size, page_index] = [that.data.type]
    if (type == 1) {
      page_size = that.data.page_size;
      page_index = that.data.page_index;
    } else if (type == 2) {
      page_size = that.data.page_Msize;
      page_index = that.data.page_Mindex;
    } else if (type == 3) {
      page_size = that.data.page_Ssize;
      page_index = that.data.page_Sindex;
    }
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...',
      noList: false,
    });
    request('post', 'get_user_msg.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      type: type
    }).then((res) => {
      if (type == 1) {
        that.setData({
          postList: res.data.notification_data,
          dotPost: res.data.post_is_new,
          dotMsg: res.data.msg_is_new,
          dotSystem: res.data.system_is_new,
          noListText: "暂无回复通知",
          have_data: res.data.notification_data.length >= page_size ? true : false,
          nomore_data: res.data.notification_data.length < page_size ? true : false
        })
        if (res.data.notification_data.length <= 0) {
          that.setData({
            noList: true,
            nomore_data: false
          })
        }
      
      } else if (type == 2) {
        that.setData({
          msgList: res.data.messages_data,
          dotPost: res.data.post_is_new,
          dotMsg: res.data.msg_is_new,
          dotSystem: res.data.system_is_new,
          noListText: "暂无私信",
          have_data: res.data.messages_data.length < page_size ? false : true,
          nomore_data: res.data.messages_data.length < page_size ? true : false
        })
        if (res.data.messages_data.length <= 0) {
          that.setData({
            noList: true,
            nomore_data: false
          })
        }

      } else {
        var noticeList = res.data.notification_data
        for (var i = 0; i < noticeList.length; i++) {
          noticeList[i].toggleShow = false
        }
        that.setData({
          systemListy: noticeList,
          dotPost: res.data.post_is_new,
          dotMsg: res.data.msg_is_new,
          dotSystem: res.data.system_is_new,
          noListText: "暂无通知",
          have_data: res.data.notification_data.length < page_size ? false : true,
          nomore_data: res.data.notification_data.length < page_size ? true : false
        })
        if (res.data.notification_data.length <= 0) {
          that.setData({
            noList: true,
            nomore_data: false
          })
        }
      }
      this.setData({
        loading_hidden: true,
        loading_msg: '加载完毕',
        
      });
    })
  },
  changeTab: function(e) {
    var that = this
    var type = e.currentTarget.dataset.type
    that.setData({
      type: type,
      page_size: 10,
      page_index: 0,
      page_Msize: 10,
      page_Mindex: 0,
      page_Ssize: 10,
      page_Sindex: 0
    })
    that.reloadIndex()
  },
  allRead: function(){
    const that = this
    let dotPost = that.data.dotPost,
      dotMsg = that.data.dotMsg,
      dotSystem = that.data.dotSystem
    if (!dotPost && !dotMsg && !dotSystem){ 
      app.wxShowToast('全部已读')  
      return
    }
    request('post','msg_all_read.php',{
      token: wx.getStorageSync('token')
    }).then((res)=>{
      if(res.err_code != 0)
        return
      app.wxShowToast('全部已读')  
      that.setData({
        dotPost: '',
        dotMsg: '',
        dotSystem: ''
      })
      let postList = that.data.postList ,
        msgList = that.data.msgList,
        systemListy = that.data.systemListy  
       
      for (let i in postList){
        that.setData({
          ['postList[' + i + '].new']: 0
        })
      }
     
      if (msgList){
        for (let i in msgList) {
          that.setData({
            ['postList[' + i + '].isnew']: 0
          })
        }
      }

      if (systemListy) {
        for (let i in msgList) {
          that.setData({
            ['postList[' + id + '].new']: 0
          })
        }
      }

      
    })
  },
  toDetail: function(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    let isnew = e.currentTarget.dataset.isnew
    let type = e.currentTarget.dataset.type
    let idx = e.currentTarget.dataset.idx
    let note = e.currentTarget.dataset.note
    let pid = e.currentTarget.dataset.pid
    let hidden = e.currentTarget.dataset.hidden
    if (isnew == 1) {
      that.readMsg(id, isnew, type, idx)
    }

    var status = e.currentTarget.dataset.status
    var tid = e.currentTarget.dataset.tid

    if (status == -1) {
      app.wxShowToast('内容已被删除', 1000, 'none')
      return
    }
    if (hidden==1){
      let kid = e.currentTarget.dataset.kid
      wx.navigateTo({
        url: '/praise/pages/praise_user/praise_user?id=' + kid + '&messagePid=' + pid,
      })
      return
    }
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid + '&messagePid=' + pid,
    })

  },
  readFun: function(e) {
    const that = this
    let isnew = e.currentTarget.dataset.isnew
    let type = e.currentTarget.dataset.type
    let id = e.currentTarget.dataset.id
    let idx = e.currentTarget.dataset.idx
    var nowToggle = this.data.systemListy[idx].toggleShow;

    this.setData({
      ['systemListy[' + idx + '].toggleShow']: !nowToggle
    })
    if (isnew == 1) {
      that.readMsg(id, isnew, type, idx)
    }
  },

  messageDetail: function(e) {
    const that = this
    let uid = e.currentTarget.dataset.uid
    let isnew = e.currentTarget.dataset.isnew
    let type = e.currentTarget.dataset.type
    let id = e.currentTarget.dataset.id
    let idx = e.currentTarget.dataset.idx
    if (isnew == 1) {
      that.readMsg(id, isnew, type, idx)
    }
    var tid = e.currentTarget.dataset.tid;
    const dotPost = that.data.dotPost
    const dotMsg = that.data.dotMsg
    const dotSystem = that.data.dotSystem
    wx.navigateTo({
      url: `/pages/dialogue/dialogue?plid=${id}&dotPost=${dotPost}&dotMsg=${dotMsg}&dotSystem=${dotSystem}&isNew=${isnew}&uid=${uid}`,
    })
  },

  readMsg: function(id, isnew, type, idx) {
    const that = this
    request('post', 'msg_notification_new.php', {
      token: wx.getStorageSync("token"),
      id: id,
      isnew: isnew,
      type: type
    }).then((res) => {
      const t = that.data.type
      if (t == 1) {
        this.setData({
          ['postList[' + idx + '].new']: 0,
          dotPost: parseInt(that.data.dotPost) - 1
        })
      } else if (t == 3) {
        this.setData({
          ['systemListy[' + idx + '].new']: 0,
          dotSystem: parseInt(that.data.dotSystem) - 1
        })
      } else if (t == 2) {
        this.setData({
          ['msgList[' + idx + '].isnew']: 0,
          dotMsg: parseInt(that.data.dotMsg) - 1
        })
      }

    })
  },

  /* 下拉刷新 */
  onPullDownRefresh: function() {
    this.reloadIndex()
    wx.stopPullDownRefresh()
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
  naviTap: function(e){
    const that = this
    let id = e.currentTarget.dataset.from_id
    if (id != 0){
      wx.navigateTo({
        url: '/question/pages/quest_detail/quest_detail?id=' + id
      })
    }
  }
})