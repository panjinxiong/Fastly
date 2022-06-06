import * as Browser from "@/util/Browser";
import * as Util from "@/util/Util";
import { Type_HTMLCanvasElement, Type_CanvasRenderingContext2D, Type_GlobalCompositeOperation } from "@g/Type";
import { Vector_FmtArr } from "@/geom/Vector";
import { Container } from "@/display/nodes/Container";
import { Node } from "@/display/nodes/Node";

type CanvasRendererCtorParam = [
  {
    element?: Type_HTMLCanvasElement;
    width?: number;
    height?: number;
    scale?: Vector_FmtArr;
  }
];

/**
 * canvas画布渲染器类
 **/
class CanvasRenderer {
  /** 渲染方式 */
  public readonly renderType: string = "canvas";
  /**  渲染器根节点 */
  public readonly layers: Container = new Container();
  /** <canvas/>画布元素 */
  public element: Type_HTMLCanvasElement;
  /** canvas画布的上下文 */
  public context: Type_CanvasRenderingContext2D;
  /** 绘制图像方式 */
  public blendMode: Type_GlobalCompositeOperation = "source-over";
  /** 舞台内容在页面中的渲染区域 */
  public viewport: Browser.getElementRectReturn | null = null;
  /** 画布高度 */
  public get height(): number { return this.layers.height; }
  /** 画布宽度 */
  public get width(): number { return this.layers.width; }
  /** 画布[拉伸x,拉伸y] */
  public get scale(): Vector_FmtArr { return this.layers.scale; }
  /** 画布高度 */
  public set height(value: number) { this.resize(this.width, value); }
  /** 画布宽度 */
  public set width(value: number) { this.resize(value, this.height); }
  /** 画布[拉伸x,拉伸y] */
  public set scale(value: Vector_FmtArr) {
    this.layers.scale = value;
    this.resize(this.width, this.height);
  }

  /**
   * @param props 初始化参数
   **/
  public constructor(props: CanvasRendererCtorParam[0] = <any>{}) {
    this.element = Util.getJsonVal(props, "element") || <Type_HTMLCanvasElement>Browser.createElement("canvas");
    this.context = <Type_CanvasRenderingContext2D>this.element.getContext("2d");

    let viewport = this.updateViewport();
    this.layers.scale = Util.getJsonVal(props, "scale", 1) || [1, 1];
    this.resize(
      Util.getJsonVal(props, "width") || (viewport && viewport.width) || 480,
      Util.getJsonVal(props, "height") || (viewport && viewport.height) || 320
    );
  }
  /**
   * 更新当舞台canvas的样式border、margin、padding等属性更改后，需要调用此方法更新舞台渲染区域
   * @return 舞台的可视区域
   **/
  public updateViewport(): Browser.getElementRectReturn | null {
    let element = this.element;
    this.viewport = element.parentNode ? Browser.getElementRect(element) : null;
    return this.viewport;
  }
  /**
   * 改变渲染器的画布大小
   * @param w 宽度
   * @param h 高度
   **/
  public resize(w: number, h: number): void {
    if (this.width !== w || this.height !== h) {
      // 渲染器大小
      this.element.width = this.layers.width = w;
      this.element.height = this.layers.height = h;
      // 画布大小
      this.element.style.width = w * this.layers.scale[0] + "px";
      this.element.style.height = h * this.layers.scale[1] + "px";

      this.updateViewport();
    }
  }
  /**
   * 为开始绘制可视对象做准备
   * @param target 要绘制的可视对象
   * @return 是否绘制
   **/
  public startDraw(target: Node): boolean {
    if (target.visible && target.alpha > 0) {
      if (target === this.layers) {
        this.clear(0, 0, target.width, target.height);
      }
      if (target.blendMode !== this.blendMode) {
        this.context.globalCompositeOperation = this.blendMode = target.blendMode;
      }

      // 保存当前环境的状态，可以调用任意多次 save方法(类似数组的push())
      this.context.save();

      return true;
    }

    return false;
  }
  /**
   * 对可视对象进行变换
   * @param target 要绘制的可视对象
   **/
  public transform(target: Node): void {
    let ctx = this.context;
    let mtx = target.getTransformMatrix();

    // 遮罩
    if (target.mask) {
      target.mask.render(this);
      ctx.clip();
    }

    // 变换
    ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);

    // 透明度
    if (target.alpha > 0) ctx.globalAlpha *= target.alpha;
  }
  /**
   * 绘制可视对象
   * @param target 要绘制的可视对象
   **/
  public draw(target: Node): void {
    let ctx = this.context;
    let bg = target.background;
    let w = target.width;
    let h = target.height;

    // 背景
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
    }

    // 缓存图片对象
    let drawable = target.drawable;
    let image = drawable && drawable.image;
    if (drawable && image) {
      let rect = drawable.rect;
      let sw = rect[2];
      let sh = rect[3];

      if (!sw || !sh) return;

      if (!w && !h) {
        w = target.width = sw;
        h = target.height = sh;
      }

      if (drawable.offset) {
        let offsetX = drawable.offset[0] || 0;
        let offsetY = drawable.offset[1] || 0;
        ctx.translate(offsetX - sw * 0.5, offsetY - sh * 0.5);
      }

      ctx.drawImage(image, rect[0], rect[1], sw, sh, 0, 0, w, h);
    }
  }
  /**
   * 结束绘制可视对象后的后续处理方法
   **/
  public endDraw(): void {
    this.context.restore();
  }
  /**
   * 清除画布指定区域
   * @param x 指定区域的x轴坐标
   * @param y 指定区域的y轴坐标
   * @param w 指定区域的宽度
   * @param h 指定区域的高度
   **/
  public clear(x: number, y: number, w: number, h: number): void {
    this.context.clearRect(x, y, w, h);
  }
}

export {
  CanvasRendererCtorParam as CanvasRenderer_CtorParam,
  CanvasRenderer
}
