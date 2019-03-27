//app.js

import {
  request
} from 'utils/util.js'

App({
  onLaunch: function(options) {
    const that = this
    that.windowHeight(options)
    that.wxGetUpdateManager() //立即更新
    if (wx.getStorageSync('token') && wx.getStorageSync('has_login')) {
      setTimeout(() => {
        that.setTabBarBadge()
      })
      return
    }
    that.get_token().then(() => {
      that.setTabBarBadge()
    })
    // 获取token
  },
  // 获取token
  get_token: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      that.get_code().then((code) => {
        request('post', 'get_token.php', {
          code: code,
        }).then((res) => {
          wx.setStorage({
            key: 'token',
            data: res.data.token
          });
          wx.setStorage({
            key: 'has_login',
            data: res.data.has_login
          });
          resolve(res.data)
        })
      })
    })
  },
  get_code: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      wx.login({
        success: function(res) {
          resolve(res.code)
        },
        fail: function() {
          that.showSvrErrModal('do_wx_login_fail')
        }
      });
    })
  },
  wxGetUserInfo: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      wx.getSetting({
        success: function(res) {
          if (res.authSetting['scope.userInfo']) {
            //已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.getUserInfo({
              withCredentials: true,
              success: function(res) {
                var username = res.userInfo.nickName;
                var avatar_url = res.userInfo.avatarUrl;
                var gender = res.userInfo.gender;
                var encryptedData = res.encryptedData;
                var iv = res.iv;
                if (username && avatar_url) {
                  request('POST', 'wx_login.php', {
                    token: wx.getStorageSync("token"),
                    username: username,
                    avatar_url: avatar_url,
                    encryptedData: encryptedData,
                    iv: iv,
                    gender: gender
                  }).then((res) => {
                    if(res.err_code != 0)
                      return
                    wx.setStorage({
                      key: 'token',
                      data: res.data.token,
                    });
                    
                    wx.setStorageSync('has_login', 1)
                    setTimeout(() => {
                      that.getUserInfo().then((res) => {
                        resolve(res)
                      })
                    }, 100)
                  })
                }
              },
              fail: function(res) {
                resolve(res)
                wx.showModal({
                  title: '警告',
                  content: '授权登录后才能和E区新能源车主们一起玩耍哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮',
                })
              }
            })
          }
        },
        fail: function(res) {
          console.log(res)
        }
      })
    })
  },

  getUserInfo: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      request('post', 'get_my_info.php', {
        token: wx.getStorageSync("token"),
      }).then((res) => {
        resolve(res.data)
        wx.setStorage({
          key: 'username',
          data: res.data.username,
        });
      })
    })
  },

  // 判断微信用户是否在论坛登录过
  hasLogin: function() {
    const that = this
    return new Promise(function(resolve, reject) {
      if (wx.getStorageSync("has_login") == 1) {
        that.getUserInfo().then((res) => {
          resolve(res)
        });
      } else {
        that.wxGetUserInfo().then((res) => {
          resolve(res)
        })
      }
    })
  },

  // 是否允许授权
  bindGetUserInfo: function(e) {
    const that = this
    return new Promise(function(resolve, reject) {
      if (e.detail.userInfo != '' && e.detail.userInfo != undefined) {
        setTimeout(() => {
          that.wxGetUserInfo().then((res) => {
            console.log(res)
          })
        }, 100)
        resolve(1)
      } else {
        setTimeout(() => {
          that.wxGetUserInfo().then((res) => {
            console.log(res)
          })
        }, 100)
        resolve(0)
        // console.log('拒绝授权')
      }
    })
  },

  showSvrErrModal: function(resp) {
    if (resp.data.err_code != 0 && resp.data.err_msg) {
      this.showErrModal(resp.data.err_msg);
    } else {
      wx.request({
        url: getApp().globalData.svr_url + 'report_error.php',
        method: 'POST',
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          token: wx.getStorageSync("token"),
          error_log: resp.data,
          svr_url: getApp().globalData.svr_url,
        },
        success: function(resp) {
          console.log(resp);
        }
      })
    }
  },

  showErrModal: function(err_msg) {
    return new Promise(function(resolve, reject) {
      wx.showModal({
        content: err_msg,
        showCancel: false,
        success() {
          resolve(true)
        }
      })
    })
  },

  /* 封装微信缓存 Api */
  putSt: function(k, v, t) {
    wx.setStorageSync(k, v)
    var seconds = parseInt(t);
    if (seconds > 0) {
      var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000 + seconds;
      wx.setStorageSync(k + 'dtime', timestamp + "")
    } else {
      wx.removeStorageSync(k + 'dtime')
    }
  },

  getSt: function(k, def) {
    var deadtime = parseInt(wx.getStorageSync(k + 'dtime'))
    if (deadtime) {
      if (parseInt(deadtime) < Date.parse(new Date()) / 1000) {
        if (def) {
          return def;
        } else {
          return;
        }
      }
    }
    var res = wx.getStorageSync(k);
    if (res) {
      return res;
    } else {
      return def;
    }
  },
 
  setTabBarBadge: function() {
    const that = this
    if (wx.getStorageSync("has_login") == 1) {
      request('post', 'get_my_msg_num.php', {
        token: wx.getStorageSync("token")
      }).then((res) => {
        let msg_status = res.data.msg_status + ''
        if (msg_status != 0) {
          wx.setTabBarBadge({
            index: 4,
            text: msg_status
          })
        } else {
          wx.removeTabBarBadge({
            index: 4,
          })
        }
      })
    }
  },
  wxGetUpdateManager: function() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function() {
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function() {
      // 新版本下载失败
    })
  },
  windowHeight: function(options) {
    var that = this
    // 判断是否由分享进入小程序
    if (options.scene == 1011 || options.scene == 1012 || options.scene == 1013) {
      this.globalData.share = true
    } else {
      this.globalData.share = false
    };

    return new Promise(function(resolve, reject) {
      wx.getSystemInfo({
        success: function(res) {
          if (res.platform == "android")
            that.globalData.is_android = 1
          resolve(res.windowHeight)
          that.globalData.windowHeight = res.windowHeight
          that.globalData.windowWidth = res.windowWidth
          //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
          that.globalData.heightMt = res.statusBarHeight
        }
      })
    })
  },

  //删除
  deleteNormal: function(data, url, isJump) {
    var that = this
    return new Promise(function(resolve, reject) {
      that.showSelModal('确定要删除？', true).then((res) => {
        if (res) {
          request('post', url, data).then((res) => {
            if (res.err_code == 0) {
              if (res.data.status != 1) {
                that.wxShowToast(res.data.message, 1500, 'none')
                return
              }
              that.wxShowToast(res.data.message, 1500, '').then((re) => {
                if (isJump) {
                  setTimeout(() => {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 1500)
                } else {
                  resolve(res.data)
                }
              })
            } else {
              that.wxShowToast(res.data.message)
            }
          })
        }
      })
    })
  },


  //显示消息提示框
  wxShowToast: function(msg, dur, icon) {
    return new Promise(function(resolve, reject) {
      wx.showToast({
        title: msg,
        icon: icon || 'success',
        duration: dur || 1500,
        success(res) {
          resolve(res)
        }
      })
    })
  },
  //判断框
  showSelModal: function(err_msg, bool) {
    return new Promise(function(resolve, reject) {
      wx.showModal({
        content: err_msg,
        showCancel: bool || false,
        success(res) {
          if (res.confirm) {
            resolve(true)
          } else if (res.cancel) {
            resolve(false)
          }
        }
      })
    })
  },
  // 是否被禁言了
  canAddThread: function(e) {
    const that = this
    return new Promise(function(resolve, reject) {
      request('post', 'is_can_add_thread.php', {
        token: wx.getStorageSync("token"),
      }).then((res) => {
        const status = res.data.status
        if (status == 0) {
          const contentText = res.data.msg
          wx.showModal({
            title: '提示',
            content: contentText,
            showCancel: false,
            success(res) {
              if (e)
                return
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          })
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  },
  toUserDetail: function(e) { //跳转到用户界面
    let uid = e.currentTarget.dataset.uid
    wx.navigateTo({
      url: `/user/pages/user_detail/user_detail?id=${uid}`,
    })
  },
  globalData: {
    shareTitle: 'E区-新能源车主社区',
    base_url: 'http://www.e-power.vip/',
    svr_url: 'https://api.mongo123.com/',
    // svr_url: 'https://api.e-power.vip/',
    userInfo: null,
    lite_switch: false,
    windowHeight: '',
    windowWidth: '',
    share: false, //判断是否从分享过来的
    heightMt: 0,
    carType: '',
    num: 0, //限制访问次数 util用到
    is_android: 0
  },
  getToken: {
    num: 0
  },
  // 购买地
  district: {
    id: 0,
    name: ''
  },
  //获取用户地理位置权限
  getPermission: function(obj) {
    wx.chooseLocation({
      success: function(res) {
        obj.setData({
          addr: res.address //调用成功直接设置地址
        })
      },
      fail: function() {
        wx.getSetting({
          success: function(res) {
            var statu = res.authSetting;
            if (!statu['scope.userLocation']) {
              wx.showModal({
                title: '是否授权当前位置',
                content: '获得您当前的位置，以便查询您附近的充电桩',
                success: function(tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: function(data) {
                        if (data.authSetting["scope.userLocation"] === true) {
                          wx.showToast({
                            title: '授权成功',
                            icon: 'success',
                            duration: 1000
                          })
                          //授权成功之后，再调用chooseLocation选择地方
                          wx.chooseLocation({
                            success: function(res) {
                              obj.setData({
                                addr: res.address
                              })
                            },
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
  }
})