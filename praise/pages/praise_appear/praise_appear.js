const app = getApp()
import {
  wxParseImgTap
} from '../../../wxParse/wxParse.js'
import {
  request,
  uploadFile
} from '../../../utils/util.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    compute_value: 0,
    compute_grade: '0.00',
    compute: {
      appear: '0.00',
      battery: '0.00', //电池
      cosiness: '0.00', //舒适
      power: '0.00', //动力
      cost: '0.00', //性价比
      intelligent: '0.00', //智能
      server: '0.00', //服务
    },
    values: {
      appear: 0,
      battery: 0, //电池
      cosiness: 0, //舒适
      power: 0, //动力
      cost: 0, //性价比
      intelligent: 0, //智能
      server: 0, //服务
    },
    date: '',
    carModelShow: false,
    gradeShow: false,
    carsUrl: [], //上传的图片 以及 aid
    district: '', //选择的地区
    second_tag: [], //第二级标签
    satisfied_tag_arr: [], //满意标签
    dissatisfied_tag_arr: [], //不满意标签

    // hasInvalidCode: 0, //是否提示过邀请码无效

    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '发表口碑', //导航栏 中间的标题
    }
  },
  onLoad: function(options) {
    const that = this
    if (options.name) {
      that.setData({
        my_car: options.name,
        car_2: options.car_2,
        car_3: options.car_3
      })
    }
    that.nowDate()
    that.getTag()
  },
  nowDate: function() {
    const that = this
    let nowDate = new Date() //获取系统当前时间
    nowDate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate()
    that.setData({
      nowDate: nowDate
    })
  },
  onShow: function() {
    const that = this
    let place = app.district.id,
      district = app.district.name
    if (place) {
      that.setData({
        place: place,
        district: district
      })
    }
  },
  // inputUid: function(e) { //INPUTUID
  //   const that = this
  //   let value = e.detail.value
  //   that.setData({
  //     uid: value
  //   })
  // },
  // inputInvalidCode: function(e) {
  //   const that = this
  //   let value = e.detail.value
  //   that.setData({
  //     invalidCode: value
  //   })
  // },
  // 落地价
  inputBuyPrice: function(e) {
    const that = this
    let value = e.detail.value
    if (parseInt(value))
      value = value.match(/\d+(\.\d{0,2})?/)[0]
    let tempValue = parseFloat(value)
    if (tempValue > 2000) {
      that.setData({
        buy_car_price: that.data.buy_car_price
      })
      return
    }
    that.setData({
      buy_car_price: value
    })
  },
  // 冬季续航
  inputMilesWinter: function(e) {
    const that = this
    let value = e.detail.value
    that.setData({
      miles_winter: value
    })
  },
  // 行驶公里数
  inputMiles: function(e) {
    const that = this
    let value = e.detail.value
    that.setData({
      miles: value
    })
  },
  // 纯续电里程
  inputMilesPower: function(e) {
    const that = this
    let value = e.detail.value
    that.setData({
      miles_power: value
    })

  },
  // 油耗
  inputFuelConsumption: function(e) {
    const that = this
    let value = e.detail.value
    if (parseInt(value))
      value = value.match(/\d+(\.\d{0,2})?/)[0]
    that.setData({
      fuel_consumption: value
    })
  },
  // 电耗
  inputPowerConsumption: function(e) {
    const that = this
    let value = e.detail.value
    if (parseInt(value))
      value = value.match(/\d+(\.\d{0,2})?/)[0]
    that.setData({
      power_consumption: value
    })
  },
  //  其他
  inputOther: function(e) {
    const that = this
    let value = e.detail.value
    that.setData({
      other: value
    })
  },
  gradeShow: function() {
    const that = this
    if (!that.data.gradeShow) {
      that.setData({
        gradeShow: true
      })
    }
  },
  gradeIsShow: function() {
    const that = this
    that.setData({
      gradeShow: that.data.gradeShow ? false : true
    })
  },
  getTag: function() {
    const that = this
    request('post', 'get_reputation_tag.php', {}).then((res) => {
      if (res.err_code != 0)
        return
      let cars_tag = res.data.cars_tag,
        second_tag_num = 0
      for (let i in cars_tag) {
        for (let m in cars_tag[i].son) {
          second_tag_num++
        }
      }
      that.setData({
        cars_tag: cars_tag,
        second_tag_num: second_tag_num
      })
    })

  },
  //选择地区
  toDistrict: function(e) {
    const that = this
    wx.navigateTo({
      url: '../district/district'
    })
  },
  computeSlider: function(e) {
    const that = this
    let compute_value = e.detail.value,
      compute_grade = (compute_value / 100 * 5).toFixed(2)
    that.setData({
      compute_value: compute_value,
      compute_grade: compute_grade
    })
    let compute = that.data.compute,
      values = that.data.values
    for (let i in compute) {
      that.setData({
        ['compute.' + i]: compute_grade
      })
    }
    for (let i in values) {
      that.setData({
        ['values.' + i]: compute_value
      })
    }
  },
  slider: function(e) { //滑动结束
    const that = this
    let grade_title = 'compute.' + e.currentTarget.dataset.title,
      value = e.detail.value,
      grade = (value / 100 * 5).toFixed(2)
    that.setData({
      [grade_title]: grade
    })
    let compute = that.data.compute,
      compute_values = 0,
      compute_value = 0,
      times = 0
    for (let i in compute) {
      if (compute[i] != '0.00') {
        times++
        compute_values = compute_values + parseInt(compute[i] / 5 * 100)
      }
    }
    compute_value = compute_values / times
    that.setData({
      [grade_title]: grade,
      compute_value: compute_value,
      compute_grade: (compute_value / 100 * 5).toFixed(2)

    })
  },

  addCar: function() {
    const that = this
   
    // if (that.data.hasInvalidCode){
    //   that.setData({
    //     carModelShow: true
    //   })
    //   return
    // }
    // const invalidCode = that.data.invalidCode
    // if (invalidCode) {
    //   that.getIsInvalidCode()
    //     .then((re) => {
    //       if (re.data.status == -1) {
    //         app.showSelModal(re.data.msg + '但邀请码不是必填项')
    //           .then((r) => {
    //             if (!r)
    //               return
    //             that.setData({
    //               hasInvalidCode: 1,
    //               carModelShow: true
    //             })
    //           })
    //       } else {
    //         that.setData({
    //           hasInvalidCode: 1,
    //           carModelShow: true
    //         })
    //       }
    //     })

    // } else {
    //   app.showSelModal('未填写邀请码,但邀请码不是必填项')
    //     .then((res) => {
    //       if (!res)
    //         return
    //       that.setData({
    //         hasInvalidCode: 1,
    //         carModelShow: true
    //       })
    //     })
    // }
    that.setData({
      carModelShow: true
    })
  },
  carModelInfo: function(e) {
    const that = this,
      car_2id = e.detail.car_2id,
      car_3id = e.detail.car_3id,
      type_category = e.detail.type_category
    that.setData({
      carModelShow: false,
      my_car: e.detail.car_1 + e.detail.car_2 + e.detail.car_3,
      car_2: car_2id,
      car_3: car_3id,
      type_category: type_category
    })
  },
  // 时间
  getDate: function(e) {
    const that = this
    let date = e.detail.value,
      buy_car_time = Date.parse(date) / 1000
    that.setData({
      date: date,
      buy_car_time: buy_car_time
    })
  },
  chooseImage: function() {
    const that = this
    let length = that.data.carsUrl.length
    if (length >= 9) {
      app.wxShowToast('上传图片不能超过9张', 1000, 'none')
      return
    }
    wx.chooseImage({
      count: 9 - length < 6 ? 9 - length : 6,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        res.imgUrl = res.tempFilePaths
        that.uploadImg(res)
      }
    })
  },
  //上传图片功能
  uploadImg: function(e) {
    const that = this,
      ix = that.data.carsUrl.length

    let tempFilePaths = e.tempFilePaths
    for (let i = 0; i < tempFilePaths.length; i++) {
      that.setData({
        loading_hidden: false,
        loading_msg: '加载中...',
      })
      let localFilePath = tempFilePaths[i]
      app.globalData.num = 0
      uploadFile('POST', 'add_reputation_image.php', localFilePath, 'myfile', {
        token: wx.getStorageSync("token")
      }).then((res) => {
        that.setData({
          loading_hidden: true
        })
        if (res.err_code == 0) {

          that.setData({
            // ['carsUrl[' + (i + ix) + '].url']: res.data.read_file_url,
            ['carsUrl[' + (i + ix) + '].url']: localFilePath,
            ['carsUrl[' + (i + ix) + '].aid']: res.data.aid
          })
          return
        }
      })

    }
  },
  previewImage: function(e) { //预览图片功能
    const that = this,
      carsUrl = that.data.carsUrl
    e.urls = []
    for (let i in carsUrl) {
      e.urls.push(carsUrl[i].url)
    }
    wxParseImgTap(e)
  },
  delImage: function(e) { //删除图片功能
    const that = this
    app.showSelModal('是否删除图片？', true).then((res) => {
      if (!res)
        return
      let index = e.currentTarget.dataset.index,
        carsUrl = that.data.carsUrl
      carsUrl.splice(index, 1)
      that.setData({
        carsUrl: carsUrl
      })
    })
  },
  tagTap: function(e) { //选择标签
    const that = this
    let id = e.currentTarget.dataset.id,
      secid = e.currentTarget.dataset.secid,
      fir_key = e.currentTarget.dataset.fir_key, //第一级（父级）
      sec_key = e.currentTarget.dataset.sec_key, //第二级（父级）
      thi_key = e.currentTarget.dataset.thi_key, //第三级（本级）
      cars_tag = that.data.cars_tag,
      second_tag = that.data.second_tag,
      satisfied_tag_arr = that.data.satisfied_tag_arr,
      dissatisfied_tag_arr = that.data.dissatisfied_tag_arr

    if (satisfied_tag_arr.includes(id) || dissatisfied_tag_arr.includes(id))
      return
    if (second_tag.includes(secid)) {
      let i = second_tag.indexOf(secid)
      for (let i in cars_tag[fir_key].son[sec_key].son)
        cars_tag[fir_key].son[sec_key].son[i].active = false
      if (thi_key == 0) {
        let m = dissatisfied_tag_arr.indexOf(cars_tag[fir_key].son[sec_key].son[1].id)
        dissatisfied_tag_arr.splice(m, 1)

      } else {
        let m = satisfied_tag_arr.indexOf(cars_tag[fir_key].son[sec_key].son[0].id)
        satisfied_tag_arr.splice(m, 1)
      }
      second_tag.splice(i, 1)
    }
    second_tag.push(secid)
    if (thi_key == 1) {
      dissatisfied_tag_arr.push(id)
      that.setData({
        dissatisfied_tag_arr: dissatisfied_tag_arr
      })
    } else {
      satisfied_tag_arr.push(id)
      that.setData({
        satisfied_tag_arr: satisfied_tag_arr
      })
    }
    cars_tag[fir_key].son[sec_key].son[thi_key].active = true
    that.setData({
      cars_tag: cars_tag
    })
  },
  getIsInvalidCode: function() {
    const that = this
    return new Promise((resolve, reject) => {
      request('post', 'is_invalid_code.php', {
        token: wx.getStorageSync('token'),
        code: that.data.invalidCode
      }).then((res) => {
        if (res.err_code == 0)
          resolve(res)
      })
    })
  },
  getReputation: function() { //判断没写全
    const that = this
    // let uid = that.data.uid || 0
    // let invalidCode = that.data.invalidCode
    let car_2 = that.data.car_2, //二级车型id
      car_3 = that.data.car_3, //三级车型id
      buy_car_time = that.data.buy_car_time, //买车时间
      place = that.data.place, //买车地点
      buy_car_price = that.data.buy_car_price, //落地价
      miles_winter = that.data.miles_winter, //冬季续航
      fuel_consumption = that.data.fuel_consumption, //油耗
      power_consumption = that.data.power_consumption, //电耗
      miles_power = that.data.miles_power, //续航里程
      miles = that.data.miles, //公里数
      score = that.data.compute_grade, //评分 score
      score_face = that.data.compute.appear, //颜值评分 score_face
      score_battery = that.data.compute.battery, //电池评分 score_battery
      score_comfort = that.data.compute.cosiness, //舒适度评分 score_comfort
      score_power = that.data.compute.power, //动力评分 score_power
      score_price_ratio = that.data.compute.cost, //性价比评分 score_price_ratio
      score_intelligent = that.data.compute.intelligent, //智能化评分 score_intelligent
      score_service = that.data.compute.server, //服务评分 score_service
      other = that.data.other, //other
      second_tag = that.data.second_tag, //是否所有标签都选了
      second_tag_num = that.data.second_tag_num, // 标签数
      satisfied_tag_arr = that.data.satisfied_tag_arr, //满意标签
      dissatisfied_tag_arr = that.data.dissatisfied_tag_arr, //不满意标签
      carsUrl = that.data.carsUrl //图片 逗号 aid_list

    // if (!uid) {
    //   app.wxShowToast('请填写UID', 1000, 'none')
    //   return
    // }

    if (!car_2) {
      app.wxShowToast('请选择车型', 1000, 'none')
      return
    }
    if (!buy_car_time) {
      app.wxShowToast('请选择购买时间', 1000, 'none')
      return
    }
    if (!place) {
      app.wxShowToast('请选择购买地点', 1000, 'none')
      return
    }
    if (!buy_car_price) {
      app.wxShowToast('请填写落地价', 1000, 'none')
      that.setData({
        empty_buy_car_price: true
      })
      return
    }

    if (!fuel_consumption && !power_consumption) {
      app.wxShowToast('请填写综合能耗', 1000, 'none')
      return
    }
    if (!miles) {
      app.wxShowToast('请填写公里数', 1000, 'none')
      that.setData({
        empty_mile: true
      })
      return
    }
    if (!miles_winter) { //冬季续航
      that.setData({
        miles_winter: 0
      })
    }

    if (score == "0.00") {
      app.wxShowToast('请评分', 1000, 'none')
      return
    }
    if (score_face == "0.00") {
      app.wxShowToast('请为颜值评分', 1000, 'none')
      return
    }
    if (score_battery == "0.00") {
      app.wxShowToast('请为电池评分', 1000, 'none')
      return
    }
    if (score_comfort == "0.00") {
      app.wxShowToast('请为舒适度评分', 1000, 'none')
      return
    }
    if (score_power == "0.00") {
      app.wxShowToast('请为动力评分', 1000, 'none')
      return
    }
    if (score_price_ratio == "0.00") {
      app.wxShowToast('请为性价比评分', 1000, 'none')
      return
    }
    if (score_intelligent == "0.00") {
      app.wxShowToast('请为智能化评分', 1000, 'none')
      return
    }
    if (score_service == "0.00") {
      app.wxShowToast('请为服务评分', 1000, 'none')
      return
    }

    if (second_tag.length == 0) {
      app.wxShowToast('请为车辆详评', 1000, 'none')
      return
    }
    if (second_tag.length < second_tag_num) {
      app.wxShowToast('车辆详评不全', 1000, 'none')
      return
    }
    if (!other) {
      app.wxShowToast('请填写其他', 1000, 'none')
      return
    }

    let satisfied_tag = satisfied_tag_arr.join(','),
      dissatisfied_tag = dissatisfied_tag_arr.join(','),
      aid_list_arr = []
    for (let i in carsUrl) {
      aid_list_arr.push(carsUrl[i].aid)
    }
    let aid_list = aid_list_arr.join(','),
      datas = {
        // uid: uid,
        // invalidCode: invalidCode,
        token: wx.getStorageSync("token"),
        car_2: car_2,
        car_3: car_3,
        buy_car_time: buy_car_time,
        place: place,
        buy_car_price: buy_car_price,
        miles_winter: miles_winter,
        fuel_consumption: fuel_consumption,
        power_consumption: power_consumption,
        miles_power: miles_power,
        miles: miles,
        score: score,
        score_face: score_face,
        score_battery: score_battery,
        score_comfort: score_comfort,
        score_power: score_power,
        score_price_ratio: score_price_ratio,
        score_intelligent: score_intelligent,
        score_service: score_service,
        other: other,
        satisfied_tag: satisfied_tag,
        dissatisfied_tag: dissatisfied_tag,
        aid_list: aid_list
      }
    that.setData({
      datas: datas
    })
    that.addReputation()
  },
  // 提交口碑
  addReputation: function() {
    const that = this,
      datas = that.data.datas
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    request('post', 'add_reputation.php', datas)
      .then((res) => {
        if (res.err_code != 0) {
          that.setData({
            loading_hidden: true
          })
          return
        }
        if (res.data.status == -1) {
          that.setData({
            loading_hidden: true
          })
          app.wxShowToast(res.data.msg, 1500, 'none')
          return
        }
        that.setData({
          loading_hidden: true
        })

        wx.redirectTo({
          url: '../praise_car/praise_car?id=' + datas.car_2,
          success() {
            app.wxShowToast(res.data.credits ? '已发表，电量+' + res.data.credits : '发表成功！')

          }
        })
      })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '发表口碑',
      path: '/pages/index/index?shareName=praise_appear&root=praise'
    }
  }

})