var app = getApp()
import {
  request,
  uploadFile
} from '../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: true,
    loading_msg: '提交中...',
    video: '',
    image_list: [],
    aid_list: [],
    type: 0, //视频1 图片2 文字0
    progress: 0,
    pic: 0,
    
    pic_text: '',
    showProgress: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1, //隐藏分享键
      title: '发表', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    if (options.type)
      that.setData({
        type: options.type
      })
    if (options.typeid) {
      that.setData({
        typeid: options.typeid
      })
    } 
    that.getsClass() 
  },
  // get_square_class.php
  getsClass: function(){
    const that = this
    request('post', 'get_square_class.php', {
      token: wx.getStorageSync('token')
    }).then((res)=>{
      if(res.err_code != 0)
        return
      let thread = res.data.threadclass  
      that.setData({
        thread: thread
      })
      let typeid = that.data.typeid
      if (typeid) 
        for (let i in thread) {
          if(typeid == thread[i].typeid){
            that.setData({
              pic_text: thread[i].name
            })
          }
        }
    })
  },
  
  addPic: function(e){
    const that = this
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    that.setData({
      typeid: id == that.data.typeid ? 0 : id,
      pic_text: id == that.data.typeid ? '' : name
    })
  },
  imageTap: function() {
    const that = this
    let image_list = that.data.image_list
    let aid_list = that.data.aid_list
    wx.chooseImage({
      count: 9 - image_list.length,
      success(res) {
        let paths = res.tempFilePaths

        for (let i in paths) {

          uploadFile('post', 'add_image.php', paths[i], 'myfile', {
            token: wx.getStorageSync("token")
          }).then((re) => {
            if (re.err_code != 0)
              return
            let data = re.data
            image_list.push(data.read_file_url)
            aid_list.push(data.aid)
            that.setData({
              aid_list: aid_list,
              image_list: image_list
            })
          })
        }
      }
    })
  },

  videoTap: function() {
    const that = this
    let aid_list = []
    let video = ''
  
    wx.chooseVideo({
      maxDuration: 20,
      success(res) {
       
        let path = res.tempFilePath
        let v_height = res.height
        let v_width = res.width
        const uploadTask = wx.uploadFile({
          url: app.globalData.svr_url + 'add_video.php',
          filePath: path,
          name: 'myfile',
          method: 'POST',
          formData: {
            token: wx.getStorageSync("token"),
          },
          success: function(resp) {
            var resp_dict = JSON.parse(resp.data)
            if (resp_dict.err_code == 0) {

              let code = resp_dict.data.code
              let url = resp_dict.data.read_file_url
              aid_list.push(resp_dict.data.aid)
            
              that.setData({
                aid_list: aid_list,
                video: url,
                v_height: v_height,
                v_width: v_width,
                loading_hidden: true
              })
            } else {
              app.showErrModal('上传失败，请重新上传');
              that.setData({
                loading_hidden: true
              })
              uploadTask.abort()
            }
          },
          fail: function(resp) {
            app.showErrModal('上传失败，请重新上传');
            that.setData({
              loading_hidden: true,
              showE: 0,
            })
            uploadTask.abort()
          }
        })

        uploadTask.onProgressUpdate((res) => {
          if (res.progress == 100) {
            that.setData({
              loading_hidden: true
            })
          } else{
            that.setData({
              loading_hidden: false
            })
          }
        })

      }
    })
  },
  videoMinusTap: function() {
    const that = this
    that.setData({
      video: '',
      aid_list: []
    })
  },
  //latitude 纬度  longitude 经度
  localTap: function() {
    const that = this
    wx.chooseLocation({
      success: function(res) {
        that.chooseLocation(res)
      },
      fail: function() {
        wx.getSetting({
          success: function(res) {
            var statu = res.authSetting;
            if (!statu['scope.userLocation']) {
              wx.showModal({
                title: '是否授权当前位置',
                content: '获得您当前发帖位置',
                success: function(tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: function(data) {
                        if (data.authSetting["scope.userLocation"] === true) {
                          //授权成功之后，再调用chooseLocation选择地方
                          wx.chooseLocation({
                            success: function(res) {
                              that.chooseLocation(res)
                            }
                          })
                        } else {
                          wx.showToast({
                            title: '授权失败',
                            icon: 'success',
                            duration: 1000
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          },
          fail: function(res) {
            wx.showToast({
              title: '调用授权窗口失败',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  },
  chooseLocation: function(res) {
    const that = this
    if (!res.address) {
      that.setData({
        address: '',
        latitude: '',
        longitude: ''
      })
      return
    }
    that.setData({
      address: res.name,
      latitude: res.latitude,
      longitude: res.longitude
    })
  },
  //   message	是	string	内容
  // attachment	是	int	附件类型012 如果为0，下面2个参数不用传
  // aid_list	否	string	附件
  // address	否	string	地址名称
  // longitude	否	string	经度
  // latitude	否	string	纬度
  inputContent: function(e) {
    const that = this
    let message = e.detail.value
    that.setData({
      message: message
    })
  },
  addSquare: function() {
    const that = this
    that.setData({
      loading_hidden: false
    })
    let message = that.data.message
    let attachment = 0
    let aid_list_arr = that.data.aid_list,
      aid_list = ''
    let image_list = that.data.image_list
    let video = that.data.video
    let address = that.data.address || ''
    let latitude = that.data.latitude || ''
    let longitude = that.data.longitude || ''
    if (!message) {
      that.setData({
        loading_hidden: true
      })
      wx.showToast({
        title: '需要输入文字内容!',
        icon: 'none'
      })
      return
    }
    if (image_list.length != 0) {
      attachment = 2
    } else if (video) {
      attachment = 1
    }
    if(aid_list_arr.length > 0)
      aid_list = aid_list_arr.join(',')
    
    request('post', 'add_square.php', {
      token: wx.getStorageSync('token'),
      message: message,
      attachment: attachment,
      aid_list: aid_list,
      typeid: that.data.typeid || 0,
      address: address,
      latitude: latitude,
      longitude: longitude
    }).then((res) => {
      that.setData({
        loading_hidden: true
      })
      if (res.err_code != 0)
        return
      wx.reLaunch({
        url: '/pages/square/square'
      })
    })
  },

  imageDel: function(e){
    const that = this
    let index = e.currentTarget.dataset.idx
    let image_list = that.data.image_list
    image_list.splice(index, 1)
    that.setData({
      image_list: image_list
    })
  }
})