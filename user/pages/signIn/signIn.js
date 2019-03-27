var app = getApp()
import {
  request
} from '../../../utils/util.js'
import {
  solar2lunar
} from '../../../resources/js/calendar.js'
Page({
  data: {
    currentDate: "", 
    dayList: '',
    currentDayList: '',
    currentObj: '',
    isSign: '',

    currentYear: '',
    currentMon: '',

    dakaList: {},
    continuity_daka: 0,

    loading_hidden: true,
    loading_msg: '加载中...',
    showAuthorization: false,

    articleList: [],
    threadList: [],
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '签到', //导航栏 中间的标题
    },
  },
  onLoad: function(options) {
    const that = this
    that.reloadIndex()
  },
  reloadIndex: function() {
    const that = this
    var currentObj = that.getCurrentDayString()

    that.setData({
      currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月' + currentObj.getDate() + '日',
      currentYear: currentObj.getFullYear(),
      currentMon: currentObj.getMonth() + 1,
      currentObj: currentObj
    })

    that.setWeekList();
    that.isshowAuthorization().then((res) => {
      if (res == true) {
        that.getDakaList()
        that.getDakaIndex()
      }
    })
  },
  setWeekList: function() {
    const that = this
    let dayList = []

    for (var i = 0; i < 7; i++) {
      const day = that.getWeeK(i),
      dayArr = day.split('/'),
      y = {
        y: parseInt(dayArr[0])
      },
      m = {
        m: that.addZ(dayArr[1])
      },
      d = {
        d: that.addZ(dayArr[2])
      },
      lunar = {
        lunar: solar2lunar(dayArr[0], dayArr[1], dayArr[2])
      }
      let active, now = new Date(), nowDate = now.getDate() //当天
      if (nowDate == that.addZ(dayArr[2])){
        active = {
          active: true,
        }
      }else{
        active = {
          active: false,
        }
      }
      

      const dayItem = Object.assign(y, m, d, lunar, active)
      dayList.push(dayItem)
    }
    that.setData({
      dayList: dayList
    })
  },
  addZ: function(n) {
    return n < 10 ? '0' + n : n
  },
  //获取本周第i天日期
  getWeeK: function(i) {
    var now = new Date();
    var nowDay = now.getDay()
    if (nowDay == 0)
      nowDay = 7
    var firstDay = new Date(now - (nowDay - 1) * 86400000);
    firstDay.setDate(firstDay.getDate() + i);
    var mon = Number(firstDay.getMonth()) + 1;
    return now.getFullYear() + "/" + mon + "/" + firstDay.getDate();
  },
  getCurrentDayString: function() {
    var objDate = this.data.currentObj
    if (objDate != '') {
      return objDate
    } else {
      var c_obj = new Date()
      var a = c_obj.getFullYear() + '/' + (c_obj.getMonth() + 1) + '/' + c_obj.getDate()
      return new Date(a)
    }
  },
  isshowAuthorization: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      const hasLogin = wx.getStorageSync("has_login");
      if (hasLogin == 1) {
        that.setData({
          showAuthorization: false
        })
        resolve(true)
      } else {
        that.setData({
          showAuthorization: true
        })
        resolve(false)
      }
    })
  },
  rejectAuthorizeFun: function() {
    // console.log('不同意授权')
    const that = this
    return
  },
  agreeAuthorizeFun: function() {
    // console.log('同意授权')
    const that = this
    that.getDakaList();
  },
  getDakaList: function() {
    var that = this
    request('post', 'get_daka_list.php', {
      token: wx.getStorageSync("token"),
      year: that.data.currentYear,
      month: that.data.currentMon
    }).then((res) => {
      var dakaListOb = {}
      var dakaList = res.data.daka_data
      for (var i = 0; i < dakaList.length; i++) {
        dakaListOb[dakaList[i]] = true
      }
      that.setData({
        dakaList: dakaListOb,
        isSign: res.data.today,
        continuity_daka: res.data.continuity_daka
      })
    });
  },
  getDakaIndex: function() {
    var that = this
    request('post', 'get_daka_index.php', {
      token: wx.getStorageSync("token")
    }).then((res) => {
      that.setData({
        articleList: res.data.article_data,
        threadList: res.data.thread_data
      })
    })
  },
  signIn: function() {
    var that = this

    that.isshowAuthorization().then((res) => {
      if (res == true) {
        if (that.data.isSign == 0) {
          request('post', 'add_daka.php', {
            token: wx.getStorageSync("token"),
          }).then((res) => {
            wx.showToast({
              title: res.data.credits ? '已签到，电量+' + res.data.credits : '签到成功！',
              icon: 'success',
            })
            that.setData({
              isSign: 1
            })
            const today = that.addZ(that.data.currentObj.getDate())
            const dayList = that.data.dayList
            that.getDakaList()
            for (var i = 0; i < dayList.length; i++) {
              if (dayList[i].d == today) {
                const j = i;
                that.setData({
                  ["dayList[" + i + "].active"]: true
                })
                setTimeout(() => {
                  that.setData({
                    ["dayList[" + j + "].active"]: false
                  })
                }, 500)

              }
            }
          });
        }
      }
    })
  },
  toDetail: function(e) {
    const that = this
    var tid = e.currentTarget.dataset.tid;
    if (tid == 0) {
      return
    }
    if (tid == -1) {
      that.toCarVip()
      return
    }
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },
  toEdetail: function(e) {
    var aid = e.currentTarget.dataset.aid;
    if (aid == 0) {
      return
    }
    wx.navigateTo({
      url: `/pages/Edetail/Edetail?aid=${aid}`,
    })
  },
  toIndexThread: function() {
    const that = this
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  toIndexArticle: function() {
    const that = this
    wx.reLaunch({
      url: '/pages/index/index?tab=Enews'
    })
  }
})