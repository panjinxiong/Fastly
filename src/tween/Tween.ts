import * as Quickly from "@quickly";
import * as Util from "@/util/Util";
import { Type_Json } from "@g/Type";
import { Ease, Ease_Fn } from "@/tween/Ease";
import { Node_Tween } from "@/display/nodes/Node";

type Targer = any;
type TweenCtorParam = [
  {
    target: Targer;
    fromProps?: Node_Tween;
    toProps?: Node_Tween;
    duration?: number;
    delay?: number;
    paused?: boolean;
    loop?: boolean;
    reverse?: boolean;
    repeat?: number;
    repeatDelay?: number;
    ease?: Ease_Fn;
    onStart?: (this: Tween) => void;
    onUpdate?: (this: Tween, easeRatio: number) => void;
    onComplete?: (this: Tween) => void;
  }
];

let NodeDefault = {
  "x": 0,
  "y": 0,
  "height": 0,
  "width": 0,
  "alpha": 0,
  "background": "",
  "anchor": [0, 0],
  "rotate": 0,
  "scale": [0, 0],
  "skew": [0, 0],
  "transform": [1, 0, 0, 1, 0, 0],
};

/**
 * 补间动画类
 **/
class Tween {
  /** 补间动画缓存 */
  private static _tweens: Tween[] = [];
  /**
   * 添加Tween对象
   * @param tween Tween对象
   * @return Tween类
   **/
  public static add(tween: Tween): typeof Tween {
    let tweens = Tween._tweens;
    if (tweens.indexOf(tween) === -1) tweens.push(tween);
    return Tween;
  }
  /**
   * 创建一个缓动动画，让目标对象从开始属性变换到目标属性
   * @param tweens 缓动动画的参数
   * @return 一个Tween对象或Tween对象数组
   **/
  public static fromto(props: TweenCtorParam[0]): Tween {
    let tween = new Tween(props);
    tween.start();
    return tween;
  }
  /**
   * 删除Tween对象
   * @param tweenOrTarget 要删除的Tween对象或target对象或要删除的一组对象
   * @return Tween对象
   **/
  public static remove(tweenOrTarget: Tween | Targer): typeof Tween {
    let tweens = Tween._tweens;
    if (tweenOrTarget instanceof Tween) {
      let i = tweens.indexOf(tweenOrTarget);
      if (i > -1) tweens.splice(i, 1);
    } else {
      for (let i = 0; i < tweens.length; i++) {
        if (tweens[i].target === tweenOrTarget) {
          tweens.splice(i, 1);
          i--;
        }
      }
    }

    return Tween;
  }
  /**
   * 删除所有Tween对象
   * @return Tween类
   **/
  public static removeAll(): typeof Tween {
    Tween._tweens.length = 0;
    return Tween;
  }
  /**
   * 更新所有Tween对象
   * @return Tween类
   **/
  public static tick(): typeof Tween {
    let tweens = Tween._tweens;
    for (let i = 0; i < tweens.length; i++) {
      let tween = tweens[i];
      if (tween && tween.update(Util.nowDate())) {
        tweens.splice(i, 1);
        i--;
        tween.onDestroyed && tween.onDestroyed.call(tween);
      }
    }
    return Tween;
  }

  /** 标记缓动开始时间 */
  private _startTime: number = 0;
  /** 标记缓动跳转指定时间 */
  private _seekTime: number = 0;
  /** 标记缓动停止时间 */
  private _pausedTime: number = 0;
  /** 标记缓动停止开始时间 */
  private _pausedStartTime: number = 0;
  /** 标记缓动反转播放,1(不是反转) */
  private _reverseFlag: number = 1;
  /** 标记缓动重复次数 */
  private _repeatCount: number = 0;
  /** 标记下一个缓动 */
  private _next: Tween | null = null;
  /** 缓动是否开始 */
  private _isStart: boolean = false;
  /** 缓动是否完成 */
  private _isComplete: boolean = false;
  /** [只读][单位毫秒] 缓动已进行的时长 */
  public time: number = 0;
  /** 缓动目标 */
  public target: Targer;
  /** 缓动开始属性 */
  public fromProps: Node_Tween;
  /** 缓动目标属性 */
  public toProps: Node_Tween;
  /** [单位毫秒] 缓动总时长 */
  public duration: number;
  /** [单位毫秒] 缓动延迟时间 */
  public delay: number;
  /** 缓动是否暂停 */
  public paused: boolean;
  /** 缓动是否循环 */
  public loop: boolean;
  /** 缓动是否反转播放 */
  public reverse: boolean;
  /** 缓动重复的次数 */
  public repeat: number;
  /** [单位毫秒] 缓动重复的延迟时长 */
  public repeatDelay: number;
  /** 缓动变化函数 */
  public ease: Ease_Fn;
  /** 缓动开始回调函数 */
  public onStart: ((this: Tween) => void) | null;
  /** 缓动更新回调函数 */
  public onUpdate: ((this: Tween, easeRatio: number) => void) | null;
  /** 缓动完成回调函数 */
  public onComplete: ((this: Tween) => void) | null;
  /** 缓动结束回调函数 */
  public onDestroyed: ((this: Tween) => void) | null;
  /** 缓动是否开始 */
  public get isStart(): boolean {
    return this._isStart;
  }
  /** 缓动是否完成 */
  public get isComplete(): boolean {
    return this._isComplete;
  }

