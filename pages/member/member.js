const app = getApp();
import util from '../../utils/util'
const obj = {
  /**
   * 页面的初始数据
   */
  data: {
    title: '...',
    avator: '',
    nickName: '',
    mobile: '...',
    joinCount: '',
    alertType: 'info',
    infoTitle: '暂无参与人员',
    activityId: '',
    noDataTips: false,
    laoding: true,
    joinUsers: []
  },
  getJoinUsers() {
    let url = `${util.config.serverUrl}viewJoinUser`;
    const params = {
      activity: this.data.activityId
    };
    util.getRequest(url, params).then(res => {
      // 隐藏loading
      this.setData({
        laoding: false
      });
      console.log('已经参加活动用户', res);
      let data = res.data, arr = [];
      Array.isArray(data) && data.map(item => {
        arr.push({
          nickName: item.nickName,
          avator: item.avator,
          mobile: item.mobile
        });
      });
      arr.length ? this.setData({
        joinUsers: arr
      }) : this.setData({
        noDataTips: true,
        alertType: 'info',
        infoTitle: '暂无参与人员'
      });
    }, error => {
      // 隐藏loading
      this.setData({
        laoding: false
      });
      this.setData({
        noDataTips: true,
        alertType: 'warn',
        infoTitle: '数据加载失败'
      });
    })
  },
  callPhone(e) {
    let mobile = e.currentTarget.id;
    let rex = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    rex.test(mobile) && wx.makePhoneCall({
      phoneNumber: mobile
    });
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('传入创建人信息', options)
    Object.keys(options).forEach(key => {
      this.setData({
        [key]: options[key] || ''
      });
    })
    this.getJoinUsers();
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