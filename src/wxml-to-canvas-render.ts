// @ts-ignore
import * as WidgetElement from './widget-ui';

interface WTCCSSStyleDeclaration {
  width?: number;
  height?: number;

  position?: 'absolute'; // 强制全部 absolute，相对定位有问题

  left?: number;
  top?: number;
  right?: number;
  bottom?: number;

  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginStart?: number;
  marginEnd?: number;

  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingStart?: number;
  paddingEnd?: number;

  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderStartWidth?: number;
  borderEndWidth?: number;

  borderRadius?: number;
  borderColor?: string;

  flexDirection?: 'column' | 'column-reverse' | 'row' | 'row-reverse';
  flexShrink?: number;
  flexGrow?: number;
  flexWrap?: 'wrap' | 'nowrap';
  direction?: 'inherit' | 'ltr' | 'rtl';
  alignContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'alignSelf' | 'flex-start' | 'center' | 'flex-end' | 'stretch';

  fontSize?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  color?: string;
  backgroundColor?: string | 'transparent';
  scale?: number;

  /**
   * 行高
   */
  textLine?: number;
  /**
   * 裁剪
   * imageClip
   * true: 宽高会以传入为准
   * false: 宽高会默认赋值为图片默认
   */
  imageClip?: boolean;
  /**
   * 裁剪位置
   */
  imageClipPosition?: 'top' | 'left' | 'center' | 'bottom' | 'right'; // imageClip = true 时有效
}

export interface WTCElementAttributes {
  id?: string;
  class?: string;
  src?: string;
  text?: string;
  style?: WTCCSSStyleDeclaration;
}

export class WTCElement {
  static inheritProps = ['fontSize', 'lineHeight', 'textAlign', 'verticalAlign', 'color'];
  children: WTCElement[] = [];
  attributes: WTCElementAttributes = {};
  redraw: (root: WTCElement) => WTCCSSStyleDeclaration;
  layout: any;

  constructor(public readonly name: string) {
  }

  setElAttr(attr: ElAttr) {
    this.attributes.class = attr.class;
    this.attributes.style = attr.style;
    this.redraw = attr.redraw;
  }

  rebuildStyle(root: WTCElement) {
    if (this.redraw) {
      const style = this.redraw(root);
      this.attributes.style = Object.assign(this.attributes.style, style);
    }

    this.layout = new WidgetElement(this.attributes.style);

    if (this.children) {
      this.children.forEach(child => {
        child.rebuildStyle(root);
        this.layout.add(child.layout);

        // 继承父级样式
        WTCElement.inheritProps.forEach(prop => {
          child.layout.computedStyle[prop] = child.layout.computedStyle[prop] || this.layout.computedStyle[prop]
        });
      });
    }

    this.layout.layout();
  }

  preloadStyle(root: WTCElement, ctx: CanvasRenderingContext2D) {
    const {style} = this.attributes;
    if (!style.lineHeight) style.lineHeight = 1;
    if (!style.scale) style.scale = 1;
    if (!style.color) style.color = '#222';
    if (!style.textAlign) style.textAlign = 'left';
    if (!style.verticalAlign) style.verticalAlign = 'top';
    style.position = 'absolute';
    return Promise.resolve();
  }

  select(className: string): WTCElement {
    if (this.attributes.class === className) return this;
    return this.children.filter(_el => _el.select(className))[0];
  }
}

export class WTCViewElement extends WTCElement {
  constructor() {
    super('view');
  }

  setElAttr(attr: ElViewAttr) {
    this.children = attr.children;
    super.setElAttr(attr);
  }

  preloadStyle(root: WTCElement, ctx: CanvasRenderingContext2D) {
    return new Promise<void>((resolve, reject) => {
      super.preloadStyle(root, ctx).then(() => {
        if (this.children) {
          Promise.all(this.children.map(child => child.preloadStyle(root, ctx))).then(() => resolve(), reject)
        }
        resolve();
      });
    });
  }
}

export class WTCTextElement extends WTCElement {
  constructor(text: string) {
    super('text');
    this.attributes.text = text;
  }

