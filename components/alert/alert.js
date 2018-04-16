Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    'type': {
      type: String,
      value: '' // success warn info
    },
    iconSize: {
      type: Number,
      value: 64
    },
    title: {
      type: String,
      value: '提示'
    },
    msg: {
      type: String,
      value: ''
    }
  }
})