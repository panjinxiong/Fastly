import * as Util from "@/util/Util";
import { CanvasRenderer } from "@/system/CanvasRenderer";
import { Ticker_TickParam } from "@/system/Ticker";
import { Container, Container_CtorParam } from "@/display/nodes/Container";
import { Particle, Particle_CtorParam } from "@/display/particles/Particle";

type ParticleSystemCtorParam = [
  (
    Container_CtorParam[0] &
    {
      gx?: number;
      gy?: number;
      emitterX?: number;
      emitterY?: number;
      emitTime?: number;
      emitTimeVar?: number;
      emitNum?: number;
      emitNumVar?: number;
      totalTime?: number;
      particle?: Particle_CtorParam[0];
    }
  )
];

/**
 * 粒子系统类
 **/
class ParticleSystem extends Container {
  /** 发射器是否运行 */
  private _isRun: boolean = false;
  /** 发射间隔进度时间 */
  private _currentRunTime: number = 0;
  /** 发射间隔，每次发射完成时间 */
  private _emitTime: number = 0;
  /** 发射器总时间 */
  private _totalRunTime: number = 0;
  /** 重力加速度x */
  public gx: number;
  /** 重力加速度y */
  public gy: number;
  /** 发射器位置x */
  public emitterX: number;
  /** 发射器位置y */
  public emitterY: number;
  /** 发射间隔，每次发射完成时间 */
  public emitTime: number;
  /** 发射间隔变化量 */
  public emitTimeVar: number;
  /** 每次发射数量 */
  public emitNum: number;
  /** 每次发射数量变化量 */
  public emitNumVar: number;
  /** 发射总时间 */
  public totalTime: number;
  /** 粒子对象构造json */
  public particle: Particle_CtorParam[0];

  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: ParticleSystemCtorParam[0] = <any>{}) {
    super(props);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("ParticleSystem");
    this.gx = Util.getJsonVal(props, "gx") || 0;
    this.gy = Util.getJsonVal(props, "gy") || 0;
    this.emitterX = Util.getJsonVal(props, "emitterX") || 0;
    this.emitterY = Util.getJsonVal(props, "emitterY") || 0;
    this.emitTime = Util.getJsonVal(props, "emitTime") || 0.2;
    this.emitTimeVar = Util.getJsonVal(props, "emitTimeVar") || 0;
    this.emitNum = Util.getJsonVal(props, "emitNum") || 10;
    this.emitNumVar = Util.getJsonVal(props, "emitNumVar") || 0;
    this.totalTime = Util.getJsonVal(props, "totalTime") || Infinity;
    this.particle = Util.getJsonVal(props, "particle") || {};
    this.particle.system = this;
  }
  /**
   * @overwrite
   **/
  public renderStartDraw(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): boolean {
    if (this._isRun && tickParam && tickParam.deltaTime) {
      let dt = tickParam.deltaTime * 0.001;

      //  console.log("发射进度：" + this._currentRunTime + " 发射完成时间" + this._emitTime);
      if ((this._currentRunTime += dt) >= this._emitTime) {
        this._currentRunTime = 0; // 重置发射进度
        this._emitTime = Util.getRandomValue(this.emitTime, this.emitTimeVar);

        // 随机添加粒子
        for (let i = 0; i < Util.getRandomValue(this.emitNum, this.emitNumVar) >> 0; i++) {
          this.addChild(Particle.create(this.particle));
        }
      }

      if ((this._totalRunTime += dt) >= this.totalTime) this.stop();
    }

    return super.renderStartDraw(renderer, tickParam);
  }
  /**
   * 开始发射粒子
   **/
  public start(): void {
    this.stop(true);
    this._isRun = true;
    this._currentRunTime = 0;
    this._totalRunTime = 0;
    this._emitTime = Util.getRandomValue(this.emitTime, this.emitTimeVar);
  }
  /**
   * 停止发射粒子
   * @param clear 是否清除所有粒子
   **/
  public stop(clear?: boolean): void {
    this._isRun = false;
    if (clear) {
      for (let i = this.children.length - 1; i >= 0; i--) (<Particle>this.children[i]).destroy();
    }
  }
  /**
   * 重置属性
   * @param cfg 发射器参数和粒子参数
   **/
  public reset(cfg: ParticleSystemCtorParam[0]): void {
    Util.mixinsJson(this, [cfg]);
    this.particle.system = this;
  }
}

export {
  ParticleSystem
}
