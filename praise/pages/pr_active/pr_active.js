 const app = getApp()
 import {
   request
 } from '../../../utils/util.js'
 Page({

   /**
    * 页面的初始数据
    */
   data: {
     loading_hidden: true,
     loading_msg: '加载中...',
     invitation: [], //被邀请人
     get_invitation: 0, //是否发过认证车型口碑
     invitation_code: '', //邀请码
     heightMt: app.globalData.heightMt + 20 * 2,
     navbarData: {
       showCapsule: 1, //是否显示左上角图标,
       hideShare: 1,
       title: '口碑活动', //导航栏 中间的标题
     }
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
     const that = this
     this.setData({
       loading_hidden: false,
       loading_msg: '加载中...'
     });
     that.reloadIndex()
   },

   reloadIndex: function() {
     const that = this
     that.setData({
       hasLogin: wx.getStorageSync("has_login")
     })
     if (that.data.hasLogin == 1) {
       app.getUserInfo().then((res) => {
        //  let invitations = [{
        //    author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline:'12-01'
        //  }, { author: 'llllpppppppppppppppppppllllllllddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01'},
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' },
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' },
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' },
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' },
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' },
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' },
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' },
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' },
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' },
        //    { author: 'ddddd', car_2: '宝马', car_3: '跃进', dateline: '12-01' }]
         let invitations = res.invitation

         let invitation = []
         for (let i in invitations){
           invitation.push(invitations[i])
           if(i>=9)
            break
         }  
         that.setData({
           loading_hidden: true,
           loading_msg: '加载成功',
           invitation_code: res.invitation_code, //邀请码
           invitation: invitation, //被邀请人
           get_invitation: res.get_invitation //是否发过认证车型
         })
       });
     }
   },

   getCode: function() {
     const that = this
     this.setData({
       loading_hidden: false,
       loading_msg: '加载中...'
     });
     request('post', 'get_code.php', {
       token: wx.getStorageSync("token")
     }).then((res) => {
       if (res.err_code != 0)
         return
       if (res.data.status == -1) {
         that.setData({
           loading_hidden: true
         })
         wx.showModal({
           title: '提示',
           content: res.data.msg,
           showCancel: false,
           success(){
             wx.navigateTo({
               url: '../praise_appear/praise_appear',
             })
           }
         })
         return
       }
       that.setData({
         loading_hidden: true,
         loading_msg: '获取成功！',
         invitation_code: res.data.invitation_code
       })

     })
   },
   setClipboard: function() {
     console.log(this.data)
     wx.setClipboardData({
       data: this.data.invitation_code + '',
       success(res) {
         wx.showToast({
           title: '复制成功'
         })
       }
     })
   },
   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function() {

   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function() {

   },

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function() {

   },

 })