import * as Quickly from "@quickly";
import * as Browser from "@/util/Browser";
import * as Util from "@/util/Util";
import { Type_Json } from "@g/Type";
import { Global_Win } from "@/@global/Global";
import { Event, Event_CtorParam } from "@/event/Event";
import { EventEmitter_Listener } from "@/event/EventEmitter";
import { Node } from "@/display/nodes/Node";
import { Stage } from "@/display/Stage";

type EventType = "keydown" | "keyup" | string;
type KeyboardEventCtorParam = [
  (
    Event_CtorParam[0] &
    {
      type?: EventType;
      target?: Node | null;
      parentEvent?: any;
      key?: string;
      keys?: string[];
      splitKeys?: string;
      keyDownKeys?: string[];
      keyDownSplitKeys?: string;
      isRepeat?: boolean;
    }
  )
];

/**
 * “键盘”事件
 **/
class KeyboardEvent extends Event {
  /** @overwrite */
  public type: EventType;
  public target: Node | null;
  /** 继承事件 */
  public parentEvent: any;
  /** 键盘值 */
  public key: string;
  /** 组合键 */
  public keys: string[];
  public splitKeys: string;
  /** 键盘当前按下组合键 */
  public keyDownKeys: string[];
  public keyDownSplitKeys: string;
  /** 时间是否足够长以触发按键重复 */
  public isRepeat: boolean;
  /** 是否按下shift */
  public get isShift(): boolean { return this.keys.indexOf("Shift") !== -1; }
  /** 是否按下ctrl */
  public isCtrl(): boolean { return this.keys.indexOf("Control") !== -1; }
  /** 是否按下alt */
  public isAlt(): boolean { return this.keys.indexOf("Alt") !== -1; }
  /** 是否按下 [⌘|⊞] */
  public isMeta(): boolean { return this.keys.indexOf("Meta") !== -1; }
  /** 组合键某个按钮是否有按下 */
  public isKeys(k: string): boolean { return this.keys.indexOf(k) !== -1; }
  /** 键盘是否有按下 */
  public isKeyDown(): boolean { return this.keyDownKeys.length === 0; }
  /** 键盘某个按钮是否有按下 */
  public isKeyDownKeys(k: string): boolean { return this.keyDownKeys.indexOf(k) !== -1; }

  /**
   * @param props 初始化参数
   **/
  public constructor(props: KeyboardEventCtorParam[0] = <any>{}) {
    super(props);

    this.type = Util.getJsonVal(props, "type") || "";
    this.target = Util.getJsonVal(props, "target") || null;
    this.parentEvent = Util.getJsonVal(props, "parentEvent") || null;
    this.key = Util.getJsonVal(props, "key") || "";
    this.keys = Util.getJsonVal(props, "keys") || [];
    this.splitKeys = Util.getJsonVal(props, "splitKeys") || "";
    this.keyDownKeys = Util.getJsonVal(props, "keyDownKeys") || [];
    this.keyDownSplitKeys = Util.getJsonVal(props, "keyDownSplitKeys") || "";
    this.isRepeat = Util.getJsonVal(props, "isRepeat") || false;
  }
}

/**
 * “键盘”DOM：事件
 **/
class KeyboardDOM {
  /** 搜集绑定键 */
  private _keysDown: string[] = [];
  /** 注册键盘队列 */
  private _reg: Node[] = [];
  /** 舞台对象 */
  public readonly stage: Stage;
  /** 设定范围的判断 */
  public splitKey: string = "+";
  /** 获取注册键盘队列 */
  public get reg(): Node[] { return this._reg; }

