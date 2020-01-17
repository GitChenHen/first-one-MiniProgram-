import util from '../utils/util'

/**
 * Note 模型类
 */
class Note  {
  constructor(model) {
    // super()
    Object.assign(this, {
      title: '',
      content: '',
      createdAt: util.formatTime(new Date(),true)
    }, model)

    // 日期格式化
    if (this.createdAt.constructor === Date) {
      this.createdAt = util.formatTime(this.createdAt)
    }
  }
}

export default Note
