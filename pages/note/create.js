// pages/note/create.js
import Note from '../../models/Note'
import util from '../../utils/util'
const dbBiJi = wx.cloud.database().collection('biji')
let uuid = ''
const MAX_IMG_NUM = 3; //最多上传9张图片
Page({
  data: {
    dianzanOk: false,
    dianzanNum: 0,
    note: new Note(),
    images: [],
    selectPhoto: true
  },
  onLoad: function(options) {
    uuid = options.uuid
    console.log("传进来的uuid：", options)
    // 是否编辑
    if (uuid) {
      dbBiJi.doc(options.uuid).get()
        .then(res => {
          console.log("获取成功", res.data)
          let item = res.data
          item.time = util.formatTime(item.time, true)

          this.setData({
            note: new Note(item),
            dianzanOk: item.dianzan,
            dianzanNum: item.dianzanNum ? item.dianzanNum : 0,
            images: item.fileIds
          })
        })
    }
  },

  //点赞操作
  dianzan() {
    let dianzanOk = !this.data.dianzanOk
    let num = this.data.dianzanNum
    num = dianzanOk ? num + 1 : num - 1
    this.setData({
      dianzanOk: dianzanOk,
      dianzanNum: num
    })
    this.data.note.dianzan = dianzanOk
    this.data.note.dianzanNum = num
    this.update()
  },

  //内容输入事件
  handleTitleChange(e) {
    this.data.note.title = e.detail.value
    this.update()
  },

  //内容输入事件
  handleContentChange(e) {
    this.data.note.content = e.detail.value
    this.update()
  },

  //取消按钮点击事件
  handleCancelTap(e) {
    wx.navigateBack()
  },

  // 保存按钮点击事件
  handleSaveTap(e) {
    let note = this.data.note
    console.log("写的笔记", note)
    if (!note.title || note.title.length <= 0) {
      wx.showToast({
        icon: 'none',
        title: '输入标题',
      })
      return
    } else if (!note.content || note.content.length <= 0) {
      wx.showToast({
        icon: 'none',
        title: '输入内容',
      })
      return
    }
    wx.showLoading({
      title: '发布中',
      mask: true,
    })

    let promiseArr = []
    let fileIds = []
    // 图片上传
    for (let i = 0, len = this.data.images.length; i < len; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        if (item.indexOf("cloud:") != -1) {
          fileIds = fileIds.concat(item)
          resolve()
        } else {
          // 文件扩展名
          let suffix = /\.\w+$/.exec(item)[0]
          wx.cloud.uploadFile({
            cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
            filePath: item,
            success: (res) => {
              console.log(res.fileID)
              fileIds = fileIds.concat(res.fileID)
              resolve()
            },
            fail: (err) => {
              console.error(err)
              reject()
            }
          })
        }
      })
      promiseArr.push(p)
    }
    // 存入到云数据库
    Promise.all(promiseArr).then((res) => {
      if (uuid && uuid.length > 0) {
        dbBiJi.doc(uuid).update({
          data: {
            title: note.title,
            content: note.content,
            dianzan: note.dianzan,
            dianzanNum: note.dianzanNum,
            time: wx.cloud.database().serverDate(),
            createdAt: util.formatTime(new Date(), true),
            fileIds: fileIds,
          }
        }).then(res => {
          console.log("修改成功", res)
          wx.hideLoading()
          wx.navigateBack()
          wx.showToast({
            title: '修改成功'
          })
        }).catch(res => {
          console.log("修改失败", res)
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '保存失败',
          })
        })
      } else {
        dbBiJi.add({
          data: {
            ...this.data.note,
            fileIds: fileIds,
            time: wx.cloud.database().serverDate(),
          }
        }).then(res => {
          console.log("保存成功", res)
          wx.hideLoading()
          wx.navigateBack()
          wx.showToast({
            title: '保存成功'
          })
        }).catch(res => {
          console.log("保存失败", res)
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '保存失败',
          })
        })
      }
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })

  },

  // 更新数据
  update(data) {
    data = data || this.data
    this.setData(data)
  },

  // 添加图片
  onChooseImage() {
    // 还能再选几张图片
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        // 还能再选几张图片
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      },
    })
  },
  //删除已添加图片
  onDelImage(event) {
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length == MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true,
      })
    }
  },
  //图片预览
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc,
    })
  },
})