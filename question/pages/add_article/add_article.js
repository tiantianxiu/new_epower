// add_article.js
var app = getApp()
import {
  request,
  myTrim
} from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fid: '',
    articleTitle: "",
    loading_hidden: true,
    loading_msg: '加载中...',

    group_list: [],
    group_index: '',
    sub_group_list: [],
    sub_group_index: '',
    group_data: [],

    type: 1,
    post_type: '',

    progress: 0,
    showProgress: false,
    showAuthorization: false,

    imageList: [],
    aidList: [],
    vedioList: [],

    showE: 0, //选择图片时会进入一次onHide，当showE为1时不执行数据重置
    focus: false,

    articleContent: [{
      text: '',
      showTextBox: true,
      url: '',
      code: '',
      aid: '',
      type: '',
      file_url: '',
      isfm: false
    }],

    showChanegBox: false,
    chanegImgIdx: '',
    chanegImgIsfm: '',
    chanegImgUrl: '',
    showTextarea: true,

    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '发帖', //导航栏 中间的标题
    },
  },

  onLoad: function (options) {
    var that = this
    if (options.fid) {
      this.setData({
        fid: options.fid
      })
    }
    if (options.post_type) {
      this.setData({
        post_type: options.post_type,
      })
    }
  },
  onShow: function () {
    const that = this
    if(wx.getStorageSync('articleTitle')){
      that.setData({
        articleTitle: wx.getStorageSync('articleTitle')
      })
    }
    if (wx.getStorageSync('articleContent')) {
      that.setData({
        articleContent: wx.getStorageSync('articleContent')
      })
      
    }

    if (wx.getStorageSync("has_login") == 1) {
      app.canAddThread()
      that.getForum()
    } else {
      that.setData({
        showAuthorization: true,
        showTextarea: false
      })
    }
  },
  rejectAuthorizeFun: function() {
    // console.log('不同意授权')
    const that = this
    that.setData({
      showAuthorization: true
    })
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  agreeAuthorizeFun: function() {
    // console.log('同意授权')
    app.canAddThread()
  },
  onHide: function() {
    var that = this
    if (that.data.showE == 0) {
      this.setData({
        post_type: ''
      })
    }
  },
  /*投票funcion
   */
  //增加一项tap
  addOptionBtn: function(e) {

  },

  getForum: function() {
    const that = this
    let sub_group_list = that.data.sub_group_list,
      group_data = that.data.group_data
    if (sub_group_list.length != 0 && group_data.length != 0)
      return
    request('post', 'get_forum.php', {
      token: wx.getStorageSync("token"),
    }).then((res) => {
      var resp_dict = res.data;
      var group_list = [];
      for (var i = 0; i < resp_dict.length; i++) {
        var group = resp_dict[i]
        var group_name = group.name;
        group_list.push(group_name);
      };
      var sub_group_list = [];
      var fid = 0;

      if (resp_dict.length > 0) {
        for (var i = 0; i < resp_dict[0].sub_group.length; i++) {
          sub_group_list.push(resp_dict[0].sub_group[i].name);
        }
        if (resp_dict[0].sub_group.length > 0 && !that.data.fid) {
          fid = resp_dict[0].sub_group[0].fid;
        }else{
          fid = that.data.fid
        }
      }
      that.setData({
        group_list: group_list,
        group_index: 0,
        sub_group_list: sub_group_list,
        sub_group_index: 0,
        fid: fid,
        group_data: resp_dict
      })
    })
  },
  // 标题
  inputTitle: function(e) {
    
    wx.setStorage({
      key: 'articleTitle',
      data: e.detail.value
    })
    this.setData({
      articleTitle: e.detail.value
    })
  },
  // 选择模块
  subGroupChange: function(e) {
    const that = this
    let group_data = that.data.group_data,
      group_index = that.data.group_index,
      sub_group_index = e.detail.value,
      fid = group_data[group_index].sub_group[sub_group_index].fid
    that.setData({
      sub_group_index: sub_group_index,
      fid: fid
    });
  },
  typeChange: function(e) {
    let type = e.currentTarget.dataset.type
    this.setData({
      type: type
    })
  },
  // 内容
  inputContent: function(e) {
    const that = this
    let idx = e.currentTarget.dataset.idx,
      text = e.detail.value
    that.setData({
      ["articleContent[" + idx + "].text"]: text
    })
    wx.setStorage({
      key: 'articleContent',
      data: that.data.articleContent
    })
  },
  // 设置封面
  setFm: function(e, index) {
    const that = this
    let idx = that.data.chanegImgIdx
    if (index != null && index != undefined && index != '') {
      idx = index
    }
    const isfm = that.data.chanegImgIsfm
    const articleContent = that.data.articleContent

    // 取消封面
    if (isfm != '' && isfm != undefined && isfm != null) {
      that.setData({
        ["articleContent[" + idx + "].isfm"]: false,
        chanegImgIsfm: false
      })
    } else {
      that.setData({
        ["articleContent[" + idx + "].isfm"]: true,
        chanegImgIsfm: true
      })
      for (var i = 0; i < articleContent.length; i++) {
        if (i != idx) {
          that.setData({
            ["articleContent[" + i + "].isfm"]: false,
          })
        }
      }
    }

  },
  hideChanegBox: function() {
    const that = this
    const navbarData = that.data.navbarData
    delete navbarData.hideBack
    that.setData({
      showChanegBox: false,
      navbarData: navbarData
    })
  },
  addTextarea: function(e) {
    const that = this
    const articleItem = {
      text: '',
      showTextBox: true,
      url: '',
      code: '',
      aid: '',
      type: '',
      file_url: '',
      isfm: false
    }
    const newArticleContent = that.data.articleContent
    newArticleContent.push(articleItem)
    that.setData({
      articleContent: newArticleContent
    })
  },
  delItem: function(e) {
    const that = this
    wx.showModal({
      title: '提示',
      content: '确定是删除该模块？',
      success: function(res) {
        if (res.confirm) {
          const idx = e.currentTarget.dataset.idx
          const articleContent = that.data.articleContent
          const isfm = articleContent[idx].isfm
          if (idx < articleContent.length && articleContent.length > 1) {
            articleContent.splice(idx, 1);
          }
          wx.setStorageSync('articleContent', articleContent)
          that.setData({
            articleContent: articleContent
          })
          if (isfm) {
            that.setData({
              chanegImgIsfm: false //如果删除的是封面
            })
          }
        } else {
          return
        }
      }
    })
  },
  editText: function(e) {
    const that = this
    const idx = e.currentTarget.dataset.idx
    that.setData({
      ["articleContent[" + idx + "].showTextBox"]: true,
    });
  },
  delText: function(e) {
    const that = this
    const idx = e.currentTarget.dataset.idx
    that.setData({
      ["articleContent[" + idx + "].text"]: '',
      ["articleContent[" + idx + "].showTextBox"]: false,
    });
  },
  
  orderItem: function(e) {
    const that = this
    const idx = e.currentTarget.dataset.idx
    const orderType = e.currentTarget.dataset.order
    const articleContent = that.data.articleContent
    const newArticleContent = that.data.articleContent
    const itemContent = articleContent[idx]
    if (orderType == 'up') {
      if (idx > 0) {
        newArticleContent.splice(idx, 1);
        newArticleContent.splice(parseInt(idx) - 1, 0, itemContent);
      } else {
        return
      }
    } else {
      if (idx < articleContent.length) {
        newArticleContent.splice(idx, 1);
        newArticleContent.splice(parseInt(idx) + 1, 0, itemContent);
      } else {
        return
      }
    }
    wx.setStorageSync('articleContent', articleContent)
    that.setData({
      articleContent: newArticleContent
    })
  },
  chanegImg: function(e) {
    const that = this
    const idx = e.currentTarget.dataset.idx
    const isfm = e.currentTarget.dataset.isfm
    const url = e.currentTarget.dataset.url
    const navbarData = that.data.navbarData
    navbarData.hideBack = 1
    that.setData({
      showChanegBox: true,
      chanegImgIdx: idx,
      chanegImgIsfm: isfm,
      chanegImgUrl: url,
      navbarData: navbarData
    })
  },
  reselectionImg: function(e) {
    const that = this
    const idx = that.data.chanegImgIdx
    that.chooseImage(e, idx)
  },
  chooseImage: function(e, idx) {
    const that = this
    const newArticleContent = that.data.articleContent
    const sefmIdx = newArticleContent.length
    let count = 9
    if (idx == null || idx == undefined || idx == '') {
      count = 9
    } else {
      count = 1
    }
    that.setData({
      showE: 1,
    })
    wx.chooseImage({
      count: count,
      success: function(res) {
        const tempFilePaths = res.tempFilePaths
        for (var i = 0; i < tempFilePaths.length; i++) {
          that.setData({
            loading_hidden: false,
            loading_msg: '加载中...',
          })
          var localFilePath = tempFilePaths[i]
          const uploadTask = wx.uploadFile({
            url: app.globalData.svr_url + 'add_image.php', 
            filePath: localFilePath,
            name: 'myfile',
            method: 'POST',
            formData: {
              token: wx.getStorageSync("token"),
            },
            success: function(resp) {
              var resp_dict = JSON.parse(resp.data)
              if (resp_dict.err_code == 0) {
                const aid = resp_dict.data.aid
                const code = resp_dict.data.code
                const url = resp_dict.data.read_file_url
                const file_url = resp_dict.data.file_url
                if (idx != null && idx != undefined && idx != '') {
                  that.setData({
                    ['articleContent[' + idx + '].url']: url,
                    ['articleContent[' + idx + '].code']: code,
                    ['articleContent[' + idx + '].aid']: aid,
                    ['articleContent[' + idx + '].file_url']: file_url,
                    chanegImgUrl: url,
                    loading_hidden: true,
                  })
                } else {
                  if (url != null && url != undefined && url != '') {
                    const creatItem = {
                      text: '',
                      showTextBox: false,
                      url: url,
                      code: code,
                      aid: aid,
                      type: 'image',
                      file_url: file_url,
                      isfm: false
                    }
                    newArticleContent.push(creatItem)
                    wx.setStorageSync('articleContent', newArticleContent)
                    that.setData({
                      showE: 0,
                      articleContent: newArticleContent
                    })
                  }
                  that.setData({
                    loading_hidden: true,
                  })
                }
                const hasfm = that.data.chanegImgIsfm
                if (hasfm == '' || hasfm == false) {
                  that.setFm(e, sefmIdx)
                }
              } else {
                getApp().showSvrErrModal(resp);
                // app.showErrModal('上传失败，请重新上传');
                that.setData({
                  showProgress: false,
                  showE: 0,
                  loading_hidden: true,
                })
                // uploadTask.abort()
              }
            },
            fail: function(resp) {
              app.showErrModal('上传失败，请重新上传');
              that.setData({
                showProgress: false,
                loading_hidden: true,
              })
            }
          })
        }

      },
      fail: function() {
        that.setData({
          showProgress: false,
          showE: 0,
          loading_hidden: true,
        })
      }
    })
  },
  chooseVedio: function(e) {
    const that = this
    const newArticleContent = that.data.articleContent
    that.setData({
      showE: 1,
      showProgress: true,
    })
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 30, 
      camera: 'back',
      success: function(res) {
        var tempFilePath = res.tempFilePath
        var tmpImageList = that.data.imageList
        var tmpAidList = that.data.aidList

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

              const aid = resp_dict.data.aid
              const code = resp_dict.data.code
              const url = resp_dict.data.read_file_url
              const creatItem = {
                text: '',
                showTextBox: false,
                url: url,
                code: code,
                aid: aid,
                type: 'video',
                file_url: '',
                isfm: false
              }
              newArticleContent.push(creatItem)
              wx.setStorageSync('articleContent', newArticleContent)
              that.setData({
                articleContent: newArticleContent,
                loading_hidden: true,
                showE: 0,
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
              showE: 0,
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
              progress: res.progress
            })
          }
        })
      },
      fail: function() {
        that.setData({
          showProgress: false,
          showE: 0,
          loading_hidden: true,
        })
      }
    })
  },
  articleSubmit: function() {
    var that = this;
    var hasLogin = wx.getStorageSync("has_login")
    that.articleSubmitFun();
  },
  articleSubmitFun: function() {
    var that = this;

    var articleTitle = that.data.articleTitle;
    articleTitle = myTrim(articleTitle)
    if (articleTitle == null || articleTitle == undefined || articleTitle == '') {
      app.showErrModal('标题不能为空');
      that.setData({
        articleTitle: '',
      })
      return;
    }
    let message = ''
    let aidList = ''
    let file_url = ''
    let textboxStr = ''
    let attachmentArr = [] //判断帖子中是否有 图片2 -> 视屏1 -> 什么都没有就0
    const articleContent = that.data.articleContent
    for (var i = 0; i < articleContent.length; i++) {

      const code = '\n' + articleContent[i].code
      let articleContentText = '[align=center]' + articleContent[i].text + '[/align]'
      let text = myTrim(articleContentText) + '\n'

      if (articleContent[i].aid) {
        aidList += articleContent[i].aid + ','

        text = articleContent[i].code //有图片时不用把text拼接到message里

        if (articleContent[i].text) { //处理图片描述
          textboxStr += articleContent[i].aid + '&&&'
          textboxStr += articleContent[i].text + '|||'
        }
        if (articleContent[i].type == 'image') {
          attachmentArr.push(2)
        } else if (articleContent[i].type == 'video') {
          attachmentArr.push(1)
        }
      }
      if (articleContent[i].isfm) {
        file_url = articleContent[i].file_url
      }
      message += text
    }

    setTimeout(() => {
      aidList = aidList.substring(0, aidList.length - 1)

      textboxStr = textboxStr.substring(0, textboxStr.length - 3).toString()

      if (message == null || message == undefined || message == '') {
        app.showErrModal('内容不能为空');
        that.setData({
          articleContent: [{
            text: '',
            showTextBox: true,
            url: '',
            code: '',
            aid: '',
            type: '',
            file_url: '',
            isfm: false
          }]
        })
        return;
      }
      let attachment = 0
      if (attachmentArr.indexOf(2) > -1) {
        attachment = 2
      } else if (attachmentArr.indexOf(1) > -1) {
        attachment = 1
      }
      that.setData({
        loading_hidden: false,
        loading_msg: '上传中...'
      })
      let fid = that.data.fid
      let type = that.data.type
      const post_type = that.data.post_type
      if (post_type == 2) {
        type = ''
      }
  
      request('post', 'add_thread.php', {
        token: wx.getStorageSync("token"),
        fid: fid,
        subject: that.data.articleTitle,
        message: message,
        aid_list: aidList,
        type: type,
        is_cover: file_url,
        aid_description_arr: textboxStr,
        attachment: attachment //
      }).then((res) => {
        wx.removeStorageSync('articleTitle')
        wx.removeStorageSync('articleContent')
        wx.showToast({
          title: res.data.credits ? '成功，电量+' + res.data.credits : '发帖成功！',
          icon: 'success',
          duration: 2000,
          success(){
            const tid = res.data.tid
            that.setData({
              articleTitle: '',
              group_index: 0,
              articleContent: [{
                text: '',
                showTextBox: true,
                url: '',
                code: '',
                aid: '',
                type: '',
                file_url: '',
                isfm: false
              }],
              showE: 0,
              loading_msg: '上传完毕...',
              loading_hidden: true,
            })
            setTimeout(()=>{
              wx.navigateTo({
                url: '/pages/detail/detail?tid=' + tid,
              })
            },1500)
           
          }
        })
        

      })
    }, 20)
  },

  onShareAppMessage: function(res) {
    var that = this
    return {
      title: app.globalData.shareTitle,
      path: '/pages/index/index?shareName=add_article&root=question'
    }
  }
})