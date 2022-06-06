import * as Util from "@/util/Util";
import { Type_Json } from "@g/Type";
import { CanvasRenderer } from "@/system/CanvasRenderer";
import { Ticker_TickParam } from "@/system/Ticker";
import { Node, Node_CtorParam } from "@/display/nodes/Node";
import { Drawable, Drawable_CtorParam } from "@/display/tool/Drawable";
import { TextureAtlas_FramesSprites } from "@/display/tool/TextureAtlas";

type SpriteCtorParam = [
  (
    Node_CtorParam[0] &
    Drawable_CtorParam[0] &
    {
      frames?: TextureAtlas_FramesSprites | TextureAtlas_FramesSprites[];
      paused?: boolean;
      loop?: boolean;
      timeBased?: boolean;
      interval?: number;
      onEnterFrame?: (this: Sprite) => void;
    }
  )
];

/**
 * 动画精灵类
 **/
class Sprite extends Node {
  /** 所有帧的集合 */
  private _frames: TextureAtlas_FramesSprites[] = [];
  /** 带名字name帧的集合 */
  private _frameNames: Type_Json<TextureAtlas_FramesSprites> = {};
  /** 当前帧持续的时间或帧数 */
  private _frameElapsed: number = 0;
  /** 标记是否是第一次渲染 */
  private _firstRender: boolean = true;
  /** 当前播放帧的索引 */
  private _currentFrame: number = 0;
  /** 判断精灵是否暂停 */
  public paused: boolean;
  /** 判断精灵是否可以循环播放 */
  public loop: boolean;
  /** 灵动画是否是以时间为基准 */
  public timeBased: boolean;
  /** 精灵动画的帧间隔 */
  public interval: number;
  /** 每个动画回调 */
  public onEnterFrame: ((this: Sprite) => void) | null;
  /** 精灵动画的总帧数 */
  public get framesCount(): number { return this._frames ? this._frames.length : 0; }
  /** 当前播放帧的索引 */
  public get currentFrame(): number { return this._currentFrame; }

  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: SpriteCtorParam[0] = <any>{}) {
    super(props);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("Sprite");
    this.paused = Util.getJsonVal(props, "paused") || false;
    this.loop = Util.getJsonVal(props, "loop") || true;
    this.timeBased = Util.getJsonVal(props, "timeBased") || false;
    this.interval = Util.getJsonVal(props, "interval") || 1;
    this.onEnterFrame = Util.getJsonVal(props, "onEnterFrame") || null;
    this.drawable = new Drawable();

    if (props.frames) this.addFrame(props.frames);
  }
  /**
   * 下一个动画位置
   **/
  private _nextFrame(delta: number): number {
    let frameIndex = this._currentFrame;
    let total = this._frames.length;
    let frame = this._frames[frameIndex];
    let duration = frame.duration || this.interval;
    let value = frameIndex === 0 && !this.drawable ? 0 : this._frameElapsed + (this.timeBased ? delta : 1); // 动画停顿时间

    this._frameElapsed = value < duration ? value : 0;

    // 停止动画
    if (frame.stop || (!this.loop && frameIndex >= total - 1)) this.stop();

    // 没有停止动画 && 动画停顿时间为0
    if (!this.paused && this._frameElapsed === 0) {
      if (frame.next !== null && frame.next !== undefined ) frameIndex = this.getFrameIndex(frame.next);
      // 当前帧是否有跳转帧，可以是{Number|String}
      else if (frameIndex >= total - 1) frameIndex = 0;
      // drawable存在时，执行下一动画
      else if (this.drawable) frameIndex++;
    }

    return frameIndex;
  }
  /**
   * @overwrite
   **/
  public renderStartDraw(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): boolean {
    if (tickParam && tickParam.deltaTime) {
      let lastFrameIndex = this._currentFrame;
      let frameIndex;

      // 获取动画位置
      if (this._firstRender) {
        this._firstRender = false;
        frameIndex = lastFrameIndex;
      } else {
        frameIndex = this._nextFrame(tickParam.deltaTime);
      }

      // 当上一个动画和下一个动画不相同，就回调下一个动画
      if (frameIndex !== lastFrameIndex) {
        let callback = this._frames[frameIndex].callback;

        this._currentFrame = frameIndex;
        callback && callback.call(this);
        this.onEnterFrame && this.onEnterFrame.call(this);
      }

      // 渲染画布
      this.drawable && this.drawable.init(this._frames[frameIndex]);
    }

    return super.renderStartDraw(renderer, tickParam);
  }
  /**
   * 播放精灵动画
   * @return 对象本身
   **/
  public play(): this {
    this.paused = false;
    return this;
  }
  /**
   * 暂停播放精灵动画
   * @return 对象本身
   **/
  public stop(): this {
    this.paused = true;
    return this;
  }
  /**
   * 跳转精灵动画到指定的帧
   * @param indexOrName 要跳转的帧的索引位置或别名
   * @param pause 指示跳转后是否暂停播放
   * @return 对象本身
   **/
  public goto(indexOrName: number, pause: boolean): this {
    let total = this._frames.length;
    let index = this.getFrameIndex(indexOrName);
    this._currentFrame = index < 0 ? 0 : index >= total ? total - 1 : index;
    this.paused = pause;
    this._firstRender = true;
    return this;
  }
  /**
   * 往精灵动画序列中增加帧
   * @param frame 要增加的精灵动画帧数据
   * @param startIndex 开始增加帧的索引位置。若不设置，默认值为(在末尾添加)
   * @return 对象本身
   **/
  public addFrame(frame: TextureAtlas_FramesSprites | TextureAtlas_FramesSprites[], startIndex?: number): this {
    let start = startIndex ? startIndex : this._frames.length;
    if (frame instanceof Array) {
      for (let i = 0; i < frame.length; i++) this.setFrame(frame[i], start + i);
    } else {
      this.setFrame(frame, start);
    }
    return this;
  }
  /**
   * 获取精灵动画序列中指定的帧
   * @param indexOrName 要获取的帧的索引位置或别名
   * @return 索引位置或别名
   **/
  public getFrame(indexOrName: number | string): TextureAtlas_FramesSprites | null {
    if (typeof indexOrName === "number") {
      let frames = this._frames;
      if (indexOrName < 0 || indexOrName >= frames.length) return null;
      return frames[indexOrName];
    }
    return this._frameNames[indexOrName];
  }
  /**
   * 获取精灵动画序列中指定帧的索引位置
   * @param frameValue 要获取的帧的索引位置或别名
   * @return 索引位置
   **/
  public getFrameIndex(frameValue: number | string): number {
    let index = -1;

    if (typeof frameValue === "number") {
      index = frameValue;
    } else if (typeof frameValue === "string" && this._frameNames[frameValue]) {
      for (let i = 0; i < this._frames.length; i++) {
        if (this._frameNames[frameValue] === this._frames[i]) {
          index = i;
          break;
        }
      }
    }

    return index;
  }
  /**
   * 设置精灵动画序列指定索引位置的帧
   * @param frame 要设置的精灵动画帧数据
   * @param index 要设置的索引位置
   * @return 对象本身
   **/
  public setFrame(frame: TextureAtlas_FramesSprites, index: number): this {
    let frames = this._frames;
    let total = frames.length;

    index = index < 0 ? 0 : index > total ? total : index;
    frames[index] = frame; // 获取精灵

    if (frame.name) this._frameNames[frame.name] = frame; // 获取精灵名

    if ((index === 0 && !this.width) || !this.height) {
      this.width = frame.rect[2];
      this.height = frame.rect[3];
    }

    return this;
  }
  /**
   * 设置指定帧的回调函数。即每当播放头进入指定帧时调用callback函数
   * @param frame 要指定的帧的索引位置或别名
   * @param callback 指定回调函数
   * @return 对象本身
   **/
  public setFrameCallback(frame: number | string, callback: () => void): this {
    let getFramesSprites = this.getFrame(frame);
    if (getFramesSprites) getFramesSprites.callback = callback;
    return this;
  }
}

export {
  Sprite
}
