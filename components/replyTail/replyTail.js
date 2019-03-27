var app = getApp()
import {
  request,
  uploadFile,
  myTrim
} from '../../utils/util.js'
Component({
  properties: {
    message: {
      type: String,
      value: 0,
    },
    focus: {
      type: Boolean,
      value: false
    },
    articleId: {
      type: String,
      value: 0,
    },

    // 是否显示收藏
    showFavorite: {
      type: Boolean,
      value: false
    },
    idtype: {
      type: String,
      value: 'tid',
    },
    is_favorite: { //收藏状态
      type: String,
      value: 0,
    },
    //点击回复是否显示另外一个回复框 
    isShowReplyForm: {
      type: Boolean,
      value: false
    },

    //是否显示赞
    showZhan: {
      type: Boolean,
      value: false
    },
    is_zan: { //0没有 1赞 2踩
      type: String,
      value: 0,
    },
    zan: {
      type: Number,
      value: 0,
    },

    //是否显示回复条数
    showReplies: {
      type: Boolean,
      value: false
    },
    replies: {
      type: Number,
      value: 0,
    },

    //是否显示踩  
    showCai: {
      type: Boolean,
      value: false
    },
    cai: {
      type: Number,
      value: 0,
    },
    replyTop: {
      type: Number,
      value: 0
    },
    is_praise: {
      type: Boolean,
      value: false
    },
    hideSmiley: {  //是否隐藏表情
      type: Boolean,
      value: false
    }
  },
  data: {
    showreplyForm: false,

    imageList: [],
    imageUrls: [],
    textContent: '',
    aidList: [],
    vedioList: [],
    // 这里是一些组件内部数据
    loading_hidden: true,
    loading_msg: '加载中...',
    progress: 0,
    showProgress: false,

    // 弹出键盘后bottom值设置
    height: 'auto',
    height_01: '',
    adjustPosition: false,

    //自定义表情包
    showEmoji: false,
    indicatorDots: true,

    emojiScrollLeft: 0,
    screenW: 375,
    touchStartX: '',

    // 触摸开始时间
    touchStartTime: 0,
    // 触摸结束时间
    touchEndTime: 0,
  },

  methods: {
    //输入回复信息
    inputMessage: function(e) {
      const that = this
      that.setData({
        message: e.detail.value
      });
    },
    // 回复贴子
    submitMessage: function(e) {
      var that = this
      app.canAddThread(true).then((re) => {
        if(!re)
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
              attachment  = 2
            }

            if (message == null || message == undefined || message == '') {
              getApp().showErrModal('评论内容不能为空');
              that.setData({
                focus: true,
                message: ''
              })
              return;
            }
            var addPostDetail = {
              message: message,
              aidList: aidList,
              attachment: attachment
            } // detail对象，提供给事件监听函数 
            this.triggerEvent('addPost', addPostDetail)
          }
        })
      })
    },
    // 收藏
    clickFollow: function() {
      var that = this
      that.isShowAuthorization().then((res) => {
        if (res == true) {
          request('post', 'add_favorite.php', {
            token: wx.getStorageSync("token"),
            idtype: that.data.idtype,
            id: that.data.articleId,
            description: ''
          }).then((r) => {
            if (that.data.is_favorite == 0) {
              wx.showToast({
                title: '收藏成功！',
                icon: 'success',
              })
              that.setData({
                is_favorite: 1
              })
            } else {
              wx.showToast({
                title: '已取消收藏！',
                icon: 'none',
              })
              that.setData({
                is_favorite: 0
              })
            }
            // that.reloadIndex()
          });
        }
      })
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

    clickReply: function() {
      const that = this
      that.queryTop().then((res) => {
        wx.pageScrollTo({ //滑动
          scrollTop: res[0].top + res[1].scrollTop, //滑动到回复高度
          duration: 0
        })
      })
    },
    //获取评论的高度
    queryTop: function() {
      const query = wx.createSelectorQuery(),
        that = this
      return new Promise(function(resolve, reject) {
        query.select('#reply-title').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function(res) {
          resolve(res) // #reply-title节点的上边界坐标
        })
      })
    },
    showreplyFormFun: function(e) {
      const that = this
      app.canAddThread(true).then((re) => {
        if (re) { 
          that.isShowAuthorization().then((res) => {
            if (res == true) {
              that.setData({
                showreplyForm: true,
                focus: true
              })
              if (!that.data.hideSmiley)
                that.getSmiley()
            }
          })
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
    chooseImage: function(e) {
      const that = this
      wx.chooseImage({
        count: 9,
        // sizeType:["original"],
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
                tmpImageList.push(tmpObj);
                that.setData({
                  // loading_hidden: true,
                  aidList: tmpAidList,
                  imageUrls: tmpimageUrls,
                  imageList: tmpImageList,
                  focus: true,
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
    chooseVedio: function(e) {
      const that = this
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 30,
        camera: 'back',
        success: function(res) {
          var tempFilePath = res.tempFilePath
          var tmpImageList = that.data.imageList;
          var tmpAidList = that.data.aidList;
          const tmpimageUrls = that.data.imageUrls;

          const uploadTask = wx.uploadFile({
            url: app.globalData.svr_url + 'add_video.php',
            filePath: tempFilePath,
            name: 'myfile',
            method: 'POST',
            formData: {
              token: wx.getStorageSync("token"),
            },
            success: function(resp) {
              var resp_dict = JSON.parse(resp.data)
              if (resp_dict.err_code == 0) {
                tmpAidList.push(resp_dict.data.aid);
                tmpimageUrls.push(resp_dict.data.read_file_url);
                var o1 = {
                  url: resp_dict.data.read_file_url
                };
                var o2 = {
                  type: 'vedio'
                }
                var o3 = {
                  code: resp_dict.data.code
                }
                var tmpObj = Object.assign(o1, o2, o3);
                tmpImageList.push(tmpObj);
                that.setData({

                  aidList: tmpAidList,
                  imageList: tmpImageList,
                  imageUrls: tmpimageUrls,
                  focus: true,
                  loading_hidden: true,
                  showProgress: false,
                  progress: 0
                })
              } else {
                app.showErrModal('上传失败，请重新上传');
                that.setData({
                  showProgress: false,
                })
                uploadTask.abort()
              }
            },
            fail: function(resp) {
              app.showErrModal('上传失败，请重新上传');
              that.setData({
                showProgress: false,
              })
              uploadTask.abort()
            }
          })
          uploadTask.onProgressUpdate((res) => {
            if (res.progress == 100) {
              that.setData({
                showProgress: false,
                progress: res.progress
              })
            } else {
              that.setData({
                showProgress: true,
                progress: res.progress
              })
            }
          })
        }
      })
    },
    chooseEmoji: function(e) {
      const that = this
      that.setData({
        showEmoji: true
      })
    },
    //长按父节点
    showGifFather: function(e) {
      const that = this
      let fatherIndex = e.currentTarget.dataset.idx
      that.setData({
        fatherIndex: fatherIndex
      })
    },
    //长按显示动图
    showGif: function(e) {
      const that = this
      setTimeout(() => {
        let fatherIndex = that.data.fatherIndex,
          long_index = parseInt(e.currentTarget.dataset.index),
          emojiListGroup = that.data.emojiListGroup,
          emojiGif = emojiListGroup[0].list[fatherIndex][long_index].show,
          gifLeft = e.currentTarget.offsetLeft * 2 - 40,
          gifBottom = 356 - e.currentTarget.offsetTop * 2 + 118
        that.setData({
          is_show_gif: 1,
          emojiGif: emojiGif,
          gifLeft: gifLeft,
          gifBottom: gifBottom
        })
      })

    },
    //按钮触摸开始触发的事件
    touchStart: function(e) {
      const that = this
      that.data.touchStartTime = e.timeStamp
    },
    /// 按钮触摸结束触发的事件
    touchEnd: function(e) {
      const that = this
      that.setData({
        touchEndTime: e.timeStamp,
        is_show_gif: 0
      })
    },
    chooseEmojiItem: function(e) {
      const that = this
      if (that.data.touchEndTime - that.data.touchStartTime > 350) {
        return
      }
      const emojiCode = e.currentTarget.dataset.code
      let message = that.data.message
      message += emojiCode
      that.setData({
        message: message
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
        showreplyForm: false
      })
    },
    resetData: function() { 
      const that = this
      that.setData({
        focus: false,
        showreplyForm: false,
        imageList: [],
        imageUrls: [],
        textContent: '',
        aidList: [],
        vedioList: [],
        message: '',
      })
    },

    //自定义表情包处理
    // 获取表情包数据
    getSmiley: function() {
      const that = this
      let emojiListSt = app.getSt('emojiList'),
        emojiListGroupSt = app.getSt('emojiListGroup')
      if (emojiListSt && emojiListGroupSt) {
        that.setData({
          emojiList: emojiListSt,
          emojiListGroup: emojiListGroupSt
        })
        return
      }
      request('post', 'get_smiley.php', {
        token: wx.getStorageSync("token"),
      }).then((res) => {
        const emojiListGroup = []
        const emojiList = res.data.common_smiley

        for (var i = 0; i < emojiList.length; i++) {
          const a1 = {
            icon: emojiList[i].icon
          };
          const a2 = {
            typeid: emojiList[i].typeid
          }
          const a3 = {
            list: []
          }
          const emojiListArr = Object.assign(a1, a2, a3);

          const emojiListGroupItem = emojiList[i].list
          if (emojiListArr.typeid == 1) {
            for (var j = 0; j < emojiListGroupItem.length; j += 24) {
              emojiListArr.list.push(emojiListGroupItem.slice(j, j + 24));
            }
          } else {
            for (var j = 0; j < emojiListGroupItem.length; j += 8) {
              emojiListArr.list.push(emojiListGroupItem.slice(j, j + 8));
            }
          }
          emojiListGroup.push(emojiListArr);
        }

        that.setData({
          emojiList: emojiList,
          emojiListGroup: emojiListGroup
        })

        app.putSt('emojiList', emojiList, 86400) //表情缓存set
        app.putSt('emojiListGroup', emojiListGroup, 86400) //表情缓存set

      })
    },
    chanegEmojiTab: function(e) {
      const that = this
      const screenW = that.data.screenW
      const idx = e.currentTarget.dataset.idx
      that.setData({
        emojiScrollLeft: screenW * idx
      })
    },
    // 
    emojitouchstart: function(e) {
      const that = this
      that.setData({
        touchStartX: e.changedTouches[0].pageX
      })

    },
    emojitouchend: function(e) {
      const that = this
      const idx = e.currentTarget.dataset.idx
      const groupIdx = e.currentTarget.dataset.groupidx
      const listLength = that.data.emojiListGroup[groupIdx].list.length
      const screenW = that.data.screenW

      const touchEndX = e.changedTouches[0].l
      let tx = touchEndX - this.data.touchStartX
      //左右方向滑动
      if (tx < -screenW * 0.3) {
        // console.log('向左滑动')
        if (idx == listLength - 1) {
          if (groupIdx == that.data.emojiListGroup.length - 1) {
            return
          } else {
            const setLeft = screenW * (groupIdx + 1)
            that.setData({
              emojiScrollLeft: setLeft
            })
          }
        }
      } else if (tx > screenW * 0.3) {
        // console.log('向右滑动')
        if (idx == 0) {
          if (groupIdx == 0) {
            return
          } else {
            const setLeft = screenW * (groupIdx - 1)
            that.setData({
              emojiScrollLeft: setLeft
            })
          }
        }
      } else {
        // console.log('滑动幅度不够哦！')
      }


    }
  }
})