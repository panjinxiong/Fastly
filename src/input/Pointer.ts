import * as Browser from "@/util/Browser";
import * as Util from "@/util/Util";
import { Event, Event_CtorParam } from "@/event/Event";
import { Container } from "@/display/nodes/Container";
import { Node } from "@/display/nodes/Node";
import { Stage } from "@/display/Stage";

type EventMode = "touch" | "mouse";
type EventType =
  | ""
  | "mousedown" | "mousemove" | "mouseover" | "mouseup" | "mouseout"
  | "touchstart" | "touchmove" | "touchover" | "touchend" | "touchout";
type PointerEventCtorParam = [
  (
    Event_CtorParam[0] &
    {
      eventTarget?: Node;
      prevTarget?: Node;
      mode?: EventMode;
      pointX?: number;
      pointY?: number;
    }
  )
];
type PointerMixinsNodeCtorParam = [
  {
    pointerEnabled?: boolean;
    pointerCursor?: string;
  }
];

/**
 * “点”事件
 **/
class PointerEvent extends Event {
  /** 冒泡状态 */
  private _stopPropagationed: boolean = false;
  /** @overwrite */
  public type: EventType;
  public target: Node | null;
  /** 事件触发目标 */
  public eventTarget: Node | null;
  /** 上一次触发目标 */
  public prevTarget: Node | null;
  /** 触发方式 */
  public mode: EventMode;
  /** 鼠标点x */
  public pointX: number;
  /** 鼠标点y */
  public pointY: number;
  /** 冒泡状态 */
  public get stopPropagationed(): boolean {
    return this._stopPropagationed;
  }

  /**
   * @param props 初始化参数
   **/
  public constructor(props: PointerEventCtorParam[0] = {}) {
    super(props);

    this.type = Util.getJsonVal(props, "type") || "";
    this.target = Util.getJsonVal(props, "target") || null;
    this.eventTarget = Util.getJsonVal(props, "eventTarget") || null;
    this.prevTarget = Util.getJsonVal(props, "prevTarget") || null;
    this.mode = Util.getJsonVal(props, "mode") || "mouse";
    this.pointX = Util.getJsonVal(props, "pointX") || 0;
    this.pointY = Util.getJsonVal(props, "pointY") || 0;
  }
  /**
   * 冒泡方法
   **/
  public stopPropagation(): void {
    this._stopPropagationed = true;
  }
}

/**
 * “点”混合
 **/
class PointerMixinsNode {
  /** 构造 */
  public static CTOR(target: any, props: PointerMixinsNodeCtorParam[0] = <any>{}): void {
    target._isMouseOver = false;
    target.pointerEnabled = Util.getJsonVal(props, "pointerEnabled") || true;
    target.pointerCursor = Util.getJsonVal(props, "pointerCursor") || "";
  }

  /** “点”事件:判断是否mouseover */
  private _isMouseOver!: boolean;
  /** “点”事件：是否接受响应 */
  public pointerEnabled!: boolean;
  /** “点”事件：鼠标图标 */
  public pointerCursor!: string;
  /**
   * 发射“点”事件
   **/
  public pointerEmitEvent(this: Node, e: PointerEvent): void {
    // 发射所有事件
    e.target = this;
    this.emit(e);

    // 发射 ("mouseover" | "touchover") 事件
    if (e.type === "mousemove" || e.type === "touchmove") {
      if (!this._isMouseOver) {
        this._isMouseOver = true;
        let overEvent = <PointerEvent>Util.mixinsJson(new PointerEvent(), [e], true);
        overEvent.type = overEvent.mode === "mouse" ? "mouseover" : "touchover";
        this.emit(overEvent);
      }
    } else if (e.type === "mouseout" || e.type === "touchout") {
      this._isMouseOver = false;
    }

    // 发射父对象事件
    let parent = this.parent;
    if (!e.stopPropagationed && parent) {
      if (e.type === "mouseout" || e.type === "touchout") {
        // 父对象是碰撞鼠标点就判断失败
        if (!parent.hitTestPoint(e.pointX, e.pointY)) parent.pointerEmitEvent(e);
      } else {
        parent.pointerEmitEvent(e);
      }
    }
  }
}

