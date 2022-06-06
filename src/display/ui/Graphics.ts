import * as Browser from "@/util/Browser";
import * as Util from "@/util/Util";
import {
  Type_HTMLCanvasElement,
  Type_HTMLImageElement,
  Type_CanvasRenderingContext2D,
  Type_CanvasGradient,
  Type_CanvasPattern,
  Type_Json
} from "@g/Type";
import { Global_Math } from "@/@global/Global";
import { Vector_FmtJson } from "@/geom/Vector";
import { CanvasRenderer } from "@/system/CanvasRenderer";
import { Ticker_TickParam } from "@/system/Ticker";
import { Node, Node_CtorParam } from "@/display/nodes/Node";

/** [参数名(说明：context[参数名]), ...参数值] */
type Actions = [string?, ...Array<any>];
type LineCap = "butt" | "round" | "square";
type LineJoin = "miter" | "round" | "bevel";
type FillStyle = string | Type_CanvasGradient | Type_CanvasPattern;
type GraphicsCtorParam = [
  (
    Node_CtorParam[0]
    &
    {
      lineWidth?: number;
      lineAlpha?: number;
      lineCap?: LineCap;
      lineJoin?: LineJoin;
      miterLimit?: number;
      strokeStyle?: string;
      fillStyle?: string;
      fillAlpha?: number;
    }
  )
];
let Context = <Type_CanvasRenderingContext2D>(
  (<Type_HTMLCanvasElement>Browser.createElement("canvas")).getContext("2d")
);

/**
 * 矢量图形类
 **/
