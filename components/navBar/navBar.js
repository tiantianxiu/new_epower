const app = getApp()
Component({
  properties: {
    navbarData: { //navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {}
    }
  },
  data: {
    heightMt: '',
    //默认值  默认显示左上角
    navbarData: {
      showCapsule: 1,
    },
    share: app.globalData.share
  },
  attached: function() {
    const that = this
    // 获取是否是通过分享进入的小程序
    // 定义导航栏的高度   方便对齐
    that.setData({
      heightMt: app.globalData.heightMt
    })
    that.setData({
      share: app.globalData.share
    })
    if (app.globalData.share)
      app.globalData.share = false
  },
  methods: {
    // 返回上一页面
    backtap() {
      wx.navigateBack({
        delta: 1
      })
    },
    //返回到首页
    hometap() {
      const that = this
      
      wx.switchTab({
        url: '/pages/index/index'
      })
    },
    sharetap() {
      const that = this
      let headerShare = {}
      that.triggerEvent('headerShare', headerShare) //myevent自定义名称事件，父组件中使用
    },
    hideShareBox: function() {
      const that = this
      that.setData({
        showShareBox: false,
        showReply: false
      })
    },
    squareTap: function(){
      const that = this
      that.triggerEvent('squareTap') 
    },
    squareLong: function(){
      const that = this
      that.triggerEvent('squareLong') 
    }

  }

})