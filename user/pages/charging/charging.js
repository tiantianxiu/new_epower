var amapFile = require('../../../resources/js/amap-wx.js');
var config =  require('../../../resources/js/config.js');
var app = getApp()


var markersData = [];
Page({
  data: {
    markers: [],
    latitude: '',
    longitude: '',
    textData: {},
    city: '',
    brands: ['全部', '特斯拉', '宝马', '比亚迪', '普天新能源'],
    ways: ['驾车', '走路'],
    wayIndex: 0,
    brandIndex: 0,
    polyline: [],
    which: -1,
    distance: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '充电桩', //导航栏 中间的标题
    }
  },
  makertap: function(e) {
    if(e){
      var id = e.markerId;
    }else{
      var id = 0
    }
    var that = this;
    this.data.which = id;
    that.showMarkerInfo(markersData,id);
    that.changeMarkerColor(markersData,id);
    this.setRoute(markersData[id]);
  },
  setRoute(destination){
    var key = config.Config.key;
    var that = this;
    var myAmapFun = new amapFile.AMapWX({ key: key });
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        let routeStr = that.data.wayIndex == 0 ? 'getDrivingRoute' : 'getWalkingRoute';
        myAmapFun[routeStr]({
          origin: res.longitude+','+res.latitude,
          destination: destination.longitude + ',' + destination.latitude,
          success: function(data){
            var points = [];
            if (data.paths && data.paths[0] && data.paths[0].steps) {
              var steps = data.paths[0].steps;
              
              for (var i = 0; i < steps.length; i++) {
                var poLen = steps[i].polyline.split(';');
                for (var j = 0; j < poLen.length; j++) {
                  points.push({
                    longitude: parseFloat(poLen[j].split(',')[0]),
                    latitude: parseFloat(poLen[j].split(',')[1])
                  })
                }
              }
            }
            that.setData({
              distance: data.paths[0].distance > 1000 ? data.paths[0].distance / 1000 + '公里' : data.paths[0].distance + '米',
              polyline: [{
                points: points,
                color: "#0091ff",
                width: 6
              }]
            });
          },
          fail: function(){}
        });
      }
    })
  },
  onLoad: function(e) {
    var that = this;
    var key = config.Config.key;
    var myAmapFun = new amapFile.AMapWX({key: key});
    var params = {
      iconPathSelected: 'http://cdn.e-power.vip/resources/image/mapicon/marker_checked.png',
      iconPath: 'http://cdn.e-power.vip/resources/image/mapicon/marker.png',
      success: function(data){
        markersData = data.markers;
        var poisData = data.poisData;
        var markers_new = [];
        markersData.forEach(function(item,index){
          markers_new.push({
            id: item.id,
            latitude: item.latitude,
            longitude: item.longitude,
            iconPath: item.iconPath,
            width: item.width,
            height: item.height
          })

        })
        if(markersData.length > 0){
          that.setData({
            markers: markers_new
          });
          that.setData({
            city: poisData[0].cityname || ''
          });
          that.setData({
            latitude: markersData[0].latitude
          });
          that.setData({
            longitude: markersData[0].longitude
          });

          that.showMarkerInfo(markersData,0);
          that.makertap();          
        }else{

          wx.getLocation({
            // type: 'gcj02',
            type: 'gcj02',
            success: function(res) {
              that.setData({
                latitude: res.latitude
              });
              that.setData({
                longitude: res.longitude
              });
              that.setData({
                city: '北京市'
              });
            },
            fail: function(){
              that.setData({
                latitude: 39.909729
              });
              that.setData({
                longitude: 116.398419
              });
              that.setData({
                city: '北京市'
              });
            }
          })
          that.setData({
            textData: {
              name: '抱歉，未找到结果',
              desc: ''
            }
          });
          wx.showModal({
            title: '提示',
            content: '定位服务未开启，如需定位请进入系统【设置】里允许微信使用定位服务',
            showCancel:false,
            confirmText:'知道了'
          })
        }
        
      },
      fail: function(info){
        app.getPermission(that);    //传入that值可以在app.js页面直接设置内容   
        // wx.showModal({title:info.errMsg})
      }
    }
    if(e && e.keywords){
      params.querykeywords = e.keywords;
    }
    params.querytypes = '011100';
    myAmapFun.getPoiAround(params)
  },
  bindInput: function(e){
    var that = this;
    var url = '../inputtips/input';
    if(e.target.dataset.latitude && e.target.dataset.longitude && e.target.dataset.city){
      var dataset = e.target.dataset;
      url = url + '?lonlat=' + dataset.longitude + ',' + dataset.latitude + '&city=' + dataset.city;
    }
    wx.redirectTo({
      url: url
    })
  },
  showMarkerInfo: function(data,i){
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  changeMarkerColor: function(data,i){
    var that = this;
    var markers = [];
    for(var j = 0; j < data.length; j++){
      if(j==i){
        data[j].iconPath = "http://cdn.e-power.vip/resources/image/mapicon/marker_checked.png";
      }else{
        data[j].iconPath = "http://cdn.e-power.vip/resources/image/mapicon/marker.png";
      }
      markers.push({
        id: data[j].id,
        latitude: data[j].latitude,
        longitude: data[j].longitude,
        iconPath: data[j].iconPath,
        width: data[j].width,
        height: data[j].height
      })
    }
    
    that.setData({
      markers: markers
    });
  },
  bindPickerChange(e){
    // let brand = this.data.brands[e.detail.value];
    this.setData({
      brandIndex: e.detail.value,
      polyline: []
    });
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    this.getPoiByBrand(e.detail.value);
  },
  bindRoutePickerChange(e){
    this.setData({
      wayIndex: e.detail.value
    });
    if(this.data.which != -1){
      this.setRoute(this.data.markers[this.data.which]);
    }
  },
  getPoiByBrand(brandIndex){
    var that = this;
    var key = config.Config.key;
    var myAmapFun = new amapFile.AMapWX({ key: key });
    if(brandIndex == 0){
      this.onLoad();
      wx.hideLoading();
      return;
    }
    myAmapFun.getRegeo({
      success: function (data) {
        //成功回调
        let addrData = data[0];
        let query = {
          query_type: 'TQUERY',
          pagesize: 20,
          pagenum: 1,
          qii: true,
          cluster_state: 5,
          need_utd: true,
          utd_sceneid: 1000,
          div: 'PC1000',
          addr_poi_merge: true,
          is_classify: true,
          zoom: 14,
          city: parseInt(addrData.regeocodeData.addressComponent.adcode/10)*10,
          // geoobj: '113.82917|22.555441|113.952815|22.585492',
          classify_data: 'query_type=TQUERY%2Bcategory=011100;custom=brand_charge:' + that.data.brands[brandIndex],
          user_loc: addrData.longitude + ',' + addrData.latitude,
          keywords: '充电站'
        };
        let queryStr = that.queryStringify(query);
        wx.request({
          url: 'https://www.amap.com/service/poiInfo?'+queryStr,
          success: function(res){
            if(res.data.status != 1){
              wx.showModal({
                title: '提示',
                content: '网络错误，请重试！'
              });
              wx.hideLoading();
              return;
            }
            markersData = res.data.data.poi_list;
            var markers_new = [];
            markersData.forEach(function (item, index) {
              item.id = index;
              item.width = 22;
              item.height = 32;
              item.iconPath = index == 0 ? 'http://cdn.e-power.vip/resources/image/mapicon/marker_checked.png' : 'http://cdn.e-power.vip/resources/image/mapicon/marker.png';
              let marker = {
                id: index,
                latitude: item.latitude,
                longitude: item.longitude,
                iconPath: item.iconPath,
                width: item.width,
                height: item.height
              };
          
              markers_new.push(marker);

            })
            if (markersData.length > 0) {
              that.setData({
                markers: markers_new
              });
              that.setData({
                city: markersData[0].cityname || ''
              });
              that.setData({
                latitude: markersData[0].latitude
              });
              that.setData({
                longitude: markersData[0].longitude
              });
              that.showMarkerInfo(markersData, 0);
            } else {
              wx.getLocation({
                // type: 'gcj02',
                type: 'gcj02',
                success: function (res) {
                  that.setData({
                    latitude: res.latitude
                  });
                  that.setData({
                    longitude: res.longitude
                  });
                  that.setData({
                    city: '北京市'
                  });
                },
                fail: function () {
                  that.setData({
                    latitude: 39.909729
                  });
                  that.setData({
                    longitude: 116.398419
                  });
                  that.setData({
                    city: '北京市'
                  });
                }
              })

              that.setData({
                textData: {
                  name: '抱歉，未找到结果',
                  desc: ''
                }
              });
            }
            wx.hideLoading();
          },
          fail: function(err){
            
            wx.hideLoading();
          }
        })
      },
      fail: function (info) {
        //失败回调
        console.log(info)
      }
    })
  },
  openLocation(){
    if(this.data.polyline.length == 0){
      return;
    }
    let location = this.data.markers[this.data.which];
    wx.openLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      scale: 28
    });
  },
  queryStringify(o){
    let arr = [];
    Object.keys(o).forEach(function(item){
      arr.push(item + '=' + o[item]);
    });
    return arr.join('&');
  },
  onShareAppMessage: function (res) {
    const that = this
    return {
      title: that.data.thread_data.subject,
      path: '/pages/index/index?shareName=charging&root=user'
    }
  },

})