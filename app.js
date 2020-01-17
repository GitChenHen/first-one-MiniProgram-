//app.js
App({
  globalData: {
    userInfo: null
  },
  onLaunch: function() {
    //云开发环境初始化
    wx.cloud.init({
      env: 'wx1f8aeff1a0470b0e-onn1u'
    })
  },
  // 检测是否授权
  _checkLogin() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          console.log(res)
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                this.globalData.userInfo = res.userInfo
                console.log("获取用户信息成功", this.globalData.userInfo)
                resolve(true)
              }
            })
          } else {
            console.log("未授权")
            resolve(false)
            // this.setData({
            //   modalShow: true,
            // })
          }
        }
      })
    })

  },

  /**
   * 小程序隐藏事件
   */
  onHide() {
    
  },

  /**
   * 小程序错误事件
   */
  onError() {
    
  }
})