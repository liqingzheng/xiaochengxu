const app = getApp();
import util from '../../utils/util'
const obj = {
  /**
   * 页面的初始数据
   */
  data: {
    avator: '',
    nickName: '...',
    mobile: '',
    gender: 'anticon-man'
  },
  setUserInfo() {
    // 头像
    this.setData({
      avator: app.globalData.userInfo.avatarUrl || ''
    });
    // 昵称
    this.setData({
      nickName: app.globalData.userInfo.nickName || ''
    });
    this.setData({
      gender: app.globalData.userInfo.gender == 2 ? 'anticon-woman' : 'anticon-man'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.getStorage('userMobile').then(res => {
      this.setData({
        mobile: res.data ? res.data.replace(/^(\d{3})\d{5}(\d{3})$/, "$1****$2") : ''
      });
    });
    if (!app.globalData.userInfo) {
      app.data.userInfoReadyCallback = this.setUserInfo
      return;
    }
    this.setUserInfo();
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
}
Page(obj)