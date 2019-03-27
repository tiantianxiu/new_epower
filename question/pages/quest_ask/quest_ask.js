// pages/quest_ask/quest_ask.js
const app = getApp()
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
    fee: 0,
    diy_fee: '',
    diy: false,
    imageList: [],
    imageUrls: [],
    aidList: [],
    my_car: '选择车型',
    carModelShow: false,
    carsShow: false,
    quest_success: false,
    moneys: [0, 1, 2, 3, 5],
    formIdString: '',
    formIdNum: 0,
    member_tag: 0,
    cars_arr: [],
    show_clause: false,
    clause_agree: true,
    inputs: [],
    sort: 1, //1：提问 2：投票
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '提问', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const  that = this
    that.pageUrl()
  },
  pageUrl: function () {
    const that = this
    let page = 'pages/index/index?shareName=quest_detail&root=question&shareId='
    that.setData({
      page: page
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  addMoney: function(e) {
    const that = this
    let value = e.currentTarget.dataset.val
    that.setData({
      diy: false,
      fee: value,
      diy_fee: '',
      price: ''
    })
  },
  diyMoney: function() {
    const that = this
    that.setData({
      diy: true,
    })
  },
  setDiyFee: function(e) {
    const that = this
    let diy_fee = e.detail.value
    if (diy_fee.length >= 4) {
      that.setData({
        diy_fee: that.data.diy_fee
      })
      return
    }
    that.setData({
      diy_fee: parseInt(diy_fee)
    })
  },
  diyMoneyBlur: function(e) {
    const that = this
    that.setData({
      price: that.data.diy_fee ? that.data.diy_fee + '元' : '0元',
      fee: that.data.diy_fee
    })
  },
  diyMoneyFocus: function() {
    const that = this
    that.setData({
      price: '',
    })
  },
  addCar: function(e) {
    const that = this
    that.setData({
      carModelShow: !that.data.carModelShow
    })
  },
  carModelInfo: function(e) {
    const that = this,
      car_1id = e.detail.car_1id,
      car_2id = e.detail.car_2id
    that.setData({
      carModelShow: false,
      my_car: e.detail.car_1 + ' ' + e.detail.car_2,
      car_1: car_1id,
      car_2: car_2id
    })
  },
  chooseImage: function(e) {
    const that = this
    let imageList = that.data.imageList
    if (imageList.length >= 3) {
      wx.showToast({
        title: '图片不能超过三张',
        icon: 'none'
      })
      return
    }
    wx.chooseImage({
      count: 3 - imageList.length,
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        var tmpImageList = that.data.imageList;
        var tmpAidList = that.data.aidList;
        const tmpimageUrls = that.data.imageUrls
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          that.setData({
            loading_hidden: false,
            loading_msg: '加载中...',
          })
          var localFilePath = res.tempFilePaths[i]
          const uploadTask = uploadFile('post', 'add_image.php', localFilePath, 'myfile', {
            token: wx.getStorageSync("token"),
            type: 'question'
          }).then((resp) => {
            if (resp != 'err') {
              tmpAidList.push(resp.data.aid);
              tmpimageUrls.push(resp.data.read_file_url);
              var o1 = {
                url: resp.data.read_file_url
              };
              var o2 = {
                type: 'img'
              }
              var o3 = {
                code: resp.data.code
              }
              var tmpObj = Object.assign(o1, o2, o3);
              tmpImageList.push(tmpObj)
              that.setData({
                aidList: tmpAidList,
                imageUrls: tmpimageUrls,
                imageList: tmpImageList,
                loading_hidden: true,
                loading_msg: '加载完毕',
              })
            } else {

              that.setData({
                loading_hidden: true,
                loading_msg: '加载完毕',
              })
            }
          })
        }
      }
    })
  },

  delImg: function(e) {
    var index = e.currentTarget.dataset.index;
    var code = e.currentTarget.dataset.code;
    var imageList = this.data.imageList;
    var aidList = this.data.aidList;
    var imageUrls = this.data.imageUrls
    if (index < imageList.length) {
      imageList.splice(index, 1);
      aidList.splice(index, 1);
      imageUrls.splice(index, 1);
    }
    this.setData({
      imageList: imageList,
      aidList: aidList,
      imageUrls: imageUrls
    })
  },
  inputContent: function(e) {
    const that = this
    const value = e.detail.value
    that.setData({
      message: value
    })
  },
  // 提问
  formSubmit: function(e) {
    const that = this
    that.setData({
      loading_hidden: false
    })
    
    if (e.detail.formId != 'the formId is a mock one') {
      let formId = e.detail.formId, formIds = formId.slice(0, formId.length - 1) + '5'
      that.setData({
        formIdString: formId + "," + formIds,
        
      })
    }

    console.log(that.data.formIdString)
    that.askQuest()
  },
  askQuest: function() {
    const that = this
    that.setData({
      loading_hidden: true
    })
    if (!that.data.message) {
      wx.showToast({
        title: '请输入您的问题',
        icon: 'none'
      })
      return
    }
    if (!that.data.fee) {
      that.putQuest()
      return
    }
    that.payFee()
  },
  askPoll: function(){
    const that = this
    that.setData({
      loading_hidden: true
    })
    if (!that.data.message) {
      wx.showToast({
        title: '请输入您的描述',
        icon: 'none'
      })
      return
    }
    let inputs = that.data.inputs
    if (inputs.length < 2) {
      wx.showToast({
        title: '选项至少两项',
        icon: 'none'
      })
      return
    } 
    for(let i in inputs){                                 
    
      if (!inputs[i]){
        wx.showToast({
          title: '填写选项框内容',
          icon: 'none'
        })
        return
      }
      if (inputs[i].length > 12){
        wx.showToast({
          title: '投票选项字数不能超过12个字',
          icon: 'none'
        })
        return
        return
      }
    }
    if (!that.data.fee) {
      that.putPoll()
      return
    }
    that.payFee(2)
  },
  payFee: function(e) {
    const that = this
    let car_2 = that.data.car_2 || 0,
      message = that.data.message,
      aid_list = that.data.aidList.join(","),
      attachment = that.data.aidList.length > 0 ? 2 : 0

    request('post', 'payfee.php', {
      token: wx.getStorageSync("token"),
      car_2: car_2,
      aid_list: aid_list,
      message: message,
      attachment: attachment,
      price: that.data.fee //商品价格
    }).then((res) => {
      that.setData({
        out_trade_no: res.data.out_trade_no,
        prepay_id: res.data.prepay_id
      })
      wx.requestPayment({
        'timeStamp': res.data.timeStamp + '',
        'nonceStr': res.data.nonceStr,
        'package': res.data.package,
        'signType': 'MD5',
        'paySign': res.data.paySign,
        'success': function(res) {
          if(e == 2){
            that.putPoll()
            return
          }
          that.putQuest()
        }
      })
    })
  },
  putPoll: function(){
    const that = this
    let  message = that.data.message,
      aid_list = that.data.aidList.join(","),
      attachment = that.data.aidList.length > 0 ? 2 : 0,
      polloption = that.data.inputs.join(',')

    request('post', 'add_release_vote.php', {
      token: wx.getStorageSync("token"),
      aid_list: aid_list,
      message: message,
      attachment: attachment,
      price: that.data.fee, //商品价格    
      out_trade_no: that.data.out_trade_no || '',
      prepay_id: that.data.prepay_id || '',
      polloption: polloption
    }).then((res) => {
      if (res.err_code != 0)
        return

      that.setData({
        sid: res.data.tid,
        quest_success: true,
        message: ''
      })

    })
  },
  putQuest: function() { 
    const that = this
    let car_2 = that.data.car_2 || 0,
      message = that.data.message,
      aid_list = that.data.aidList.join(","),
      attachment = that.data.aidList.length > 0 ? 2 : 0,
      member_tag = that.data.member_tag,
      page = that.data.page

    request('post', 'add_question.php', {
      token: wx.getStorageSync("token"),
      car_2: car_2,
      aid_list: aid_list,
      message: message,
      attachment: attachment,
      price: that.data.fee, //商品价格    
      out_trade_no: that.data.out_trade_no || '',
      prepay_id: that.data.prepay_id || '',
      form_id: that.data.formIdString,
      member_tag: member_tag,
      page: page
    }).then((res) => {
      if (res.err_code != 0)
        return

      that.setData({
        sid: res.data.tid,
        quest_success: true,
        message: ''
      })

    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const that = this
    return {
      title: '提问',
      path: '/pages/index/index?shareName=quest_ask&root=question'
    }
  },
  questiontap: function(e) {
    const that = this
    let item = e.currentTarget.dataset.item,
      id = e.currentTarget.dataset.id
    if (id) {
      wx.navigateTo({
        url: `../${item}/${item}?id=${id}`
      })
      return
    }
    wx.navigateTo({
      url: `../${item}/${item}`
    })
  },
  appoint: function(e) { //指定回答
    const that = this
    let item = e.currentTarget.dataset.item
    if (item == 'all') {
      that.setData({
        member_tag: 0,
        cars_arr: []
      })
      that.selectComponent('#cars').carsClear()
      return
    }
    that.setData({
      carsShow: !that.data.carsShow
    })
  },
  carsInfo: function(e) {
    const that = this
    let cars_arr = []
    for (let i in e.detail) {
      cars_arr.push(e.detail[i]); //属性
    }
    that.setData({
      cars_arr: cars_arr
    })
    let member_tag = 0
    if (cars_arr.length > 0) {
      member_tag = cars_arr.join(',')
    }
    that.setData({
      member_tag: member_tag
    })
  },
  carsArrTap: function(e){
    const that = this
    const cars_arr = that.data.cars_arr
    let item = e.currentTarget.dataset.item
    let index = cars_arr.indexOf(item)
    cars_arr.splice(index, 1)
    that.setData({
      cars_arr: cars_arr
    })
    let member_tag = 0
    if (cars_arr.length > 0) {
      member_tag = cars_arr.join(',')
    }
    that.setData({
      member_tag: member_tag
    })

    that.selectComponent('#cars').carsClear(item)
  },
  // 查看免责条款
  showClause: function(){
    const that = this
    that.setData({
      show_clause: !that.data.show_clause
    })
  },
  clauseAgree: function(){
    const  that = this
    that.setData({
      clause_agree: !that.data.clause_agree
    })
  },
  questTap: function(e){
    const that = this
    let sort = e.currentTarget.dataset.sort
    if (sort == that.data.sort)
      return
    that.setData({
      sort: sort
    })
  },
  inputBind: function(e){
    const that = this
    let index = e.currentTarget.dataset.index
    let value = e.detail.value
    console.log(value)
    that.setData({
      [`inputs[${index}]`]: value
    })
  },
  addPollInput: function(){
    const that = this
    let inputs = that.data.inputs
    that.setData({
      [`inputs[${inputs.length}]`]: ''
    },()=>{
      console.log(inputs)
    })
  },
  delPollInput: function (e) {
    const that = this
    let inputs = that.data.inputs
    let index = e.currentTarget.dataset.index
    inputs.splice(index, 1)
    console.log(inputs)
    that.setData({
      inputs: inputs
    })
  }
})