//获取应用实例
var app = getApp()
import * as util from '../../utils/util.js';
let _date = util.formatTime(new Date());
_date = _date.split(' ')[0].replace(/\//ig, '-');
const pageObject = {
  data: {
    activityId: null,
    userID: '',
    descriptionvabel: false,
    location: true, // 定位开启
    activityName: '', // 活动名称
    description: '', // 备注
    peopleNum: '', // 人数
    startDate: _date,
    endDate: _date,
    region: ['广东省', '深圳市', '龙岗区'],
    address: "广东省深圳市龙岗区",
    tips: {
      title: '提示',
      activityName: '活动名称不能为空',
      description: '备注不能为空',
      peopleNum: '活动上限人数不能为空',
      peopleNumRex: '活动上限人数为大于等于1的整数'
    },
    modal: {
      confirmShare: false, //
      content: '保存活动！把这个活动分享给您的小伙伴们吧',
      confirmText: '分享'
    }
  },
  startDateChange(e) {
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
  bindFormSubmit(e) {
    let valueObj = e.detail.value, flag = false;
    // 如果有一个为空
    flag = !['activityName', 'description', 'peopleNum'].some(key => {
      if (!valueObj[key])
        wx.showModal({
          title: this.data.tips.title,
          content: this.data.tips[key],
          showCancel: false
        });
      return valueObj[key] === '';
    });
    if (!flag) return;
    else if (valueObj['peopleNum'] && (isNaN(+valueObj['peopleNum']) || +valueObj['peopleNum'] <= 0)) {
      wx.showModal({
        title: this.data.tips.title,
        content: this.data.tips['peopleNumRex'],
        showCancel: false
      });
      flag = false;
    }
    else flag = true;
    this.setData(valueObj);
    // 如果是点击创建活动按钮的 设置可以分享 否则不可以分享
    valueObj['is-share'] = typeof e.detail.target.dataset.noshare === 'undefined' ? true : false;
    flag && this.saveForms(valueObj);
  },
  /**
   * 提交活动
  */
  saveForms(valueObj) {
    let url = util.config.serverUrl + 'save';
    let params = {
      'user.id': this.data.userID,
      title: valueObj.activityName,
      address: valueObj.address,
      startDate: valueObj.startDate,
      endDate: valueObj.endDate,
      picture: 'null',
      description: valueObj.description,
      limitedPerson: valueObj.peopleNum
    };
    wx.showLoading({
      title: '保存中',
      mask: true
    });
    console.log('保存活动参数', params);
    util.postRequest(url, params).then(res => {
      wx.hideLoading();
      console.log('保存成功', res)
      if (res.data.success) {
        this.setData({
          activityId: res.data.attributes.activity.id
        });
        this.setData({
          'modal.confirmShare': true,
          descriptionvabel: true, // 隐藏textarea 不然会有自定义的弹窗无法点击问题
          'modal.content': '保存活动成功！把这个活动分享给您的小伙伴们吧'
        });
        this.dialog.showDialog();
      }
      else {
        wx.hideLoading();
        wx.showModal({
          title: this.data.tips.title,
          content: '保存失败',
          showCancel: false
        });
      }
    }, error => {
      wx.hideLoading();
      wx.showModal({
        title: this.data.tips.title,
        content: '保存失败',
        showCancel: false
      });
    });
  },
  _goToView() {
    wx.navigateTo({
      url: `../ViewActivity/ViewActivity?activityId=${this.data.activityId}`
    });
  },
  onShareAppMessage(opt) {
    let timer = null, speed = 1500;
    return {
      title: `邀您一起参加：${this.data.activityName || ''}`,
      path: `pages/ViewActivity/ViewActivity?activityId=${this.data.activityId}`,
      imageUrl: '../../image/share.jpeg',
      success: (res) => {
        clearTimeout(timer);
        this.dialog.hideDialog(); // 隐藏弹窗
        // 分享成功之后
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: speed,
          success: () => {
            timer = setTimeout(() => {
              wx.navigateTo({
                url: `../ViewActivity/ViewActivity?activityId= ${this.data.activityId}`
              });
            }, speed);
          }
        });
      },
      fail: (res) => {
        this.dialog.showDialog();
        // 分享失败
        this.setData({
          'modal.content': '分享失败哟,点击【分享】重新分享'
        });
      }
    }
  },
  onLoad: function (opt) {
    let location = util.wxGetLocation();
    location().then(res => {
      // 根据经纬度 调用腾讯地图获取用户当前城市
      let latitude = res.latitude; // 纬度
      let longitude = res.longitude; // 经度
      util.getRequest(util.config.mapUrl, {
        location: latitude + ',' + longitude,
        key: util.config.mapKey
      }).then(res => {
        this.setData({
          location: true
        });
        let addressComponent = res.data.result.address_component;
        let addressDetail = res.data.result.address;
        this.setData({
          address: addressDetail
        });
      }, (erorr) => {
        Console.log('地理位置失败');
        this.setData({
          location: false
        });
      });
    }, error => {
      this.setData({
        location: false
      });
    });
    // 获取用户
    util.getStorage('userID').then(res => {
      this.setData({
        userID: res.data
      });
    }, () => {
      util.GetUser().then(obj => {
        util.postRequest(`${util.config.serverUrl}login`, {
          openId: obj['openId'],
          nickName: obj['nickName'],
          avator: obj['avator']
        }).then(res => {
          let id = res.data.attributes && res.data.attributes.user.id || '';
          this.setData({
            'userID': id
          });
        });
      }, () => {
        wx.showModal({
          title: '提示',
          content: '获取失败，无法创建活动',
          showCancel: false
        })
      });
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.dialog = this.selectComponent("#modal");
  }
}
Page(pageObject);