var app = getApp();
console.log('app', app);
import * as util from '../../utils/util.js';
Page({
  data: {
    isEdit: false, // 是否可以编辑 一般是创建人才能编辑
    isFinish: false, //是否已经结束
    isOngoing: true,// 是否已经参与
    activityID: null,
    mobileValue: '',
    memberUrl: '',
    activityCreatedUserID: '', // 当然创建活动人的ID
    limitedPerson: '',
    title: '...', // 活动标题
    date: '...',
    address: '...',
    description: '...',
    joinCount: '',
    pepopleList: [], // 参与人员
    updateStr: '', // 修改传参数据
    user: {
      mobile: '',
      ID: '',
      nickName: '',
      avator: '',
      userListID: [],
    },
    modal: {
      confirmShare: false, //
      content: '恭喜您，参加活动成功，祝您玩得开心',
      confirmText: '分享'
    }
  },
  getUserFunc: function () {
    let userInfo = app.globalData.userInfo
    this.setData({
      'user.nickName': userInfo['nickName']
    });
    this.setData({
      'user.avator': userInfo['avatarUrl']
    });
    util.postRequest(`${util.config.serverUrl}login`, {
      nickName: userInfo['nickName'],
      avator: userInfo['avatarUrl'],
      openid: app.globalData.openid || ''
    }).then(res => {
      let _user = res.data.attributes && res.data.attributes.user;
      let id = _user.id || '';
      this.setData({
        'user.mobile': _user.mobile || ''
      })
      console.log('服务器返回的ID', id);
      this.data.isOngoing && this.setData({
        'user.ID': id,
        isOngoing: !(this.data.userListID.indexOf(id) >= 0) // 存在不可参加
      });
      // 本地存储用户在服务器的ID
      wx.setStorage({
        key: 'userID',
        data: id
      })
      // 如果当前用户的ID与创建人ID一直
      id == this.activityCreatedUserID && this.setData({
        isEdit: true
      });
    }, () => {
      wx.showModal({
        title: '提示',
        content: '服务器链接失败',
        showCancel: false
      });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opt) {
    let ID = opt.activityId || 107;
    let url = `${util.config.serverUrl}view`;
    this.setData({
      activityID: ID
    });
    wx.showLoading({
      title: '',
      mask: true
    })
    util.getRequest(url, {
      id: ID
    }).then(res => {
      console.log('获取数据', res);
      let data = res.data;
      // 获取当前活动创建人的信息
      this.setData({
        activityCreatedUserID: data.user.id
      });
      let joinCount = data.joinCount || 0;
      // 成员列表传参
      this.setData({
        memberUrl: `../member/member?activityId=${this.data.activityID}&title=${data.title}&nickName=${data.user.nickName}&avator=${data.user.avator}&mobile=${data.user.mobile || ''}&joinCount=${joinCount}`
      })
      let flag = false;
      // 获取已加入该活动相关用户
      util.getRequest(`${util.config.serverUrl}viewJoinUser`, {
        activity: this.data.activityID
      }).then(res => {
        wx.hideLoading();
        console.log('已经参加活动用户', res)
        let joinUserList = res.data, userList = [];
        Array.isArray(joinUserList) && joinUserList.map(item => {
          let _arr = this.data.pepopleList;
          _arr.push({ nickName: item.nickName, avator: item.avator, mobile: item.mobile || '-' });
          userList.push(item.id);
          this.setData({
            pepopleList: _arr
          });
        });
        this.setData({
          userListID: userList
        });
        // 编辑传参
        let str = `&activityID='${this.data.activityID}&title=${data.title}&startDate=${data.startDate}&endDate=${data.endDate}&address=${data.address}&description=${data.description}&limitedPerson=${data.limitedPerson}`;
        // 显示数据
        this.setData({
          updateStr: str,
          title: data.title,
          date: `${data.startDate} 至 ${data.endDate}`,
          address: data.address,
          description: data.description,
          joinCount: joinCount,
          limitedPerson: data.limitedPerson || ''
        });
        // 结束了就不能编辑 分享和才参加
        if (new Date(util.formatTime().split(' ')[0]).getTime() > new Date(data.endDate).getTime()) {
          this.setData({
            isOngoing: false,
            isFinish: true,
            isEdit: false
          });
        }
        // 如果 加入人数达到上线就不能参加
        else if (!(joinCount < data.limitedPerson)) {
          this.setData({
            isOngoing: false,
            isFinish: false
          });
        }
        else {
          this.setData({
            isOngoing: true,
            isFinish: false
          });
        }
        // 获取用户
        util.getStorage('userID').then(res => {
          console.log('本地存储用户ID', res.data);
          let isUserIdx = userList.indexOf(res.data);
          this.setData({
            'user.mobile': isUserIdx >= 0 ? this.data.pepopleList[isUserIdx]['mobile'] : ''
          })
          this.setData({
            'user.ID': res.data
          });
          util.GetUser().then(obj => {
            this.setData({
              'user.nickName': obj['nickName']
            });
            this.setData({
              'user.avator': obj['avator']
            });
          });
          if (this.data.isOngoing)
            this.setData({
              isOngoing: !(isUserIdx >= 0) // 存在不可参加
            });
          // 如果当前用户的ID与创建人ID一样 并且当前日期小于等于结束日期
          res.data === data.user.id && new Date().getTime() <= new Date(data.endDate).getTime() && this.setData({
            isEdit: true
          });
        }, () => {
          if (!app.globalData.userInfo) {
            app.data.userInfoReadyCallback = this.getUserFunc
            return;
          }
          this.getUserFunc()
        });
      });
    }, error => {
      console.error('请求失败');
    });
  },
  // 参加活动
  joinActivity() {
    // 如果当前用户手机号为空就验证
    if (!this.data.user.mobile) {
      let Rex = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (!this.data.mobileValue || !Rex.test(this.data.mobileValue)) {
        wx.showModal({
          title: '提示',
          content: '请输入正确的手机号码',
        });
        return;
      }
    }
    wx.showLoading({
      title: '正在加入…',
      mask: true
    });
    let url = `${util.config.serverUrl}join`;
    let params = {
      'user.id': this.data.user.ID,
      'activity.id': this.data.activityID,
      'mobile': this.data.mobileValue || this.data.user.mobile
    };
    this.setData({
      isOngoing: false
    });
    let joinCount = this.data.joinCount;
    util.postRequest(url, params).then(res => {
      wx.hideLoading();
      console.log('加入', res);
      if (!res.data.success) {
        this.setData({
          isOngoing: true
        });
        wx.showModal({
          title: '',
          content: res.data.msg,
          showCancel: false
        });
        return;
      }
      let obj = {
        nickName: this.data.user.nickName,
        avator: this.data.user.avator
      };
      let arr = this.data.pepopleList;
      arr.push(obj);
      wx.hideLoading();
      // 显示分享成功提示框 并增加参加人数
      this.setData({
        joinCount: joinCount + 1,
        pepopleList: arr
      });
      // 提示分享的弹窗
      this.setData({
        'modal.confirmShare': true
      });
      // 显示分享
      this.dialog.showDialog();
    }, res => {
      wx.hideLoading();
      wx.showModal({
        title: '',
        content: res.data.msg,
        showCancel: false
      });
    });
  },
  mobileInput(e) {
    this.setData({
      mobileValue: e.detail.value
    })
  },
  // 编辑活动
  editHandle: function () {
    wx.navigateTo({
      url: `../update/update?userID='${this.data.user.ID + this.data.updateStr}`,
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: `邀您一起参加：${this.data.title || ''}`,
      path: `pages/ViewActivity/ViewActivity?activityId=${this.data.activityID}`,
      imageUrl: '../../image/share.jpeg',
      success: (res) => {
        this.dialog.hideDialog(); // 隐藏弹窗
        wx.showModal({
          title: '提示',
          content: '分享成功',
          showCancel: false
        });
      },
      fail: (res) => {
        // 转发失败
      }
    }
  },
  // 小程序在群里被打开后，获取情景值和shareTicket
  onLaunch: function (ops) {
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.dialog = this.selectComponent("#modal");
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