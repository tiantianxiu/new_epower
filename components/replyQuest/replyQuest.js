var app = getApp()
import {
  request,
  uploadFile,
  myTrim
} from '../../utils/util.js'
Component({
  properties: {

    focus: {
      type: Boolean,
      value: false
    },

    //点击回复是否显示另外一个回复框 
    replyType: {
      type: Number,
      value: 0
    },
    showReply: {
      type: Boolean,
      value: false
    },
    hasTall: {
      type: Boolean,
      value: false
    },
    showToQuest: {
      type: Boolean,
      value: false
    },
    showUnVip: {
      type: Boolean,
      value: false
    },
    btnMsg: {
      type: String,
      value: ''
    },
    disableMsg: {
      type: String,
      value: ''
    },
    pid: {
      type: Number,
      value: 0
    },
    tid: {
      type: Number,
      value: 0
    },
    isAdmin: {
      type: Number,
      value: 0
    }
    
  },
  data: {
    loading_hidden: true,
    loading_msg: '加载中',
    aidList: [],
    imageUrls: [],
    imageList: [],
    message: '',
  },

  methods: {
    //输入回复信息
    inputMessage: function(e) {
      const that = this
      that.setData({
        message: e.detail.value
      });
    },
    formSubmit: function(e) { 
      const that = this
      let form_id = e.detail.formId
      let data = {
        form_id: form_id
      }
      that.submitMessage(data)
    },
    // 回复贴子
    submitMessage: function(e) {
      var that = this
      let form_id = e.form_id
      app.canAddThread(true).then((re) => {
        if (!re)
          return
        that.isShowAuthorization().then((res) => {
          if (res == true) {
            let message = myTrim(that.data.message);
            const imageList = that.data.imageList
            const aidList = that.data.aidList
            let attachment = 0
            if (imageList.length > 0) {
              let codeList = ""
              for (var i = imageList.length - 1; i >= 0; i--) {
                const code = imageList[i].code
                codeList += code
              }
              message += codeList
              attachment = 2
            }

            if (message == null || message == undefined || message == '') {
              getApp().showErrModal('回答内容不能为空');
              that.setData({
                focus: true,
                message: ''
              })
              return;
            }
            var addPostDetail = {
              message: message,
              aidList: aidList,
              attachment: attachment,
              form_id: form_id
            } // detail对象，提供给事件监听函数 
           
            that.triggerEvent('addPost', addPostDetail)
          }
        })
      })
    },
    toSet: function () {
      this.triggerEvent('toSet')
    },
    // 是否弹出授权框
    isShowAuthorization: function() {
      const that = this
      let hasLogin = wx.getStorageSync("has_login")
      return new Promise(function(resolve, reject) {
        if (hasLogin == 1) {
          resolve(true)
        } else {
          resolve(false)
          that.triggerEvent('showAuthorization')
        }
      })
    },


    chooseImage: function(e) {
      const that = this
      wx.chooseImage({
        count: 1,
        success: function(res) {
          var tempFilePaths = res.tempFilePaths
          var tmpImageList = that.data.imageList;
          var tmpAidList = that.data.aidList;
          const tmpimageUrls = that.data.imageUrls
          for (var i = 0; i < res.tempFilePaths.length; i++) {

            var localFilePath = res.tempFilePaths[i]
            const uploadTask = uploadFile('post', 'add_image.php', localFilePath, 'myfile', {
              token: wx.getStorageSync("token"),
              type: 'question'
            }).then((resp) => {
              if (resp == 'err')
                return
              let addPostDetail = {
                message: resp.data.code,
                aid_list: resp.data.aid,
                attachment: 2
              } // detail对象，提供给事件监听函数 
              that.triggerEvent('addPost', addPostDetail)

            })
          }
        }
      })
    },
    replyPost: function() {
      const that = this
      app.canAddThread(true).then((re) => {
        if (re) {
          that.isShowAuthorization().then((res) => {
            if (res == true) {
              that.setData({
                replyType: false,
                focus: true
              })

            }
          })
        }
      })
    },
    bindfocus: function(e) {
      let that = this;
      let height = '';
      let height_02 = 0;
      wx.getSystemInfo({
        success: function(res) {
          height_02 = res.windowHeight;
          height = e.detail.height
          setTimeout(() => {
            that.setData({
              height: height,
              showEmoji: false
            })
          }, 100)

        }
      })
    },
    //监听input失去焦点
    bindblur: function(e) {
      this.setData({
        height: 0
      });
    },
    hideReplyForm: function() {
      const that = this
      that.setData({
        focus: false,
        replyType: 1
      })
    },
    resetData: function() {
      const that = this
      that.setData({
        focus: false,
        showreplyForm: false,
        imageList: [],
        imageUrls: [],
        aidList: [],
        tallValue: '',
      })
    },
    tallInput: function(e) {
      const that = this
      let value = e.detail.value
      that.setData({
        tallValue: value
      })
    },
    sendTall: function() {
      const that = this
      let tallValue = that.data.tallValue
      if (!tallValue) {
        wx.showToast({
          title: '不能发送空信息',
          icon: 'none'
        })
        return
      }
      var addPostDetail = {
        message: tallValue,
      } // detail对象，提供给事件监听函数 
      that.triggerEvent('addPost', addPostDetail)
    },

    toquest: function() {
      wx.navigateTo({
        url: '../quest_ask/quest_ask'
      })
    },
    disableTap: function(e) {
      const that = this
      let msg = e.currentTarget.dataset.msg
      if (!msg)
        return
      wx.showToast({
        title: msg,
        icon: 'none'
      })
    }
  }

})