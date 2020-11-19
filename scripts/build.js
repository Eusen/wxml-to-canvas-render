const fsExtra = require('fs-extra');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

(() => {
  // 第一步，将 wxml-to-canvas 和 widget-ui 中的核心文件，复制到 dist 中并合并
  // 第二步，打包
  const wxmlToCanvasPath = path.join(__dirname, '../node_modules/wxml-to-canvas/src');
  const wxmlToCanvasPathDist = path.join(__dirname, '../dist/wxml-to-canvas');
  // 先删除
  fs.rmSync(wxmlToCanvasPathDist, {recursive: true});
  // 再复制
  fsExtra.copySync(wxmlToCanvasPath, wxmlToCanvasPathDist);
  const widgetUIPath = path.join(__dirname, '../node_modules/widget-ui/dist/index.js');
  const widgetUIPathDist = path.join(__dirname, '../dist/wxml-to-canvas/widget-ui.js');
  // 把widget-ui.js 也复制过去
  fsExtra.copySync(widgetUIPath, widgetUIPathDist);

  const widgetPath = path.join(wxmlToCanvasPathDist, 'widget.js');
  const widgetContent = fs.readFileSync(widgetPath).toString();
  fs.writeFileSync(widgetPath, widgetContent.replace(`require('widget-ui')`, `require('./widget-ui.js')`));

  const tsPath = path.join(__dirname, '../src/wxml-to-canvas.ts');
  const tsdPath = path.join(__dirname, '../src/wxml-to-canvas.d.ts');
  const jsPath = path.join(__dirname, '../src/wxml-to-canvas.js');
  child_process.execSync(`npx tsc ${tsPath} -d`);

  const wtcJsPath = path.join(__dirname, '../dist/wxml-to-canvas/wtc.js');
  const wtcTsdPath = path.join(__dirname, '../dist/wxml-to-canvas/wtc.d.ts');

  fsExtra.moveSync(jsPath, wtcJsPath);
  fsExtra.moveSync(tsdPath, wtcTsdPath);

  const weappComponentsPath = path.join(__dirname, '../examples/weapp/components/wxml-to-canvas')
  fsExtra.copySync(wxmlToCanvasPathDist, weappComponentsPath);
})();
