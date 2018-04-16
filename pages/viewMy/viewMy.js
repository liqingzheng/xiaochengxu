// pages/viewJoin/viewJoin.js
import util from '../../utils/util'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    arr: [],
    infoTitle: '暂无数据',
    alertType: 'info',
    windowHeight: 10,
    hidden: true,
    loadDone: false,
    moreText: '上拉加载更多数据',
    moreFlag: false,
    noData: false,
    page: 0
  },
  getList() {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    // 设置加载是否完成
    this.setData({
      loadDone: false
    });
    util.getRequest(
      `${util.config.serverUrl}viewMy`,
      {
        user: 2,
        page: this.data.page
      }
    ).then(res => {
      wx.hideLoading();
      console.log('加入', res);
      this.setData({
        loadDone: true
      });
      // 判断全部据是否请求完毕
      if ((this.data.page + 1) * res.data.pageSize > res.data.totalRecords) {
        this.setData({
          moreFlag: true,
          noData: true,
          moreText: '没更多数据了'
        })
      }
      else {
        let p = this.data.page + 1;
        this.setData({
          page: p,
          moreFlag: true,
          noData: false,
          moreText: '上拉加载更多数据'
        })
      }
      let data = (res.data && res.data.data) || [];
      // 第一次加载数据为空的提示
      !data.length && this.data.page === 0 && this.setData({
        alertType: 'info',
        hidden: false
      });
      data.forEach(item => {
        item.share = new Date().getTime() < new Date(item.endDate).getTime();
        this.data.arr.push(item)
      });
      this.setData({
        arr: this.data.arr
      })
    }, error => {
      wx.hideLoading();
      this.setData({
        loadDone: true,
        alertType: 'warn',
        infoTitle: '数据加载失败',
        hidden: false
      })
    });
  },
  pageCount() {
    if (this.data.noData) return;
    this.data.loadDone && this.getList();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let op = wx.getSystemInfoSync();
    this.setData({
      windowHeight: op.windowHeight - 12
    });
    this.setData({
      arr: []
    });
    this.setData({
      page: 0
    });
    this.setData({
      moreFlag: false
    });
    this.getList();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    let target = e.target;
    return {
      title: `邀您一起参加：${target.dataset.title || ''}`,
      path: `pages/ViewActivity/ViewActivity?activityId=${e.target.id}`,
      imageUrl: '../../image/share.jpeg',
      success: (res) => {
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

  }
})