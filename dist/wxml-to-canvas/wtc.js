"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.WTCUtils = exports.el = void 0;
function el(tagName, attr) {
    return __assign(__assign({}, attr), { tagName: tagName });
}
exports.el = el;
var WTCUtils = /** @class */ (function () {
    function WTCUtils(containerWidth, containerHeight) {
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        this.widget = null;
    }
    WTCUtils.create = function (containerWidth, containerHeight) {
        if (containerWidth === void 0) { containerWidth = wx.getSystemInfoSync().screenWidth; }
        if (containerHeight === void 0) { containerHeight = wx.getSystemInfoSync().screenHeight; }
        return new WTCUtils(containerWidth, containerHeight);
    };
    WTCUtils.prototype.setWidget = function (widget) {
        this.widget = widget;
    };
    WTCUtils.prototype.getSize = function () {
        return {
            width: this.containerWidth,
            height: this.containerHeight
        };
    };
    WTCUtils.prototype.widthFix = function (originalWidth, originalHeight, scale) {
        if (scale === void 0) { scale = 1; }
        return {
            width: this.containerWidth * scale,
            height: this.containerWidth / originalWidth * originalHeight * scale
        };
    };
    WTCUtils.prototype.heightFix = function (originalWidth, originalHeight, scale) {
        if (scale === void 0) { scale = 1; }
        return {
            width: this.containerHeight / originalHeight * originalWidth * scale,
            height: this.containerHeight * scale
        };
    };
    WTCUtils.prototype.getScaleWidth = function (scale) {
        return this.containerWidth * scale;
    };
    WTCUtils.prototype.getScaleHeight = function (scale) {
        return this.containerHeight * scale;
    };
    /**
     * 精确计算
     */
    WTCUtils.prototype.getFontWidth = function (text, fontSize) {
        if (fontSize === void 0) { fontSize = 14; }
        var ctx = this.widget.ctx;
        var originalFont = ctx.font;
        ctx.font = fontSize + "px sans-serif";
        var width = ctx.measureText(text).width;
        ctx.font = originalFont;
        return width;
    };
    WTCUtils.prototype.covertElToMetadata = function (element, deep) {
        var _a;
        var _this = this;
        if (deep === void 0) { deep = 0; }
        // @ts-ignore
        var tabs = new Array(deep).fill('  ').join('');
        var childWXML = [];
        if (!element.style)
            element.style = {};
        if (!element.style.lineHeight) {
            element.style.lineHeight = 1.5;
        }
        if (!element.style.fontSize) {
            element.style.fontSize = 14;
        }
        if (element.tagName === 'text' && !element.style.width) {
            element.style.width = this.getFontWidth(element.text, element.style.fontSize);
        }
        if (element.style.textLine) {
            element.style.height = element.style.lineHeight * element.style.textLine * element.style.fontSize;
        }
        else {
            element.style.height = element.style.height || (element.style.lineHeight * element.style.fontSize);
        }
        element.style.lineHeight = (element.style.lineHeight + '');
        var style = (_a = {}, _a[element["class"]] = element.style, _a);
        if (element.children) {
            element.children.forEach(function (e) {
                if (!e)
                    return;
                var child = _this.covertElToMetadata(e, deep + 1);
                childWXML.push(child.wxml);
                // @ts-ignore
                style = Object.assign(style, child.style);
            });
        }
        var hasChild = childWXML.length > 0;
        return {
            wxml: tabs + "<" + element.tagName + (element["class"] ? " class=\"" + element["class"] + "\"" : '') + (element.src ? " src=\"" + element.src + "\"" : '') + ">" + (hasChild ? '\n' : '') + (element.text ? "" + element.text + (childWXML.length > 0 ? '\n' : '') : '') + childWXML.join('\n') + (hasChild ? "\n" + tabs : '') + "</" + element.tagName + ">",
            style: style,
            width: element.style ? element.style.width : 0,
            height: element.style ? element.style.height : 0
        };
    };
    return WTCUtils;
}());
exports.WTCUtils = WTCUtils;
