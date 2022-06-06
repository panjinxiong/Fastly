
import * as Browser from "@/util/Browser";
import * as Util from "@/util/Util";
import { Type_CanvasRenderingContext2D } from "@g/Type";
import { Global_Ele } from "@/@global/Global";
import { CanvasRenderer } from "@/system/CanvasRenderer";
import { Ticker_TickParam } from "@/system/Ticker";
import { Node, Node_CtorParam } from "@/display/nodes/Node";

type TextAlign = "start" | "end" | "left" | "right" | "center";
type TextVAlign = "top" | "middle" | "bottom";
type TextCtorParam = [
  (
    Node_CtorParam[0] &
    {
      text?: string;
      color?: string;
      textAlign?: TextAlign;
      textVAlign?: TextVAlign;
      outline?: boolean;
      lineSpacing?: number;
      maxWidth?: number;
      font?: string;
    }
  )
];

class Text extends Node {
  /**
   * 测算指定字体样式的行高
   * @param font 指定要测算的字体样式
   * @return 返回指定字体的行高
   **/
  public static measureFontHeight(font: string): number {
    let fontHeight;
    let docElement = Global_Ele;
    let elem = Browser.createElement("div", { style: { font: font, position: "absolute" }, innerHTML: "M" });

    docElement.appendChild(elem);
    fontHeight = elem.offsetHeight;
    docElement.removeChild(elem);

    return fontHeight;
  }

  /** 宽度 */
  private _textWidth: number = 0;
  /** 高度 */
  private _textHeight: number = 0;
  /** 字体高度 */
  private _fontHeight: number;
  /** 文本内容 */
  public text: string;
  /** 字体颜色 */
  public color: string;
  /** 对齐方式 */
  public textAlign: TextAlign;
  /** 垂直对齐方式 */
  public textVAlign: TextVAlign;
  /** 绘制边框还是填充 */
  public outline: boolean;
  /** 行距 */
  public lineSpacing: number;
  /** 最大宽度 */
  public maxWidth: number;
  /** 高度 */
  public font: string;
  /** 宽度 */
  public get textWidth(): number {
    return this._textWidth;
  }
  /** CSS字体样式 */
  public get textHeight(): number {
    return this._textHeight;
  }

  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: TextCtorParam[0] = <any>{}) {
    super(props);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("Text");
    this.text = Util.getJsonVal(props, "text") || "";
    this.color = Util.getJsonVal(props, "color") || "#000";
    this.textAlign = Util.getJsonVal(props, "textAlign") || "left";
    this.textVAlign = Util.getJsonVal(props, "textVAlign") || "top";
    this.outline = Util.getJsonVal(props, "outline") || false;
    this.lineSpacing = Util.getJsonVal(props, "lineSpacing") || 0;
    this.maxWidth = Util.getJsonVal(props, "maxWidth") || 200;
    this.font = Util.getJsonVal(props, "font") || "12px arial";

    this._fontHeight = Text.measureFontHeight(this.font);
  }
  /**
   * 在指定的渲染上下文上绘制一行文本
   * @param context 渲染上下文
   * @param text 文本内容
   * @param y 垂直对齐方式
   **/
  private _drawTextLine(context: Type_CanvasRenderingContext2D, text: string, y: number): void {
    let x = 0;
    let width = this.width;

    switch (this.textAlign) {
      case "center":
        x = width >> 1;
        break;
      case "right":
      case "end":
        x = width;
        break;
    }

    if (this.outline) context.strokeText(text, x, y);
    else context.fillText(text, x, y);
  }
  /**
   * 在指定的渲染上下文上绘制文本
   * @param context 渲染上下文
   **/
  private _draw(context: Type_CanvasRenderingContext2D): void {
    let self = this;

    if (!self.text) return;

    let text = self.text;
    let lines = text.split(/\r\n|\r|\n|<br(?:[ \/])*>/);
    let width = 0;
    let height = 0;
    let lineHeight = self._fontHeight + self.lineSpacing;
    let line;
    let drawLines = [];

    context.font = self.font;
    context.textAlign = self.textAlign;
    context.textBaseline = "top";

    for (let i = 0; i < lines.length; i++) {
      line = lines[i];

      let w = context.measureText(line).width;
      if (w <= self.maxWidth) {
        drawLines.push({ text: line, y: height });
        if (width < w) width = w;
        height += lineHeight;
        continue;
      }

      let str = "";
      let oldWidth = 0;
      let newWidth;
      let word;
      for (let j = 0, wlen = line.length; j < wlen; j++) {
        word = line[j];
        newWidth = context.measureText(str + word).width;

        if (newWidth > self.maxWidth) {
          drawLines.push({ text: str, y: height });
          if (width < oldWidth) width = oldWidth;
          height += lineHeight;
          str = word;
        } else {
          oldWidth = newWidth;
          str += word;
        }

        if (j === wlen - 1) {
          drawLines.push({ text: str, y: height });
          if (str !== word && width < newWidth) width = newWidth;
          height += lineHeight;
        }
      }
    }

    self._textWidth = width;
    self._textHeight = height;
    if (!self.width) self.width = width;
    if (!self.height) self.height = height;

    let startY = 0;
    switch (self.textVAlign) {
      case "middle":
        startY = (self.height - self._textHeight) >> 1;
        break;
      case "bottom":
        startY = self.height - self._textHeight;
        break;
    }

    if (self.background) {
      context.fillStyle = self.background;
      context.fillRect(0, 0, self.width, self.height);
    }

    if (self.outline) context.strokeStyle = self.color;
    else context.fillStyle = self.color;

    for (let i = 0; i < drawLines.length; i++) {
      line = drawLines[i];
      self._drawTextLine(context, line.text, startY + line.y);
    }
  }
  /**
   * @overwrite
   **/
  public renderDraw(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): void {
    this._draw(renderer.context);
  }
  /**
   * 设置文本的字体CSS样式
   * @param font 要设置的字体CSS样式
   * @return 对象本身
   **/
  public setFont(font: string): this {
    if (this.font !== font) {
      this.font = font;
      this._fontHeight = Text.measureFontHeight(font);
    }
    return this;
  }
}

export {
  Text
}
