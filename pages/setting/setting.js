// pages/setting/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile: '',
    loading: false,
    disabled: true
  },
  saveMobile(e) {
    let p = e.detail.value;
    let rex = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    // 验证输入的手机是否为空和是否符合规则
    if (!p.mobile || !rex.test(p.mobile)) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号',
        showCancel: false
      });
      return;
    }
  },
  bindinput(e) {
    this.setData({
      disabled: !e.detail.value || e.detail.value === this.data.mobile 
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opt) {
    this.setData({
      mobile: opt.mobile || ''
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})