/**
 * “点”DOM：[鼠标|触屏]事件
 **/
class PointerDOM {
  /** 上一个触碰事件对象 */
  private _pointerPrevTarget: Container | null = null;
  /** 舞台对象 */
  public readonly stage: Stage;

  /**
   * @param stage 舞台对象
   **/
  public constructor(stage: Stage) {
    this.stage = stage;
    this._domEvent = this._domEvent.bind(this);
  }
  /**
   * DOM事件处理函数
   *  @param e DOM元素事件状态
   **/
  private _domEvent(e: any): void {
    let pointerEvent = new PointerEvent();
    let viewport = this.stage.viewport;
    let prevTaget = this._pointerPrevTarget;
    let posObj = e;
    let type = e.type;
    let mode = type.indexOf("touch") === 0 ? "touch" : "mouse";
    let leave = type === "mouseout" || type === "touchout"; // “点”离开canvas元素

    // 获取触屏点
    if (mode === "touch") {
      let t = e.touches;
      let c = e.changedTouches;
      posObj = t && t.length ? t[0] : c && c.length ? c[0] : null;
    }

    let x = posObj.pageX || posObj.clientX;
    let y = posObj.pageY || posObj.clientY;
    pointerEvent.pointX = x = (x - ((viewport && viewport.left) || 0)) / this.stage.layers.scale[0];
    pointerEvent.pointY = y = (y - ((viewport && viewport.top) || 0)) / this.stage.layers.scale[1];
    pointerEvent.type = type;
    pointerEvent.mode = <EventMode>mode;

    // obj对象是 “点”捕获，target是上一个obj对象
    let obj = this.stage.layers.getNodeAtPoint(x, y, false, true) || this.stage.layers;

    // target对象发射touchout | mouseout事件
    // 有target && (“点”离开canvas || prevTaget!=obj)
    if (prevTaget && (leave || prevTaget !== obj)) {
      let out = "";
      if (type === "touchmove") { out = "touchout"; }
      else if (type === "mousemove") { out = "mouseout"; }
      else if (leave || !obj) { out = mode === "touch" ? "touchout" : "mouseout"; }

      if (out) {
        let outEvent = <PointerEvent>Util.mixinsJson(new PointerEvent(), [pointerEvent], true);
        outEvent.type = <EventType>out;
        outEvent.eventTarget = prevTaget;
        prevTaget.pointerEmitEvent(outEvent);
      }

      pointerEvent.prevTarget = prevTaget;
      this._pointerPrevTarget = null;
    }

    // obj对象发射所有事件，除了mouseout | touchout事件之外
    if (obj.pointerEnabled && (type !== "mouseout" || type !== "touchout")) {
      pointerEvent.eventTarget = this._pointerPrevTarget = <Container>obj;
      obj.pointerEmitEvent(pointerEvent);
    }

    // 设置鼠标图标
    if (mode === "mouse" && obj instanceof Node) {
      this.stage.element.style.cursor = obj.pointerEnabled && obj.pointerCursor ? obj.pointerCursor : "";
    }

    // 安卓模式下禁止默认事件
    if (Browser.isAndroid && type === "touchmove") {
      e.preventDefault();
    }
  }
  /**
   * [开启|关闭][鼠标|触屏]事件响应
   * @param enabled 指定开启还是关闭
   **/
  public enable(enabled: boolean = true): void {
    let types = Browser.isTouch ? ["touchstart", "touchmove", "touchend", "touchout"] : ["mousedown", "mousemove", "mouseup", "mouseout"];
    for (let i = 0; i < types.length; i++) {
      Browser.enableEvent(this.stage.element, types[i], this._domEvent, enabled);
    }
  }
}

export {
  PointerMixinsNodeCtorParam as Pointer_MixinsNodeCtorParam,
  PointerMixinsNode as Pointer_MixinsNode,
  PointerDOM as Pointer_DOM,
}
