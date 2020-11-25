"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.WTCRenderer = exports.WTCDocument = exports.el = exports.image = exports.text = exports.view = exports.getTextWidth = exports.WTCImageElement = exports.WTCTextElement = exports.WTCViewElement = exports.WTCElement = void 0;
// @ts-ignore
var WidgetElement = require("./widget-ui");
var WTCElement = /** @class */ (function () {
    function WTCElement(name) {
        this.name = name;
        this.children = [];
        this.attributes = {};
    }
    WTCElement.prototype.setElAttr = function (attr) {
        this.attributes["class"] = attr["class"];
        this.attributes.style = attr.style;
        this.redraw = attr.redraw;
    };
    WTCElement.prototype.rebuildStyle = function (root) {
        var _this = this;
        if (this.redraw) {
            var style = this.redraw(root);
            this.attributes.style = Object.assign(this.attributes.style, style);
        }
        this.layout = new WidgetElement(this.attributes.style);
        if (this.children) {
            this.children.forEach(function (child) {
                child.rebuildStyle(root);
                _this.layout.add(child.layout);
                // 继承父级样式
                WTCElement.inheritProps.forEach(function (prop) {
                    child.layout.computedStyle[prop] = child.layout.computedStyle[prop] || _this.layout.computedStyle[prop];
                });
            });
        }
        this.layout.layout();
    };
    WTCElement.prototype.preloadStyle = function (root, ctx) {
        var style = this.attributes.style;
        if (!style.lineHeight)
            style.lineHeight = 1;
        if (!style.scale)
            style.scale = 1;
        if (!style.color)
            style.color = '#222';
        if (!style.textAlign)
            style.textAlign = 'left';
        if (!style.verticalAlign)
            style.verticalAlign = 'top';
        style.position = 'absolute';
        return Promise.resolve();
    };
    WTCElement.prototype.select = function (className) {
        if (this.attributes["class"] === className)
            return this;
        return this.children.filter(function (_el) { return _el.select(className); })[0];
    };
    WTCElement.inheritProps = ['fontSize', 'lineHeight', 'textAlign', 'verticalAlign', 'color'];
    return WTCElement;
}());
exports.WTCElement = WTCElement;
var WTCViewElement = /** @class */ (function (_super) {
    __extends(WTCViewElement, _super);
    function WTCViewElement() {
        return _super.call(this, 'view') || this;
    }
    WTCViewElement.prototype.setElAttr = function (attr) {
        this.children = attr.children;
        _super.prototype.setElAttr.call(this, attr);
    };
    WTCViewElement.prototype.preloadStyle = function (root, ctx) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _super.prototype.preloadStyle.call(_this, root, ctx).then(function () {
                if (_this.children) {
                    Promise.all(_this.children.map(function (child) { return child.preloadStyle(root, ctx); })).then(function () { return resolve(); }, reject);
                }
                resolve();
            });
        });
    };
    return WTCViewElement;
}(WTCElement));
exports.WTCViewElement = WTCViewElement;
var WTCTextElement = /** @class */ (function (_super) {
    __extends(WTCTextElement, _super);
    function WTCTextElement(text) {
        var _this = _super.call(this, 'text') || this;
        _this.attributes.text = text;
        return _this;
    }
    WTCTextElement.prototype.preloadStyle = function (root, ctx) {
        var _this = this;
        return new Promise(function (resolve) {
            _super.prototype.preloadStyle.call(_this, root, ctx).then(function () {
                var _a = _this.attributes, style = _a.style, text = _a.text;
                if (!style.lineHeight)
                    style.lineHeight = 1.5;
                if (!style.fontSize)
                    style.fontSize = 14;
                if (style.textLine) {
                    style.height = style.lineHeight * style.fontSize * style.textLine;
                }
                else {
                    style.height = style.height || (style.lineHeight * style.fontSize);
                }
                if (!style.width)
                    style.width = getTextWidth(ctx, text, style.fontSize);
                resolve();
            });
        });
    };
    return WTCTextElement;
}(WTCElement));
exports.WTCTextElement = WTCTextElement;
var WTCImageElement = /** @class */ (function (_super) {
    __extends(WTCImageElement, _super);
    function WTCImageElement(src, preload) {
        if (preload === void 0) { preload = true; }
        var _this = _super.call(this, 'image') || this;
        _this.preload = preload;
        _this.attributes.src = src;
        return _this;
    }
    WTCImageElement.prototype.preloadStyle = function (root, ctx) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a = _this.attributes, src = _a.src, style = _a.style;
            if (!src)
                return reject('WTCImageElement is required attribute `src`');
            _super.prototype.preloadStyle.call(_this, root, ctx).then(function () {
                if (_this.preload) {
                    return wx.getImageInfo({ src: _this.attributes.src }).then(function (resp) {
                        _this.imageWidth = resp.width;
                        _this.imageHeight = resp.height;
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
    };
    return WTCImageElement;
}(WTCElement));
exports.WTCImageElement = WTCImageElement;
function getTextWidth(ctx, text, fontSize) {
    if (fontSize === void 0) { fontSize = 14; }
    var originalFont = ctx.font;
    ctx.font = fontSize + "px sans-serif";
    var width = ctx.measureText(text).width;
    ctx.font = originalFont;
    return width;
}
exports.getTextWidth = getTextWidth;
function view(attr) {
    var el = new WTCViewElement();
    el.setElAttr(attr);
    return el;
}
exports.view = view;
function text(text, attr) {
    var el = new WTCTextElement(text);
    el.setElAttr(attr);
    return el;
}
exports.text = text;
function image(src, attr, preload) {
    if (preload === void 0) { preload = true; }
    var el = new WTCImageElement(src, preload);
    el.setElAttr(attr);
    return el;
}
exports.image = image;
function el(name, attr) {
    switch (name) {
        case "view":
            return view(attr);
        case "text":
            return text(attr.text, attr);
        case "image":
            return image(attr.src, attr, attr.preload);
    }
}
exports.el = el;
var WTCDocument = /** @class */ (function () {
    function WTCDocument(containerWidth, containerHeight) {
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        this.widget = null;
    }
    WTCDocument.create = function (containerWidth, containerHeight) {
        if (containerWidth === void 0) { containerWidth = wx.getSystemInfoSync().screenWidth; }
        if (containerHeight === void 0) { containerHeight = wx.getSystemInfoSync().screenHeight; }
        return new WTCDocument(containerWidth, containerHeight);
    };
    WTCDocument.getReadyCallback = function (docInstanceName, callbackFnName) {
        return function (widget) {
            var pages = getCurrentPages();
            var self = pages[pages.length - 1];
            self[docInstanceName].setWidget(widget);
            self[callbackFnName]();
        };
    };
    WTCDocument.prototype.setWidget = function (widget) {
        this.widget = widget;
    };
    WTCDocument.prototype.getSize = function () {
        return {
            width: this.containerWidth,
            height: this.containerHeight
        };
    };
    WTCDocument.prototype.resize = function (containerWidth, containerHeight) {
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
    };
    WTCDocument.prototype.widthFix = function (originalWidth, originalHeight, scale) {
        if (scale === void 0) { scale = 1; }
        return {
            width: this.containerWidth * scale,
            height: this.containerWidth / originalWidth * originalHeight * scale
        };
    };
    WTCDocument.prototype.heightFix = function (originalWidth, originalHeight, scale) {
        if (scale === void 0) { scale = 1; }
        return {
            width: this.containerHeight / originalHeight * originalWidth * scale,
            height: this.containerHeight * scale
        };
    };
    WTCDocument.prototype.getScaleWidth = function (scale) {
        return this.containerWidth * scale;
    };
    WTCDocument.prototype.getScaleHeight = function (scale) {
        return this.containerHeight * scale;
    };
    WTCDocument.prototype.renderToCanvas = function (element) {
        var _this = this;
        var ctx = this.widget.ctx;
        var canvas = this.widget.canvas;
        var use2dCanvas = this.widget.data.use2dCanvas;
        return new Promise(function (resolve, reject) {
            // 第一步，预加载样式，主要是针对特定属性进行纠正
            element.preloadStyle(element, ctx).then(function () {
                // 第二步，构建样式，主要是针对一些需要利用其他元素样式进行的构建（比如图片）
                element.rebuildStyle(element);
                var _a = element.attributes.style, width = _a.width, height = _a.height;
                var _b = element.layout.layoutBox, top = _b.top, left = _b.left;
                if (use2dCanvas && !canvas) {
                    return reject(new Error('renderToCanvas: fail canvas has not been created'));
                }
                ctx.clearRect(0, 0, width, height);
                _this.boundary = {
                    top: top,
                    left: left,
                    width: width,
                    height: height
                };
                var draw = new WTCRenderer(ctx, canvas, use2dCanvas);
                draw.drawNode(element).then(function () {
                    if (!use2dCanvas) {
                        return ctx.draw(false, function () {
                            resolve(element.layout);
                        });
                    }
                    return resolve(element.layout);
                });
            });
        });
    };
    WTCDocument.prototype.canvasToTempFilePath = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var _a = this.widget.data, use2dCanvas = _a.use2dCanvas, canvasId = _a.canvasId;
        return new Promise(function (resolve, reject) {
            var _a = _this.boundary, top = _a.top, left = _a.left, width = _a.width, height = _a.height;
            var copyArgs = {
                x: left,
                y: top,
                width: width,
                height: height,
                destWidth: width * (options.scale || 1),
                destHeight: height * (options.scale || 1),
                canvasId: canvasId,
                canvas: null,
                fileType: options.fileType || 'png',
                quality: options.quality || 1,
                success: resolve,
                fail: reject
            };
            if (use2dCanvas) {
                delete copyArgs.canvasId;
                copyArgs.canvas = _this.widget.canvas;
            }
            wx.canvasToTempFilePath(copyArgs, _this.widget);
        });
    };
    return WTCDocument;
}());
exports.WTCDocument = WTCDocument;
var WTCRenderer = /** @class */ (function () {
    function WTCRenderer(ctx, canvas, use2dCanvas) {
        if (use2dCanvas === void 0) { use2dCanvas = false; }
        this.ctx = ctx;
        this.canvas = canvas;
        this.use2dCanvas = use2dCanvas;
    }
    WTCRenderer.prototype.roundRect = function (x, y, w, h, r, fill, stroke) {
        if (fill === void 0) { fill = true; }
        if (stroke === void 0) { stroke = false; }
        if (r < 0)
            return;
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 3 / 2);
        ctx.arc(x + w - r, y + r, r, Math.PI * 3 / 2, 0);
        ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
        ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
        ctx.lineTo(x, y + r);
        if (stroke)
            ctx.stroke();
        if (fill)
            ctx.fill();
    };
    WTCRenderer.prototype.drawView = function (box, style) {
        var ctx = this.ctx;
        var x = box.left, y = box.top, w = box.width, h = box.height;
        var _a = style.borderRadius, borderRadius = _a === void 0 ? 0 : _a, _b = style.borderWidth, borderWidth = _b === void 0 ? 0 : _b, borderColor = style.borderColor, _c = style.color, color = _c === void 0 ? '#000' : _c, _d = style.backgroundColor, backgroundColor = _d === void 0 ? 'transparent' : _d;
        ctx.save();
        // 外环
        if (borderWidth > 0) {
            ctx.fillStyle = borderColor || color;
            this.roundRect(x, y, w, h, borderRadius);
        }
        // 内环
        ctx.fillStyle = backgroundColor;
        var innerWidth = w - 2 * borderWidth;
        var innerHeight = h - 2 * borderWidth;
        var innerRadius = borderRadius - borderWidth >= 0 ? borderRadius - borderWidth : 0;
        this.roundRect(x + borderWidth, y + borderWidth, innerWidth, innerHeight, innerRadius);
        ctx.restore();
    };
    WTCRenderer.prototype.drawImage = function (src, box, style) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var ctx = _this.ctx;
            var canvas = _this.canvas;
            var _a = style.borderRadius, borderRadius = _a === void 0 ? 0 : _a;
            var x = box.left, y = box.top, w = box.width, h = box.height;
            ctx.save();
            _this.roundRect(x, y, w, h, borderRadius, false, false);
            ctx.clip();
            var _drawImage = function (img) {
                if (_this.use2dCanvas) {
                    var Image_1 = canvas.createImage();
                    Image_1.onload = function () {
                        ctx.drawImage(Image_1, x, y, w, h);
                        ctx.restore();
                        resolve();
                    };
                    Image_1.onerror = function () {
                        reject(new Error("createImage fail: " + img));
                    };
                    Image_1.src = img;
                }
                else {
                    ctx.drawImage(img, x, y, w, h);
                    ctx.restore();
                    resolve();
                }
            };
            var isTempFile = /^wxfile:\/\//.test(src);
            var isNetworkFile = /^https?:\/\//.test(src);
            if (isTempFile) {
                _drawImage(src);
            }
            else if (isNetworkFile) {
                wx.downloadFile({
                    url: src,
                    success: function (res) {
                        if (res.statusCode === 200) {
                            _drawImage(res.tempFilePath);
                        }
                        else {
                            reject(new Error("downloadFile:fail " + src));
                        }
                    },
                    fail: function () {
                        reject(new Error("downloadFile:fail " + src));
                    }
                });
            }
            else {
                reject(new Error("image format error: " + src));
            }
        });
    };
    WTCRenderer.prototype.drawText = function (text, box, style) {
        var ctx = this.ctx;
        var x = box.left, y = box.top, w = box.width, h = box.height;
        var _a = style.color, color = _a === void 0 ? '#000' : _a, _b = style.lineHeight, lineHeight = _b === void 0 ? 1.5 : _b, _c = style.fontSize, fontSize = _c === void 0 ? 14 : _c, _d = style.textAlign, textAlign = _d === void 0 ? 'left' : _d, _e = style.verticalAlign, verticalAlign = _e === void 0 ? 'top' : _e, _f = style.backgroundColor, backgroundColor = _f === void 0 ? 'transparent' : _f;
        if (!text || (lineHeight > h))
            return;
        ctx.save();
        ctx.textBaseline = 'top';
        ctx.font = fontSize + "px sans-serif";
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
        var textWidth = ctx.measureText(text).width;
        var actualHeight = Math.ceil(textWidth / w) * lineHeight;
        var paddingTop = Math.ceil((h - actualHeight) / 2);
        if (paddingTop < 0)
            paddingTop = 0;
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
        var inlinePaddingTop = Math.ceil((lineHeight - fontSize) / 2);
        // 不超过一行
        if (textWidth <= w) {
            ctx.fillText(text, x, y + inlinePaddingTop);
            return;
        }
        // 多行文本
        var chars = text.split('');
        var _y = y;
        // 逐行绘制
        var line = '';
        for (var _i = 0, chars_1 = chars; _i < chars_1.length; _i++) {
            var ch = chars_1[_i];
            var testLine = line + ch;
            var testWidth = ctx.measureText(testLine).width;
            if (testWidth > w) {
                ctx.fillText(line, x, y + inlinePaddingTop);
                y += lineHeight;
                line = ch;
                if ((y + lineHeight) > (_y + h))
                    break;
            }
            else {
                line = testLine;
            }
        }
        // 避免溢出
        if ((y + lineHeight) <= (_y + h)) {
            ctx.fillText(line, x, y + inlinePaddingTop);
        }
        ctx.restore();
    };
    WTCRenderer.prototype.drawNode = function (element) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!element)
                return resolve();
            var name = element.name;
            var _a = element.layout, layoutBox = _a.layoutBox, computedStyle = _a.computedStyle;
            var _b = element.attributes, src = _b.src, text = _b.text;
            (function () {
                switch (name) {
                    case 'view':
                        _this.drawView(layoutBox, computedStyle);
                        return Promise.resolve();
                    case 'image':
                        return _this.drawImage(src, layoutBox, computedStyle);
                    case 'text':
                        _this.drawText(text, layoutBox, computedStyle);
                        return Promise.resolve();
                }
            })().then(function () {
                var childList = Object.values(element.children);
                if (childList.length === 0) {
                    return resolve();
                }
                var waterFall = function (index) {
                    if (index === void 0) { index = 0; }
                    _this.drawNode(childList[index]).then(function () {
                        if (index < childList.length) {
                            waterFall(index + 1);
                        }
                        else {
                            resolve();
                        }
                    }, reject);
                };
                waterFall();
            }, reject);
        });
    };
    return WTCRenderer;
}());
exports.WTCRenderer = WTCRenderer;
