let Promise = require('../libs/es6-promise.min');
const WxUtil = new class {
  constructor() { }
  formatTime(date) {
    date = Object.prototype.toString.call(date) === '[object Date]' ? date : new Date();
    let year = date.getFullYear(),
      month = date.getMonth() + 1,
      day = date.getDate(),
      hour = date.getHours(),
      minute = date.getMinutes(),
      second = date.getSeconds();
    return [year, month, day].map(this.formatNumber).join('/') + ' ' + [hour, minute, second].map(this.formatNumber).join(':');
  }
  formatNumber(n) {
    n = n.toString();
    return n > 10 ? n : '0' + n;
  }
  wxPromisify(fn) {
    return function (obj = {}) {
      return new Promise((resolve, reject) => {
        obj.success = res => resolve(res);
        obj.fail = err => reject(err);
        fn(obj);
      });
    };
  }
  wxLogin() {
    return this.wxPromisify(wx.login);
  }
  wxGetUserInfo() {
    return this.wxPromisify(wx.getUserInfo);
  }
  wxGetLocation() {
    return this.wxPromisify(wx.getLocation);
  }
  chooseLocation() {
    return this.wxPromisify(wx.chooseLocation);
  }
  wxAuthorize() {
    return this.wxPromisify();
  }
  wxGetStorage (key) {
    let ov = this.wxPromisify(wx.getStorage);
    return ov({
      key: key
    });
  }
  GetUser() {
    return new Promise((resolve, reject) => {
      let obj = {};
      const getUserFunc = () => {
        wx.getUserInfo({
          withCredentials: true,
          success: res => {
            obj = res.userInfo
            obj['avator'] = res.userInfo.avatarUrl; // 用户头像
            resolve(obj);
          },
          fail: res => {
            wx.showModal({
              title: '提示',
              content: '只有授权用户才能创建或参加活动哟！',
              showCancel: false,
              success: () => {
                // 打开用户设置权限
                wx.openSetting({
                  success: (res) => {
                    res.authSetting['scope.userInfo'] && getUserFunc(); // back
                  }
                });
              }
            });
          }
        });
      };
      getUserFunc();
    });
  }
  wxUserLocationQQMapWX(res) {
    const _this = this;
    const obj = {
      location: {
        latitude: res.latitude,
        longitude: res.longitude
      }
    };
    return new Promise((resolve, reject) => {
      obj.success = res => resolve(res);
      obj.fail = err => reject(err);
      new QQMapWX({
        //key 去http://lbs.qq.com/console/user_info.html这里申请 然后【密钥(key)管理
        key: _this.config.mapKey
      }).reverseGeocoder(obj);
    });
  }
  /**
 * 微信请求get方法
 * url
 * data 以对象的格式传入
 */
  getRequest(url, data) {
    let getRequest = this.wxPromisify(wx.request)
    return getRequest({
      url: url,
      method: 'GET',
      data: data,
      header: {
        'Content-Type': 'application/json'
      }
    });
  }
  /**
   * 微信请求post方法封装
   * url
   * data 以对象的格式传入
   */
  postRequest(url, data) {
    let postRequest = this.wxPromisify(wx.request);
    return postRequest({
      url: url,
      method: 'POST',
      data: data,
      header: {
        "content-type": "application/x-www-form-urlencoded"
      }
    });
  }
};
module.exports = {
  formatNumber: WxUtil.formatNumber,
  formatTime: WxUtil.formatTime,
  wxPromisify: WxUtil.wxPromisify,
  chooseLocation: WxUtil.chooseLocation,
  wxLogin: WxUtil.wxLogin,
  wxAuthorize: WxUtil.wxAuthorize,
  wxGetUserInfo: WxUtil.wxGetUserInfo,
  GetUser: WxUtil.GetUser,
  wxGetLocation: WxUtil.wxGetLocation,
  postRequest: WxUtil.postRequest,
  getRequest: WxUtil.getRequest,
  getStorage: WxUtil.wxGetStorage,
  config: {
    serverUrl: 'https://localhost:8080/activity.web/activity/',
    mapUrl: 'https://apis.map.qq.com/ws/geocoder/v1/', 
    mapKey: '', //key 去http://lbs.qq.com/console/user_info.html这里申请 然后【密钥(key)管理
    openIdUrl: 'https://api.weixin.qq.com/sns/jscode2session'
  }
}