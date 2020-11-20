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
    style: {
        [key: string]: WTCCSSStyleDeclaration;
    };
    width: number;
    height: number;
}
export declare function el(tagName: 'view' | 'image' | 'text', attr: WTCElement): WTCElement;
export declare class WTCUtils {
    private containerWidth;
    private containerHeight;
    widget: any;
    static create(containerWidth?: any, containerHeight?: any): WTCUtils;
    constructor(containerWidth: number, containerHeight: number);
    setWidget(widget: any): void;
    getSize(): {
        width: number;
        height: number;
    };
    widthFix(originalWidth: number, originalHeight: number, scale?: number): {
        width: number;
        height: number;
    };
    heightFix(originalWidth: number, originalHeight: number, scale?: number): {
        width: number;
        height: number;
    };
    getScaleWidth(scale: number): number;
    getScaleHeight(scale: number): number;
    /**
     * 精确计算
     */
    getFontWidth(text: string, fontSize?: number): any;
    covertElToMetadata(element: WTCElement, deep?: number): WTCMetadata;
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
export {};