  /**
   * @param props 初始化参数
   **/
  public constructor(props: TweenCtorParam[0] = <any>{}) {
    this.target = props.target;
    this.fromProps = Util.getJsonVal(props, "fromProps", 2) || null;
    this.toProps = Util.getJsonVal(props, "toProps", 2) || null;
    this.duration = Util.getJsonVal(props, "duration") || 1000;
    this.delay = Util.getJsonVal(props, "delay") || 0;
    this.paused = Util.getJsonVal(props, "paused") || false;
    this.loop = Util.getJsonVal(props, "loop") || false;
    this.reverse = Util.getJsonVal(props, "reverse") || false;
    this.repeat = Util.getJsonVal(props, "repeat") || 0;
    this.repeatDelay = Util.getJsonVal(props, "repeatDelay") || 0;
    this.ease = Util.getJsonVal(props, "ease") || Ease.linear;
    this.onStart = Util.getJsonVal(props, "onStart") || null;
    this.onUpdate = Util.getJsonVal(props, "onUpdate") || null;
    this.onComplete = Util.getJsonVal(props, "onComplete") || null;
    this.onDestroyed = Util.getJsonVal(props, "onDestroyed") || null;
  }
  /**
   * Tween类的内部渲染方法
   * @param ratio 完成率
   **/
  private _renderFromTo(ratio: number): void {
    let target = <Type_Json<any>>this.target;
    let fromProps = <Type_Json<any>>this.fromProps;
    let toProps = <Type_Json<any>>this.toProps;

    for (let p in fromProps) target[p] = fromProps[p] + (toProps[p] - fromProps[p]) * ratio;
  }
  /**
   * 设置缓动对象的初始和目标属性
   * @param fromProps 缓动对象的初始属性
   * @param toProps 缓动对象的目标属性
   * @return 对象本身
   */
  public setProps(fromProps: Node_Tween | null = null, toProps: Node_Tween | null = null): this {
    let propNames = fromProps || toProps;

    if (propNames) {
      let newFromProps: Type_Json<any> = fromProps || this.target;
      let newToProps: Type_Json<any> = toProps || this.target;
      let nodeTweenDefault: Type_Json<any> = Quickly.clone(NodeDefault, true);

      this.fromProps = {};
      this.toProps = {};

      for (let p in propNames) {
        (<Type_Json<any>>this.toProps)[p] = newToProps[p] || nodeTweenDefault[p];
        (<Type_Json<any>>this.target)[p] = (<Type_Json<any>>this.fromProps)[p] = newFromProps[p] || nodeTweenDefault[p];
      }
    }

    return this;
  }
  /**
   * 启动缓动播放
   * @return 对象本身
   */
  public start(): this {
    this._startTime = Util.nowDate() + this.delay;
    this._seekTime = 0;
    this._pausedTime = 0;
    this._reverseFlag = 1;
    this._repeatCount = 0;
    this.paused = false;
    this._isStart = false;
    this._isComplete = false;
    Tween.add(this);
    return this;
  }
  /**
   * 停止缓动播放
   * @return 对象本身
   */
  public stop(): this {
    Tween.remove(this);
    return this;
  }
  /**
   * 暂停缓动播放
   * @return 对象本身
   */
  public pause(): this {
    this.paused = true;
    this._pausedStartTime = Util.nowDate();
    return this;
  }
  /**
   * 恢复缓动播放
   * @return 对象本身
   */
  public resume(): this {
    this.paused = false;
    if (this._pausedStartTime) this._pausedTime += Util.nowDate() - this._pausedStartTime;
    this._pausedStartTime = 0;
    return this;
  }
  /**
   * 跳转Tween到指定的时间
   * @param {Number} time [取值范围：0 - Tween.duraion] 指定要跳转的时间
   * @param {Boolean} pause 是否暂停
   * @return 对象本身
   */
  public seek(time: number, pause: boolean = false): this {
    let current = Util.nowDate();

    this._startTime = current;
    this._seekTime = time;
    this._pausedTime = 0;
    if (pause) this.paused = pause;

    this.update(current, true);
    Tween.add(this);

    return this;
  }
  /**
   * 连接下一个Tween对象
   * @param 连接下一个Tween对象
   * @param isDuration 是否 标记缓动开始时间+缓动总时长
   * @return 连接下一个Tween对象
   */
  public link(tween: Tween, isDuration: boolean = false): Tween {
    let delay = tween.delay;
    let startTime = this._startTime;

    tween._startTime = isDuration ? startTime + this.duration + delay : startTime + delay;
    this._next = tween;
    Tween.remove(tween);
    return tween;
  }
  /**
   * Tween类的内部更新方法
   * @param time 当前时间
   * @param forceUpdate 是否强行更新
   * @return 是否缓动完成
   **/
  public update(time: number, forceUpdate: boolean = false): boolean {
    if (this.paused && !forceUpdate) return false;
    if (this._isComplete) return true;

    // 当前缓动完成时间
    let elapsed = time - this._startTime - this._pausedTime + this._seekTime;
    if (elapsed < 0) return false;

    // 当前缓动完成率
    let ratio = elapsed / this.duration;
    ratio = ratio <= 0 ? 0 : ratio >= 1 ? 1 : ratio;
    let easeRatio = this.ease(ratio);

    // 当前缓动是反转 && 开始当前缓动
    if (this.reverse && this._isStart) {
      // 当前缓动完成率 反转
      if (this._reverseFlag < 0) {
        ratio = 1 - ratio;
        easeRatio = 1 - easeRatio;
      }

      // 当前反转缓动完成(当前反转缓动完成率 < 0.0000001)
      if (ratio < 1e-7) {
        // (当前反转缓动重复次数 > 0 && 当前反转缓动重复累计次数 >= 当前反转缓动重复次数) || (当前反转缓动重复次数 == 0 && 当前反转缓动不循环)
        if ((this.repeat > 0 && this._repeatCount++ >= this.repeat) || (this.repeat === 0 && !this.loop)) {
          this._isComplete = true;
        }
        // 当前反转缓动 变 当前缓动
        else {
          this._startTime = Util.nowDate();
          this._pausedTime = 0;
          this._reverseFlag *= -1;
        }
      }
    }

    // 没开始当前缓动
    if (!this._isStart) {
      this.setProps(this.fromProps, this.toProps);
      this._isStart = true;
      this.onStart && this.onStart.call(this);
    }

    // 当前缓动渲染 && 当前缓动更新事件回调
    this.time = elapsed;
    this._renderFromTo(easeRatio);
    this.onUpdate && this.onUpdate.call(this, easeRatio);

    // 当前缓动完成
    if (ratio >= 1) {
      // 当前缓动 变 当前反转缓动
      if (this.reverse) {
        this._startTime = Util.nowDate();
        this._pausedTime = 0;
        this._reverseFlag *= -1;
      }
      // 当前缓动循环 || (当前缓动重复次数 > 0 && 当前缓动重复累计次数 < 当前缓动重复次数)
      else if (this.loop || (this.repeat > 0 && this._repeatCount++ < this.repeat)) {
        this._startTime = Util.nowDate() + this.repeatDelay;
        this._pausedTime = 0;
      }
      // 当前缓动完成
      else this._isComplete = true;
    }

    // 下一个Tween对象
    let next = this._next;
    if (next && next.time <= 0) {
      // 下一个Tween对象已经开始 && (下一个Tween对象 <= 当前时间)
      if (next._startTime > 0 && next._startTime <= time) {
        next._renderFromTo(ratio);
        next.time = elapsed;
        Tween.add(next);
      }
      // 当前缓动已经完成 && (下一个Tween对象没开始 || 下一个Tween对象开始时间 > 当前时间)
      else if (this._isComplete && (next._startTime < 0 || next._startTime > time)) next.start();
    }

    // 当前缓动完成事件回调
    if (this._isComplete) {
      this.onComplete && this.onComplete.call(this);
      return true;
    }

    return false;
  }
}

export {
  Tween
}