class Graphics extends Node {
  /** 绘制动作 */
  private _actions: Actions = [];
  /** 笔划 */
  private _hasStroke: boolean = false;
  /** 填充 */
  private _hasFill: boolean = false;
  /** 线条宽度 */
  public lineWidth: number;
  /** 线条透明度 */
  public lineAlpha: number;
  /**线条端部样式 */
  public lineCap: LineCap | null;
  /** 线条连接样式 */
  public lineJoin: LineJoin | null;
  /** 斜连线长度和线条宽度的最大比率 */
  public miterLimit: number;
  /**笔画边框的样式  */
  public strokeStyle: string;
  /** 内容填充的样式 */
  public fillStyle: FillStyle;
  /** 内容填充的透明度 */
  public fillAlpha: number;
  /** 笔划状态 */
  public get hasStroke(): boolean {
    return this._hasStroke;
  }
  /** 填充状态 */
  public get hasFill(): boolean {
    return this._hasFill;
  }

  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: GraphicsCtorParam[0] = <any>{}) {
    super(props);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("Graphics");
    this.lineWidth = Util.getJsonVal(props, "lineWidth") || 1;
    this.lineAlpha = Util.getJsonVal(props, "lineAlpha") || 1;
    this.lineCap = Util.getJsonVal(props, "lineCap") || null;
    this.lineJoin = Util.getJsonVal(props, "lineJoin") || null;
    this.miterLimit = Util.getJsonVal(props, "miterLimit") || 10;
    this.strokeStyle = Util.getJsonVal(props, "strokeStyle") || "0";
    this.fillStyle = Util.getJsonVal(props, "fillStyle") || "0";
    this.fillAlpha = Util.getJsonVal(props, "fillAlpha") || 0;
  }
  /**
   * 处理SVG字符串
   * @param str SVG字符串
   * @return SVG数组
   **/
  private _getSVGParams(str: string): number[] {
    let p: (number | string)[] = str
      .substring(1)
      .replace(/[\s]+$|^[\s]+/g, "")
      .split(/[\s]+/);

    if ((<string>p[0]).length === 0) p.shift(); //第一数组为空，就移除

    for (let i = 0; i < p.length; i++) p[i] = parseFloat(<string>p[i]);

    return <number[]>p;
  }
  /**
   * 转化为绝对点
   * @param currentPoint 当前点
   * @param data 数组点
   **/
  private _convertToAbsolute(currentPoint: Vector_FmtJson, data: number[]): void {
    for (let i = 0; i < data.length; i++) {
      if (i % 2 === 0) data[i] += currentPoint.x;
      else data[i] += currentPoint.y;
    }
  }
  /**
   * 设置当前点
   * @param currentPoint 当前点
   * @param x 设置点
   * @param y 设置点
   **/
  private _setCurrentPoint(currentPoint: Vector_FmtJson, x: number, y: number): void {
    currentPoint.x = x;
    currentPoint.y = y;
  }
  /**
   * 反射点
   * @param centerPoint
   * @param point
   * @return 新点
   **/
  private _getReflectionPoint(centerPoint: Vector_FmtJson, point: Vector_FmtJson): Vector_FmtJson {
    return {
      x: centerPoint.x * 2 - point.x,
      y: centerPoint.y * 2 - point.y,
    };
  }
  /**
   * 添加一个绘制动作
   * @param action 绘制动作数组
   * @return 对象本身
   **/
  private _addAction(action: Actions): this {
    this._actions.push(action);
    return this;
  }
  /**
   * @overwrite
   **/
  public renderDraw(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): void {
    let context = renderer.context;
    let actions = this._actions;
    let contextJsonAny = <Type_Json<any>>context;

    context.beginPath();

    for (let i = 0; i < actions.length; i++) {
      let action = actions[i];
      let f = action[0]; // 参数名
      let args = action.length > 1 ? action.slice(1) : null; // 参数值

      if (typeof contextJsonAny[f] === "function") {
        contextJsonAny[f].apply(context, args); // context[参数名].apply(context,参数值)
      } else {
        contextJsonAny[f] = action[1]; // context[参数名] = 参数值
      }
    }
  }
  /**
   * 指定绘制图形的线条样式
   * @param thickness 线条的粗细值
   * @param lineColor 线条的CSS颜色值
   * @param lineAlpha 线条的透明度值
   * @param lineCap 线条的端部样式
   * @param lineJoin 线条的连接样式
   * @param miterLimit 斜连线长度和线条宽度的最大比率。此属性仅当lineJoin为miter时有效
   * @return 对象本身
   **/
  public lineStyle(
    thickness: number = 1,
    lineColor: string = "0",
    lineAlpha: number = 1,
    lineCap?: LineCap,
    lineJoin?: LineJoin,
    miterLimit?: number
  ): this {
    this._addAction(["lineWidth", (this.lineWidth = thickness)]);
    this._addAction(["strokeStyle", (this.strokeStyle = lineColor)]);
    this._addAction(["lineAlpha", (this.lineAlpha = lineAlpha)]);

    if (lineCap !== undefined) this._addAction(["lineCap", (this.lineCap = lineCap)]);
    if (lineJoin !== undefined) this._addAction(["lineJoin", (this.lineJoin = lineJoin)]);
    if (miterLimit !== undefined) this._addAction(["miterLimit", (this.miterLimit = miterLimit)]);

    this._hasStroke = true;

    return this;
  }
  /**
   * 设置虚线样式
   * @param segments 一组描述交替绘制线段和间距（坐标空间单位）长度的数字
   * @return 对象本身
   **/
  public setLineDash(segments: number[]): this {
    return this._addAction(["setLineDash", segments]);
  }
  /**
   * 指定绘制图形的填充样式和透明度
   * @param fill 填充样式
   * @param alpha 透明度
   * @return 对象本身
   **/
  public beginFill(fill: FillStyle, alpha: number = 1): this {
    this._addAction(["fillStyle", (this.fillStyle = fill)]);
    this._addAction(["fillAlpha", (this.fillAlpha = alpha)]);
    this._hasFill = true;
    return this;
  }
  /**
   * 应用并结束笔画的绘制和图形样式的填充
   * @return 对象本身
   **/
  public endFill(): this {
    if (this._hasStroke) this._addAction(["stroke"]);
    if (this._hasFill) this._addAction(["fill"]);
    return this;
  }
  /**
   * 指定绘制图形的线性渐变填充样式
   * @param x0 渐变的起始点的x轴坐标
   * @param y0 渐变的起始点的y轴坐标
   * @param x1 渐变的结束点的x轴坐标
   * @param y1 渐变的结束点的y轴坐标
   * @param colors 渐变中使用的CSS颜色值数组
   * @param ratios 渐变中开始与结束之间的位置数组。需与colors数组里的颜色值一一对应，介于0.0与1.0之间的值
   * @return 对象本身
   **/
  public beginLinearGradientFill(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    colors: string[],
    ratios: number[]
  ): this {
    let gradient = Context.createLinearGradient(x0, y0, x1, y1);
    for (let i = 0; i < colors.length; i++) gradient.addColorStop(ratios[i], colors[i]);
    this._hasFill = true;
    return this._addAction(["fillStyle", (this.fillStyle = gradient)]);
  }
  /**
   * 指定绘制图形的放射性渐变填充样式
   * @param x0 渐变的起始圆的x轴坐标
   * @param y0 渐变的起始圆的y轴坐标
   * @param r0 渐变的起始圆的半径
   * @param x1 渐变的结束圆的x轴坐标
   * @param y1 渐变的结束圆的y轴坐标
   * @param r1 渐变的结束圆的半径
   * @param colors 渐变中使用的CSS颜色值数组
   * @param ratios 渐变中开始与结束之间的位置数组。需与colors数组里的颜色值一一对应，介于0.0与1.0之间的值
   * @return 对象本身
   **/
  public beginRadialGradientFill(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
    colors: string[],
    ratios: number[]
  ): this {
    let gradient = Context.createRadialGradient(x0, y0, r0, x1, y1, r1);
    for (let i = 0; i < colors.length; i++) gradient.addColorStop(ratios[i], colors[i]);
    this._hasFill = true;
    return this._addAction(["fillStyle", (this.fillStyle = gradient)]);
  }
  /**
   * 开始一个位图填充样式
   * @param image 指定填充的Image对象
   * @param repetition 指定填充的重复设置参数
   * @return 对象本身
   **/
  public beginBitmapFill(
    image: Type_HTMLImageElement,
    repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat" | "" = ""
  ): this {
    let pattern = Context.createPattern(image, repetition) || "0";
    this._hasFill = true;
    return this._addAction(["fillStyle", (this.fillStyle = pattern)]);
  }
  /**
   * 开始一个新的路径
   * @return 对象本身
   **/
  public beginPath(): this {
    return this._addAction(["beginPath"]);
  }
  /**
   * 关闭当前的路径
   * @return 对象本身
   **/
  public closePath(): this {
    return this._addAction(["closePath"]);
  }
  /**
   * 将当前绘制位置移动到点(x, y)
   * @param x x轴坐标
   * @param y y轴坐标
   * @return 对象本身
   **/
  public moveTo(x: number, y: number): this {
    return this._addAction(["moveTo", x, y]);
  }
  /**
   * 绘制从当前位置开始到点(x, y)结束的直线
   * @param x x轴坐标
   * @param y y轴坐标
   * @return 对象本身
   **/
  public lineTo(x: number, y: number): this {
    return this._addAction(["lineTo", x, y]);
  }
  /**
   * 绘制从当前位置开始到点(x, y)结束的二次曲线
   * @param cpx 控制点cp的x轴坐标
   * @param cpy 控制点cp的y轴坐标
   * @param x x轴坐标
   * @param y y轴坐标
   * @return 对象本身
   **/
  public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this {
    return this._addAction(["quadraticCurveTo", cpx, cpy, x, y]);
  }
  /**
   * 绘制从当前位置开始到点(x, y)结束的贝塞尔曲线
   * @param cp1x 控制点cp1的x轴坐标
   * @param cp1y 控制点cp1的y轴坐标
   * @param cp2x 控制点cp2的x轴坐标
   * @param cp2y 控制点cp2的y轴坐标
   * @param x x轴坐标
   * @param y y轴坐标
   * @return 对象本身
   **/
  public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this {
    return this._addAction(["bezierCurveTo", cp1x, cp1y, cp2x, cp2y, x, y]);
  }
  /**
   * 绘制一个矩形
   * @param x x轴坐标
   * @param y y轴坐标
   * @param width  矩形的宽度
   * @param height 矩形的高度
   * @return 对象本身
   **/
  public drawRect(x: number, y: number, width: number, height: number): this {
    return this._addAction(["rect", x, y, width, height]);
  }
  /**
   * 绘制一个复杂的圆角矩形
   * @param x x轴坐标
   * @param y y轴坐标
   * @param width 圆角矩形的宽度
   * @param height 圆角矩形的高度
   * @param cornerTL 圆角矩形的左上圆角大小
   * @param cornerTR 圆角矩形的右上圆角大小
   * @param cornerBR 圆角矩形的右下圆角大小
   * @param cornerBL 圆角矩形的左下圆角大小
   * @return 对象本身
   **/
  public drawRoundRectComplex(
    x: number,
    y: number,
    width: number,
    height: number,
    cornerTL: number,
    cornerTR: number,
    cornerBR: number,
    cornerBL: number
  ): this {
    this._addAction(["moveTo", x + cornerTL, y]);
    this._addAction(["lineTo", x + width - cornerTR, y]);
    this._addAction(["arc", x + width - cornerTR, y + cornerTR, cornerTR, -Global_Math.PI / 2, 0, false]);
    this._addAction(["lineTo", x + width, y + height - cornerBR]);
    this._addAction(["arc", x + width - cornerBR, y + height - cornerBR, cornerBR, 0, Global_Math.PI / 2, false]);
    this._addAction(["lineTo", x + cornerBL, y + height]);
    this._addAction([
      "arc",
      x + cornerBL,
      y + height - cornerBL,
      cornerBL,
      Global_Math.PI / 2,
      Global_Math.PI,
      false,
    ]);
    this._addAction(["lineTo", x, y + cornerTL]);
    this._addAction(["arc", x + cornerTL, y + cornerTL, cornerTL, Global_Math.PI, (Global_Math.PI * 3) / 2, false]);
    return this;
  }
  /**
   * 绘制一个圆角矩形
   * @param x x轴坐标
   * @param y y轴坐标
   * @param width 圆角矩形的宽度
   * @param height 圆角矩形的高度
   * @param cornerSize 圆角矩形的圆角大小
   * @return 对象本身
   **/
  public drawRoundRect(x: number, y: number, width: number, height: number, cornerSize: number): this {
    return this.drawRoundRectComplex(x, y, width, height, cornerSize, cornerSize, cornerSize, cornerSize);
  }
  /**
   * 绘制一个圆
   * @param x x轴坐标
   * @param y y轴坐标
   * @param radius 圆的半径
   * @return  对象本身
   **/
  public drawCircle(x: number, y: number, radius: number): this {
    return this._addAction(["arc", x + radius, y + radius, radius, 0, Global_Math.PI * 2, 0]);
  }
  /**
   * 绘制一个椭圆
   * @param x x轴坐标
   * @param y y轴坐标
   * @param width 椭圆的宽度
   * @param height 椭圆的高度
   * @return 对象本身
   **/
  public drawEllipse(x: number, y: number, width: number, height: number): this {
    if (width === height) return this.drawCircle(x, y, width);

    let w = width / 2;
    let h = height / 2;
    let C = 0.5522847498307933;
    let cx = C * w;
    let cy = C * h;
    x = x + w;
    y = y + h;
    this._addAction(["moveTo", x + w, y]);
    this._addAction(["bezierCurveTo", x + w, y - cy, x + cx, y - h, x, y - h]);
    this._addAction(["bezierCurveTo", x - cx, y - h, x - w, y - cy, x - w, y]);
    this._addAction(["bezierCurveTo", x - w, y + cy, x - cx, y + h, x, y + h]);
    this._addAction(["bezierCurveTo", x + cx, y + h, x + w, y + cy, x + w, y]);

    return this;
  }
  /**
   * 根据参数指定的SVG数据绘制一条路径。不支持Arcs
   * @param pathData 要绘制的SVG路径数据
   * @return 对象本身
   **/
  public drawSVGPath(pathData: string): this {
    let currentPoint = { x: 0, y: 0 };
    let lastControlPoint = { x: 0, y: 0 };
    let controlPoint: Vector_FmtJson;
    let lastCmd;
    let path = pathData
      .replace(/,/g, " ")
      .replace(/-/g, " -")
      .split(/(?=[a-zA-Z])/);

    this._addAction(["beginPath"]);

    for (let i = 0; i < path.length; i++) {
      let str = path[i];

      if (!str.length) continue;

      let realCmd = str[0];
      let cmd = realCmd.toUpperCase();
      let p = this._getSVGParams(str);
      let useRelative = cmd !== realCmd; // 大写 !== [大写|小写]

      switch (cmd) {
        case "M":
          if (useRelative) this._convertToAbsolute(currentPoint, p);

          this._addAction(["moveTo", p[0], p[1]]);
          this._setCurrentPoint(currentPoint, p[0], p[1]);

          break;
        case "L":
          if (useRelative) this._convertToAbsolute(currentPoint, p);

          this._addAction(["lineTo", p[0], p[1]]);
          this._setCurrentPoint(currentPoint, p[0], p[1]);

          break;
        case "H":
          if (useRelative) p[0] += currentPoint.x;

          this._addAction(["lineTo", p[0], currentPoint.y]);
          currentPoint.x = p[0];

          break;
        case "V":
          if (useRelative) p[0] += currentPoint.y;

          this._addAction(["lineTo", currentPoint.x, p[0]]);
          currentPoint.y = p[0];

          break;
        case "Z":
          this._addAction(["closePath"]);

          break;
        case "C":
          if (useRelative) this._convertToAbsolute(currentPoint, p);

          this._addAction(["bezierCurveTo", p[0], p[1], p[2], p[3], p[4], p[5]]);
          lastControlPoint.x = p[2];
          lastControlPoint.y = p[3];
          this._setCurrentPoint(currentPoint, p[4], p[5]);

          break;
        case "S":
          if (useRelative) this._convertToAbsolute(currentPoint, p);

          if (lastCmd === "C" || lastCmd === "S") {
            controlPoint = this._getReflectionPoint(currentPoint, lastControlPoint);
          } else {
            controlPoint = currentPoint;
          }

          this._addAction(["bezierCurveTo", controlPoint.x, controlPoint.y, p[0], p[1], p[2], p[3]]);
          lastControlPoint.x = p[0];
          lastControlPoint.y = p[1];
          this._setCurrentPoint(currentPoint, p[2], p[3]);

          break;
        case "Q":
          if (useRelative) this._convertToAbsolute(currentPoint, p);

          this._addAction(["quadraticCurveTo", p[0], p[1], p[2], p[3]]);
          lastControlPoint.x = p[0];
          lastControlPoint.y = p[1];
          this._setCurrentPoint(currentPoint, p[2], p[3]);

          break;
        case "T":
          if (useRelative) this._convertToAbsolute(currentPoint, p);

          if (lastCmd === "Q" || lastCmd === "T") {
            controlPoint = this._getReflectionPoint(currentPoint, lastControlPoint);
          } else {
            controlPoint = currentPoint;
          }

          this._addAction(["quadraticCurveTo", controlPoint.x, controlPoint.y, p[0], p[1]]);
          lastControlPoint = controlPoint;
          this._setCurrentPoint(currentPoint, p[0], p[1]);

          break;
      }

      lastCmd = cmd;
    }

    return this;
  }
  /**
   * 清除所有绘制动作并复原所有初始状态
   * @return 对象本身
   **/
  public clear(): this {
    this._actions.length = 0;
    this.strokeStyle = "0";
    this.lineWidth = 1;
    this.lineAlpha = 1;
    this.lineCap = null;
    this.lineJoin = null;
    this.miterLimit = 10;
    this._hasStroke = false;
    this._hasFill = false;
    this.fillStyle = "0";
    this.fillAlpha = 1;
    return this;
  }
}

export {
  Graphics
}
