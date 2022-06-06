import * as Util from "@/util/Util";
import { Type_Json, Type_HTMLImageElement } from "@g/Type";
import { Global_Math } from "@/@global/Global";
import { Rectangle_FmtArr } from "@/geom/Rectangle";
import { Container, Container_CtorParam } from "@/display/nodes/Container";
import { Bitmap } from "@/display/ui/Bitmap";

type Glyphs = {
  image: Type_HTMLImageElement;
  rect: Rectangle_FmtArr;
};
type BitmapTextCtorParam = [
  (
    Container_CtorParam[0] &
    {
      glyphs?: Type_Json<Glyphs>;
      text?: string;
      letterSpacing?: number;
      textAlign?: string;
    }
  )
];

/**
 * 图文本功能类
 **/
class BitmapText extends Container {
  /** 缓冲器 */
  private static _pool: Bitmap[] = [];
  /**
   * 简易方式生成字形集合
   * @param text 字符文本
   * @param image 字符图片
   * @param col 列数。默认值为(文本字数一样)
   * @param row 行数。默认值为(1行)
   * @return 位图字体的字形集合
   **/
  public static createGlyphs(
    text: string,
    image: Type_HTMLImageElement,
    col?: number,
    row?: number
  ): Type_Json<Glyphs> {
    col = col || text.length;
    row = row || 1;

    let glyphs: Type_Json<any> = {};
    let w = image.width / col;
    let h = image.height / row;

    for (let i = 0; i < text.length; i++) {
      glyphs[text.charAt(i)] = {
        image: image,
        rect: [w * (i % col), h * Global_Math.floor(i / col), w, h],
      };
    }

    return glyphs;
  }

  /** 位图字体的字形集合 */
  public glyphs: Type_Json<Glyphs> | null;
  /** 位图文本的文本内容 */
  public text: string;
  /** 字距，即字符间的间隔 */
  public letterSpacing: number;
  /** 文本对齐方式 */
  public textAlign: string;

  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: BitmapTextCtorParam[0] = <any>{}) {
    super(props);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("BitmapText");
    this.glyphs = Util.getJsonVal(props, "glyphs") || null;
    this.text = Util.getJsonVal(props, "text") || "";
    this.letterSpacing = Util.getJsonVal(props, "letterSpacing") || 0;
    this.textAlign = Util.getJsonVal(props, "textAlign") || "left";

    let text = this.text + "";
    if (text) {
      this.text = "";
      this.setText(text);
    }

    this.pointChildrenEnabled = false;
  }
  /**
   * 创建Bitmap对象
   * @param cfg 位图字体的字形集合
   * @return Bitmap对象
   **/
  private _createBitmap(cfg: Glyphs): Bitmap {
    let bmp: any;

    if (BitmapText._pool.length) {
      bmp = <Bitmap>BitmapText._pool.pop();
      bmp.setImage({ image: cfg.image, rect: cfg.rect });
    } else {
      bmp = new Bitmap({ image: cfg.image, rect: cfg.rect });
    }

    return bmp;
  }
  /**
   * 储存Bitmap对象
   * @param bmp Bitmap对象
   **/
  private _releaseBitmap(bmp: Bitmap): void {
    BitmapText._pool.push(bmp);
  }
  /**
   * 设置位图文本的文本内容
   * @param text 要设置的文本内容
   * @return 对象本身
   **/
  public setText(text: string): this {
    let self = this;
    let str = text.toString();
    let len = str.length;

    if (self.text === str) return this;

    let width = 0;
    let height = 0;
    let charGlyph;
    let charObj;

    self.text = str;

    for (let i = 0; i < len; i++) {
      charGlyph = self.glyphs && self.glyphs[str.charAt(i)];

      if (charGlyph) {
        if (self.children[i]) {
          charObj = self.children[i];
          (<Bitmap>charObj).setImage({ image: charGlyph.image, rect: charGlyph.rect });
        } else {
          charObj = self._createBitmap(charGlyph);
          self.addChild(charObj);
        }

        charObj.x = width + (width > 0 ? self.letterSpacing : 0);
        width = charObj.x + charGlyph.rect[2];
        height = Global_Math.max(height, charGlyph.rect[3]);
      }
    }

    // 设置文本 小于 当前文本字符串长度 时 就释放资源
    for (let i = self.children.length - 1; i >= len; i--) {
      self._releaseBitmap(<Bitmap>self.children[i]);
      self.children[i].removeParent();
    }

    self.width = width;
    self.height = height;
    this.setTextAlign();

    return self;
  }
  /**
   * 设置位图文本的对齐方式
   * @param textAlign 文本对齐方式
   * @return 对象本身
   **/
  public setTextAlign(textAlign?: string): this {
    this.textAlign = textAlign || this.textAlign;

    switch (this.textAlign) {
      case "center":
        this.anchor[0] = this.width * 0.5;
        break;
      case "right":
        this.anchor[0] = this.width;
        break;
      case "left":
      default:
        this.anchor[0] = 0;
        break;
    }

    return this;
  }
  /**
   * 返回能否使用当前指定的字体显示提供的字符串
   * @param str 要检测的字符串
   * @return 是否能使用指定字体
   **/
  public hasGlyphs(str: string): boolean {
    let glyphs = this.glyphs;

    if (!glyphs) return false;
    str = str.toString();
    for (let i = 0; i < str.length; i++) {
      if (!glyphs[str.charAt(i)]) return false;
    }

    return true;
  }
}

export {
  BitmapText
}
