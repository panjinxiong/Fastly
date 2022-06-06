import * as Quickly from "@quickly";
import * as Util from "@/util/Util";
import { Type_GlobalCompositeOperation } from "@g/Type";
import { Global_Math } from "@/@global/Global";
import { EventEmitter_Mixins } from "@/event/EventEmitter";
import { Polygon_FmtArr, Polygon_PointContains, Polygon_PolyContains } from "@/geom/Polygon";
import { Matrix, Matrix_FmtJson } from "@/geom/Matrix";
import { Vector, Vector_FmtArr } from "@/geom/Vector";
import { Pointer_MixinsNode, Pointer_MixinsNodeCtorParam } from "@/input/Pointer";
import { CanvasRenderer } from "@/system/CanvasRenderer";
import { Ticker_TickParam } from "@/system/Ticker";
import { Container } from "@/display/nodes/Container";
import { Drawable } from "@/display/tool/Drawable";
import { Graphics } from "@/display/ui/Graphics";

type NodeRender = {
  renderStartDraw?: (renderer: CanvasRenderer, tickParam?: Ticker_TickParam) => boolean;
  renderTransform?: (renderer: CanvasRenderer, tickParam?: Ticker_TickParam) => void;
  renderDraw?: (renderer: CanvasRenderer, tickParam?: Ticker_TickParam) => void;
  renderEndDraw?: (renderer: CanvasRenderer, tickParam?: Ticker_TickParam) => void;
  render?: (renderer: CanvasRenderer, tickParam?: Ticker_TickParam) => void;
};
type NodeTween = {
  x?: number;
  y?: number;
  height?: number;
  width?: number;
  alpha?: number;
  background?: string;
  anchor?: Vector_FmtArr;
  rotate?: number;
  scale?: Vector_FmtArr;
  skew?: Vector_FmtArr;
  transform?: [];
};
type NodeCtorParam = [
  (
    Pointer_MixinsNodeCtorParam[0] &
    {
      name?: string;
      x?: number;
      y?: number;
      height?: number;
      width?: number;
      alpha?: number;
      background?: string;
      visible?: boolean;
      blendMode?: Type_GlobalCompositeOperation;
      boundsArea?: Polygon_FmtArr;
      drawable?: Drawable;
      mask?: Graphics;
      anchor?: Vector_FmtArr;
      rotate?: number;
      scale?: Vector_FmtArr;
      skew?: Vector_FmtArr;
      transform?: [];
      zIndex?: number;
      onRenderStart?: (tickParam?: Ticker_TickParam) => boolean;
      onRenderEnd?: (tickParam?: Ticker_TickParam) => void;
    }
  )
];

/**
 * 视图类
 **/
