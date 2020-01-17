import util from '../../utils/util'
const app = getApp()
Page({
  data: {
    // 笔记列表
    notes: [],
    // 是否动画延迟
    delay: true,
  },

  onShow(options) {
    this.getData()
  },

  getData() {
    wx.cloud.database().collection('biji').get()
      .then(res => {
        console.log("读取云笔记成功", res.data)
        let list = res.data
        list.forEach(item => {
          item.time = util.formatTime(item.time, true)
        });
        this.setData({
          notes: res.data
        })
        // 动画结束后取消动画队列延迟
        setTimeout(() => {
          this.update({
            delay: false
          })
        }, 2000)
      })
      .catch(res => {
        console.log("读取云笔记失败", res)
      })
  },

  //懒人函数--更新数据
  update(data) {
    data = data || this.data
    this.setData(data)
  },


  //编辑笔记
  handleNoteTap(e) {
    let uuid = e.currentTarget.dataset.uuid
    wx.navigateTo({
      url: '../note/create?uuid=' + uuid
    })
  },

  //点击删除
  handleNoteLongTap(e) {
    let uuid = e.currentTarget.dataset.uuid
    wx.showModal({
      title: '删除提示',
      content: '确定要删除这个笔记吗？',
      success: (e) => {
        if (e.confirm) {
          wx.cloud.database().collection('biji').doc(uuid)
            .remove()
            .then(res => {
              console.log("删除成功", res)
              this.getData()
            })
            .catch(res => {
              console.log("删除失败", res)
            })

        }
      }
    })
  },
  //新建按钮点击事件
  handleAddNote() {
    wx.navigateTo({
      url: '../note/create'
    })
  }
})