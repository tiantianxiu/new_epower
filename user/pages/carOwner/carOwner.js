var app = getApp()
import {
  request
} from '../../../utils/util.js'
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',

    carModelShow: false,
    upid: 0,

    car_1: '',
    car_2: '',
    car_3: '',
    myCarVerify: '', //已经认证的车型 
    action: '',

    base_url: getApp().globalData.base_url,
    applyStatus: '',
    applyTest: '',
    type: '', //certified如果从“用户页面”传入只显示已经认证车辆，且页面不可操作
    uid: '',
    showAuthorization: false, //授权
    
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 0, //是否显示左上角图标,
      title: '认证', //导航栏 中间的标题
    }
  },
  onLoad: function (options) {
    const that = this
    if (wx.getStorageSync("has_login") == 1) {
      that.reloadIndex()
    } else {
      that.setData({
        showAuthorization: true
      })
    }      
  },
  onShow: function(){
    const that = this
    that.getMyCarVerify()
  },
  rejectAuthorizeFun: function () {
    // console.log('不同意授权')
    const that = this
    that.setData({
      showAuthorization: true
    })
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  reloadIndex: function() {
    const that = this
    that.getUserInfo() //获得用户信息
  },
  getUserInfo: function() {
    const that = this
    app.getUserInfo().then((res) => {      
      that.setData({
        uid: res.uid
      })
      that.getMyCarVerify()
      that.getApplyCarOwner()
    })
  },
  hideFixedTab: function() {
    const that = this
    that.setData({
      carModelShow: false,
    })
  },
  addCar: function() {
    const that = this
    if (that.data.myCarVerify.length >= 3) {
      wx.showToast({
        title: '添加车型不能超过3个',
        icon: 'none',
      })
      return
    }
    that.setData({
      carModelShow: true,
    })
  },

  carModelInfo: function(e) {
    const that = this
    const car_1 = e.detail.car_1
    const car_2 = e.detail.car_2
    const car_3 = e.detail.car_3
    that.setData({
      car_1: car_1,
      car_2: car_2,
      car_3: car_3,
      action: 'add',
      vid: ''
    })
    that.toUpload(e)
  },

  toUpload: function(e) {
    const that = this
    if (that.data.type == 'certified') {
      return
    }
    let car_1 = e.currentTarget.dataset.brand
    let car_2 = e.currentTarget.dataset.model
    let car_3 = e.currentTarget.dataset.name
    let action = e.currentTarget.dataset.action
    if (car_1 == undefined || car_1 == '' || car_1 == null) {
      car_1 = that.data.car_1
    }
    if (car_2 == undefined || car_2 == '' || car_2 == null) {
      car_2 = that.data.car_2
    }
    if (car_3 == undefined || car_3 == '' || car_3 == null) {
      car_3 = that.data.car_3
    }
    if (action == undefined || action == '' || action == null) {
      action = that.data.action
    }

    let vid = e.currentTarget.dataset.vid
    let status = e.currentTarget.dataset.status
    let owner = e.currentTarget.dataset.owner
    let phone = e.currentTarget.dataset.phone
    let img = e.currentTarget.dataset.img
    let imgurl = e.currentTarget.dataset.imgurl
    let carnumber = e.currentTarget.dataset.carnumber
    if (owner == undefined || owner == null) {
      owner = ''
    }
    if (vid == undefined || vid == null) {
      vid = ''
    }
    if (phone == undefined || phone == null) {
      phone = ''
    }
    if (img == undefined || img == null) {
      img = ''
    }
    if (imgurl == undefined || imgurl == null) {
      imgurl = ''
    }
    if (status == undefined || status == null) {
      status = ''
    }
    if (carnumber == undefined || carnumber == null) {
      carnumber = ''
    }
    that.setData({
      carModelShow: false,
    })
    wx.navigateTo({
      url: `../carInfoSubmit/carInfoSubmit?status=${status}&car_1=${car_1}&car_2=${car_2}&car_3=${car_3}&action=${action}&vid=${vid}&owner=${owner}&phone=${phone}&img=${img}&imgurl=${imgurl}&carnumber=${carnumber}`
    })
  },

  // 删除车辆
  carFun: function(e) {
    const that = this
    const vid = e.currentTarget.dataset.vid
    const status = e.currentTarget.dataset.status
    const isShow = e.currentTarget.dataset.show
    if (status == '已认证') {
      if (isShow != vid) {
        that.showCar(vid)
      } else {
        return
      }
    } else {
      that.delCar(vid)
    }

  },

  delCar: function(vid) {
    const that = this
    wx.showModal({
      content: '确定要删除吗？',
      confirmColor: '#00c481',
      success: function(res) {
        if (res.confirm) {
          request('post', 'del_car_verify.php', {
            token: wx.getStorageSync("token"),
            vid: vid
          }).then((res) => {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              complete: function() {
                that.getMyCarVerify()
              }
            })

          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },
  showCar: function(vid) {
    const that = this
    request('post', 'add_show_car_model.php', {
      token: wx.getStorageSync("token"),
      vid: vid
    }).then((res) => {
      wx.showToast({
        title: '已设为显示车辆',
        icon: 'success',
        complete: function() {
          that.getMyCarVerify()
        }
      })
    })
  },
  getMyCarVerify: function() {
    const that = this
    let uid
    if (that.data.type == 'certified') {
      uid = that.data.uid
    } else {
      uid = ''
    }
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    request('post', 'get_my_car_verify.php', {
      token: wx.getStorageSync("token"),
      uid: uid
    }).then((res) => {
      that.setData({
        loading_hidden: true,
        loading_msg: '加载完毕...',
        myCarVerify: res.data.list
      })
    });
  },

  getApplyCarOwner: function() {
    const that = this
    request('post', 'get_apply_car_owner.php', {
      token: wx.getStorageSync("token"),
    }).then((res) => {
      const applyStatus = res.data.status
      let applyTest
      //applyStatus1：已成为车代表 2：拒绝(车代表审核未通过) 3：已申请车代表 4：可以申请
      if (applyStatus == 1) {
        applyTest = '车代表已审核通过'
      } else if (applyStatus == 2) {
        applyTest = '重新申请'
      } else if (applyStatus == 3) {
        applyTest = '已申请车代表'
      } else {
        applyTest = '车代表申请'
      }
      that.setData({
        applyStatus: applyStatus,
        applyTest: applyTest,
      })
    })
  },
  applyCarOwner: function() {
    var that = this
    if (that.data.applyStatus == 4 || that.data.applyStatus == 2) {
      request('post', 'add_apply_car_owner.php', {
        token: wx.getStorageSync("token"),
        type: 2
      }).then((res) => {
        const status = res.data.status
        if (status == 1) {
          wx.showToast({
            title: '申请已提交',
            icon: 'success',
            duration: 2000,
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000,
          })
        }
        setTimeout(() => {
          that.getApplyCarOwner()
        }, 100)
      })
    }
  },
})