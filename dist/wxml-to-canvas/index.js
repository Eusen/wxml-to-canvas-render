const {compareVersion} = require('./utils');

const canvasId = 'weui-canvas';

Component({
  properties: {
    width: {
      type: Number,
      value: 400
    },
    height: {
      type: Number,
      value: 300
    },
    ready: {
      type: Function,
    }
  },
  data: {
    use2dCanvas: false, // 2.9.2 后可用canvas 2d 接口
    canvasId,
  },
  lifetimes: {
    attached() {
      const {SDKVersion, pixelRatio: dpr} = wx.getSystemInfoSync();
      const use2dCanvas = compareVersion(SDKVersion, '2.9.2') >= 0;
      this.dpr = dpr;
      this.setData({use2dCanvas}, () => {
        if (use2dCanvas) {
          const query = this.createSelectorQuery();
          query.select(`#${canvasId}`)
              .fields({node: true, size: true})
              .exec(res => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                canvas.width = res[0].width * dpr;
                canvas.height = res[0].height * dpr;
                ctx.scale(dpr, dpr);
                this.ctx = ctx;
                this.canvas = canvas;
                if (this.data.ready) this.data.ready(this);
              });
          setTimeout(() => {
            if (!this.ctx) {
              this.setData({use2dCanvas: false}, () => {
                this.ctx = wx.createCanvasContext(canvasId, this);
                if (this.data.ready) this.data.ready(this);
              });
            }
          }, 80);
        } else {
          this.ctx = wx.createCanvasContext(canvasId, this);
          if (this.data.ready) this.data.ready(this);
        }
      })
    }
  },
  methods: {}
})