  preloadStyle(root: WTCElement, ctx: CanvasRenderingContext2D) {
    return new Promise<void>(resolve => {
      super.preloadStyle(root, ctx).then(() => {
        const {style, text} = this.attributes;

        if (!style.lineHeight) style.lineHeight = 1.5;
        if (!style.fontSize) style.fontSize = 14;

        if (style.textLine) {
          style.height = style.lineHeight * style.fontSize * style.textLine;
        } else {
          style.height = style.height || (style.lineHeight * style.fontSize);
        }

        if (!style.width) style.width = getTextWidth(ctx, text, style.fontSize);

        resolve();
      });
    });
  }
}

export class WTCImageElement extends WTCElement {
  imageWidth: number;
  imageHeight: number;

  constructor(src: string, private preload = true) {
    super('image');
    this.attributes.src = src;
  }

  preloadStyle(root: WTCElement, ctx: CanvasRenderingContext2D) {
    return new Promise<void>((resolve, reject) => {
      const {src, style} = this.attributes;

      if (!src) return reject('WTCImageElement is required attribute `src`');

      super.preloadStyle(root, ctx).then(() => {
        if (this.preload) {
          return wx.getImageInfo({src: this.attributes.src}).then(resp => {
            this.imageWidth = resp.width;
            this.imageHeight = resp.height;

            if (!style.imageClip) {
              style.width = resp.width;
              style.height = resp.height;
            }
            return style;
          });
        }

        resolve();
      });
    });
  }
}

export function getTextWidth(ctx: CanvasRenderingContext2D, text: string, fontSize = 14) {
  const originalFont = ctx.font;
  ctx.font = `${fontSize}px sans-serif`;
  const width = ctx.measureText(text).width;
  ctx.font = originalFont;
  return width;
}

export interface ElAttr {
  class?: string;
  style?: WTCCSSStyleDeclaration;
  redraw?: (root: WTCElement) => WTCCSSStyleDeclaration;
}

export interface ElViewAttr extends ElAttr {
  children?: WTCElement[];
}

export interface ElTextAttr extends ElAttr {
  text?: string;
}

export interface ElImageAttr extends ElAttr {
  src?: string;
  preload?: boolean;
}

export type MixinElAttr = ElViewAttr & ElTextAttr & ElImageAttr;

export function view(attr: ElViewAttr) {
  const el = new WTCViewElement();
  el.setElAttr(attr);
  return el;
}

export function text(text: string, attr: ElAttr) {
  const el = new WTCTextElement(text);
  el.setElAttr(attr);
  return el;
}

export function image(src: string, attr: ElAttr, preload = true) {
  const el = new WTCImageElement(src, preload);
  el.setElAttr(attr);
  return el;
}

export function el(name: 'view' | 'image' | 'text', attr: MixinElAttr): WTCElement {
  switch (name) {
    case "view":
      return view(attr);
    case "text":
      return text(attr.text, attr);
    case "image":
      return image(attr.src, attr, attr.preload);
  }
}

export interface WTCWidget {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  data: {
    use2dCanvas: boolean;
    canvasId: string;
  };
}

export interface WTCBox {
  top: number;
  left: number;
  width: number;
  height: number
}

export class WTCDocument {
  private widget: WTCWidget = null;
  boundary: WTCBox;

  static create(containerWidth = wx.getSystemInfoSync().screenWidth, containerHeight = wx.getSystemInfoSync().screenHeight) {
    return new WTCDocument(containerWidth, containerHeight);
  }

  static getReadyCallback(docInstanceName: string, callbackFnName: string) {
    return function (widget) {
      const pages = getCurrentPages();
      const self = pages[pages.length - 1];
      self[docInstanceName].setWidget(widget);
      self[callbackFnName]();
    };
  }

  constructor(public containerWidth: number, public containerHeight: number) {
  }

  setWidget(widget: any) {
    this.widget = widget;
  }

  getSize() {
    return {
      width: this.containerWidth,
      height: this.containerHeight,
    };
  }

  resize(containerWidth: number, containerHeight: number) {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
  }

  widthFix(originalWidth: number, originalHeight: number, scale = 1) {
    return {
      width: this.containerWidth * scale,
      height: this.containerWidth / originalWidth * originalHeight * scale,
    }
  }

