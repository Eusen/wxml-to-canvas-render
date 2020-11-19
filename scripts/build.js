const fsExtra = require('fs-extra');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

function log(...messages) {
  const date = new Date();
  console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`, ...messages);
}

(() => {
  // 第一步，将 wxml-to-canvas 和 widget-ui 中的核心文件，复制到 dist 中并合并
  // 第二步，打包
  const wxmlToCanvasPath = path.join(__dirname, '../node_modules/wxml-to-canvas/src');
  const wxmlToCanvasPathDist = path.join(__dirname, '../dist/wxml-to-canvas');

  log('正在清理旧版本...');
  fs.rmSync(wxmlToCanvasPathDist, {recursive: true});

  log('正在将新版本复制到dist目录...');
  fsExtra.copySync(wxmlToCanvasPath, wxmlToCanvasPathDist);

  const widgetUIPath = path.join(__dirname, '../node_modules/widget-ui/dist/index.js');
  const widgetUIPathDist = path.join(__dirname, '../dist/wxml-to-canvas/widget-ui.js');

  log('正在将 widget-ui 合并至 `/dist/wxml-to-canvas` ...');
  fsExtra.copySync(widgetUIPath, widgetUIPathDist);


  log('正在修改 widget-ui.js 中的关联...');
  const widgetPath = path.join(wxmlToCanvasPathDist, 'widget.js');
  const widgetContent = fs.readFileSync(widgetPath).toString();
  fs.writeFileSync(widgetPath, widgetContent.replace(`require('widget-ui')`, `require('./widget-ui.js')`));


  log('正在编译扩展库...');
  const tsPath = path.join(__dirname, '../src/wxml-to-canvas.ts');
  const tsdPath = path.join(__dirname, '../src/wxml-to-canvas.d.ts');
  const jsPath = path.join(__dirname, '../src/wxml-to-canvas.js');
  child_process.execSync(`npx tsc ${tsPath} -d`);

  const wtcJsPath = path.join(__dirname, '../dist/wxml-to-canvas/wtc.js');
  const wtcTsdPath = path.join(__dirname, '../dist/wxml-to-canvas/wtc.d.ts');

  log('正在将扩展库合并至 `/dist/wxml-to-canvas` ...');
  fsExtra.moveSync(jsPath, wtcJsPath);
  fsExtra.moveSync(tsdPath, wtcTsdPath);


  log('正在将新版本插件下发至测试项目...');
  const weappComponentsPath = path.join(__dirname, '../examples/weapp/components/wxml-to-canvas')
  // 先删除原来的文件
  fs.rmSync(weappComponentsPath, {recursive: true});
  fsExtra.copySync(wxmlToCanvasPathDist, weappComponentsPath);

  log('构建成功✔');
})();