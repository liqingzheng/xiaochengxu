// pages/update/update.js
import * as util from '../../utils/util.js';
Page({
  data: {
    userID: '',
    activityID: '',
    location: true, // 定位开启
    title: '',
    startDate: '',
    endDate: '',
    address: '',
    descriptionFlag: false,
    description: '',
    limitedPerson: '',
    region: ['广东省', '深圳市', '龙岗区'],
    location: {
      lat: 39.984154,
      lng: 116.30749
    },
    tips: {
      title: '活动名称不能为空',
      description: '备注不能为空',
      limitedPerson: '活动上限人数不能为空',
      limitedPersonRex: '活动上限人数为大于等于1的整数'
    },
    modal: {
      confirmShare: false, //
      content: '更新成功！把这个活动分享给小伙伴们吧',
      confirmText: '分享'
    }
  },
  startDateChange: function (e) {
    let start = e.detail.value.replace(/\-/ig, ''),
      end = this.data.endDate.replace(/\-/ig, '');
    this.setData({
      startDate: e.detail.value,
      endDate: start > end ? e.detail.value : this.data.endDate
    });
  },
  endDateChange: function (e) {
    this.setData({
      endDate: e.detail.value
    });
  },
  bindRegionChange: function (e) {
    // 查询用是否授权地址
    if (!this.data.location) {
      this.setData({
        region: e.detail.value
      })
      return;
    }
    util.chooseLocation()().then(res => {
      this.setData({
        address: res.address
      })
    });
  },
  bindFormSubmit: function(e) {
    let valueObj = e.detail.value, flag = false;
    let _tipsTitle = '提示';
    console.log('valueObj', valueObj);
    flag = !['title', 'description', 'limitedPerson'].some(key => {
      if (!valueObj[key]) {
        wx.showModal({
          title: _tipsTitle,
          content: this.data.tips[key],
          showCancel: false
        });
      }
      return valueObj[key] === '';
    });
    if (!flag) return;
    else if (valueObj['limitedPerson'] && (isNaN(+valueObj['limitedPerson']) || +valueObj['limitedPerson'] <= 0)) {
      wx.showModal({
        title: _tipsTitle,
        content: this.data.tips['limitedPersonRex'],
        showCancel: false
      });
      flag = false;
    }
    else flag = true;
    flag && this.saveForms(valueObj); //保存
  },
  saveForms: function(opt) {
    let url = `${util.config.serverUrl}update`;
    let params = {
      title: opt.title,
      address: opt.address,
      description: opt.description,
      startDate: opt.startDate,
      endDate: opt.endDate,
      limitedPerson: opt.limitedPerson,
      'user.id': this.data.userID,
      'id': this.data.activityID
    };
    wx.showLoading({
      title: '更新中',
      mask: true
    });
    util.postRequest(url, params).then(res => {
      console.log('更新返回', res);
      wx.hideLoading();
      let status = res.data.status, msg = res.data.message;
      if (status == 200) {
        this.setData({
          descriptionFlag: true // 隐藏textarea 不然会有自定义的弹窗无法点击问题
        });
        // 提示分享的弹窗
        this.setData({
          'modal.confirmShare': true
        });
        // 显示分享
        this.dialog.showDialog();
      } else {
        wx.showModal({
          title: '提示',
          content: `更新失败${msg}`,
          showCancel: false
        })
        this.setData({
          descriptionFlag: false 
        });
      }
    }, res => {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: res.data.msg,
        showCancel: false
      });
    });
  },
  _goToUser() {
    wx.navigateTo({
      url: '../user/user'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opt) {
    let location = util.wxGetLocation();
    location().then(res => {
      this.setData({
        location: true
      });
    }, res => {
      this.setData({
        location: false
      });
    })
    let url = util.config.mapUrl;
    //地址解析
    opt = Object.keys(opt).length ? opt : {
      activityID: '43',
      address: "广东省深圳市龙岗区龙翔大道8033号",
      description: "hd",
      endDate: "2018-03-24",
      limitedPerson: null,
      startDate: "2018-03-24",
      title: "hd",
      userID: '1'
    };
    util.getRequest(url, {
      address: opt.address,
      key: util.config.mapKey
    }).then(res => {
      console.log('地址解析', res);
      let address = res.data.result.address_component
      Object.keys(opt).forEach(key => {
        this.setData({
          [key]: opt[key] || ''
        });
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.dialog = this.selectComponent("#modal");
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: `邀您一起参加：${this.data.title || ''}`,
      path: `pages/ViewActivity/ViewActivity?activityId=${this.data.activityID}`,
      imageUrl: '../../image/share.jpeg',
      success: (res) => {
        this.dialog.hideDialog(); // 隐藏弹窗
        wx.showModal({
          title: '提示',
          content: '分享成功',
          showCancel: false,
          success: () => {
            wx.navigateTo({
              url: '../user/user',
            });
          }
        });
      },
      fail: (res) => {
        // 转发失败
      }
    }
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
  
  }
})