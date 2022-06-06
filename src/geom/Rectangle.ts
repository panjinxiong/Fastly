import { Vector } from "@/geom/Vector";

/** [x, y, width, height] */
type FmtArr = [number, number, number, number];

/**
 * Rectangle类
 **/
class Rectangle {
  public x!: number;
  public y!: number;
  public width!: number;
  public height!: number;
  public get top(): number { return this.y; }
  public get bottom(): number { return this.y + this.height; }
  public get left(): number { return this.x; }
  public get right(): number { return this.x + this.width; }
  public get topLeft(): Vector { return new Vector(this.left, this.top); }
  public get bottomRight(): Vector { return new Vector(this.right, this.bottom); }
  public set top(top: number) {
    this.height += this.y - top;
    this.y = top;
  }
  public set bottom(bottom: number) {
    this.height = bottom - this.y;
  }
  public set left(left: number) {
    this.width += this.x - left;
    this.x = left;
  }
  public set right(right: number) {
    this.width = right - this.x;
  }
  public set topLeft(v: Vector) {
    this.top = v.y;
    this.left = v.x;
  }
  public set bottomRight(v: Vector) {
    this.bottom = v.y;
    this.right = v.x;
  }

  public constructor(x?: number, y?: number, width?: number, height?: number) {
    this.set(x, y, width, height);
  }
  /**
   * 设置
   * @param x 矩形x
   * @param y 矩形y
   * @param width 矩形宽度
   * @param height 矩形高度
   * @return 对象本身
   **/
  public set(x: number = 0, y: number = 0, width: number = 0, height: number = 0): this {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }
  /**
   * 判断坐标点是否在矩形
   * @param x Vector对象 | 坐标点x
   * @param y 坐标点y
   * @return 判断是否碰撞
   **/
  public contains(v: Vector): boolean;
  public contains(x: number, y: number): boolean;
  public contains(x: number | Vector, y?: number): boolean {
    let is = false;
    if (x instanceof Vector) {
      is = this.contains(x.x, x.y);
    } else if (x !== undefined && y !== undefined) {
      is = x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height
    }
    return is;
  }
  /**
   * 判断两个矩形是否相等
   * @param r Rectangle对象
   * @return 是否相同
   **/
  public equal(r: Rectangle): boolean {
    return r instanceof Rectangle && r.x === this.x && r.y === this.y && r.width === this.width && r.height === this.height;
  }
  /**
   * 矩形转换为数组
   * @return 数组对象
   **/
  public toArray(): FmtArr {
    return [this.x, this.y, this.width, this.height];
  }
}

export {
  FmtArr as Rectangle_FmtArr,
  Rectangle
}
