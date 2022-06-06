import * as Util from "@/util/Util";
import { Global_Math } from "@/@global/Global";
import { Rectangle_FmtArr } from "@/geom/Rectangle";
import { Vector_FmtJson } from "@/geom/Vector";
import { Ticker_Tick, Ticker_TickParam } from "@/system/Ticker";

type CameraCtorParam = [
  {
    bound: Rectangle_FmtArr;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    zoom?: number;
    target?: Vector_FmtJson;
    deadzone?: Rectangle_FmtArr;
  }
];

/**
 * 摄像机类
 **/
class Camera implements Ticker_Tick {
  /** 摄像机移动的边界矩形区域 */
  public bound: Rectangle_FmtArr;
  /** 镜头x */
  public x: number;
  /** 镜头y */
  public y: number;
  /** 镜头宽 */
  public width: number;
  /** 镜头高 */
  public height: number;
  /** 镜头焦距 */
  public zoom: number;
  /** 摄像机跟随的目标 */
  public target: Vector_FmtJson | null;
  /** 摄像机不移动的边界矩形区域 */
  public deadzone: Rectangle_FmtArr | null;

  /**
   * @param props 初始化参数
   **/
  public constructor(props: CameraCtorParam[0] = <any>{}) {
    this.bound = Util.getJsonVal(props, "bound", 1);
    this.x = Util.getJsonVal(props, "x") || 0;
    this.y = Util.getJsonVal(props, "y") || 0;
    this.width = Util.getJsonVal(props, "width") || 0;
    this.height = Util.getJsonVal(props, "height") || 0;
    this.zoom = Util.getJsonVal(props, "zoom") || 1;
    this.target = Util.getJsonVal(props, "target") || null;
    this.deadzone = Util.getJsonVal(props, "deadzone", 1) || null;
  }
  /**
   * Ticker对象更新
   **/
  public tick(tickParam?: Ticker_TickParam): void {
    if (this.target) {
      let viewX;
      let viewY;
      let target = this.target;
      let zoom = this.zoom;
      let deadzone = this.deadzone;
      let point = { x: target.x * zoom, y: target.y * zoom };
      let bound = [
        this.bound[0] * zoom,
        this.bound[1] * zoom,
        this.bound[2] * zoom - this.width,
        this.bound[3] * zoom - this.height,
      ];

      if (deadzone) {
        viewX = Global_Math.min(Global_Math.max(point.x - this.x, deadzone[0]), deadzone[0] + deadzone[2]);
        viewY = Global_Math.min(Global_Math.max(point.y - this.y, deadzone[1]), deadzone[1] + deadzone[3]);
      } else {
        viewX = this.width / 2;
        viewY = this.height / 2;
      }

      this.x = point.x - viewX;
      this.y = point.y - viewY;

      if (bound) {
        this.x = Global_Math.min(Global_Math.max(this.x, bound[0]), bound[0] + bound[2]);
        this.y = Global_Math.min(Global_Math.max(this.y, bound[1]), bound[1] + bound[3]);
      }
    }
  }
  /**
   * 跟随目标
   * @param target 跟随目标对象
   **/
  public follow(target: Vector_FmtJson): void {
    this.target = target;
    this.tick();
  }
}

export { Camera }
