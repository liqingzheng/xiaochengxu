Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  data: {
    isShow: false
  },
  properties: {
    // 弹窗标题
    title: {       
      type: String,
      value: '提示'     
    },
    // 弹窗内容
    content: {
      type: String,
      value: '弹窗内容'
    },
    // 弹窗取消按钮文字
    cancelText: {
      type: String,
      value: '取消'
    },
    // 弹窗确认按钮文字
    confirmText: {
      type: String,
      value: '确定'
    },
    confirmShare: {
      type: Boolean
    }
  },
  methods: {
    hideDialog() {
      this.setData({
        isShow: false
      })
    },
    showDialog() {
      this.setData({
        isShow: true
      })
    },
    _cancelEvent() {
      this.hideDialog();
      this.triggerEvent("cancelEvent")
    },
    _confirmEvent() {
      if(!this.confirmShare) {
        this.hideDialog();
        this.triggerEvent("confirmEvent");
      }
    }
  }
});