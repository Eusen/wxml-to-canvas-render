const {el, WTCUtils, covertElToMetadata} = require('../../components/wxml-to-canvas/wtc');

Page({
  data: {
    src: '',
    size: null,
  },
  onLoad() {
    // 先创建工具，传入尺寸
    this.utils = WTCUtils.create(750 * 1.2, 889 * 1.2);

    this.setData({
      size: this.utils.getSize(),
    }, () => {
      setTimeout(() => {
        // 等待页面渲染完成，否则找不到 canvas
        this.build();
      }, 100);
    });
  },
  build() {
    // 通过API获取组件实例
    this.widget = this.selectComponent('.widget');
    // 将组件注入到工具类中
    this.utils.setWidget(this.widget);
    // 获取当前尺寸
    const size = this.utils.getSize();

    // 构建 DOM 树
    const dom = el('view', {
      class: 'container',
      style: {
        ...size,
        backgroundColor: '#fff',
      },
      children: [
        (() => {
          const src = 'https://cloud-minapp-37929.cloud.ifanrusercontent.com/1kflAf6K5B5D5ucV.jpg';
          const backSize = this.utils.widthFix(1152, 1152, 0.26);
          return el('image', {
            class: 'back',
            src,
            style: {
              position: 'absolute',
              left: this.utils.getScaleWidth(55 / size.width),
              top: this.utils.getScaleHeight(600 / size.height),
              ...backSize,
            },
          })
        })(),
        (() => {
          const src = 'https://cloud-minapp-37929.cloud.ifanrusercontent.com/1kflb1WtHktkL6L0.png';
          return el('image', {
            class: 'cover',
            src,
            style: {
              ...size,
            },
          })
        })(),
        (() => {
          const text = '嘿嘿~';
          return el('text', {
            class: 'heihei',
            text,
            style: {
              position: 'absolute',
              left: this.utils.getScaleWidth(130 / size.width),
              top: this.utils.getScaleHeight(450 / size.height),
              color: '#fff',
              fontSize: 26,
            },
          })
        })(),
      ]
    });

    // 将DOM树转化成插件可读的数据
    const metadata = covertElToMetadata(dom);

    console.log(metadata.wxml);
    console.log(metadata.style);

    // 直接将数据喂给插件即可
    const p1 = this.widget.renderToCanvas(metadata);
    p1.then((res) => {
      console.log('container', res);
    });
  },
  extraImage() {
    wx.showLoading({title: '图片生成中'}).then(() => {
      const p2 = this.widget.canvasToTempFilePath();
      
      p2.then(res => {
        this.setData({
          src: res.tempFilePath,
        });

        wx.hideLoading();
      });
    });
  },
  viewImage() {
    wx.previewImage({
      index: 0,
      urls: [this.data.src],
    });
  },
  saveImage() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.src,
    });
  }
});