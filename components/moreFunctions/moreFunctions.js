import {
  request
} from '../../utils/util.js'
var app = getApp()
Component({
  properties: {
    addPosts: {
      type: Object,
      value: {}
    },
    showGoHome: {
      type: Boolean,
      value: false
    },
    showToTop: {
      type: Boolean,
      value: false
    },

    scrollTop: {
      type: Number,
      value: 0,
      observer: function(newVal, oldVal, changedPath) {
        const that = this
        if (newVal >= 300) {
          that.setData({
            scroll_show: true
          })
        }
        // else {
        //   that.setData({
        //     scroll_show: false
        //   })
        // }
      }
    },
    showZan: {
      type: Boolean,
      value: false
    },
    showCai: {
      type: Boolean,
      value: false
    },
    showShare: {
      type: Boolean,
      value: false
    },
    shareType: {
      type: String,
      value: 'tid'
    },
    tid: { //文章tid
      type: String,
      value: '',
    },
    showSharetail: {
      type: Boolean,
      value: false,
    },
    showReplyBtn: {
      type: Boolean,
      value: false
    },
    showReply: {
      type: Boolean,
      value: false
    },
    isAdmin: {
      type: Number,
      value: 0
    },
    thisModerator: {
      type: Number,
      value: 0
    },
    is_zan: { //0没有 1赞 2踩
      type: String,
      value: 0,
    },
    zan: {
      type: Number,
      value: 0,
    },
    cai: {
      type: Number,
      value: 0,
    },
    totalNum: { //回复数
      type: Number,
      value: 0
    },
    showSet: { //点开设置
      type: Boolean,
      value: false
    },
    showToPost: {
      type: Boolean,
      value: false
    },
    showToPraise: {
      type: Boolean,
      value: false
    },
    messagePid: { //从消息通知那里进帖子详情
      type: Number,
      value: 0
    },
    showCopy: {
      type: Boolean,
      value: false
    },
    showShareBox: {
      type: Boolean,
      value: false
    }

  },
  data: {
    scroll_show: false,
   
    showShareCanvasBox: false,
    showShareCanvasInner: false,
    shareImageSrc: '',
    shareEPower: '../../resources/image/user/e-power.png',
    shareQrText: '长按识别小程序“码”查看详情',
    shareTitle: '',
    shareImg: '',
    shareQrcode: '',
    shareContent: '',
    replyScrollH: 0, //评论高度
    page_size: 5, //查询评论数
    page_index: 0,
    pid: 0, //回复哪个帖子的记录
    scrBottom: 1,
    heightMt: app.globalData.heightMt + 20 * 2
  },
  ready: function() {
    const that = this
  },
  methods: {
    // 回复后评论增加
    addPost: function() {
      const that = this
      that.setData({
        totalNum: that.data.totalNum + 1
      })
      if (that.data.showReply) {
        let articleList = that.data.articleList
        articleList.splice(0, 0, that.data.addPosts)
        that.setData({
          articleList: articleList
        })
        setTimeout(() => {
          that.setData({
            'articleList[0]is_add_post': 0
          })
        }, 4000)
      }
    },
    toSet: function() {
      this.triggerEvent('toSet')
    },
    toPost: function() { //发帖
      wx.navigateTo({
        url: '/question/pages/add_article/add_article'
      })
    },
    toPraise: function() {
      const that = this
      app.canAddThread(true).then((re) => {
        if (re) {
          that.isShowAuthorization().then((res) => {
            if (res == true) {

              if (re.data) {
                if (re.data.name) {
                  let name = re.data.name,
                    car_2 = re.datacar_2,
                    car_3 = re.datacar_3
                  wx.navigateTo({
                    url: `/praise/pages/praise_appear/praise_appear?name=${name}&car_2=${car_2}&car_3=${car_2}`,
                  })
                  return
                }
              }
              wx.navigateTo({
                url: '/praise/pages/praise_appear/praise_appear',
              })
            }
          })
        }
      })
    },
    //点击查看评论回复
    toReply: function() {
      const that = this
      if (that.data.articleList) {
        that.setData({
          showReply: true
        })
        return
      }
      that.getComment().then((res) => {
        let [totalNum, num] = [res]

        if (totalNum < 2) {
          totalNum = 1.2, num = 2
        } else if (totalNum == 2) {
          totalNum = 2, num = 3
        } else if (totalNum >= 3) {
          totalNum = 3, num = 4
        }
        that.setData({
          replyScrollH: 140 * totalNum,
          showReply: true,
          scrBottom: num
        })
      })

    },
    cloceReply: function() {
      const that = this
      that.setData({
        showReply: false
      })
    },

    // 评论回复传给父组件
    replyCommentCld: function(e) {
      const that = this
      const pid = e.currentTarget.dataset.pid
      let faReply = {
        pid: pid
      }
      that.triggerEvent('faReply', faReply)
    },
    //删除评论  再给父组件
    replyDel: function(e) {
      const that = this
      let index = e.currentTarget.dataset.index,
        pid = e.currentTarget.dataset.pid,
        data = {
          token: wx.getStorageSync("token"),
          pid: pid
        }
      app.deleteNormal(data, 'del_reply.php').then((res) => {
        if (res.status < 0)
          return
        that.data.articleList.splice(index, 1)
        that.setData({
          articleList: that.data.articleList,
          totalNum: that.data.totalNum - 1
        })
      })
    },
    // 点赞文章
    toZan: function(e) {
      const that = this
      const type = e.currentTarget.dataset.type //1赞 2踩

      that.isShowAuthorization().then((res) => {
        if (res == true) {
          var is_zan = that.data.is_zan
          if (is_zan == 0) {
            request('post', 'add_zan.php', {
              token: wx.getStorageSync("token"),
              tid: that.data.tid,
              type: type
            }).then((res) => {
              if (res.err_code != 0)
                return

              if (type == 1) {
                this.setData({
                  is_zan: 1,
                  zan: parseInt(that.data.zan) + parseInt(1)
                })
              } else {
                this.setData({
                  is_zan: 2,
                  cai: parseInt(that.data.cai) + parseInt(1)
                })
              }
              wx.showToast({
                title: res.data.credits ? '已评价，电量+' + res.data.credits : '评价成功！',
                icon: 'success',
              })
            })
          } else {
            wx.showToast({
              title: '你已经评价过啦！',
              icon: 'none',
            })
          }
        }
      })
    },
    // 点赞评论
    clickZhan: function(e) {
      const that = this
      const type = e.currentTarget.dataset.type //1赞 2踩
      const is_zan = e.currentTarget.dataset.iszan
      const pid = e.currentTarget.dataset.pid
      const index = e.currentTarget.dataset.index
      const number = e.currentTarget.dataset.number
      const one_man = e.currentTarget.dataset.one_man
      that.isShowAuthorization().then((res) => {
        if (res == true) {
          if (is_zan == 0) {
            request('post', 'add_zan_post.php', {
              token: wx.getStorageSync("token"),
              tid: that.data.tid,
              type: type,
              pid: pid
            }).then((res) => {
              let articleListIndex, indexNum

              if (type == 1) {
                articleListIndex = one_man ? 'replyList[' + index + '].zan' : 'articleList[' + index + '].zan'
                indexNum = 1
              } else {
                articleListIndex = one_man ? 'replyList[' + index + '].cai' : 'articleList[' + index + '].cai'
                indexNum = 2
              }

              let artIndexIs = one_man ? 'replyList[' + index + '].is_zan' : 'articleList[' + index + '].is_zan'
              that.setData({
                [artIndexIs]: indexNum,
                [articleListIndex]: parseInt(number) + parseInt(1)
              })
              if (!one_man) {
                let faZan = {
                  artIndexIs: artIndexIs,
                  articleListIndex: articleListIndex,
                  indexNum: indexNum,
                  number: number
                } // detail对象，提供给事件监听函数
                that.triggerEvent('faZan', faZan)
              }
              wx.showToast({
                title: res.data.credits ? '已评价，电量+' + res.data.credits : '评价成功！',
                icon: 'success',
              })
            })
          } else {
            wx.showToast({
              title: '你已经评价过啦！',
              icon: 'none',
            })
          }
        }
      })
    },

    toUserDetail: function(e) {
      app.toUserDetail(e)
    },
    // 是否弹出授权框
    isShowAuthorization: function() {
      const that = this
      const hasLogin = wx.getStorageSync("has_login")
      return new Promise(function(resolve, reject) {
        if (hasLogin == 1) {
          resolve(true)
        } else {
          resolve(false)
          that.triggerEvent('showAuthorization')
        }
      })
    },
    showAuthorization: function() {
      const that = this
      that.setData({
        showAuthorization: true
      })
    },
    //访问评论接口
    getComment: function() {
      const that = this
      let page_size = that.data.page_size
      that.data.page_index = 0
      return new Promise(function(resolve, reject) {
        request('post', 'get_post_detail_comment.php', {
          token: wx.getStorageSync("token"),
          tid: that.data.tid,
          page_size: page_size,
          page_index: 0,
          pid: that.data.messagePid || 0
        }).then((res) => {
          let post_list_length = res.data.post_list.length,
            totalNum = res.data.total_num,
            postList = res.data.reply,
            replyList = res.data.reply,
            post_list = res.data.post_list
          if (that.data.messagePid && replyList.length == 0) {
            app.wxShowToast('该回复已被删除', 1500, 'none')
          }
          for (let i in post_list) {
            var extcredits2 = post_list[i].extcredits2 + ''
            post_list[i].extcredits2_arr = extcredits2.split('')
          }
          that.setData({
            articleList: post_list,
            replyList: postList, //有人回复你
            totalNum: totalNum,
            nomore_data: post_list_length < page_size ? true : false
          })
          resolve(totalNum)
        })
      })
    },
    getClipboard: function() {

      this.triggerEvent('getClipboard')
    },
    //评论滑动到底部加载
    onReplyReachBottom: function() {
      const that = this
      let page_size = that.data.page_size
      let page_index = that.data.page_index + 1
      if (that.data.nomore_data == true)
        return
      that.setData({
        have_data: true
      })
      setTimeout(() => {
        request('post', 'get_post_detail_comment.php', {
          token: wx.getStorageSync("token"),
          tid: that.data.tid,
          page_size: page_size,
          page_index: page_index
        }).then((res) => {

          let tmpArticleList = that.data.articleList;
          let respArticleList = res.data.post_list;

          for (let i in respArticleList) {
            var extcredits2 = respArticleList[i].extcredits2 + ''
            respArticleList[i].extcredits2_arr = extcredits2.split('')
          }
          let newArticleList = tmpArticleList.concat(respArticleList)
          let post_list_length = res.data.post_list.length
          that.setData({
            have_data: post_list_length < page_size ? false : true,
            articleList: newArticleList,
            page_index: page_index,
            nomore_data: post_list_length < page_size ? true : false,
          }, 100)
        })
      })
    },
    // 这里是一个自定义方法
    toHome: function() {
      wx.switchTab({
        url: `/pages/index/index`,
      })
    },
    scrollToTop: function() {
      const that = this
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 600
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
      that.setData({
        scroll_show: false
      })
    },

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
        that.setData({
          shareTitle: res.data.subject,
          shareContent: res.data.message,
        })

        let urls = [res.data.img, res.data.qrcode];
        that.downloadImgs(res.data.img).then((r) => {
          that.setData({
            shareImg: r,
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
      const title = that.data.shareTitle
      const content = that.data.shareContent
      const ePower = that.data.shareEPower
      const qrText = that.data.shareQrText
      const radiusL = '../../resources/image/radius_left.png'
      const radiusR = '../../resources/image/radius_right.png'
      const radiusBL = '../../resources/image/radius_bl.png'
      const radiusBR = '../../resources/image/radius_br.png'
      var canvasCtx = wx.createCanvasContext('shareCanvas', that)
      that.setData({
        showShareCanvasBox: true,
        showShareCanvasInner: false
      })
      //为了防止标题过长，分割字符串,每行18个
      let yOffset = 168
      let titleArray = []
      for (let i = 0; i < title.length / 16; i++) {
        if (i > 1) {
          break;
          yOffset = 168
        }
        titleArray.push(title.substr(i * 16, 16));
      }

      let cOffset = 220
      let contentArray = []
      for (let i = 0; i < content.length / 20; i++) {
        if (i > 2) {
          break;
        }
        contentArray.push(content.substr(i * 20, 20));
      }
      canvasCtx.save(); // 先保存状态 已便于画完圆再用
      canvasCtx.beginPath(); //开始绘制

      //绘制背景
      canvasCtx.setFillStyle('#2c2c2c');
      canvasCtx.fillRect(0, 0, 275, 450);
      canvasCtx.setFillStyle('#ffffff');
      canvasCtx.fillRect(15, 20, 245, 410);
      canvasCtx.drawImage(img, 15, 20, 245, 130);
      canvasCtx.drawImage(radiusL, 15, 20, 5, 5);
      canvasCtx.drawImage(radiusR, 255, 20, 5, 5);
      canvasCtx.drawImage(radiusBL, 15, 425, 5, 5);
      canvasCtx.drawImage(radiusBR, 255, 425, 5, 5);
      //绘制分享的标题文字
      canvasCtx.setFillStyle('#4db68f');
      canvasCtx.fillRect(15, 150, 245, 45);
      titleArray.forEach(function(value) {
        canvasCtx.setFontSize(13);
        canvasCtx.setFillStyle('#ffffff');
        canvasCtx.setTextAlign('center');
        canvasCtx.fillText(value, 137, yOffset, 275);
        yOffset += 20;
      });
      //绘制分享的文字描述
      contentArray.forEach(function(value) {
        canvasCtx.setFontSize(11);
        canvasCtx.setFillStyle('#757575');
        canvasCtx.setTextAlign('left');
        canvasCtx.fillText(value, 32, cOffset, 245);
        cOffset += 22;
      });
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