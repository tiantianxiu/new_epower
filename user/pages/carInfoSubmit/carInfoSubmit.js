// user.js
var app = getApp()
import {
  request
} from '../../../utils/util.js'
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',

    car_1: '',
    car_2: '',
    car_3: '',
    name: '',
    phone: '',
    carNumber: '',
    imageList: '',
    aidList: '',
    action: '',
    vid: '',
    status: '',
    base_url: getApp().globalData.base_url,
    progress: 0,
    showProgress: false,

    carModelShow: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      shareImg: 1,
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '车主认证', //导航栏 中间的标题
    }
  },
  onLoad: function(options) {
    const that = this
    const car_1 = options.car_1;
    const car_2 = options.car_2;
    const car_3 = options.car_3;
    const action = options.action;
    const vid = options.vid;
    const owner = options.owner;
    const phone = options.phone;
    const img = options.img;
    const imgurl = options.imgurl;
    const status = options.status
    const carnumber = options.carnumber
    that.setData({
      car_1: car_1,
      car_2: car_2,
      car_3: car_3,
      action: action,
      vid: vid,
      name: owner,
      aidList: img,
      phone: phone,
      imageList: `${that.data.base_url}${imgurl}`,
      status: status,
      carNumber: carnumber
    });
    // console.log("car_1:" + car_1 + "car_2:" + car_2 + "car_3:" + car_3 + 'action:'+ action + 'vid:'+ vid + 'owner:'+ owner + 'phone:'+ phone + 'img:'+ img + 'imgurl:' +imgurl)
  },
  onShow: function() {
    const that = this
    that.reloadIndex()
  },
  reloadIndex: function() {
    const that = this;
  },
  inputName: function(e) {
    this.setData({
      name: e.detail.value
    });
  },
  inputPhone: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  inputCarNumber: function(e) {
    this.setData({
      carNumber: e.detail.value
    });
  },
  chooseImage: function() {
    var that = this
    if (that.data.status == '已认证') {
      return
    }
    wx.chooseImage({
      count: 1,
      success: function(res) {
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths[0])
        const uploadTask = wx.uploadFile({
          url: app.globalData.svr_url + 'add_verify_image.php',
          filePath: tempFilePaths[0],
          name: 'myfile',
          method: 'POST',
          formData: {
            token: wx.getStorageSync("token"),
          },
          success: function(res) {
            var res = JSON.parse(res.data)
            if (res.err_code == 0) {
              const imageSrc = `${that.data.base_url}${res.data.real_file_url}`
              that.setData({
                imageList: imageSrc,
                aidList: res.data.file_url,
                showProgress: false,
                progress: 0
              })
              setTimeout(() => {
                that.getLicenseInfo()
              }, 20)

            }

          }
        })
        uploadTask.onProgressUpdate((res) => {
          that.setData({
            showProgress: true,
            progress: res.progress
          })
        })
      }
    })
  },
  getLicenseInfo: function() {
    const that = this
    that.setData({
      loading_msg: '证件识别中',
      loading_hidden: false,
    })
    request('post', 'get_license_info.php', {
      token: wx.getStorageSync("token"),
      pic_url: that.data.imageList
    }).then((res) => {
      const status = res.data.status
      if (status == -1) {
        that.setData({
          loading_hidden: true,
        })
        app.showErrModal(res.data.message);
      } else {
        that.setData({
          name: res.data.username,
          carNumber: res.data.plate_number,
          loading_msg: '证件识别完成',
          loading_hidden: true,
        })
      }

    })
  },
  submitFun: function() {
    const that = this
    const name = that.data.name
    const phone = that.data.phone
    const aidList = that.data.aidList
    const carNumber = that.data.carNumber
    if (name == null || name == undefined || name == '') {
      getApp().showErrModal('请输入姓名');
      return;
    }

    if (!(/^1[34578]\d{9}$/.test(phone))) {
      getApp().showErrModal('手机号码有误，请重填')
      return
    }
    if (carNumber == null || carNumber == undefined || carNumber == '') {
      getApp().showErrModal('请输入您的车牌号码');
      return;
    }
    if (aidList == null || aidList == undefined || aidList == '') {
      getApp().showErrModal('请上传行驶证正面照');
      return;
    }
    if (carNumber == null || carNumber == undefined || carNumber == '') {
      getApp().showErrModal('请输入您的车牌号码');
      return;
    }

    request('post', 'save_car_verify.php', {
      token: wx.getStorageSync("token"),
      realname: name,
      mobile: phone,
      car_1: that.data.car_1,
      car_2: that.data.car_2,
      car_3: that.data.car_3,
      myfile: aidList,
      action: that.data.action,
      vid: that.data.vid,
      plate_number: carNumber
    }).then((res) => {
      if (res.err_code != 0)
        return
      wx.showModal({
        content: '上传完毕，等待审核',
        showCancel: false,
        confirmColor: '#00c481',
        complete: function() {
          wx.reLaunch({
            url: '/pages/carOwner/carOwner'
          })
        }
      })
    })
  },
  chooseCarModel: function() {
    const that = this
    if (that.data.status != '已认证') {
      that.setData({
        carModelShow: true
      })
    }
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
    })
  }
})