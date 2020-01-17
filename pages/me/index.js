// pages/me/index.js
const app = getApp()

var ringChart = null
var lineChart = null
var startPos = null

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: app.globalData.userInfo,
    notesCount: 0
  },
  onShow() {
    wx.cloud.database().collection('biji').count().then(res => {
      console.log("笔记个数", res)
      this.setData({
        notesCount: res.total
      })
    })
    wx.getSetting({
      success: (res) => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              app.globalData.userInfo = res.userInfo
              console.log("个人中心show", app.globalData.userInfo)
              this.setData({
                userInfo: app.globalData.userInfo,
              })
            }
          })
        }
      }
    })

  },
  //授权登陆
  onGotUserInfo(event) {
    console.log(event)
    const userInfo = event.detail.userInfo
    if (userInfo) { // 允许授权
      app.globalData.userInfo = event.detail.userInfo
      console.log("个人中心授权登陆成功", app.globalData.userInfo)
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请允许登陆',
      })
    }
  },

  update(data) {
    data = data || this.data
    this.setData(data)
    this.updateChartsA()
    this.updateChartsB()
  },

  linkToNotes() {
    wx.switchTab({
      url: '../biji/biji'
    })
  }
})