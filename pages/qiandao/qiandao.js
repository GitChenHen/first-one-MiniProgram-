//引用es7异步语法文件
const regeneratorRuntime = require('../../utils/runtime.js')

const app = getApp();
const dbQD = wx.cloud.database().collection('qiandao')
var mydate = new Date();
var year = mydate.getFullYear();
var month = mydate.getMonth() + 1;
const qdKey = "" + year + "年" + month + '月'
var calendarSignData; //签到日期
var date;
var qiandaoArr = []; //连续签到天数
let _id = ''
Page({
  data: {
    yearMonth: qdKey,
    qiandaoDay: 0,
    calendarSignData: [],
    is_qd: false,
  },


  //点击签到
  calendarSign(e) {
    if (this.data.is_qd) {
      wx.showToast({
        icon: "none",
        title: '今日已经签到过',
      })
      return
    }
    calendarSignData[date] = date;
    qiandaoArr.push(date)

    let resultdb = null
    if (_id && _id.length > 0) {
      resultdb = dbQD.doc(_id).update({
        data: {
          key: qdKey,
          qiandaoArr: qiandaoArr
        }
      })
    } else {
      resultdb = dbQD.add({
        data: {
          key: qdKey,
          qiandaoArr: qiandaoArr
        }
      })
    }
    resultdb.then(res => {
      console.log("签到成功", res)
      wx.showToast({
        title: '签到成功',
      })
      this.setData({
        qiandaoDay: qiandaoArr.length,
        is_qd: true,
        calendarSignData: calendarSignData,
      })
    }).catch(res => {
      wx.showToast({
        icon: 'none',
        title: '签到失败',
      })
    })
  },

  onLoad: function() {

    date = mydate.getDate();  
    console.log("今天日期" + date)
    var day = mydate.getDay(); //周几
    var nbsp = 7 - ((date - day) % 7);
    var monthDaySize;
    if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
      monthDaySize = 31;
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
      monthDaySize = 30;
    } else if (month == 2) {
      // 计算是否是闰年,如果是二月份则是29天
      if ((year - 2000) % 4 == 0) {
        monthDaySize = 29;
      } else {
        monthDaySize = 28;
      }
    };
    if (!calendarSignData) {
      calendarSignData = new Array(monthDaySize)
    }
    dbQD.where({
        key: qdKey
      })
      .get()
      .then(res => {
        if (res.data && res.data[0]) {
          _id = res.data[0]._id
          qiandaoArr = res.data[0].qiandaoArr
          console.log("请求数据成功", qiandaoArr)
        }
        let is_qd = false
        for (var i in qiandaoArr) {
          let dayItem = parseInt(qiandaoArr[i])
          calendarSignData[dayItem] = dayItem
          is_qd = dayItem == date
        }
        this.setData({
          qiandaoDay: qiandaoArr.length,
          is_qd: is_qd,
          nbsp: nbsp,
          monthDaySize: monthDaySize,
          date: date,
          calendarSignData: calendarSignData,
        })
      }).catch(res => {
        console.log("请求数据失败", res)
      })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})