declare const wx;

export interface WTCElement {
  tagName?: string;
  class: string;
  style?: WTCCSSStyleDeclaration;
  children?: (WTCElement | null)[];
  src?: string;
  text?: string;
}

export interface WTCMetadata {
  wxml: string;
  style: { [key: string]: WTCCSSStyleDeclaration };
  width: number;
  height: number;
}

export function el(tagName: 'view' | 'image' | 'text', attr: WTCElement): WTCElement {
  return {
    ...attr,
    tagName,
  };
}

export function covertElToMetadata(element: WTCElement, deep = 0): WTCMetadata {
  // @ts-ignore
  const tabs = new Array(deep).fill('  ').join('');
  const childWXML: string[] = [];

  if (!element.style) element.style = {};

  if (!element.style.lineHeight) {
    element.style.lineHeight = 1.5;
  }

  if (!element.style.fontSize) {
    element.style.fontSize = 14;
  }

  if (element.tagName === 'text' && !element.style.width) {
    element.style.width = getFontWidth(element.text!, element.style.fontSize);
  }

  if (element.style.textLine) {
    element.style.height = element.style.lineHeight * element.style.textLine * element.style.fontSize;
  } else {
    element.style.height = element.style.height || (element.style.lineHeight * element.style.fontSize);
  }

  element.style.lineHeight = (element.style.lineHeight + '') as any;

  let style = {[element.class!]: element.style};

  if (element.children) {
    element.children.forEach(e => {
      if (!e) return;
      const child = covertElToMetadata(e, deep + 1);
      childWXML.push(child.wxml);
      // @ts-ignore
      style = Object.assign(style, child.style);
    });
  }

  const hasChild = childWXML.length > 0;

  return {
    wxml: `${tabs}<${element.tagName}${element.class ? ` class="${element.class}"` : ''}${element.src ? ` src="${element.src}"` : ''}>${hasChild ? '\n' : ''}${element.text ? `${element.text}${childWXML.length > 0 ? '\n' : ''}` : ''}${childWXML.join('\n')}${hasChild ? `\n${tabs}` : ''}</${element.tagName}>`,
    style,
    width: element.style ? element.style.width! : 0,
    height: element.style ? element.style.height! : 0,
  }
}

/**
 * 粗略计算，不精确
 * @param str
 * @param fontSize
 */
export function getFontWidth(str: string, fontSize = 14) {
  return str.split('').reduce((width, char) => {
    if (char.charCodeAt(0) < 128) {
      return width + fontSize / 2;
    }
    return width + fontSize;
  }, 0);
}

export class WTCUtils {
  widget = null;

  static create(containerWidth = wx.getSystemInfoSync().screenWidth, containerHeight = wx.getSystemInfoSync().screenHeight) {
    return new WTCUtils(containerWidth, containerHeight);
  }

  constructor(private containerWidth: number, private containerHeight: number) {
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

  /**
   * 精确计算
   */
  getFontWidth(text: string, fontSize = 14) {
    const {ctx} = this.widget;
    const originalFont = ctx.font;
    ctx.font = `${fontSize}px sans-serif`;
    const width = ctx.measureText(text).width;
    ctx.font = originalFont;
    return width;
  }
}

interface WTCCSSStyleDeclaration {
  width?: number;
  height?: number;
  position?: 'relative' | 'absolute';
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  margin?: number;
  padding?: number;
  borderWidth?: number;
  borderRadius?: number;
  flexDirection?: 'column' | 'row';
  flexShrink?: number;
  flexGrow?: number;
  flexWrap?: 'wrap' | 'nowrap';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'alignSelf' | 'flex-start' | 'center' | 'flex-end' | 'stretch';

  fontSize?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  color?: string;
  backgroundColor?: string | 'transparent';

  scale?: number;

  textLine?: number;
}
