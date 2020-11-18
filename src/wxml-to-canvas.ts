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

export function widthFix(originalWidth: number, originalHeight: number, scale = 100, containerWidth = wx.getSystemInfoSync().screenWidth) {
  return {
    width: containerWidth * (scale / 100),
    height: containerWidth / originalWidth * originalHeight * (scale / 100),
  }
}

export function heightFix(originalWidth: number, originalHeight: number, scale = 100, containerHeight = wx.getSystemInfoSync().screenHeight) {
  return {
    width: containerHeight / originalHeight * originalWidth * (scale / 100),
    height: containerHeight * (scale / 100),
  }
}

export function getFontWidth(str: string, fontSize: number) {
  const strLength = str.length;
  const zh = str.match(/\p{Unified_Ideograph}/ug);
  const zhLength = zh ? zh.length : 0;
  const enLength = strLength - zhLength;
  return enLength * fontSize / 2 + zhLength * fontSize;
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

