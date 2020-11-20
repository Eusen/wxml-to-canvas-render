const {el, WTCUtils, covertElToMetadata} = require('../../components/wxml-to-canvas/wtc');

Page({
  data: {
    src: '',
    size: null,
  },
  onLoad() {
    const info = wx.getSystemInfoSync();
    // 先创建工具，传入尺寸
    const height = info.screenHeight * 453 / 641;
    this.utils = WTCUtils.create(info.screenWidth, height);

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
        backgroundColor: '#000',
      },
      children: [
        // 封面
        (() => {
          const coverSize = this.utils.heightFix(1024, 577, 0.7);
          return el('image', {
            class: 'cover',
            src: 'https://cloud-minapp-37929.cloud.ifanrusercontent.com/1kflrtz76Uf6fRGY.jpg',
            style: {
              ...coverSize,
              position: 'absolute',
              top: 0,
              left: (size.width * 1.2) / 2 - coverSize.width / 2,
            }
          })
        })(),
        // 遮挡
        (() => {
          return el('image', {
            class: 'mask',
            src: 'https://cloud-minapp-37929.cloud.ifanrusercontent.com/1kflDQtAeJC7btAo.png',
            style: {
              ...size,
            }
          });
        })(),
        // logo JayJay
        (() => {
          return el('text', {
            class: 'JayJay',
            text: 'JayJay',
            style: {
              position: 'absolute',
              top: size.height * 0.09,
              right: size.width * 0.1,
              color: '#000',
              fontSize: 14,
            },
          });
        })(),
        // 名字
        (() => {
          return el('text', {
            class: 'name',
            text: '周 杰 伦',
            style: {
              position: 'absolute',
              top: size.height * 0.55,
              right: size.width * 0.1,
              color: '#fff',
              fontSize: 16,
            },
          });
        })(),
        // 不能说的秘密
        ...(() => {
          const texts = [
            {
              text: '不',
              style: {
                left: size.width * 0.2,
                bottom: size.height * 0.38,
                // color: '#fff',
                fontSize: 40,
              }
            },
            {
              text: '能',
              style: {
                left: size.width * 0.22,
                bottom: size.height * 0.29,
                fontSize: 42,
              }
            },
            {
              text: '说',
              style: {
                left: size.width * 0.23,
                bottom: size.height * 0.18,
                fontSize: 46,
              }
            },
            {
              text: '的',
              style: {
                left: size.width * 0.13,
                bottom: size.height * 0.22,
                fontSize: 38,
              }
            },
            {
              text: '秘',
              style: {
                left: size.width * 0.1,
                bottom: size.height * 0.1,
                fontSize: 50,
              }
            },
            {
              text: '密',
              style: {
                left: size.width * 0.23,
                bottom: size.height * 0.07,
                fontSize: 46,
              }
            },
          ];
          return texts.map((t, index) => {
            return el('text', {
              class: `title${index}`,
              text: t.text,
              style: {
                position: 'absolute',
                color: '#222',
                ...t.style,
                bottom: t.style.bottom - size.height * 0.09,
              }
            });
          });
        })(),
        // subtitle
        ...(() => {
          const subtitle = '周杰伦深圳演唱会';
          return subtitle.split('').map((text, index) => {
            return el('text', {
              class: `subtitle${index}`,
              text, 
              style: {
                position: 'absolute',
                left: size.width * 0.37,
                top: size.height * 0.7 + 19 * index,
                color: '#222',
                fontSize: 16,
              }
            });
          });
        })(),
        // 12月04日
        ...(() => {
          const texts = [
            {
              text: '12',
              style: {
                right: size.width * 0.2,
                bottom: size.height * 0.3,
                fontSize: 30,
              }
            },
            {
              text: '月',
              style: {
                right: size.width * 0.1,
                bottom: size.height * 0.3,
                fontSize: 20,
              }
            },
            {
              text: '4',
              style: {
                right: size.width * 0.2,
                bottom: size.height * 0.3,
                fontSize: 30,
              }
            },
            {
              text: '日',
              style: {
                right: size.width * 0.2,
                bottom: size.height * 0.3,
                fontSize: 20,
              }
            },
          ];
          return texts.map((t, index) => {
            return el('text', {
              class: `time${index}`,
              text: t.text,
              style: {
                position: 'absolute',
                color: '#222',
                ...t.style,
              }
            });
          });
        })(),
        // Friday. 20:07
        (() => {
          const text = 'Friday. 20:07';
        })(),
        // 联系方式
        ...(() => {
          const texts = [
            '如有疑问请联系客服人员，联系方式如下：',
            'https://github.com/Eusen/wxml-to-canvas-render/issues/new',
            '179530591@qq.com',
          ];
          return [];
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
