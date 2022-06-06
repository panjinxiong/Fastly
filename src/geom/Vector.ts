import { Global_Math } from "@/@global/Global";
import { Matrix } from "@/geom/Matrix";

type FmtJson = { x: number; y: number; };
/** [x, y] */
type FmtArr = [number, number];

/**
 * Vector类
 **/
class Vector {
  public x!: number;
  public y!: number;
  /** 原点距离 */
  public get length(): number { return Global_Math.sqrt(this.x * this.x + this.y * this.y); }
  /**
   * 原点角度
   * @return -PI 到 PI 之间的值，是从 X 轴正向逆时针旋转到点 (x,y) 时经过的角度
   **/
  public get angle(): number { return Global_Math.atan2(this.y, this.x); }

  /**
   * @param x 矢量x
   * @param y 矢量y
   **/
  public constructor(x?: number, y?: number) {
    this.set(x || 0, y || 0);
  }
  /**
   * 设置
   * @param x 矢量x
   * @param y 矢量y
   * @return 对象本身
   **/
  public set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }
  /**
   * 复制其他矢量
   * @param v Vector对象
   * @return 对象本身
   **/
  public copyTo(v: Vector): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  /**
   * 克隆
   * @return 克隆对象
   **/
  public clone(): Vector {
    return new Vector().copyTo(this);
  }
  /**
   * 判断两个矢量是否相等
   * @param v Vector对象
   * @return 是否相同
   **/
  public equal(v: Vector): boolean {
    return this.x === v.x && this.y === v.y;
  }
  /**
   * 乘积
   * @param x Vector对象 | 矢量x
   * @param y 矢量y
   * @return 对象本身
   **/
  public dotProduct(v: Vector): number;
  public dotProduct(x: number, y: number): number;
  public dotProduct(x: number | Vector, y?: number): number {
    if (x instanceof Vector) {
      return this.x * x.x + this.y * x.y;
    } else {
      return this.x * x + this.y * (y === undefined ? x : y);
    }
  }
  /**
   * 正常化
   * @return 对象本身
   **/
  public normalize(): this {
    let length = this.length;
    this.x = this.x / length;
    this.y = this.y / length;
    return this;
  }
  /**
   * 取反
   * @return 对象本身
   **/
  public inverse(): this {
    this.x *= -1;
    this.y *= -1;
    return this;
  }
  /**
   * 拉伸
   * @param x 总数 | 矢量x
   * @param y 矢量y
   * @return 对象本身
   **/
  public scale(c: number): this;
  public scale(x: number, y?: number): this {
    this.x *= x;
    this.y *= y === undefined ? x : y;
    return this;
  }
  /**
   * 旋转
   * @param angle 度数
   * @return 对象本身
   **/
  public rotate(angle: number): this {
    let x = this.x;
    let y = this.y;
    this.x = x * Math.cos(angle) - y * Math.sin(angle);
    this.y = x * Math.sin(angle) + y * Math.cos(angle);
    return this;
  }
  /**
   * 矢量转换为数组
   * @return 数组对象
   **/
  public toArray(): FmtArr {
    return [this.x, this.y];
  }
  /**
   * 加上其他矢量
   * @param x Vector对象 | 矢量x
   * @param y 矢量y
   * @return 对象本身
   **/
  public toAdd(v: Vector): this;
  public toAdd(x: number, y: number): this;
  public toAdd(x: number | Vector, y?: number): this {
    if (x instanceof Vector) {
      this.x += x.x;
      this.y += x.y;
    } else if (x !== undefined && y !== undefined) {
      this.x += x;
      this.y += y;
    }
    return this;
  }
  /**
   * 减上其他矢量
   * @param x Vector对象 | 矢量x
   * @param y 矢量y
   * @return 对象本身
   **/
  public toSubtract(v: Vector): this;
  public toSubtract(x: number, y: number): this;
  public toSubtract(x: number | Vector, y?: number): this {
    if (x instanceof Vector) {
      this.x -= x.x;
      this.y -= x.y;
    } else if (x !== undefined && y !== undefined) {
      this.x -= x;
      this.y -= y;
    }
    return this;
  }
  /**
   * 与其他矢量距离
   * @param v Vector对象
   * @return 对象本身
   **/
  public toDistance(v: Vector): number {
    return Global_Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
  }
  /**
   * 矢量 转换 Matrix对象 表示的几何转换应用于指定点所产生的结果
   * @param m Matrix对象
   * @param round 对点的坐标进行向上取整
   * @return 对象本身
   **/
  public toTransform(m: Matrix, round: boolean): this {
    let x = this.x * m.a + this.y * m.c + m.tx;
    let y = this.x * m.b + this.y * m.d + m.ty;
    if (round) {
      x = (x + 0.5) >> 0; // >> 0 与 parseInt() 一样
      y = (y + 0.5) >> 0;
    }
    this.x = x;
    this.y = y;
    return this;
  }
}

export {
  FmtJson as Vector_FmtJson,
  FmtArr as Vector_FmtArr,
  Vector
}
