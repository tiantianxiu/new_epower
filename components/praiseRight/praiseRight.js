import {
  request
} from '../../utils/util.js'
var app = getApp()
Component({
  properties: {

    showShare: {
      type: Boolean,
      value: false
    },
    shareType: {
      type: String,
      value: 'id'
    },
    tid: { //口碑详情id
      type: String,
      value: '',
    },
    showSharetail: {
      type: Boolean,
      value: false,
    },
    adopt: {
      type: String,
      value: "1"
    },
    subject: {
      type: String,
      value: ""
    },
    showCopy: {
      type: Boolean,
      value: false
    }

  },
  data: {
    showShareBox: false,
    showShareCanvasBox: false,
    showShareCanvasInner: false,
    shareImageSrc: '',
    shareEPower: '../../resources/image/user/e-power.png',
    shareQrText: '长按识别小程序“码”查看详情',
    shareTitle: '',
    shareImg: '',
    shareQrcode: '',
    shareContent: '',
    heightMt: app.globalData.heightMt + 20 * 2,
  },
  ready: function() {
    const that = this
  },
  methods: {

    showShareBox: function() {
      const that = this
      that.setData({
        showShareBox: true
      })
    },

    hideShareBox: function() {
      const that = this
      that.setData({
        showShareBox: false,
        showReply: false
      })
    },
    shareImg: function() {
      const that = this
      that.hideShareBox()
      wx.showLoading({
        title: '图片生成中...',
        mask: true
      })
      request('post', 'get_friends_circle.php', {
        token: wx.getStorageSync("token"),
        type: that.data.shareType,
        typeid: that.data.tid
      }).then((res) => {

        let img = 'https://e-power.oss-cn-shenzhen.aliyuncs.com/resources/image/praise/share_img_header.jpg'
        that.downloadImgs(img).then((r) => {
          that.setData({
            shareImg: r,
          })
          let adoptUrl = that.data.adopt == 1 ? 'https://e-power.oss-cn-shenzhen.aliyuncs.com/resources/image/praise/share_img_adopt.png' : 'https://e-power.oss-cn-shenzhen.aliyuncs.com/resources/image/praise/share_img_unadopt.png'
          that.downloadImgs(adoptUrl).then((r) => {
            that.setData({
              adoptUrl: r,
            })
          })
          that.downloadImgs(res.data.qrcode).then((r) => {
            that.setData({
              shareQrcode: r,
            })
            wx.hideLoading();
            that.drawSharePic()
          })

        })
      })

    },
    downloadImgs: function(img) {
      const that = this
      return new Promise(function(resolve, reject) {
        const downloadTaskImg = wx.downloadFile({
          url: img,
          success(res) {
            resolve(res.tempFilePath)
          }
        })
      })
    },
    drawSharePic: function() {
      const that = this
      const qrcode = that.data.shareQrcode
      const img = that.data.shareImg
      const subject = that.data.subject
      const content = that.data.shareContent
      const ePower = that.data.shareEPower
      const qrText = that.data.shareQrText
      const radiusL = '../../resources/image/radius_left.png'
      const radiusR = '../../resources/image/radius_right.png'
      const radiusBL = '../../resources/image/radius_bl.png'
      const radiusBR = '../../resources/image/radius_br.png'
      const adoptUrl = that.data.adoptUrl
      var canvasCtx = wx.createCanvasContext('shareCanvas', that)
      that.setData({
        showShareCanvasBox: true,
        showShareCanvasInner: false
      })
      //为了防止标题过长，分割字符串,每行18个
      let yOffset = 202
      let titleArray = []
      titleArray = subject.split("-")




      canvasCtx.save(); // 先保存状态 已便于画完圆再用
      canvasCtx.beginPath(); //开始绘制

      //绘制背景
      canvasCtx.setFillStyle('#2c2c2c');
      canvasCtx.fillRect(0, 0, 275, 450);
      canvasCtx.setFillStyle('#ffffff');
      canvasCtx.fillRect(15, 20, 245, 410);
      canvasCtx.drawImage(img, 15, 20, 245, 165);
      canvasCtx.drawImage(radiusL, 15, 20, 5, 5);
      canvasCtx.drawImage(radiusR, 255, 20, 5, 5);
      canvasCtx.drawImage(radiusBL, 15, 425, 5, 5);
      canvasCtx.drawImage(radiusBR, 255, 425, 5, 5);
      //绘制分享的标题文字
      canvasCtx.setFillStyle('#00c481');
      canvasCtx.fillRect(15, 185, 245, 55);
      let i = 0
      titleArray.forEach(function(value) {
        canvasCtx.setFontSize(i == 0 ? 15 : 11);
        canvasCtx.setFillStyle('#ffffff');
        canvasCtx.setTextAlign('left');
        canvasCtx.fillText(value, 22, yOffset, 275);
        yOffset += 17;
        i += 1;
      });
      //绘制是否采纳
      canvasCtx.drawImage(adoptUrl, 185, 182, 65, 65);
      
      //绘制线条
      canvasCtx.beginPath()
      canvasCtx.setLineWidth(1)
      canvasCtx.moveTo(30, 285)
      canvasCtx.lineTo(245, 285)
      canvasCtx.setStrokeStyle('#e5e5e5')
      canvasCtx.stroke()
      canvasCtx.beginPath()
      canvasCtx.setLineWidth(1)
      canvasCtx.moveTo(145, 305)
      canvasCtx.lineTo(145, 385)
      canvasCtx.setStrokeStyle('#e5e5e5')
      canvasCtx.stroke()
      //绘制二维码
      canvasCtx.drawImage(ePower, 160, 305, 85, 85);
      canvasCtx.drawImage(qrcode, 30, 295, 100, 100);
      canvasCtx.setFontSize(7);
      canvasCtx.setFillStyle('#757575');
      canvasCtx.setTextAlign('left');
      canvasCtx.fillText(qrText, 30, 410, 245);
      canvasCtx.draw();
      //绘制之后加一个延时去生成图片，如果直接生成可能没有绘制完成，导出图片会有问题。
      setTimeout(function() {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 550,
          height: 900,
          destWidth: 750,
          destHeight: 1227,
          canvasId: 'shareCanvas',
          success: function(res) {
            that.setData({
              shareImageSrc: res.tempFilePath,
              showShareCanvasInner: true
            })
          },
          fail: function(res) {
            console.log(res)
          }
        }, that)
      }, 1000);
    },
    closeCanvas: function() {
      const that = this
      that.setData({
        showShareCanvasBox: false
      })
    },
    saveCanvas: function() {
      const that = this
      wx.saveImageToPhotosAlbum({
        filePath: that.data.shareImageSrc,
        success(res) {
          wx.showModal({
            title: '存图成功',
            content: '图片成功保存到相册了，去发圈噻~',
            showCancel: false,
            confirmText: '好哒',
            confirmColor: '#72B9C3',
            success: function(res) {
              if (res.confirm) {
                that.hideShareBox()
              }
              that.closeCanvas()
            }
          })
        }
      })
    }
  },

})