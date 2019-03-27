var app = getApp()
import {
  request
} from '../../utils/util.js'
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    typeClass: 0,
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
  onLoad: function(options) {
    const that = this
    if (wx.getStorageSync("has_login") == 1) {
      that.getApplyType()
    } else {
      that.setData({
        showAuthorization: true
      })
    }
  },
  onShow: function(options) {
    const that = this
  },
  getApplyType: function() {
    const that = this
    that.setData({
      loading_hidden: false
    })
    request('post', 'get_apply_type.php', {
      token: wx.getStorageSync("token")
    }).then((res) => {
      that.setData({
        loading_hidden: true
      })
      if (res.err_code != 0)
        return
      let id = res.data.type
      that.setData({
        typeClass: id
      }, () => {
        if (id == 1) {
          that.carOwnerIndex()
          that.setData({
            'navbarData.title': '车主认证'
          })
        }
        if (id == 2) {
          that.getIndustryVerifyFun()
        } else if (id == 3) {
          that.setData({
            'navbarData.title': '媒体认证'
          })
          that.getEinfoVerifyFun()
        }
      })

    })
  },
  bindTap: function(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    if (!id) {
      that.setData({
        typeClass: 0
      })
      return
    }
    that.setData({
      typeClass: id
    }, () => {
      that.setData({
        typeClassTap: true
      })
      if (id == 1) {
        that.setData({
          'navbarData.title': '车主认证'
        })
        that.carOwnerIndex()
      }
      if (id == 2) {
        let item = e.currentTarget.dataset.item
        that.setData({
          'navbarData.title': item,
          textOccupation: item
        })
        that.getIndustryVerifyFun()
      } else if (id == 3) {
        that.setData({
          'navbarData.title': '媒体认证'
        })
        that.getEinfoVerifyFun()
      }

    })
  },
  showTap: function() {
    const that = this
    that.setData({
      showMen: !that.data.showMen
    })
  },
  // 行业人士认证
  getIndustryVerifyFun: function() {
    const that = this
    request('post', 'get_industry_verify.php', {
      token: wx.getStorageSync("token"),
    }).then((res) => {
      if (res.err_code != 0)
        return
      if (res.data != '') {
        that.setData({
          textPosition: res.data.position, //职位、专家
          textPhone: res.data.mobile,
          textName: res.data.realname,
          textCompany: res.data.company,
          textPosition: res.data.position,
          textOccupation: res.data.occupation,
          'navbarData.title': res.data.occupation,
          flag: res.data.flag,
          job_image: res.data.job_image,
          job_image_url: res.data.base_url,
          vid: res.data.vid
        })
      } else {
        that.setData({
          flag: -2
        })
      }
    })
  },
  // 媒体认证
  // 获取公众号申请信息
  getEinfoVerifyFun: function() {
    const that = this
    request('post', 'get_einfo_verify.php', {
      token: wx.getStorageSync("token"),
    }).then((res) => {
      if (res.err_code != 0)
        return
      if (res.data != '') {
        that.setData({
          textID: res.data.field4,
          textPhone: res.data.mobile,
          textName: res.data.realname,
          textCompany: res.data.company,
          flag: res.data.flag,
          job_image: res.data.job_image,
          job_image_url: res.data.base_url,
          vid: res.data.vid
        })
      } else {
        that.setData({
          flag: -2
        })
      }
    })
  },
  inputID: function(e) {
    this.setData({
      textID: e.detail.value
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
  inputCompany: function(e) {
    this.setData({
      textCompany: e.detail.value
    })
  },
  inputPosition: function(e) { //专家、职位
    this.setData({
      textPosition: e.detail.value
    })
  },
  chooseMediaImage: function() {
    var that = this
    if (that.data.flag == 1)
      return

    wx.chooseImage({
      count: 1,
      success: function(res) {
        const tempFilePaths = res.tempFilePaths
        const uploadTask = wx.uploadFile({
          url: app.globalData.svr_url + 'add_daka_verify_image.php',
          filePath: tempFilePaths[0],
          name: 'myfile',
          method: 'POST',
          formData: {
            token: wx.getStorageSync("token"),
          },
          success: function(res) {
            var res = JSON.parse(res.data)
            if (res.err_code == 0) {
              that.setData({
                job_image_url: `${that.data.base_url}${res.data.real_file_url}`,
                job_image: res.data.file_url,
                showProgress: false,
                progress: 0
              })
            }
          }
        })
        uploadTask.onProgressUpdate((res) => {
          that.setData({
            showProgress: true,
            progress: res.progress
          })
        })
      },
    })
  },
  delPic: function() {
    const that = this
    that.setData({
      job_image: '',
      job_image_url: '',
    })
  },
  submitFun: function() {
    const that = this
    const textName = that.data.textName;
    if (textName == null || textName == undefined || textName == '') {
      getApp().showErrModal('姓名不能为空')
      return
    }
    const job_image = that.data.job_image
    if (job_image == null || job_image == undefined || job_image == '') {
      getApp().showErrModal('请上传名片或者工作证')
      return
    }
    const textPhone = that.data.textPhone;
    if (textPhone == null || textPhone == undefined || textPhone == '') {
      getApp().showErrModal('手机号不能为空')
      return
    }
    if (!(/^1[34578]\d{9}$/.test(textPhone))) {
      getApp().showErrModal('手机号码有误，请重填')
      return
    }
    const textID = that.data.textID;
    if (textID == null || textID == undefined || textID == '') {
      getApp().showErrModal('公众号ID不能为空')
      return
    }
    const textCompany = that.data.textCompany;
    if (textCompany == null || textCompany == undefined || textCompany == '') {
      getApp().showErrModal('公司不能为空')
      return
    }
    request('post', 'add_einfo_verify.php', {
      token: wx.getStorageSync("token"),
      vid: that.data.vid || 0,
      job_image: job_image,
      wechatnum: textID,
      company: textCompany,
      mobile: textPhone,
      realname: textName
    }).then((res) => {
      if (res.err_code != 0)
        return
      wx.showToast({
        title: '申请成功',
        icon: 'success',
        duration: 2000,
      })
      if (that.data.typeClassTap)
        that.setData({
          typeClassTap: false
        })
      that.getEinfoVerifyFun()
    })
  },
  submitFuns: function() { //行业人士认证
    const that = this
    const textName = that.data.textName;
    if (textName == null || textName == undefined || textName == '') {
      getApp().showErrModal('姓名不能为空')
      return
    }
    const job_image = that.data.job_image
    if (job_image == null || job_image == undefined || job_image == '') {
      getApp().showErrModal('请上传名片或者工作证')
      return
    }
    const textPhone = that.data.textPhone;
    if (textPhone == null || textPhone == undefined || textPhone == '') {
      getApp().showErrModal('手机号不能为空')
      return
    }
    if (!(/^1[34578]\d{9}$/.test(textPhone))) {
      getApp().showErrModal('手机号码有误，请重填')
      return
    }

    const textCompany = that.data.textCompany;
    if (textCompany == null || textCompany == undefined || textCompany == '') {
      getApp().showErrModal('公司不能为空')
      return
    }
    const textPosition = that.data.textPosition;
    if (textPosition == null || textPosition == undefined || textPosition == '') {
      getApp().showErrModal('职位栏不能为空')
      return
    }
    const textOccupation = that.data.textOccupation

    request('post', 'add_industry_verify.php', {
      token: wx.getStorageSync("token"),
      vid: that.data.vid || 0,
      job_image: job_image,
      company: textCompany,
      occupation: textOccupation,
      position: textPosition,
      mobile: textPhone,
      realname: textName
    }).then((res) => {
      if (res.err_code != 0)
        return
      wx.showToast({
        title: '申请成功',
        icon: 'success',
        duration: 2000,
      })
      if (that.data.typeClassTap)
        that.setData({
          typeClassTap: false
        })
      that.getIndustryVerifyFun()
    })
  },
  rejectAuthorizeFun: function() {
    // console.log('不同意授权')
    const that = this
    that.setData({
      showAuthorization: true
    })
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  carOwnerIndex: function() {
    const that = this
    that.getUserInfo() //获得用户信息
  },
  getUserInfo: function() {
    const that = this
    if (!wx.getStorageSync('uid')) {
      app.getUserInfo().then((res) => {
        wx.setStorageSync('uid', res.uid)
      })
    }
    that.getMyCarVerify()
    that.getApplyCarOwner()
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
      url: `/user/pages/carInfoSubmit/carInfoSubmit?status=${status}&car_1=${car_1}&car_2=${car_2}&car_3=${car_3}&action=${action}&vid=${vid}&owner=${owner}&phone=${phone}&img=${img}&imgurl=${imgurl}&carnumber=${carnumber}`
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
      uid = wx.getStorageSync('uid')
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
  /* 下拉刷新 */
  onPullDownRefresh: function() {
    this.getApplyType()
    wx.stopPullDownRefresh()
  },
})