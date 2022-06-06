import * as Quickly from "@quickly";
import * as Browser from "@/util/Browser";
import { Vector_FmtArr } from "@/geom/Vector";
import { Keyboard_DOM } from "@/input/Keyboard";
import { Pointer_DOM } from "@/input/Pointer";
import { CanvasRenderer, CanvasRenderer_CtorParam } from "@/system/CanvasRenderer";
import { Ticker_Tick, Ticker_TickParam } from "@/system/Ticker";
import { Container } from "@/display/nodes/Container";

type StageCtorParam = [
  (
    CanvasRenderer_CtorParam[0] &
    {
      paused?: boolean;
    }
  )
];

/**
 * 舞台映射渲染器
 **/
class Stage implements Ticker_Tick {
  /** 舞台 渲染器 */
  private _renderer: CanvasRenderer;
  /** 唯一标识符 */
  public readonly id: string = Quickly.uuid();
  /** “键盘”DOM */
  public keyboardDOM: Keyboard_DOM;
  /** “点”DOM */
  public pointerDOM: Pointer_DOM;
  /** 舞台是否暂停刷新渲染 */
  public paused: boolean;
  /** 渲染器画布元素 */
  public get element(): HTMLCanvasElement { return this._renderer.element; }
  /** 渲染器根节点 */
  public get layers(): Container { return this._renderer.layers; }
  /** 渲染器画布高度 */
  public get height(): number { return this._renderer.height; }
  /** 渲染器画布宽度 */
  public get width(): number { return this._renderer.width; }
  /** 渲染器画布[拉伸x,拉伸y] */
  public get scale(): Vector_FmtArr { return this._renderer.scale; }
  /** 舞台内容在页面中的渲染区域 */
  public get viewport(): Browser.getElementRectReturn | null { return this._renderer.viewport || this._renderer.updateViewport(); }
  /** 舞台高度 */
  public set height(value: number) { this._renderer.height = value; }
  /** 舞台宽度 */
  public set width(value: number) { this._renderer.width = value; }
  /** 舞台[拉伸x,拉伸y] */
  public set scale(value: Vector_FmtArr) { this._renderer.scale = value; }

  /**
   * @param props 初始化参数
   **/
  public constructor(props: StageCtorParam[0] = <any>{}) {
    this.keyboardDOM = new Keyboard_DOM(this);
    this.pointerDOM = new Pointer_DOM(this);
    this.paused = (props && props.paused) || false;
    this._renderer = new CanvasRenderer(props);
  }
  /**
   * @implements
   **/
  public tick(tickParam?: Ticker_TickParam): void {
    if (!this.paused) this.layers.render(this._renderer, tickParam);
  }
}

export {
  Stage
}
