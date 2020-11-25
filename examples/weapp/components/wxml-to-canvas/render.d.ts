interface WTCCSSStyleDeclaration {
    width?: number;
    height?: number;
    position?: 'absolute';
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
    imageClipPosition?: 'top' | 'left' | 'center' | 'bottom' | 'right';
}
export interface WTCElementAttributes {
    id?: string;
    class?: string;
    src?: string;
    text?: string;
    style?: WTCCSSStyleDeclaration;
}
export declare class WTCElement {
    readonly name: string;
    static inheritProps: string[];
    children: WTCElement[];
    attributes: WTCElementAttributes;
    redraw: (root: WTCElement) => WTCCSSStyleDeclaration;
    layout: any;
    constructor(name: string);
    setElAttr(attr: ElAttr): void;
    rebuildStyle(root: WTCElement): void;
    preloadStyle(root: WTCElement, ctx: CanvasRenderingContext2D): Promise<void>;
    select(className: string): WTCElement;
}
export declare class WTCViewElement extends WTCElement {
    constructor();
    setElAttr(attr: ElViewAttr): void;
    preloadStyle(root: WTCElement, ctx: CanvasRenderingContext2D): Promise<void>;
}
export declare class WTCTextElement extends WTCElement {
    constructor(text: string);
    preloadStyle(root: WTCElement, ctx: CanvasRenderingContext2D): Promise<void>;
}
export declare class WTCImageElement extends WTCElement {
    private preload;
    imageWidth: number;
    imageHeight: number;
    constructor(src: string, preload?: boolean);
    preloadStyle(root: WTCElement, ctx: CanvasRenderingContext2D): Promise<void>;
}
export declare function getTextWidth(ctx: CanvasRenderingContext2D, text: string, fontSize?: number): number;
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
export declare type MixinElAttr = ElViewAttr & ElTextAttr & ElImageAttr;
export declare function view(attr: ElViewAttr): WTCViewElement;
export declare function text(text: string, attr: ElAttr): WTCTextElement;
export declare function image(src: string, attr: ElAttr, preload?: boolean): WTCImageElement;
export declare function el(name: 'view' | 'image' | 'text', attr: MixinElAttr): WTCElement;
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
    height: number;
}
export declare class WTCDocument {
    containerWidth: number;
    containerHeight: number;
    private widget;
    boundary: WTCBox;
    static create(containerWidth?: number, containerHeight?: number): WTCDocument;
    static getReadyCallback(docInstanceName: string, callbackFnName: string): (widget: any) => void;
    constructor(containerWidth: number, containerHeight: number);
    setWidget(widget: any): void;
    getSize(): {
        width: number;
        height: number;
    };
    resize(containerWidth: number, containerHeight: number): void;
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
    renderToCanvas(element: WTCElement): Promise<unknown>;
    canvasToTempFilePath(options?: {
        scale?: number;
        fileType?: 'jpg' | 'png';
        quality?: number;
    }): Promise<unknown>;
}
export declare class WTCRenderer {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    use2dCanvas: boolean;
    constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, use2dCanvas?: boolean);
    roundRect(x: number, y: number, w: number, h: number, r: number, fill?: boolean, stroke?: boolean): void;
    drawView(box: WTCBox, style: WTCCSSStyleDeclaration): void;
    drawImage(src: any, box: WTCBox, style: WTCCSSStyleDeclaration): Promise<unknown>;
    drawText(text: string, box: WTCBox, style: WTCCSSStyleDeclaration): void;
    drawNode(element: WTCElement): Promise<unknown>;
}
export {};
