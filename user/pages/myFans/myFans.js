var app = getApp()
import {request} from '../../../utils/util.js'

Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    scrollTop: '',
    have_data: false,
    nomore_data: false,
    type:1,//2我关注的 1关注我的

    followList:[],
    page_size: 10,
    page_index: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '我的粉丝', //导航栏 中间的标题
    }
  }, 
 
  onLoad: function (options) {
    var uid = options.uid;
    this.setData({
      uid: uid,
      // uid: 1,
    })
  },
  onShow: function (){
    this.reloadIndex();  
  },
  onReachBottom: function () {
    const that = this;
    const page_size = that.data.page_size;
    const page_index = that.data.page_index + 1;
    const type = that.data.type;
    if(that.data.nomore_data == true){
      return
    }  
    request('post','get_follow.php',{
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      type:type
    }).then((res)=>{
      let tmpFollowList = that.data.followList;
      let respFollowList = res.data.follow_data;
      let newFollowList = tmpFollowList.concat(respFollowList)
      that.setData({
        followList: newFollowList,
        page_index: page_index,
        have_data: respFollowList.length <= 0 ? false:true,
        nomore_data: respFollowList.length > 0 ? false:true,
      })
    });
  },

  reloadIndex: function() {
    const that = this;
    const page_size = that.data.page_size;
    const page_index = that.data.page_index;
    const type = that.data.type;
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
    request('post','get_follow.php',{
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      type:type
    }).then((res)=>{
      that.setData({
        followList: res.data.follow_data,
        page_index: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕...',
      })
    });
  },

  // 点击关注
  followBtn: function(e) {
    var that = this
    var uid = e.currentTarget.dataset.uid
    request('post','add_follow.php',{
      token: wx.getStorageSync("token"),
      followuid:uid,
    }).then((r)=>{
      wx.showToast({
        title: '关注成功',
        icon: 'success',
      })
      that.reloadIndex();       
    })  
  },
  toUserDetail: function (e) {
    app.toUserDetail(e)
  },
  /* 下拉刷新 */
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh');
    this.reloadIndex();
    wx.stopPullDownRefresh();
  },

  /* 返回顶 */
  onPageScroll: function (e) {
    const that = this
    let eScrollTop = e.scrollTop
    let dataScrollTop = that.data.scrollTop
    if (e.scrollTop >= 600 && dataScrollTop < 600) {
      this.setData({
        scrollTop: eScrollTop
      })
    } else if (eScrollTop < 600 && dataScrollTop >= 600) {
      this.setData({
        scrollTop: eScrollTop
      })
    }
  },

})
