import * as Util from "@/util/Util";
import { Type_HTMLImageElement, Type_Json } from "@g/Type";
import { Global_Math } from "@/@global/Global";
import { Rectangle_FmtArr } from "@/geom/Rectangle";
import { CanvasRenderer } from "@/system/CanvasRenderer";
import { Ticker_TickParam } from "@/system/Ticker";
import { Drawable } from "@/display/tool/Drawable";
import { Node, Node_CtorParam } from "@/display/nodes/Node";
import { ParticleSystem } from "@/display/particles/ParticleSystem";

type ParticleCtorParam = [
  (
    Node_CtorParam[0] &
    {
      image?: Type_HTMLImageElement;
      frames?: Rectangle_FmtArr[];
      system?: ParticleSystem;
      /** 粒子类属性值 */
      vx?: number;
      vy?: number;
      ax?: number;
      ay?: number;
      scaleFix?: number;
      vScaleFix?: number;
      vRotate?: number;
      vAlpha?: number;
      life?: number;
      /** 粒子属性随机值 */
      xVar?: number;
      yVar?: number;
      rotateVar?: number;
      alphaVar?: number;
      vxVar?: number;
      vyVar?: number;
      axVar?: number;
      ayVar?: number;
      scaleFixVar?: number;
      vScaleFixVar?: number;
      vRotateVar?: number;
      vAlphaVar?: number;
      lifeVar?: number;
    }
  )
];
// 粒子属性
let PropsDefault = {
  /** 父结构属性 */
  "x": 0,
  "y": 0,
  "rotate": 0,
  "alpha": 1,
  /** 粒子类属性 */
  "vx": 0,
  "vy": 0,
  "ax": 0,
  "ay": 0,
  "scaleFix": 1,
  "vScaleFix": 0,
  "vRotate": 0,
  "vAlpha": 0,
  "life": 1,
};

/**
 * 粒子类
 **/
class Particle extends Node {
  /** 粒子缓存 */
  public static diedParticles: Particle[] = [];
  /**
   * 生成粒子
   * @param cfg 粒子参数
   * @return 粒子对象
   **/
  public static create(cfg: ParticleCtorParam[0]): Particle {
    let particle;
    if (Particle.diedParticles.length > 0) {
      particle = <Particle>Particle.diedParticles.pop();
      particle.init(cfg);
    } else {
      particle = new Particle(cfg);
    }
    return particle;
  }

  /** 粒子是否死亡 */
  private _died: boolean = false;
  /** 粒子动画完成时间 */
  private _time: number = 0;
  /** 发射器对象 */
  public system: ParticleSystem | null;
  /** x,y速度 */
  public vx!: number;
  public vy!: number;
  /** x,y加速度 */
  public ax!: number;
  public ay!: number;
  /** 缩放速度 */
  public scaleFix!: number;
  public vScaleFix!: number;
  /** 旋转速度 */
  public vRotate!: number;
  /** 透明度速度 */
  public vAlpha!: number;
  /** 存活时间 */
  public life!: number;

  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: ParticleCtorParam[0] = <any>{}) {
    super(props);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("Particle");
    this.system = Util.getJsonVal(props, "system") || null;

    this.init(props);
  }
  /**
   * @overwrite
   **/
  public renderStartDraw(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): boolean {
    if (this.system && tickParam && tickParam.deltaTime) {
      if (this._died) return false;

      let dt = tickParam.deltaTime * 0.001;
      this._time += dt;

      // 重力方向
      this.vx += (this.ax + this.system.gx) * dt;
      this.vy += (this.ay + this.system.gy) * dt;
      // 移动位置
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      // 大小拉伸
      this.scaleFix += this.vScaleFix;
      this.scale[0] = this.scale[1] = this.scaleFix;
      // 旋转
      this.rotate += this.vRotate;
      // 透明度
      if (this._time > 0.1) this.alpha += this.vAlpha;

      // 时间结束 || 透明度为0 就删除粒子
      if (this._time >= this.life || this.alpha <= 0) {
        this.destroy();
        return false;
      }
    }

    return super.renderStartDraw(renderer, tickParam);
  }
  /**
   * 初始化粒子
   * @param  cfg 粒子参数
   **/
  public init(cfg: ParticleCtorParam[0]): void {
    if (cfg.system) {
      // 粒子 参数初始化
      this.system = cfg.system;
      this._died = false;
      this._time = 0;
      this.alpha = 1;
      for (let p in PropsDefault) {
        (<Type_Json<any>>this)[p] = Util.getRandomValue(
          (<Type_Json<any>>cfg)[p] === undefined
            ? (<Type_Json<any>>PropsDefault)[p]
            : (<Type_Json<any>>cfg)[p],
          (<Type_Json<any>>cfg)[p + "Var"]
        );
      }
      this.x += this.system.emitterX;
      this.y += this.system.emitterY;

      // 图片粒子
      if (cfg.image && cfg.frames) {
        let frames: Rectangle_FmtArr[] = cfg.frames;
        let frame: Rectangle_FmtArr;

        // 图片随机图案
        if (frames && frames.length) frame = frames[(Global_Math.random() * frames.length) >> 0];
        else frame = [0, 0, cfg.image.width, cfg.image.height];

        // 添加图片
        this.drawable = this.drawable || new Drawable();
        this.width = frame[2];
        this.height = frame[3];
        this.drawable.rect = frame;
        this.drawable.image = cfg.image;

        // 图片大小偏移
        if (cfg.anchor && cfg.anchor[0] !== undefined && cfg.anchor[1] !== undefined) {
          this.anchor[0] = cfg.anchor[0] * frame[2];
          this.anchor[1] = cfg.anchor[1] * frame[3];
        }
      }
    }
  }
  /**
   * 销毁粒子
   **/
  public destroy(): void {
    this._died = true;
    this.alpha = 0;
    this.removeParent();
    Particle.diedParticles.push(this);
  }
}

export {
  ParticleCtorParam as Particle_CtorParam,
  Particle
}
