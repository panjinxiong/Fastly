import * as Util from "@/util/Util";
import { Node, Node_CtorParam } from "@/display/nodes/Node";
import { Drawable, Drawable_CtorParam } from "@/display/tool/Drawable";

type BitmapCtorParam = [
  (Node_CtorParam[0] & Drawable_CtorParam[0])
];

/**
 * 位图图像类
 **/
class Bitmap extends Node {
  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: BitmapCtorParam[0] = <any>{}) {
    super(props);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("Bitmap");
    this.drawable = new Drawable();
    this.setImage(props);
  }
  /**
   * 设置位图的图片
   * @param props 绘制图像的包装
   * @return 对象本身
   **/
  public setImage(props: BitmapCtorParam[0]): this {
    if (this.drawable) {
      let drawable = this.drawable.init(props);

      if (props.rect) {
        this.width = props.rect[2];
        this.height = props.rect[3];
      } else if (!this.width || !this.height) {
        this.width = drawable.rect[2];
        this.height = drawable.rect[3];
      }
    }

    return this;
  }
}

export {
  BitmapCtorParam as Bitmap_CtorParam,
  Bitmap
}
