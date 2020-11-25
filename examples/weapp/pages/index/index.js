Page({
  data: {
    src: '',
    size: null,
  },
  navToTest1() {
    wx.navigateTo({
      url: `../test1/test1`,
    });
  },
  navToTest2() {
    wx.navigateTo({
      url: `../test2/test2`,
    });
  },
  navToTest3() {
    wx.navigateTo({
      url: `../test3/test3`,
    });
  },
})
