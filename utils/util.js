function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function request(method, url, data) {
  const that = this
  const app = getApp()
  return new Promise(function(resolve, reject) {
    wx.request({
      url: getApp().globalData.svr_url + url,
      method: method,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      data: data,
      success: function(res) {
        if (res.data.err_code == 0) {
          resolve(res.data)
          if (url != 'get_token.php') {
            app.globalData.num = 0
          }
        }
        //限制次数大于1，就禁止
        else if (app.globalData.num < 2 && res.data.err_code == 10001 || res.data.err_code == 10003 || res.data.err_code == 10004 || res.data.err_code == 10011) {
          app.globalData.num = app.globalData.num + 1 //限制次数增加
          app.get_token().then((res) => {
            data.token = res.token
            request(method, url, data).then((res) => {
              if (res.err_code == 0) {
                app.globalData.num = 0
                resolve(res)
              } else {
                resolve(res)
                // getApp().showSvrErrModal(res)
              }
            });
          });
        } else if (app.globalData.num >= 2) {
          resolve(res)
        } else {

          resolve(res)
          if (res.data.err_code != 10001)
            app.showSvrErrModal(res)
        }
      },
      fail: function(err) {

        app.showErrModal("请求超时，请检查您的网络！")
          .then(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            })
          })


      }

    })
  })
}

function uploadFile(method, url, filePath, name, formData) {
  const that = this
  return new Promise(function(resolve, reject) {
    const uploadTask = wx.uploadFile({
      url: getApp().globalData.svr_url + url,
      method: method,
      filePath: filePath,
      name: name,
      formData: formData,
      success: function(res) {
        var res = JSON.parse(res.data)

        if (res.err_code == 0) {
          resolve(res)
          if (url != 'get_token.php')
            getApp().globalData.num = 0

        } else if (res.err_code == 10001 && getApp().globalData.num < 2) {
          getApp().globalData.num++ //限制次数增加

            getApp().get_token().then((res) => {
              formData.token = res.token
              uploadFile(method, url, filePath, name, formData).then((res) => {
                if (res.err_code == 0) {
                  resolve(res)
                } else {
                  resolve(res)
                }
              });
            });
        } else {
          getApp().showErrModal(res.err_msg || '上传失败，请重新上传');
          resolve('err')
        }
      },
      fail: function(res) {
        resolve('err')
        getApp().showErrModal('上传失败，请重新上传');
      }
    })

  })
}


// 去除空格
function myTrim(x) {
  return x.replace(/^(\s*)|(\s*)$/g, '');
}


//添加某个class
function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

//判断是否有某个class
function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

//数组中是否存在某个元素
function contains(arr, obj) {
  let i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return i + 1;
    }
  }
  return false;
}
// JS中时间戳转日期格式（YYYY - MM - dd HH: mm: ss）
function uTS(unixtimestamp) {
  var unixtimestamp = new Date(unixtimestamp * 1000);
  var year = 1900 + unixtimestamp.getYear();
  var month = "0" + (unixtimestamp.getMonth() + 1);
  var date = "0" + unixtimestamp.getDate();
  return year + "-" + month.substring(month.length - 2, month.length) + "-" + date.substring(date.length - 2, date.length)
}

// 几个小时前的提示字样
function transformPHPTime(time) {　
  var timestamp = Date.parse(new Date()); //当前时间戳
  var timestime = time * 1000　
  var disparity = timestamp - timestime
  if (disparity < 3600000) {
    if (parseInt(disparity / 60000) == 0)
      return '刚刚'
    return parseInt(disparity / 60000) + '分钟前'
  }
  if (disparity < 86400000) {
    return parseInt(disparity / 3600000) + '小时前'
  }
  var date = new Date(timestime);
  let Y = date.getFullYear() + '-';　　　　
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';　　　　
  let D = date.getDate() + ' ';　　　　
  return Y + M + D
}
// 倒计时
function oldTime(timechage) {
  var oDate = Date.parse(new Date()) /1000
  var timechages = (parseInt(timechage) - oDate) * 1000
  if (timechages <= 0){
    return 0
  }
  var oDates = new Date(timechages)
 
  var oMinutes = oDates.getMinutes();
  //获取秒数
  var oSeconds = oDates.getSeconds();
  //获取分钟
  var oHours = parseInt((parseInt(timechage) - oDate - oMinutes * 60 - oSeconds) / (60 * 60))
  //获取小时

  var b = p(oHours) + ":" + p(oMinutes) + ":" + p(oSeconds);
  return b
}
function p(n) {
  return n < 10 ? '0' + n : n;
}



module.exports = {
  formatTime,
  request,
  addClass,
  hasClass,
  myTrim,
  uploadFile,
  contains,
  uTS,
  transformPHPTime,
  oldTime
}