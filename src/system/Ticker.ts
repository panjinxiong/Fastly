import * as Util from "@/util/Util";
import { Global_Math, Global_Win } from "@/@global/Global";

type TickFn = (tickParam?: TickParam) => void;
type TickParam = { deltaTime?: number };
type Tick = { "tick": TickFn; };

/**
 * 定时器类
 **/
class Ticker {
  /** 是否使用requestAnimationFrame */
  private _isRAF: boolean = false;
  /** 暂停定时器 */
  private _paused: boolean = false;
  /** 定时器运行对象列表 */
  private _tickers: Tick[] = [];
  /** 每秒固定FPS帧。显示器刷新频率是60Hz相当于每秒钟重绘60次，每秒60FPS帧 */
  private _targetFPS: number = 0;
  /** 每秒运行FPS帧 */
  private _measuredFPS: number = 0;
  /** [单位毫秒] 执行定时器前需等待的毫秒数 */
  private _interval: number = 0;
  /** 定时器Id */
  private _intervalId: any = null;
  /** 保存定时器上一次完毕时间 */
  private _lastTime: number = 0;
  /** 每秒钟下，定时器执行次数，解析：显示器刷新频率每秒钟重绘次数 */
  private _tickCount: number = 0;
  /** 每秒钟下，定时器执行时间长。解析：_tickTime 大于 每秒钟 那么 _measuredFPS下降，相反就上升 */
  private _tickTime: number = 0;
  /** 运行时帧率 */
  public get measuredFPS(): number { return Global_Math.min(this._measuredFPS, this._targetFPS); }

  /**
   * @param fps 帧率
   **/
  public constructor(fps: number = 60) {
    this._targetFPS = fps;
    this._interval = 1000 / this._targetFPS;
  }
  /** 运行每个对象里面tick方法 */
  private _tick(): void {
    if (this._paused) return;

    let startTime = Util.nowDate();
    let deltaTime = startTime - this._lastTime; // 延迟时间 = 开始时间 - 上一次完毕时间

    // 定时器执行次数 大于等于 每秒固定FPS帧 就重置定时器执行次数
    if (++this._tickCount >= this._targetFPS) {
      this._measuredFPS = (1000 / (this._tickTime / this._tickCount) + 0.5) >> 0; // 取整数，舍下
      this._tickCount = 0;
      this._tickTime = 0;
    } else {
      this._tickTime += deltaTime;
    }
    this._lastTime = startTime;

    let tickersCopy = this._tickers.slice(0); // 防止添加定时器对象队列变形
    for (let i = 0, len = tickersCopy.length; i < len; i++) {
      tickersCopy[i].tick({ deltaTime });
    }
  }
  /**
   * 启动定时器
   * @param useRAF 是否使用requestAnimationFrame。默认值为true
   **/
  public start(useRAF?: boolean): void {
    if (this._intervalId) return;

    let self = this;
    let runLoop: any = null;
    let raf = Global_Win.requestAnimationFrame;

    useRAF = useRAF !== false;
    this._lastTime = Util.nowDate();

    if (useRAF && raf && this._interval < 17) {
      this._isRAF = useRAF;
      runLoop = function () {
        self._intervalId = raf(runLoop);
        self._tick();
      };
    } else {
      runLoop = function () {
        self._intervalId = Global_Win.setTimeout(runLoop, self._interval);
        self._tick();
      };
    }
    this._paused = false;

    runLoop();
  }
  /**
   * 停止定时器
   **/
  public stop(): void {
    if (this._isRAF) {
      Global_Win.cancelAnimationFrame(this._intervalId);
    } else {
      Global_Win.clearTimeout(this._intervalId);
    }
    this._intervalId = null;
    this._lastTime = 0;
    this._paused = true;
  }
  /**
   * 暂停定时器
   **/
  public pause(): void {
    this._paused = true;
  }
  /**
   * 恢复定时器
   **/
  public resume(): void {
    this._paused = false;
  }
  /**
   * 添加定时器对象
   * @param tickObject 要添加的定时器对象，此对象必须包含 tick 方法
   **/
  public addTick(tickObject: Tick): void {
    if (!tickObject || typeof tickObject.tick !== "function") {
      throw new Error("Ticker: The tick object must implement the tick method.");
    }
    this._tickers.push(tickObject);
  }
  /**
   * 删除定时器对象
   * @param tickObject 要删除的定时器对象
   **/
  public removeTick(tickObject: Tick): void {
    let tickers = this._tickers;
    let index = tickers.indexOf(tickObject);
    if (index >= 0) tickers.splice(index, 1);
  }
  /**
   * 执行一次tick时回调
   * @param callback 回调
   * @return Ticker_Tick对象
   **/
  public nextTick(callback: TickFn): Tick {
    let self = this;
    let tickObj: Tick = {
      "tick": function (tickParam) {
        self.removeTick(tickObj);
        callback(tickParam);
      }
    };
    self.addTick(tickObj);
    return tickObj;
  }
  /**
   * 延迟指定的时间后调用回调，类似setTimeout
   * @param callback 回调
   * @param duration [单位毫秒] 间断的毫秒数
   * @return Ticker_Tick对象
   **/
  public timeoutTick(callback: TickFn, duration: number): Tick {
    let self = this;
    let targetTime = Util.nowDate() + duration;
    let tickObj: Tick = {
      tick: function (tickParam) {
        if (Util.nowDate() - targetTime >= 0) {
          self.removeTick(tickObj);
          callback(tickParam);
        }
      },
    };
    self.addTick(tickObj);
    return tickObj;
  }
  /**
   * 指定的时间周期来调用函数, 类似setInterval
   * @param callback 回调
   * @param duration [单位毫秒] 间断的毫秒数
   * @return Ticker_Tick对象
   **/
  public interval(callback: TickFn, duration: number): Tick {
    let targetTime = Util.nowDate() + duration;
    let tickObj: Tick = {
      tick: function (tickParam) {
        /**
         * 例子流程：
         * let duration = 5, // 间断时间
         *   targetTime = 0 + 5; // 触发时间
         * -----------------------
         * = true流程
         * let nowTime = 8,
         *   dt = 3 = 8 - 5; // 延迟时间
         * if (3 >= 0)  // true
         * if (3 < 5) { nowTime = 5 = 8 - 3; } // true，延迟时间 没有小于 下一个间断时间
         * targetTime = 5 + 5;
         * -----------------------
         * = false流程
         * let nowTime = 11,
         *   dt = 6 = 11 - 5;
         * if (6 >= 0) // true
         * if(6 < 5) // false，延迟时间 超过 下一个间断时间
         * targetTime = 11 + 5;
         **/
        let nowTime = Util.nowDate(),
          dt = nowTime - targetTime;
        if (dt >= 0) {
          if (dt < duration) nowTime -= dt;
          targetTime = nowTime + duration;
          callback(tickParam);
        }
      },
    };
    this.addTick(tickObj);
    return tickObj;
  }
}

export {
  TickParam as Ticker_TickParam,
  Tick as Ticker_Tick,
  Ticker
}
