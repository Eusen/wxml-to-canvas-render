const {el, WTCUtils, covertElToMetadata} = require('../../components/wxml-to-canvas/wtc');

Page({
  data: {
    src: '',
    size: null,
  },
  onLoad() {
    const info = wx.getSystemInfoSync();
    // 先创建工具，传入尺寸
    // 我这里传入的是屏幕尺寸
    // 你也可以传入设计图的实际尺寸
    this.utils = WTCUtils.create(info.screenWidth, info.screenHeight);

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
          const src = 'https://cloud-minapp-37929.cloud.ifanrusercontent.com/1kffKYiy6a9aLqSD.jpg';
          // 这里的宽高，是图片素材的原始宽高
          const bgSize = this.utils.heightFix(1024, 639);

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
          const ccSize = this.utils.widthFix(259, 377, 0.5);

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
          const textWidth = this.utils.getFontWidth(title, 18);
          return el("text", {
            class: 'title',
            text: title,
            style: {
              top: 30,
              left: size.width / 2 - textWidth / 2,
              width: textWidth + 16,
              color: '#fff',
              fontSize: 18,
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: 'rgba(0,0,0,0.6)',
            }
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
            const textWidth = this.utils.getFontWidth(text);
            return el('text', {
              // 每一个元素的类都不能相同，所以循环遍历的时候，一定要注意把索引带上
              class: `text${index}`,
              text,
              style: {
                top: index * 14 + 44,
                left: size.width / 2 - textWidth / 2,
                width: textWidth + 16,
                color: '#fff',
                textAlign: "center",
                verticalAlign: "middle",
                backgroundColor: 'rgba(0,0,0,0.6)',
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
  }
})
