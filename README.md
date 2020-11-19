# wxml-to-canvas-render

[![](https://img.shields.io/npm/l/wxml-to-canvas)](https://github.com/wechat-miniprogram/wxml-to-canvas)

本仓库为 [wxml-to-canvas](https://github.com/wechat-miniprogram/wxml-to-canvas) 外部（非侵入，不改变原版API）扩展渲染库，可以更高效、快速地生成插件需要的数据。当海报中有需要循环的数据时，原版需要复杂的字符串拼接。而通过这个扩展，可以非常方便地做到循环渲染（有点类似与React）。

目前扩展的内容比较简单，大致包含三个部分：

1. DOM树组合
2. DOM树转换
3. 各元素尺寸计算

## 用法

以原生小程序为例：

### 第一步：导入组件

将 `/dist/wxml-to-canvas` 复制到小程序项目的 `components/` 中

``` json
{
  "usingComponents": {
    "wxml-to-canvas": "../../components/wxml-to-canvas" // 页面中使用相对路径引入
  }
}
```

### 第二步：导入函数和工具类

``` js
const {
  el, 
  WTCUtils, 
  covertElToMetadata
} = require('../../components/wxml-to-canvas/wtc'); // 注意：扩展库位于 wxml-to-canvas/wtc.js 内
```

### 第三步：创建工具类

``` js
onLoad() {
  const info = wx.getSystemInfoSync();
  // 先创建工具类实例，传入画布尺寸
  // 我这里传入的是屏幕尺寸，你也可以传入设计图的实际尺寸
  this.utils = WTCUtils.create(info.screenWidth, info.screenHeight);

  this.setData({
    size: this.utils.getSize(),
  }, () => {
    setTimeout(() => {
      // 第四步：构建。
      // 需要等待页面渲染完成，否则找不到 canvas
      this.build();
    }, 100);
  });
}
```

### 第四步：构建
``` js
build() {
  // 通过小程序API获取组件实例
  this.widget = this.selectComponent('.widget');
  
  // 将组件注入到工具类实例中
  this.utils.setWidget(this.widget);

  // 获取容器尺寸
  const size = this.utils.getSize();

  // 构建 DOM 树
  const dom = el('view', {
    // 每一个 el 都必须定义一个唯一的 class
    class: 'container',
    // 样式，可以参考原插件文档中的样式部分
    style: {
      ...size,
      backgroundColor: '#fff',
    },
    children: [
      (() => {
        // 渲染图片
        const src = 'https://cloud-minapp-37929.cloud.ifanrusercontent.com/1kffKYiy6a9aLqSD.jpg';
        // 这里的 1024, 639 为图片素材的原始宽高
        // 通过下面方法，你可得到【与容器等高】，且【比例不变】的图片尺寸
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
            // 让图片居中
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
            // 因为 left 需要字体宽度来确定位置
            // 所以通过工具类 getFontWidth 计算了一遍
            // 如果不传 width，扩展库会根据传入的文本，自动计算一个宽度
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
            // 每一个元素的类都不能相同
            // 所以循环遍历的时候，一定要注意把索引带上
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

  ...
}
```
去看看 [原插件样式定义](https://github.com/wechat-miniprogram/wxml-to-canvas#%E6%A0%B7%E5%BC%8F)

### 第五步：DOM转化

``` js
// 将DOM树转化成插件可读的数据
const metadata = covertElToMetadata(dom);
```

### 第六步：插件渲染

``` js
// 直接将数据喂给插件即可
const p1 = this.widget.renderToCanvas(metadata);

p1.then((res) => {
  console.log('container', res);
});
```

### 第七步：生成图片

``` js
const p2 = this.widget.canvasToTempFilePath();

p2.then(res => {
  this.setData({
    src: res.tempFilePath,
  });
});
```

---

## API

### 创建 DOM Element
> <b>el(tagName: 'view' | 'image' | 'text', attr: WTCElement): `WTCElement`</b>

- tagName 目前官方仅支持 'view' | 'image' | 'text'
- `WTCElement`

``` ts
export interface WTCElement {
  tagName?: string;
  class: string; // 必传，且保证唯一
  style?: WTCCSSStyleDeclaration; // 样式
  children?: (WTCElement | null)[]; // 子元素数组
  src?: string; // image 时传入
  text?: string; // text 时传入
}
```

### 将 DOM Element 转化为插件需要的数据
> <b>covertElToMetadata(element: WTCElement, deep = 0): `WTCMetadata`</b>

- WTCElement 构建完的Element对象
- deep 深度，扩展库自用，误传
- `WTCMetadata`
``` ts
export interface WTCMetadata {
  wxml: string; // 插件需要的 wxml
  style: { [key: string]: WTCCSSStyleDeclaration }; // 插件需要的样式
  width: number; // 容器宽度
  height: number; // 容器高度
}
```

### 创建工具类
> <b>WTCUtils.create(containerWidth: number, containerHeight: number): WTCUtils</b>

- containerWidth 默认为屏幕宽度
- containerHeight 默认为屏幕高度

### 设置官方插件实例 
> <b>WTCUtils#setWidget(widget: any)</b>

- widget 官方插件实例

### 获取容器宽高
> <b>WTCUtils#getSize(): {`width`: number; `height`: number;}</b>

- `width` 容器宽度
- `height` 容器高度

### 以容器宽度为基准，计算等比缩放的宽高
> <b>WTCUtils#widthFix(originalWidth: number, originalHeight: number, scale = 1): {`width`: number; `height`: number;}</b>

- originalWidth 原始宽度
- originalHeight 原始高度
- scale 缩放比例
- `width` (与容器等宽) * 缩放比例
- `height` (与容器等宽的同时，按原始宽高比，等比缩放的高度) * 缩放比例

### 以容器高度为基准，计算等比缩放的宽高
> <b>WTCUtils#heightFix(originalWidth: number, originalHeight: number, scale = 1): {`width`: number; `height`: number;}</b>

- originalWidth 原始宽度
- originalHeight 原始高度
- scale 缩放比例
- `width` (与容器等高的同时，按原始宽高比，等比缩放的宽度) * 缩放比例
- `height` (与容器等高) * 缩放比例

### 获取缩放后的宽度
> <b>WTCUtils#getScaleWidth(scale: number): number</b>

- scale 缩放比例

### 获取缩放后的高度
> <b>WTCUtils#getScaleHeight(scale: number): number</b>

- scale 缩放比例

### 获取字符串（精确）宽度
> <b>WTCUtils#getFontWidth(text: string, fontSize = 14): number</b>

- text 字符串

### style 中的附加属性：textLine

我在原有style的基础上增加了一个新的属性 `textLine`，顾名思义，这个属性用于多行文本，比如 textLine 传入 2 时，文本元素的高度 = 文字高度 * 2。


## 目录说明
- `/dist/wxml-to-canvas` 为合成版组件，可以独立使用。
- `/examples` 存放了一些使用示例（目前只完善了原生小程序）

## 作者

[@Eusen](https://github.com/Eusen)

## 特别鸣谢

- [@jiangyh](https://github.com/jiangyh) 感谢 [隔壁小甜] 第一时间试用并给予支持

## issues

[提个建议？](https://github.com/Eusen/wxml-to-canvas-render/issues/new)