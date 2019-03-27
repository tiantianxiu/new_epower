// pages/praise_index/praise_index.js
const app = getApp()
import {
  request,
  starMove
} from '../../../utils/util.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    price: 0,
    shape: 0,
    type: 0,
    page_index: 0,
    page_size: 8,
    reputation_data: [],
    showAuthorization: false,
    now_no_data: '暂无数据',
    now_no_praise: '暂无口碑',
    now_no_sale: '该车型暂未上市',
    recommend_data: [],
    type_in: 0,
    windowHeight: app.globalData.windowHeight,
    toView: 'A',
    text: '',
    search: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '口碑选车', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this

    let price = parseInt(options.item) || 0,
      scrollLeft = price ? 68 * (price - 1) : 0,
      shape = options.shape
    that.setData({
      price: price,
      scrollLeft: scrollLeft,
      shape: shape || 0,
      type_in: shape ? 0 : that.data.type_in
    })
    that.reloadIndex()
  },

  // 口碑或选车
  typetap: function(e) {
    const that = this
    let type_in = e.currentTarget.dataset.type_in
    if (type_in == that.data.type_in)
      return
    that.setData({
      type_in: type_in
    })
    if (that.data.type_in == 1) {
      that.setData({
        price: 0,
        shape: 0,
        type: 0
      })
      if (!that.data.letter) {
        that.getCars()
      }
    }
    if (that.data.type_in == 0) {
      that.getReputation()
    }
  },
  toSet: function(e) {
    const that = this
    let tab = e.currentTarget.dataset.tab,
      set = parseInt(e.currentTarget.dataset.set)
    that.setData({
      [tab]: set,
      page_index: 0,
      type_in: 0
    })
    that.reloadIndex()
  },
  reloadIndex: function() {
    const that = this
    that.setLoding()
    that.getReputation()
    that.setData({
      page_index: 0
    })
  },
  setLoding: function() {
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
  },
  selSearch: function() {
    const that = this
    that.setData({
      search: 1
    })
  },
  cancleSearch: function() {
    const that = this
    that.setData({
      search: 0,
      name: '',
      name_data: []
    })
  },
  searchInput: function(e) {
    const that = this
    let value = e.detail.value
    that.setData({
      name: value
    })
    if (!value) {
      that.setData({
        name_data: []
      })
      return
    }
    that.getName()
  },
  //点击右侧字母导航定位触发
  handlerStart: function(e) {
    const that = this
    let _id = e.target.dataset.id
    that.setData({
      toView: _id,
      text: _id
    })
    setTimeout(() => {
      that.setData({
        text: ''
      })
    }, 600)

  },
  //点击右侧字母导航定位触发
  handlerMove: function(e) {
    const that = this
    const letter = that.data.letter
    let pageY = e.touches[0].pageY

    let idx = Math.floor((pageY - 188) / 18)
    idx = Math.min(letter.length - 1, Math.max(idx, 0))
    if (letter[idx] == that.data.toView)
      return
    console.log(letter[idx])
    that.setData({
      toView: letter[idx],
      text: letter[idx]
    })
    setTimeout(() => {
      that.setData({
        text: ''
      })
    }, 300)
  },
  bindScroll: function(e) {
    const that = this
  },
  getName: function() {
    const that = this
    request('post', 'get_reputation_index.php', {
      name: that.data.name
    }).then((res) => {
      if (res.err_code != 0)
        return
      let reputation_data = res.data.reputation_data
      for (let i in reputation_data) {
        let for_power_consumption = reputation_data[i].power_consumption,
          for_fuel_consumption = reputation_data[i].fuel_consumption
        if (for_power_consumption != 0.0 && for_fuel_consumption == 0.0) {
          reputation_data[i].rmb = parseInt(for_power_consumption * 1.2)
        }
      }
      that.setData({
        name_data: reputation_data
      })
    })
  },
  getCars: function() {
    const that = this
    request('post', 'get_reputation_index.php', {
      type: that.data.type_in
    }).then((res) => {
      if (res.err_code != 0)
        return
      let selection_data = res.data.selection_data
      let letter = []
      for (let i in selection_data) {
        letter.push(i)
      }
      for (let i in selection_data) {

        for (let ii in selection_data[i]) {
          for (let iii in selection_data[i][ii].list) {
            let for_power_consumption = selection_data[i][ii].list[iii].power_consumption,
              for_fuel_consumption = selection_data[i][ii].list[iii].fuel_consumption
            if (for_power_consumption != 0.0 && for_fuel_consumption == 0.0) {
              selection_data[i][ii].list[iii].rmb = parseInt(for_power_consumption * 1.2)
            }
          }
        }

      }
      that.setData({
        letter: letter,
        cars_data: selection_data,
        loading_hidden: true,
        loading_msg: '加载完毕...',
      })
    })
  },
  getReputation: function() {
    const that = this
    let page_size = that.data.page_size,
      page_index = that.data.page_index
    request('post', 'get_reputation_index.php', {
      page_size: page_size,
      page_index: page_index,
      sort: that.data.price + '_' + that.data.shape + '_' + that.data.type,
      type: that.data.type_in
    }).then((res) => {
      if (res.err_code != 0)
        return
      let reputation_data_res = res.data.reputation_data,
        reputation_data_data = that.data.reputation_data,
        reputation_data = page_index == 0 ? reputation_data_res : reputation_data_data.concat(reputation_data_res)

      for (let i in reputation_data) {
        let for_power_consumption = reputation_data[i].power_consumption,
          for_fuel_consumption = reputation_data[i].fuel_consumption
        if (for_power_consumption != 0.0 && for_fuel_consumption == 0.0) {
          reputation_data[i].rmb = parseInt(for_power_consumption * 1.2)
        }
      }

      that.setData({
        reputation_data: reputation_data,
        recommend_data: res.data.recommend_data,
        i: 0,
        loading_hidden: true,
        loading_msg: '加载完毕...',
        have_data: false,
        nomore_data: reputation_data_res.length >= page_size ? false : true
      })

    })
  },
  toDetail: function(e) { //口碑详情
    const that = this
    let car_2 = e.currentTarget.dataset.car_2
    wx.navigateTo({
      url: '../praise_car/praise_car?id=' + car_2,
    })
  },
  toPostDetail: function(e) { //帖子详情
    const that = this
    let tid = e.currentTarget.dataset.tid
    wx.navigateTo({
      url: '/pages/detail/detail?tid=' + tid,
    })
  },
  toPraisePost: function(e) { //更多推荐
    wx.navigateTo({
      url: '../praise_post/praise_post'
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const that = this
    if (that.data.nomore_data || that.data.type_in == 1 || that.data.search)
      return

    that.data.page_index = that.data.page_index + 1
    that.setData({
      have_data: true
    }, that.getReputation())

  },
  showAuthorization: function() {
    const that = this
    that.setData({
      showAuthorization: true
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '口碑首页',
      path: '/pages/index/index?shareName=praise_index&root=praise'
    }
  }
})