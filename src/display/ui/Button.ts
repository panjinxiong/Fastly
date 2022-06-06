import * as Util from "@/util/Util";
import { Event } from "@/event/Event";
import { Node, Node_CtorParam } from "@/display/nodes/Node";
import { Drawable, Drawable_CtorParam } from "@/display/tool/Drawable";

type EventType = "up" | "over" | "down" | "disabled";
type State = Node_CtorParam[0] & Drawable_CtorParam[0];
type ButtonCtorParam = [
  (
    State &
    {
      upState?: Drawable_CtorParam[0];
      overState?: Drawable_CtorParam[0];
      downState?: Drawable_CtorParam[0];
      disabledState?: Drawable_CtorParam[0];
      state?: string;
      enabled?: boolean;
    }
  )
];

/**
 * 简单按钮类
 **/
class Button extends Node {
  /** 按钮弹起 */
  public static readonly UP: EventType = "up";
  /** 按钮经过 */
  public static readonly OVER: EventType = "over";
  /** 按钮按下 */
  public static readonly DOWN: EventType = "down";
  /** 禁止按钮 */
  public static readonly DISABLED: EventType = "disabled";

  /** 按钮弹起状态 */
  public upState: State | null;
  /** 按钮经过状态 */
  public overState: State | null;
  /** 按钮按下状态 */
  public downState: State | null;
  /** 按钮不可用状态 */
  public disabledState: State | null;
  /** 按钮的状态名称 */
  public state: string;
  /** 指示按钮是否可用 */
  public enabled: boolean;

  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: ButtonCtorParam[0] = <any>{}) {
    super(props);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("Button");
    this.upState = Util.getJsonVal(props, "upState") || null;
    this.overState = Util.getJsonVal(props, "overState") || null;
    this.downState = Util.getJsonVal(props, "downState") || null;
    this.disabledState = Util.getJsonVal(props, "disabledState") || null;
    this.state = Util.getJsonVal(props, "state") || "";
    this.enabled = Util.getJsonVal(props, "enabled") || true;

    this.drawable = new Drawable(props);
    this.pointerCursor = "pointer";
    this.setState(Button.UP);
  }
  /**
   * @overwrite
   **/
  public emit(detail: Event): boolean {
    if (!this.enabled) return false;

    switch (detail.type) {
      case "mousedown":
      case "touchstart":
      case "touchmove":
        this.setState(Button.DOWN);
        break;
      case "mouseover":
      case "touchover":
        this.setState(Button.OVER);
        break;
      case "mouseup":
      case "touchend":
        if (this.overState) this.setState(Button.OVER);
        else if (this.upState) this.setState(Button.UP);
        break;
      case "touchout":
      case "mouseout":
        this.setState(Button.UP);
        break;
    }

    return super.emit(detail);
  }
  /**
   * 设置按钮是否可用
   * @param enabled 指示按钮是否可用
   * @return 对象本身
   **/
  public setEnabled(enabled: boolean): this {
    if (this.enabled !== enabled) {
      if (!enabled) this.setState(Button.DISABLED);
      else this.setState(Button.UP);
    }
    return this;
  }
  /**
   * 设置按钮的状态。此方法由Button内部调用，一般无需使用此方法
   * @param state 按钮的新的状态
   * @return 对象本身
   **/
  public setState(state: string): this {
    if (this.state !== state) {
      let stateObj;

      this.state = state;
      this.pointerEnabled = this.enabled = state !== Button.DISABLED;

      switch (state) {
        case Button.UP:
          stateObj = this.upState;
          break;
        case Button.OVER:
          stateObj = this.overState;
          break;
        case Button.DOWN:
          stateObj = this.downState;
          break;
        case Button.DISABLED:
          stateObj = this.disabledState;
          break;
      }

      stateObj && this.drawable && this.drawable.init(stateObj);
    }

    return this;
  }
}

export {
  Button
}
