//app.js
import util from './utils/util'
App({
  data: {
    userInfoReadyCallback: null
  },
  getUser() {
    util.GetUser().then(res => {
      this.globalData.userInfo = res
      typeof this.data.userInfoReadyCallback === 'function' && this.data.userInfoReadyCallback(res)
    })
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        let code = res.code; //返回code
        let appid = ''; // 小程序APPID
        let secret = ''; // 小程序密匙
        wx.request({
          url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}js_code=${code}&grant_type=authorization_code`,
          header: {
            'content-type': 'application/json'
          },
          success: (res) => {
            //openid = res.data.openid //返回openid
            this.globalData.openid = res.data.openid;
          }
        })
      }
    })
    // 获取用户信息
    this.getUser();
  },
  globalData: {
    userInfo: null,
    openid: null,
    location: true
  }
})