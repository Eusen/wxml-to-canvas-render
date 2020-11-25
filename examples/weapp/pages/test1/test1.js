const {el, WTCDocument} = require('../../components/wxml-to-canvas/render');

Page({
  data: {
    src: '',
    size: null,
    ready: WTCDocument.getReadyCallback('doc', 'build'),
  },
  onLoad() {
    const info = wx.getSystemInfoSync();
    // 先创建工具，传入尺寸
    // 我这里传入的是屏幕尺寸
    // 你也可以传入设计图的实际尺寸
    this.doc = WTCDocument.create(info.screenWidth, info.screenHeight);

    this.setData({
      size: this.doc.getSize(),
    });
  },
  build() {
    // 获取当前尺寸
    const size = this.doc.getSize();

    // 构建 DOM 树
    const dom = el('view', {
      class: 'container',
      style: {
        ...size,
        backgroundColor: '#fff',
      },
      children: [
        (() => {
          const src = 'https://cloud-minapp-37929.cloud.ifanrusercontent.com/1kffKYiy6a9aLqSD.jpg';
          // 这里的宽高，是图片素材的原始宽高
          const bgSize = this.doc.heightFix(1024, 639);

          return el("image", {
            class: 'bgImage',
            src,
            style: {
              // 一般 absolute 比较常用，因为元素的位置基本都是确定的
              // 如果用 relative 样式不好控制，因为目前官方插件对样式支持的并不是很好
              position: "absolute",
              ...bgSize,
              top: 0,
              left: size.width / 2 - bgSize.width / 2,
            },
          });
        })(),
        (() => {
          const src = 'https://cloud-minapp-37929.cloud.ifanrusercontent.com/1kffNWemWO0tCukQ.png';
          const ccSize = this.doc.widthFix(259, 377, 0.5);

          return el("image", {
            class: 'ccImage',
            src,
            style: {
              position: "absolute",
              ...ccSize,
              bottom: 0,
              left: 0,
            },
          });
        })(),
        (() => {
          const title = '短歌行';
          return el("text", {
            class: 'title',
            text: title,
            style: {
              position: 'absolute',
              top: 30,
              left: size.width / 2,
              color: '#fff',
              fontSize: 18,
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: 'rgba(0,0,0,0.6)',
            },
            redraw: (root) => {
              const el = root.select(`title`);
              return {
                left: size.width / 2 - el.attributes.style.width / 2
              };
            },
          })
        })(),
        ...(() => {
          const texts = [
            '对酒当歌，人生几何。',
            '譬如朝露，去日苦多。',
            '慨当以慷，忧思难忘。',
            '何以解忧？唯有杜康。',
            '青青子衿，悠悠我心。',
            '但为君故，沉吟至今。',
            '呦呦鹿鸣，食野之苹。',
            '我有嘉宾，鼓瑟吹笙。',
            '明明如月，何时可掇？',
            '忧从中来，不可断绝。',
            '越陌度阡，枉用相存。',
            '契阔谈䜩，心念旧恩。',
            '月明星稀，乌鹊南飞。',
            '绕树三匝，何枝可依？',
            '山不厌高，海不厌深。',
            '周公吐哺，天下归心。',
          ];
          return texts.map((text, index) => {
            return el('text', {
              // 每一个元素的类都不能相同，所以循环遍历的时候，一定要注意把索引带上
              class: `text${index}`,
              text,
              style: {
                top: index * 20 + 60,
                color: '#fff',
                textAlign: "center",
                verticalAlign: "middle",
                backgroundColor: 'rgba(0,0,0,0.6)',
              },
              redraw: (root) => {
                const el = root.select(`text${index}`);
                return {
                  left: size.width / 2 - el.attributes.style.width / 2
                };
              },
            });
          })
        })(),
        (() => {
          const tip = '下面还有内容哦';
          return el('text', {
            class: 'tip',
            text: tip,
            style: {
              position: 'absolute',
              bottom: 16,
              right: 16,
            }
          })
        })(),
      ]
    });

    console.log(dom);

    this.doc.renderToCanvas(dom).then((res) => {
      console.log('container', res);
    });
  },
  extraImage() {
    wx.showLoading({title: '图片生成中'}).then(() => {
      this.doc.canvasToTempFilePath().then(res => {
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