interface Node extends EventEmitter_Mixins, Pointer_MixinsNode { };
@Util.mixinsClassDecorator([EventEmitter_Mixins, Pointer_MixinsNode])
class Node implements NodeRender {
  /** 堆叠顺序 */
  private _zIndex: number;
  /** 唯一标识符 */
  public readonly id: string = Quickly.uuid();
  /** [只读] 深度，父容器排序序号，1为开始界限 */
  public depth: number = -1;
  /** 父容器 */
  public parent: Container | null = null;
  /** 名 */
  public name: string;
  /** x轴坐标 */
  public x: number;
  /** y轴坐标 */
  public y: number;
  /** 高度 */
  public height: number;
  /** 宽度 */
  public width: number;
  /** 透明度 */
  public alpha: number;
  /** 背景 */
  public background: string;
  /** 可视对象是否可见 */
  public visible: boolean;
  /** 绘制图像方式 */
  public blendMode: Type_GlobalCompositeOperation;
  /** 区域顶点数组 */
  public boundsArea: Polygon_FmtArr | null;
  /** 可绘制对象。供高级开发使用。缓存图片对象 */
  public drawable: Drawable | null;
  /** 遮罩图形 */
  public mask: Graphics | null;
  /** [平移x,平移y] */
  public anchor: Vector_FmtArr;
  /** 旋转度数 */
  public rotate: number;
  /** [拉伸x,拉伸y] */
  public scale: Vector_FmtArr;
  /** [扭曲x,扭曲y] */
  public skew: Vector_FmtArr;
  /** transform变换 */
  public transform: Matrix_FmtJson[];
  /**
   * 开始渲染事件
   * @return 是否渲染
   **/
  public onRenderStart: ((tickParam?: Ticker_TickParam) => boolean) | null;
  /**
   * 结束渲染事件
   * @return 是否渲染
   **/
  public onRenderEnd: ((tickParam?: Ticker_TickParam) => boolean) | null;
  /** 缩放宽度 */
  public get scaledWidth(): number { return this.width * this.scale[0]; }
  /** 缩放高度 */
  public get scaledHeight(): number { return this.height * this.scale[1]; }
  /** 堆叠顺序 */
  public get zIndex(): number { return this._zIndex; }
  /** 堆叠顺序 */
  public set zIndex(value: number) {
    this._zIndex = value;
    this.parent && this.parent.renderSort();
  }

  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: NodeCtorParam[0] = <any>{}) {
    EventEmitter_Mixins.CTOR(this);
    Pointer_MixinsNode.CTOR(this);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("Node");
    this.x = Util.getJsonVal(props, "x") || 0;
    this.y = Util.getJsonVal(props, "y") || 0;
    this.height = Util.getJsonVal(props, "height") || 0;
    this.width = Util.getJsonVal(props, "width") || 0;
    this.alpha = Util.getJsonVal(props, "alpha") || 1;
    this.background = Util.getJsonVal(props, "background") || "";
    this.visible = Util.getJsonVal(props, "visible") || true;
    this.blendMode = Util.getJsonVal(props, "blendMode") || "source-over";
    this.boundsArea = Util.getJsonVal(props, "boundsArea") || null;
    this.drawable = Util.getJsonVal(props, "drawable") || null;
    this.mask = Util.getJsonVal(props, "mask") || null;
    this.anchor = Util.getJsonVal(props, "anchor", 1) || [0, 0];
    this.rotate = Util.getJsonVal(props, "rotate") || 0;
    this.scale = Util.getJsonVal(props, "scale", 1) || [1, 1];
    this.skew = Util.getJsonVal(props, "skew") || [0, 0];
    this.transform = Util.getJsonVal(props, "transform", 1) || [];
    this._zIndex = Util.getJsonVal(props, "zIndex") || 0;
    this.onRenderStart = Util.getJsonVal(props, "onRenderStart") || null;
    this.onRenderEnd = Util.getJsonVal(props, "onRenderEnd") || null;
  }
  /**
  * 添加此对象到父容器
  * @param container 容器
  * @param index 添加到索引位置
  * @return 对象本身
  **/
  public addTo(container: Container, index: number): this {
    if (typeof index === "number") container.addChildAt(this, index);
    else container.addChild(this);
    return this;
  }
  /**
   * 否存在父元素
   * @param node 元素
   * @return 父元素是否存在
   **/
  public hasParents(node: Node): boolean {
    while (node.parent && (node = node.parent)) {
      if (node === this) return true;
    }
    return false;
  }
  /**
   * 交换元素
   * @param node 指定要交换的元素
   * @return 是否交换成功
   **/
  public swapNode(node: Container | Node): boolean {
    if (!this.hasParents(node) && !node.hasParents(this)) {
      let parent = this.parent;
      let nodeParent = node.parent;
      let depth = this.depth;
      let nodeDepth = node.depth;
      if (parent) { parent.addChildAt(node, depth - 1); }
      else if (nodeParent) { node.removeParent(); }
      if (nodeParent) { nodeParent.addChildAt(this, nodeDepth - 1); }
      else if (parent) { this.removeParent(); }
      return true;
    }
    return false;
  }
  /**
   * 从父容器里删除此对象
   * @return 对象本身
   **/
  public removeParent(): this {
    let parent = this.parent;
    if (parent) parent.removeChild(this);
    return this;
  }
  /**
   * 返回可视对象的字符串表示
   * @return 可视对象name的字符串
   **/
  public toName(): string {
    let result: string = "";
    let obj: Node | null = this;
    while (obj) {
      result = result ? obj.name + "." + result : obj.name;
      obj = obj.parent;
    }
    return result;
  }
  /**
   * 开始渲染
   * @return 是否渲染
   **/
  public renderStartDraw(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): boolean { return renderer.startDraw(this); }
  /**
   * 渲染变换位置
   **/
  public renderTransform(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): void { renderer.transform(this); }
  /**
   * 渲染中
   **/
  public renderDraw(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): void { renderer.draw(this); }
  /**
   * 结束渲染
   **/
  public renderEndDraw(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): void { renderer.endDraw(); }
  /**
   * 渲染
   **/
  public render(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): void {
    if (this.onRenderStart && !this.onRenderStart(tickParam)) return;
    if (this.renderStartDraw(renderer, tickParam)) {
      this.renderTransform(renderer, tickParam);
      this.renderDraw(renderer, tickParam);
      this.renderEndDraw(renderer, tickParam);
    }
    this.onRenderEnd && this.onRenderEnd(tickParam);
  }
  /***
   * 获取复合矩形
   **/
  public getTransformMatrix(): Matrix {
    let mtx = new Matrix();
    let deg = Global_Math.PI / 180;
    let transform = this.transform;
    if (transform.length !== 0) {
      for (let t = 0; t < transform.length; t++) {
        let myTransform = transform[t];
        mtx.append(myTransform.a, myTransform.b, myTransform.c, myTransform.d, myTransform.tx, myTransform.ty);
      }
    } else {
      mtx.translate(-this.anchor[0], -this.anchor[1]);
      mtx.skew(this.skew[0] * deg, this.skew[1] * deg);
      mtx.rotate(this.rotate * deg);
      mtx.scale(this.scale[0], this.scale[1]);
      mtx.translate(this.x, this.y);
    }
    return mtx;
  }
  /**
   * 获取可视对象相对于其某个祖先（默认为最上层容器）的连接矩阵
   * @param ancestor 可视对象的相对的祖先容器
   **/
  public getConcatMatrix(this: Node, ancestor?: Node): Matrix {
    let mtx = new Matrix();
    for (let o = this; o !== ancestor && o.parent; o = o.parent) {
      mtx.append(o.getTransformMatrix());
    }
    return mtx;
  }
  /**
   * 获取视图范围值
   **/
  public getBounds(): Polygon_FmtArr {
    let mtx = this.getConcatMatrix();
    let w = this.width;
    let h = this.height;
    let vertex: Polygon_FmtArr = [];
    let poly = this.boundsArea || [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];

    for (let i = 0; i < poly.length; i++) {
      vertex[i] = new Vector(poly[i].x, poly[i].y).toTransform(mtx, true);
    }

    return vertex;
  }
  /**
   * 检测由x和y参数指定的点是否在其外接矩形之内
   * @param x 要检测的点的x轴坐标
   * @param y 要检测的点的y轴坐标
   * @return 点是否在可视对象之内
   **/
  public hitTestPoint(x: number, y: number): boolean {
    return Polygon_PointContains(x, y, this.getBounds());
  }
  /**
   * 检测object参数指定的对象是否与其相交
   * @param object 要检测的可视对象
   * @return 对象是否在可视对象之内
   **/
  public hitTestObject(object: Node): boolean {
    return Polygon_PolyContains(this.getBounds(), object.getBounds());
  }
}

export {
  NodeTween as Node_Tween,
  NodeCtorParam as Node_CtorParam,
  Node
}
