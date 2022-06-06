/**
 * 性能监控
 **/
import * as Util from "@/util/Util";
import { Global_Math } from "@/@global/Global";

type PanelUpdateReturn = {
  min: number;
  max: number;
  val: number;
  pct: number;
};
type StatsCtorParam = [
  {
    onFPS?: (value?: PanelUpdateReturn) => void;
    onMS?: (value?: PanelUpdateReturn) => void;
  }
];

class Panel {
  private _min: number = Infinity;
  private _max: number = 0;

  public update(value: number, maxValue: number): PanelUpdateReturn {
    let round = Global_Math.round;
    this._min = Global_Math.min(this._min, value);
    this._max = Global_Math.max(this._max, value);
    return {
      min: round(this._min),
      max: round(this._max),
      val: round(value),
      pct: value / maxValue
    }
  }
}

class Stats {
  private _beginTime: number;
  private _prevTime: number;
  private _frames: number;
  private _fps: Panel;
  private _ms: Panel;
  public onFPS: (value?: PanelUpdateReturn) => void;
  public onMS: (value?: PanelUpdateReturn) => void;

  public constructor(props: StatsCtorParam[0] = {}) {
    this._prevTime = this._beginTime = Util.nowDate();
    this._frames = 0;
    this._fps = new Panel();
    this._ms = new Panel();
    this.onFPS = props.onFPS || function () { };
    this.onMS = props.onMS || function () { };
  }
  public begin(): void {
    this._beginTime = Util.nowDate();
  }
  public update(): void {
    this._beginTime = this.end();
  }
  public end(): number {
    this._frames++;
    let time = Date.now();
    this.onMS(this._ms.update(time - this._beginTime, 200));
    if (time >= this._prevTime + 1000) {
      this.onFPS(this._fps.update((this._frames * 1000) / (time - this._prevTime), 100));
      this._prevTime = time;
      this._frames = 0;
    }
    return time;
  }
}

export {
  Panel as panel,
  Stats as stats
}