  /**
   * @param props 初始化参数
   **/
  public constructor(stage: Stage) {
    this.stage = stage;
    this._domEvent = this._domEvent.bind(this);
    this._domClearKey = this._domClearKey.bind(this);
  }
  /**
   * DOM事件处理函数
   * @param e DOM元素事件状态
   **/
  private _domEvent(e: any): void {
    let copyKeysDown = this._keysDown.slice(0);
    let event: Type_Json<any> = {
      "type": e.type,
      "key": e.key,
      "isRepeat": e.repeat,
    };
    if (event.type === "keydown") {
      if (this._keysDown.indexOf(event.key) === -1) {
        this._keysDown.push(event.key);
        copyKeysDown = this._keysDown.slice(0);
      }
    } else if (event.type === "keyup") {
      let k = this._keysDown.indexOf(event.key);
      if (k > -1) this._keysDown.splice(k, 1);
    }

    // 发射“键盘”事件
    event["keys"] = copyKeysDown;
    event["splitKeys"] = event.keys.join(this.splitKey);
    event["keyDownKeys"] = this._keysDown.slice(0);
    event["keyDownSplitKeys"] = event.keyDownKeys.join(this.splitKey);
    for (let r = 0; r < this._reg.length; r++) {
      let myReg = this._reg[r];

      /* "keydown" 或 "keyup" 事件 */
      myReg.emitFn(event.type, function (el: EventEmitter_Listener): Event {
        let copyMy = Quickly.clone(event);
        copyMy.target = myReg;
        copyMy.parentEvent = e;
        return new KeyboardEvent(copyMy);
      });
      /* "keydown键" 或 "keyup键" 事件 */
      myReg.emitFn(event.type + " " + event.splitKeys, function (el: EventEmitter_Listener): Event {
        let copyMy = Quickly.clone(event);
        copyMy.type = copyMy.type + " " + copyMy.splitKeys;
        copyMy.target = myReg;
        copyMy.parentEvent = e;
        return new KeyboardEvent(copyMy);
      });
    }
  }
  private _domClearKey(e: any): void {
    this._keysDown = [];
  }
  /**
   * 重置注册键盘队列
   **/
  public reset(obj: Node[]): void {
    if (obj.length !== 0) { this._reg = obj; }
    else { this._reg = []; }
  }
  /**
   * 判断注册键盘
   * @param obj Node对象
   * @return 对象本身
   **/
  public has(obj: Node): boolean {
    return this.get(obj) !== -1;
  }
  /**
   * 获取注册键盘
   * @param obj Node对象
   * @return 对象本身
   **/
  public get(obj: Node): number {
    return this._reg.indexOf(obj);
  }
  /**
   * 添加注册键盘队列
   * @param obj Node对象
   * @return 对象本身
   **/
  public add(obj: Node | Node[]): this {
    if (obj instanceof Array) this._reg.concat(obj);
    else this._reg.push(obj);
    return this;
  }
  /**
   * 修改注册键盘队列
   * @param index 修改位置
   * @param obj Node对象
   * @return 对象本身
   **/
  public set(index: number | Node, obj: Node): this {
    let i = index instanceof Node ? this._reg.indexOf(index) : index;
    (i >= 0 || i < this._reg.length) && (this._reg[i] = obj);
    return this;
  }
  /**
   * 删除注册键盘队列
   * @param index 删除位置
   * @return 对象本身
   **/
  public remove(index: number | Node): this {
    let i = index instanceof Node ? this._reg.indexOf(index) : index;
    (i >= 0 || i < this._reg.length) && this._reg.splice(i, 1);
    return this;
  }
  /**
   * [开启|关闭]键盘事件响应
   * @param enabled 指定开启还是关闭
   **/
  public enable(enabled: boolean = true): void {
    let types = ["keydown", "keyup"];
    for (let i = 0; i < types.length; i++) {
      Browser.enableEvent(Global_Win, types[i], this._domEvent, enabled);
    }
    Browser.enableEvent(Global_Win, 'focus', this._domClearKey, enabled);
    Browser.enableEvent(Global_Win, 'blur', this._domClearKey, enabled);
  }
}

export {
  KeyboardDOM as Keyboard_DOM
}
