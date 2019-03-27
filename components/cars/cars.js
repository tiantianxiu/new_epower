const app = getApp()
import {
  request
} from '../../utils/util.js'
Component({
  properties: {
    carsShow: {
      type: Boolean,
      value: false
    }
  },
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    base_url: getApp().globalData.base_url,
    windowHeight: '',
    otherHeight: 70,
    fixedTabScrollTop: 0,
    scrollToId: '',
    arr: [],
    cars_arr: {},
    car_1: '',
    heightMt: app.globalData.heightMt + 20 * 2,
    type: 1
  },
  ready: function() {
    const that = this
    that.getCarsFun()
    that.getSystemInfo()
  },
  methods: {
    getSystemInfo: function() {
      const that = this
      wx.getSystemInfo({
        success: function(res) {
          that.setData({
            windowHeight: app.globalData.windowHeight - 30 - that.data.heightMt
          })
        }
      })
    },
    getCarsFun: function() {
      const that = this
      const upid = that.data.upid
      that.setData({
        loading_hidden: false,
        loading_msg: '加载中...'
      })
      request('post', 'get_cars.php', {
        token: wx.getStorageSync("token"),
        upid: upid,
        type: that.data.type
      }).then((res) => {
        that.setData({
          loading_hidden: true,
          loading_msg: '加载完毕...',
        })
        that.setData({
          brandList: res.data,
          arr: Object.keys(res.data)
        })

      });
    },
    handlerStart: function(e) {
      const that = this
      let idx = e.target.dataset.idx
      that.setData({
        scrollToId: idx
      })
    },
    handlerMove: function(e) {
      const that = this
      // let brandList = that.data.brandList
      let heightMt = that.data.heightMt
      const arr = that.data.arr
      let pageY = e.touches[0].pageY
      let idx = Math.floor((pageY - 65 - heightMt) / 20)
      idx = Math.min(arr.length - 1, Math.max(idx, 0))
      if (that.data.scrollToId == arr[idx])
        return
      that.setData({
        scrollToId: arr[idx]
      })
    },
    selectCarSystem: function(e) {
      const that = this
      const name = e.currentTarget.dataset.name
      const id = e.currentTarget.dataset.id
      let cars_arr = that.data.cars_arr
      if (id in cars_arr) {
        delete cars_arr[id]
        that.setData({
          cars_arr: cars_arr
        })
        that.triggerEvent('carsInfo', cars_arr)
        return
      }
      if (Object.getOwnPropertyNames(cars_arr).length >= 10) {
        wx.showToast({
          title: '不得超过10个车型哦',
          icon: 'none'
        })
        return
      }
      cars_arr[id] = name
      that.setData({
        cars_arr: cars_arr
      })
      that.triggerEvent('carsInfo', cars_arr)
    },
    hideFixedTab: function() {
      const that = this
      that.setData({
        carsShow: false
      })
      that.triggerEvent('appoint')
    },
    carsClear: function(e){
      const that = this
      if(!e){
        that.setData({
          cars_arr: {}
        })
        return
      }
      const cars_arr = that.data.cars_arr
      for (let i in cars_arr){
        if (cars_arr[i] == e){
          delete cars_arr[i]
        }
      }
      that.setData({
        cars_arr: cars_arr
      })
      
    }

  }
})