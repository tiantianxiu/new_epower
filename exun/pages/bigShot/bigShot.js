var app = getApp()
import {request} from '../../../utils/util.js'
Page({
    data: {
        loading_hidden: true,
        loading_msg: '加载中...',
        rankList:'',
        type:1, //1：媒体推荐号 2：大咖排行榜
      heightMt: app.globalData.heightMt + 20 * 2,
      navbarData: {
        showCapsule: 1, //是否显示左上角图标,
        hideShare: 1,
        title: '大咖媒体号推荐', //导航栏 中间的标题
      },
    },
    onLoad: function (options) {
        this.reloadIndex()
    },
    onShow: function (options) {
        
    },
    reloadIndex: function() {
    	const that = this;
    	that.getEinfoRanklist()
    },
    getEinfoRanklist: function () {
    	const that = this;
	      that.setData({
	        loading_hidden: false,
	        loading_msg: '加载中...',
	      })    	
    	request('post','get_einfo_ranklist.php',{
	      token: wx.getStorageSync("token"),
	      type:that.data.type
	    }).then((res)=>{
	      that.setData({
	        rankList: res.data.rank_data,
	        loading_hidden: true,
	        loading_msg: '加载完毕',
	      })
	    });
    },
    toEList: function (e){
      var fid = e.currentTarget.dataset.fid
    	wx.navigateTo({
        url: `/exun/pages/eList/eList?fid=${fid}`
	    })
    }
})
