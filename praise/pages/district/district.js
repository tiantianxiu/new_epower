const app = getApp()
import {
  request
} from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isActive: null,
    listMain: [],
    listTitles: [],
    fixedTitle: null,
    toView: 'inToViewA',
    oHeight: [],
    scroolHeight: 0,
    upid: 0,
    letter: '',
    windowHeight: app.globalData.windowHeight,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      shareImg: 1,
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1, 
      title: '省市', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    that.getDistrict().then((res)=>{
      var arr = []
      for (let i in res.data) {
        arr.push(i); //属性
      }
      that.setData({
        district: res.data,
        arr: arr
      })
    })
  },
  
  districTap: function(e){
    const that = this
    let upid = e.currentTarget.dataset.upid
    that.setData({
      upid: upid
    })
    that.getDistrict().then((res)=>{
     
      that.setData({
        district_le2: res.data,
        showLe2: true
      })
    })
  },
  getDistrict: function() {
    const that = this
    let upid = that.data.upid
    return new Promise((resolve, reject)=>{
      request('post', 'get_district.php', {
        token: wx.getStorageSync("token"),
        upid: upid
      }).then((res) => {
        if (res.err_code != 0)
          return
        resolve(res)
    })
    
    })
  },
  //点击右侧字母导航定位触发
  handlerStart: function(e){
    const that = this
    let _id = e.target.dataset.id;
    that.setData({
      toView: 'inToView' + _id,
      letter: _id
    })
    setTimeout(()=>{
      that.setData({
        letter: ''
      })
    },300)

  },
  //点击右侧字母导航定位触发
  handlerMove: function(e) {
    const that = this
    const arr = that.data.arr
    let pageY = e.touches[0].pageY
    
    let idx = Math.floor((pageY - 160) / 23 )
     idx = Math.min(arr.length - 1, Math.max(idx, 0))
    if ('inToView' + arr[idx] == that.data.toView)
      return
    that.setData({
      toView: 'inToView' + arr[idx],
      letter: arr[idx]
    })
    setTimeout(() => {
      that.setData({
        letter: ''
      })
    }, 300)

  },
  toNaviToAppear: function(e){ 
    const that = this
    let id = e.currentTarget.dataset.id,
      name = e.currentTarget.dataset.name
    app.district.id = id
    app.district.name = name
    wx.navigateBack({
      delta: 1
    })
  },
  clearLe2: function(){
    const that = this
    that.setData({
      showLe2: false
    })
  },
  touchStart: function(e){
    const that = this
    let x_start = e.touches[0].pageX
    that.setData({
      x_start: x_start
    })
  },
  touchEnd:function(e){
    const that = this
    let x_end = e.changedTouches[0].pageX,
      x_start = that.data.x_start
    if (x_end - x_start > 100){
      that.setData({
        showLe2: false
      })
    }
  }
})