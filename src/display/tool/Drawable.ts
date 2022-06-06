import { Type_CanvasImageSource } from "@g/Type";
import { Rectangle_FmtArr } from "@/geom/Rectangle";
import { Vector_FmtArr } from "@/geom/Vector";

type DrawableCtorParam = [
  {
    image: Type_CanvasImageSource;
    rect?: Rectangle_FmtArr;
    offset?: Vector_FmtArr;
  }
];

/**
 * Drawable是可绘制图像的包装类
 **/
class Drawable {
  /** 绘制的图像 */
  public image!: Type_CanvasImageSource;
  /** 绘制的图像的矩形区域 */
  public rect!: Rectangle_FmtArr;
  /** 绘制的图像的偏移位置[x,y] */
  public offset: Vector_FmtArr | null = null;

  /**
   * @param props 初始化参数
   **/
  public constructor(props?: DrawableCtorParam[0]) {
    if (props) this.init(props);
  }
  /**
   * 初始化
   * @param props 初始化参数
   * @return 对象本身
   **/
  public init(props: DrawableCtorParam[0]): this {
    this.image = props.image || this.image;
    (props.rect && (this.rect = props.rect)) ||
      (this.rect = [0, 0, <number>this.image.width, <number>this.image.height]);
    props.offset && (this.offset = props.offset);
    return this;
  }
}

export {
  DrawableCtorParam as Drawable_CtorParam,
  Drawable
}
