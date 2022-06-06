import { Type_Json } from "@g/Type";
import { Event } from "@/event/Event";

type Listener = {
  /** [只读] 事件完成次数 */
  complete: number;
  /** 事件回调 */
  callback: (event?: Event) => void;
  /** 事件执行次数，小于0就是无限次 */
  total: number;
};

/**
 * 触发器类
 **/
class EventEmitterMixins {
  /** 构造 */
  public static CTOR(target: any): void {
    target._listeners = {};
  }

  /** 触发器队列 */
  private _listeners!: Type_Json<Listener[]>;
  /**
   * 增加一个触发器
   * @param type 监听事件类型
   * @param callback 事件类型回调函数
   * @param total 回调函数响应次数
   * @return 对象本身
   **/
  public on(type: string, callback: Listener["callback"], total: number = -1): this {
    let eventListeners = (this._listeners[type] = this._listeners[type] || []);

    for (let i = 0; i < eventListeners.length; i++) {
      if (eventListeners[i].callback === callback) return this;
    }

    eventListeners.push({ callback: callback, complete: 0, total: total });

    return this;
  }
  /**
   * 删除触发器
   * @param type 监听事件类型
   * @param callback 监听类型回调函数
   * @return 对象本身
   **/
  public off(): this; // 删除所有的监听事件
  public off(type: string): this; // 删除指定类型的所有监听事件
  public off(type: string, callback: Listener["callback"]): this; // 删除指定类型的监听事件
  public off(type?: string, callback?: Listener["callback"]): this {
    if (arguments.length === 0) this._listeners = {};
    else if (type && this._listeners[type]) {
      if (arguments.length === 1) delete this._listeners[type];
      else {
        let eventListeners = this._listeners[type];

        for (let i = 0; i < eventListeners.length; i++) {
          if (eventListeners[i].callback === callback) {
            eventListeners.splice(i, 1);
            if (eventListeners.length === 0) delete this._listeners[type];
            break;
          }
        }
      }
    }

    return this;
  }
  /**
   * 发送事件
   * @param detail 发送事件参数
   * @return 是否成功发送事件
   **/
  public emit(detail: Event): boolean {
    if (!this._listeners) return false;

    let eventListeners = this._listeners[detail.type];
    if (eventListeners) {
      let event = detail;
      let eventListenersCopy = eventListeners.slice(0); // 防止添加发射器队列变形

      for (let i = 0; i < eventListenersCopy.length; i++) {
        let el = eventListenersCopy[i];

        if (el.total > -1) {
          if (el.total > el.complete) {
            el.callback.call(this, event);
            el.complete++;
          }

          if (el.total <= el.complete) {
            let index = eventListeners.indexOf(el);
            if (index > -1) eventListeners.splice(index, 1);
          }
        } else {
          el.callback.call(this, event);
        }
      }

      if (eventListeners.length === 0) delete this._listeners[detail.type];

      return true;
    }

    return false;
  }
  /**
   * 发送事件,通过fn返回值获取Event对象
   * @param type 发送监听事件类型
   * @param fn 发送事件方法
   **/
  public emitFn(type: string, fn: (el: Listener) => Event): void {
    if (!this._listeners) return;

    let eventListeners = this._listeners[type];

    if (eventListeners) {
      let eventListenersCopy = eventListeners.slice(0); // 防止添加发射器队列变形

      for (let i = 0; i < eventListenersCopy.length; i++) {
        let el = eventListenersCopy[i];

        if (el.total > -1) {
          if (el.total > el.complete) {
            el.callback.call(this, fn(el));
            el.complete++;
          }
          if (el.total <= el.complete) {
            let index = eventListeners.indexOf(el);

            if (index > -1) eventListeners.splice(index, 1);
          }
        } else {
          el.callback.call(this, fn(el));
        }
      }

      if (eventListeners.length === 0) delete this._listeners[type];
    }
  }
}

export {
  EventEmitterMixins as EventEmitter_Mixins,
  Listener as EventEmitter_Listener
}