  heightFix(originalWidth: number, originalHeight: number, scale = 1) {
    return {
      width: this.containerHeight / originalHeight * originalWidth * scale,
      height: this.containerHeight * scale,
    }
  }

  getScaleWidth(scale: number) {
    return this.containerWidth * scale;
  }

  getScaleHeight(scale: number) {
    return this.containerHeight * scale;
  }

  renderToCanvas(element: WTCElement) {
    const ctx = this.widget.ctx;
    const canvas = this.widget.canvas;
    const {use2dCanvas} = this.widget.data;

    return new Promise((resolve, reject) => {
      // 第一步，预加载样式，主要是针对特定属性进行纠正
      element.preloadStyle(element, ctx).then(() => {
        // 第二步，构建样式，主要是针对一些需要利用其他元素样式进行的构建（比如图片）
        element.rebuildStyle(element);

        const {width, height} = element.attributes.style;
        const {top, left} = element.layout.layoutBox;

        if (use2dCanvas && !canvas) {
          return reject(new Error('renderToCanvas: fail canvas has not been created'));
        }

        ctx.clearRect(0, 0, width, height);

        this.boundary = {
          top,
          left,
          width,
          height,
        };

        const draw = new WTCRenderer(ctx, canvas, use2dCanvas);
        draw.drawNode(element).then(() => {
          if (!use2dCanvas) {
            return (ctx as any).draw(false, () => {
              resolve(element.layout);
            });
          }

          return resolve(element.layout);
        });
      });
    })
  }

  canvasToTempFilePath(options: { scale?: number; fileType?: 'jpg' | 'png', quality?: number } = {}) {
    const {use2dCanvas, canvasId} = this.widget.data;

    return new Promise((resolve, reject) => {
      const {
        top, left, width, height
      } = this.boundary;

      const copyArgs = {
        x: left,
        y: top,
        width,
        height,
        destWidth: width * (options.scale || 1),
        destHeight: height * (options.scale || 1),
        canvasId,
        canvas: null,
        fileType: options.fileType || 'png',
        quality: options.quality || 1,
        success: resolve,
        fail: reject
      };

      if (use2dCanvas) {
        delete copyArgs.canvasId;
        copyArgs.canvas = this.widget.canvas;
      }
      wx.canvasToTempFilePath(copyArgs, this.widget as any);
    })
  }
}

export class WTCRenderer {
  constructor(
    public ctx: CanvasRenderingContext2D,
    public canvas: HTMLCanvasElement,
    public use2dCanvas = false,
  ) {
  }

