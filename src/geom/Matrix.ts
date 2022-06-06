import { Global_Math } from "@/@global/Global";

type FmtJson = { a: number; b: number; c: number; d: number; tx: number; ty: number; };

/**
 * 矩阵变换类
 * ```
 *             [ a  b  0 ]
 * (x, y, 1) * [ c  d  0 ] = (ax + cy + tx, bx + dy + ty, 1)
 *             [ tx ty 1 ]
 * ```
 */
class Matrix {
  public a: number = 1;
  public b: number = 0;
  public c: number = 0;
  public d: number = 1;
  public tx: number = 0;
  public ty: number = 0;

  /**
   * @param args 矩阵队列
   **/
  public constructor(...args: number[]) {
    if (args.length === 6) {
      this.set(args[0], args[1], args[2], args[3], args[4], args[5]);
    }
  }
  /**
   * 设置矩阵属性值
   * @param args 矩阵队列
   * @return 对象本身
   **/
  public set(...args: number[]): this {
    this.a = args[0];
    this.b = args[1];
    this.c = args[2];
    this.d = args[3];
    this.tx = args[4];
    this.ty = args[5];
    return this;
  }
  /**
   * 设置当前矩阵为单位矩阵
   * @return 对象本身
   **/
  public identity(): this {
    return this.set(1, 0, 0, 1, 0, 0);
  }
  /**
   * 复制其他Matrix
   * @param mat Matrix对象
   * @return 对象本身
   **/
  public copyTo(mat: Matrix): this {
    this.a = mat.a;
    this.b = mat.b;
    this.c = mat.c;
    this.d = mat.d;
    this.tx = mat.tx;
    this.ty = mat.ty;
    return this;
  }
  /**
   * 克隆
   * @return 克隆对象
   **/
  public clone(): Matrix {
    return new Matrix().copyTo(this);
  }
  /**
   * 判断两个矩阵是否相等
   * @param mat Matrix对象
   * @return 是否相同
   **/
  public equals(mat: Matrix): boolean {
    return (
      mat instanceof Matrix &&
      this.a === mat.a &&
      this.b === mat.b &&
      this.c === mat.c &&
      this.d === mat.d &&
      this.tx === mat.tx &&
      this.ty === mat.ty
    );
  }
  /**
   * 将矩阵转换为数组
   * @return 数组对象
   **/
  public toArray(): number[] {
    return [this.a, this.b, this.c, this.d, this.tx, this.ty];
  }
  /**
   * 平移
   * @param x x轴
   * @param y y轴
   * @return 对象本身
   **/
  public translate(x: number, y: number): this {
    this.tx += x;
    this.ty += y;
    return this;
  }
  /**
   * 拉伸
   * @param x x轴
   * @param y y轴
   * @return 对象本身
   **/
  public scale(x: number, y: number): this {
    return this.append(x, 0, 0, y, 0, 0);
  }
  /**
   * 旋转
   * @param angle 度数
   * @return 对象本身
   **/
  public rotate(angle: number): this {
    let sin = Global_Math.sin(angle);
    let cos = Global_Math.cos(angle);
    return this.append(cos, sin, -sin, cos, 0, 0);
  }
  /**
   * 扭曲
   * @param x x轴
   * @param y y轴
   * @return 对象本身
   **/
  public skew(x: number, y: number): this {
    return this.append(1, Global_Math.tan(y), Global_Math.tan(x), 1, 0, 0);
  }
  /**
   * 前置相乘(将某个矩阵与当前矩阵连接，从而将这两个矩阵的几何效果有效地结合在一起)
   * @param a Matrix对象 | a值
   * @param b b值
   * @param c c值
   * @param d d值
   * @param tx tx值
   * @param ty ty值
   * @return 对象本身
   **/
  public prepend(m: Matrix): this;
  public prepend(a: number, b: number, c: number, d: number, tx: number, ty: number): this;
  public prepend(a: number | Matrix, b?: number, c?: number, d?: number, tx?: number, ty?: number): this {
    if (a instanceof Matrix) {
      return this.prepend(a.a, a.b, a.c, a.d, a.tx, a.ty);
    }
    if (a !== undefined && b !== undefined && c !== undefined && d !== undefined && tx !== undefined && ty !== undefined) {
      let a1 = this.a;
      let b1 = this.b;
      let c1 = this.c;
      let d1 = this.d;
      let tx1 = this.tx;
      let ty1 = this.ty;
      this.a = a * a1 + b * c1;
      this.b = a * b1 + b * d1;
      this.c = c * a1 + d * c1;
      this.d = c * b1 + d * d1;
      this.tx = tx * a1 + ty * c1 + tx1;
      this.ty = tx * b1 + ty * d1 + ty1;
    }
    return this;
  }
  /**
   * 后置相乘(将某个矩阵与当前矩阵连接，从而将这两个矩阵的几何效果有效地结合在一起)
   * @param a Matrix对象 | a值
   * @param b b值
   * @param c c值
   * @param d d值
   * @param tx tx值
   * @param ty ty值
   * @return 对象本身
   **/
  public append(m: Matrix): this;
  public append(a: number, b: number, c: number, d: number, tx: number, ty: number): this;
  public append(a: number | Matrix, b?: number, c?: number, d?: number, tx?: number, ty?: number): this {
    if (a instanceof Matrix) {
      return this.append(a.a, a.b, a.c, a.d, a.tx, a.ty);
    }
    if (a !== undefined && b !== undefined && c !== undefined && d !== undefined && tx !== undefined && ty !== undefined) {
      let a1 = this.a;
      let b1 = this.b;
      let c1 = this.c;
      let d1 = this.d;
      let tx1 = this.tx;
      let ty1 = this.ty;
      this.a = a * a1 + c * b1;
      this.b = b * a1 + d * b1;
      this.c = a * c1 + c * d1;
      this.d = b * c1 + d * d1;
      this.tx = a * tx1 + c * ty1 + tx;
      this.ty = b * tx1 + d * ty1 + ty;
    }
    return this;
  }
  /**
   * 执行原始矩阵的逆转换
   * @return 对象本身
   **/
  public invert(): this {
    let a = this.a;
    let b = this.b;
    let c = this.c;
    let d = this.d;
    let tx = this.tx;
    let ty = this.ty;
    let n = a * d - c * b;
    this.a = d / n;
    this.b = -b / n;
    this.c = -c / n;
    this.d = a / n;
    this.tx = (c * ty - d * tx) / n;
    this.ty = (b * tx - a * ty) / n;
    return this;
  }
}

export {
  FmtJson as Matrix_FmtJson,
  Matrix
}
