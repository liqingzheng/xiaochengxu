//index.js
var app = getApp();
const util = require('../../utils/util');
var pageObject = {
  data: {
    createdFlag: true,
    userFlag: true,
    params : {
      date: util.formatTime(new Date())
    }
  },
  getUserFunc: function() {
    let params = this.data.params;
    let location = util.wxGetLocation();
    this.setData({
      createdFlag: false,
      userFlag: false
    });
    let userInfo = app.globalData.userInfo;
    params['openId'] = app.globalData['openid'];
    params['nickName'] = userInfo['nickName'];
    params['avator'] = userInfo['avatarUrl'];
    location().then(res => {
      // 根据经纬度 调用腾讯地图获取用户当前城市
      let latitude = res.latitude; // 纬度
      let longitude = res.longitude; // 经度
      util.getRequest(util.config.mapUrl, {
        location: `${latitude},${longitude}`,
        key: util.config.mapKey
      }).then(res => {
        let addressComponent = res.data.result.address_component;
        let addressDetail = res.data.result.address;
        params['province'] = addressComponent.province; //用户省份
        params['city'] = addressComponent.city; //用户省份
        this.setData({
          params: params
        })
        this.serverRequst(); // 数据请求
      });
    }, () => {
      wx.showModal({
        title: '提示',
        content: '为了更方便创建活动，请您授权开启地里位置哟！',
        showCancel: false,
        success: () => {
          wx.openSetting({
            success: res => {
              this.serverRequst(); // 数据请求
            },
            fail: res => {
              this.serverRequst(); // 数据请求
            }
          });
        }
      });
    });
  },
  serverRequst: function() {
    wx.showLoading({
      title: '正在登录…',
      mask: true
    });
    let url = `${util.config.serverUrl}login`;
    console.log('登录传参', this.data.params)
    util.postRequest(url, this.data.params).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: res.data.msg,
        icon: 'success'
      });
      this.setData({
        createdFlag: false,
        userFlag: false
      });
      console.log('返回', res);
      // 数据存储在本地缓存中
      let _user = res.data.attributes && res.data.attributes.user;
      _user.id && wx.setStorage({
        key: 'userID',
        data: _user.id
      });
      _user.mobile && wx.setStorage({
        key: 'userMobile',
        data: _user.mobile
      })
    }, error => {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '连接服务器失败',
        showCancel: false
      })
    });
  },
  onLoad: function (opt) {
    // 从用户中心跳转过来就不需要登录了
    if (opt.login) {
      this.setData({
        createdFlag: false,
        userFlag: false
      });
      return;
    }
    wx.clearStorage(); // 清理本地数据缓存。
    // 获取用户信息
    if (!app.globalData.userInfo) {
      app.data.userInfoReadyCallback = this.getUserFunc
      return;
    };
    this.getUserFunc();
  }
}
Page(pageObject)