  roundRect(x: number, y: number, w: number, h: number, r: number, fill = true, stroke = false) {
    if (r < 0) return;
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 3 / 2);
    ctx.arc(x + w - r, y + r, r, Math.PI * 3 / 2, 0);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + r);
    if (stroke) ctx.stroke();
    if (fill) ctx.fill();
  }

  drawView(box: WTCBox, style: WTCCSSStyleDeclaration) {
    const ctx = this.ctx;
    const {
      left: x, top: y, width: w, height: h
    } = box;
    const {
      borderRadius = 0,
      borderWidth = 0,
      borderColor,
      color = '#000',
      backgroundColor = 'transparent',
    } = style;
    ctx.save();
    // 外环
    if (borderWidth > 0) {
      ctx.fillStyle = borderColor || color;
      this.roundRect(x, y, w, h, borderRadius);
    }

    // 内环
    ctx.fillStyle = backgroundColor;
    const innerWidth = w - 2 * borderWidth;
    const innerHeight = h - 2 * borderWidth;
    const innerRadius = borderRadius - borderWidth >= 0 ? borderRadius - borderWidth : 0;
    this.roundRect(x + borderWidth, y + borderWidth, innerWidth, innerHeight, innerRadius);
    ctx.restore();
  }

  drawImage(src, box: WTCBox, style: WTCCSSStyleDeclaration) {
    return new Promise((resolve, reject) => {
      const ctx = this.ctx;
      const canvas = this.canvas;

      const {
        borderRadius = 0
      } = style;
      const {
        left: x, top: y, width: w, height: h
      } = box;
      ctx.save();
      this.roundRect(x, y, w, h, borderRadius, false, false);
      ctx.clip();

      const _drawImage = (img) => {
        if (this.use2dCanvas) {
          const Image = (canvas as any).createImage();
          Image.onload = () => {
            ctx.drawImage(Image, x, y, w, h);
            ctx.restore();
            resolve();
          };
          Image.onerror = () => {
            reject(new Error(`createImage fail: ${img}`));
          };
          Image.src = img;
        } else {
          ctx.drawImage(img, x, y, w, h);
          ctx.restore();
          resolve();
        }
      }

      const isTempFile = /^wxfile:\/\//.test(src);
      const isNetworkFile = /^https?:\/\//.test(src);

      if (isTempFile) {
        _drawImage(src);
      } else if (isNetworkFile) {
        wx.downloadFile({
          url: src,
          success(res) {
            if (res.statusCode === 200) {
              _drawImage(res.tempFilePath);
            } else {
              reject(new Error(`downloadFile:fail ${src}`));
            }
          },
          fail() {
            reject(new Error(`downloadFile:fail ${src}`));
          }
        })
      } else {
        reject(new Error(`image format error: ${src}`));
      }
    })
  }

  drawText(text: string, box: WTCBox, style: WTCCSSStyleDeclaration) {
    const ctx = this.ctx;
    let {
      left: x, top: y, width: w, height: h
    } = box;
    let {
      color = '#000',
      lineHeight = 1.5,
      fontSize = 14,
      textAlign = 'left',
      verticalAlign = 'top',
      backgroundColor = 'transparent'
    } = style;

    if (!text || (lineHeight > h)) return;

    ctx.save();
    ctx.textBaseline = 'top';
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = textAlign;

    // 背景色
    ctx.fillStyle = backgroundColor;
    this.roundRect(x, y, w, h, 0);

    // 文字颜色
    ctx.fillStyle = color;

    // 水平布局
    switch (textAlign) {
      case 'left':
        break;
      case 'center':
        x += 0.5 * w;
        break;
      case 'right':
        x += w;
        break;
      default:
        break;
    }

    const textWidth = ctx.measureText(text).width;
    const actualHeight = Math.ceil(textWidth / w) * lineHeight;
    let paddingTop = Math.ceil((h - actualHeight) / 2);
    if (paddingTop < 0) paddingTop = 0;

    // 垂直布局
    switch (verticalAlign) {
      case 'top':
        break;
      case 'middle':
        y += paddingTop;
        break;
      case 'bottom':
        y += 2 * paddingTop;
        break;
      default:
        break;
    }

    const inlinePaddingTop = Math.ceil((lineHeight - fontSize) / 2);

    // 不超过一行
    if (textWidth <= w) {
      ctx.fillText(text, x, y + inlinePaddingTop);
      return;
    }

    // 多行文本
    const chars = text.split('');
    const _y = y;

    // 逐行绘制
    let line = '';
    for (const ch of chars) {
      const testLine = line + ch;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > w) {
        ctx.fillText(line, x, y + inlinePaddingTop);
        y += lineHeight;
        line = ch;
        if ((y + lineHeight) > (_y + h)) break;
      } else {
        line = testLine;
      }
    }

    // 避免溢出
    if ((y + lineHeight) <= (_y + h)) {
      ctx.fillText(line, x, y + inlinePaddingTop);
    }
    ctx.restore();
  }

  drawNode(element: WTCElement) {
    return new Promise((resolve, reject) => {
      if (!element) return resolve();

      const {name} = element;
      const {layoutBox, computedStyle} = element.layout;
      const {src, text} = element.attributes;

      (() => {
        switch (name) {
          case 'view':
            this.drawView(layoutBox, computedStyle);
            return Promise.resolve();
          case 'image':
            return this.drawImage(src, layoutBox, computedStyle);
          case 'text':
            this.drawText(text, layoutBox, computedStyle);
            return Promise.resolve();
        }
      })().then(() => {
        const childList = Object.values(element.children);

        if (childList.length === 0) {
          return resolve();
        }

        const waterFall = (index = 0) => {
          this.drawNode(childList[index]).then(() => {
            if (index < childList.length) {
              waterFall(index + 1);
            } else {
              resolve();
            }
          }, reject);
        };

        waterFall();
      }, reject)
    });
  }
}
