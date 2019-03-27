var app = getApp()

Component({
  properties: {
   
    hideSmiley: {  //是否隐藏表情
      type: Boolean,
      value: false
    }
  },
  data: {},

  methods: {
    squareTap: function () {
      const that = this
      that.triggerEvent('squareTap')
    },
    squareLong: function () {
      const that = this
      that.triggerEvent('squareLong')
    }
  }
})