//引用es7异步语法文件
const regeneratorRuntime = require('../../utils/runtime.js')
const app = getApp()
Page({
  data: {
    logo: '',
    name: '',
    is_login: true,
    angle: 0,
  },
  //首次点击允许获取用户信息并且授权
  bindgetuserinfo: function(event) {
    const userInfo = event.detail.userInfo
    // 允许授权
    if (userInfo) {
      app.globalData.userInfo = userInfo
      console.log("授权登陆成功", app.globalData.userInfo)
      this.setData({
        userInfo: app.globalData.userInfo,
        finish: true,
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请授权登陆',
      })
    }
  },
  //是否显示登录授权框
  showlogin: function(ishouw, times = 1500) {
    var that = this;
    setTimeout(function() {
      that.setData({
        is_login: ishouw
      })
    }, times)
  },
  async onShow() {
    //检验是否授权登陆
    let isLogin = await app._checkLogin();
    console.log("启动页授权登陆成功", isLogin, app.globalData.userInfo)
    if (isLogin) {
      this.setData({
        userInfo: app.globalData.userInfo,
        finish: true,
      })
    }

  },
  goSign: function() {
    wx.reLaunch({
      url: '/pages/qiandao/qiandao'
    })
  }

})