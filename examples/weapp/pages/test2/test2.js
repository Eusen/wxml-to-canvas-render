const {el, WTCDocument} = require('../../components/wxml-to-canvas/render');

Page({
  data: {
    src: '',
    size: null,
    ready: WTCUtils.getReadyCallback('build'),
  },
  onLoad() {
    // 先创建工具，传入尺寸
    this.utils = WTCUtils.create(750, 889);

    this.setData({
      size: this.utils.getSize(),
    });
  },
  build() {
    // 通过API获取组件实例
    this.widget = this.selectComponent('.widget');
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
            class: 'backImage',
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
            class: 'coverImage',
            src,
            style: {
              ...size,
            },
          })
        })(),
        (() => {
          const text = '窝窝头，一块钱四个~';
          return el('text', {
            class: 'heihei',
            text,
            style: {
              position: 'absolute',
              left: this.utils.getScaleWidth(20 / size.width),
              top: this.utils.getScaleHeight(450 / size.height),
              color: '#fff',
              fontSize: 26,
            },
          })
        })(),
      ]
    });

    // 将DOM树转化成插件可读的数据
    const metadata = this.utils.covertElToMetadata(dom);

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
      const p2 = this.widget.canvasToTempFilePath({quality: 0.6, fileType: 'jpg'});

      p2.then(res => {
        this.setData({
          src: res.tempFilePath,
        });
        wx.hideLoading();
      }, err => {
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
