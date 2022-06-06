/*
  AudioContext API:
    createBufferSource 可以用来播放AudioBuffer对象中包含的音频数据
    createGain 该节点可用于控制音频图的总体增益（或音量）
    destination 所有音频（节点）的最终目标节点，一般是音频渲染设备，比如扬声器
    currentTime 返回一个double值，该值表示以秒为单位的不断增加的硬件时间戳，它从0开始
*/
import * as Util from "@/util/Util";
import {
  Type_AudioContext,
  Type_GainNode,
  Type_AudioBuffer,
  Type_AudioBufferSourceNode,
  Type_ArrayBuffer,
} from "@g/Type";
import { Global_AudioContext } from "@/@global/Global";
import { Event } from "@/event/Event";
import { EventEmitter_Mixins } from "@/event/EventEmitter";


type EventType = "load" | "error" | "end";
type WebAudioCtorParam = [
  {
    data: Type_ArrayBuffer;
    loop?: boolean;
    autoPlay?: boolean;
  }
];

let Context: Type_AudioContext | null = null;
try { if (Global_AudioContext) Context = new Global_AudioContext(); } catch (e) { }

/**
 * 音频类
 **/
interface WebAudio extends EventEmitter_Mixins { }
@Util.mixinsClassDecorator([EventEmitter_Mixins])
class WebAudio {
  /** 浏览器是否支持WebAudio */
  public static readonly isSupported: boolean = Context !== null;
  /** 加载完毕 */
  public static readonly LOAD: EventType = "load";
  /** 加载错误 */
  public static readonly ERROR: EventType = "error";
  /** 播放完毕 */
  public static readonly END: EventType = "end";
  /** WebAudio上下文 */
  private _context!: Type_AudioContext;
  /** 音量控制器 */
  private _gainNode!: Type_GainNode;
  /** 音频缓冲文件 */
  private _buffer!: Type_AudioBuffer;
  /** 音频播放器 */
  private _audioNode!: Type_AudioBufferSourceNode;
  /** 音频资源是否已加载完成 */
  private _loaded: boolean = false;
  /** 是否正在播放音频 */
  private _playing: boolean = false;
  /** 开始播放时间戳 */
  private _startTime: number = 0;
  /** 播放偏移量 */
  private _offset: number = 0;
  /** 音频时长 */
  private _duration: number = 0;
  /** [取值范围：0-1 ] 音量大小 */
  private _volume: number = 1;
  /** 是否静音 */
  private _muted: boolean = false;
  /** 音频二进制数据 */
  public data: Type_ArrayBuffer;
  /** 是否循环播放 */
  public loop: boolean;
  /** 是否自动播放 */
  public autoPlay: boolean;
  /** 音频资源是否已加载完成 */
  public get loaded(): boolean { return this._loaded; }
  /** 是否正在播放音频  */
  public get playing(): boolean { return this._playing; }
  /** 音频时长 */
  public get duration(): number { return this._duration; }
  /** 音量 */
  public get volume(): number { return this._volume; }
  /** 静音状态 */
  public get muted(): boolean { return this._muted; }
  /**
   * 音量
   * @param value 音量
   **/
  public set volume(value: number) { this._volume !== value && (this._gainNode.gain.value = this._volume = value); }
  /**
   * 是否静音
   * @param value 是否静音
   **/
  public set muted(value: boolean) {
    if (this._muted !== value) {
      this._muted = value;
      this._gainNode.gain.value = value ? 0 : this._volume;
    }
  }

  /**
   * @param props 初始化参数
   **/
  public constructor(props: WebAudioCtorParam[0] = <any>{}) {
    EventEmitter_Mixins.CTOR(this);
    this.data = props.data;
    this.loop = Util.getJsonVal(props, "loop") || false;
    this.autoPlay = Util.getJsonVal(props, "autoPlay") || false;

    if (Context) {
      this._context = Context;
      this._gainNode = this._context.createGain();
      this._gainNode.connect(this._context.destination);
    }
  }
  /**
   * 播放音频器
   **/
  private _doPlay(): void {
    let self = this;

    if (this._audioNode) {
      this._audioNode.onended = null;
      this._audioNode.disconnect(0); // 断开连接的节点
    }

    this._audioNode = this._context.createBufferSource();
    this._gainNode.gain.value = this._muted ? 0 : this._volume;
    this._startTime = this._context.currentTime; // 音频时间戳
    this._audioNode.buffer = this._buffer;
    this._audioNode.onended = function () {
      self._playing = false;
      self._offset = 0;
      self.emit(new Event({ "type": WebAudio.END, "target": self }));
      if (self.loop) self._doPlay();
    };
    this._audioNode.connect(this._gainNode);
    this._audioNode.start(0, this._offset);
    this._playing = true;
  }
  /**
   * 加载音频文件
   * @return 对象本身
   **/
  public load(): this {
    let self = this;
    // 二进制数据转换音频缓存数据
    this._context.decodeAudioData(
      this.data,
      function (audioBuffer: Type_AudioBuffer) {
        self._buffer = audioBuffer;
        self._loaded = true;
        self._duration = audioBuffer.duration;
        self.emit(new Event({ "type": WebAudio.LOAD, "target": self }));
        if (self.autoPlay) self._doPlay();
      },
      function () {
        self.emit(new Event({ "type": WebAudio.ERROR, "target": self }));
      }
    );
    return this;
  }
  /**
   * 播放音频。如果正在播放，则会重新开始
   * @return 对象本身
   **/
  public play(): this {
    if (this._loaded) {
      this._doPlay();
    } else {
      this.autoPlay = true;
      this.load();
    }
    return this;
  }
  /**
   * 暂停音频
   * @return 对象本身
   **/
  public pause(): this {
    if (this._audioNode && this._playing) {
      this._audioNode.stop(0);
      this._audioNode.disconnect(0);
      this._offset += this._context.currentTime - this._startTime;
      this._playing = false;
    }
    return this;
  }
  /**
   * 停止音频播放
   * @return 对象本身
   **/
  public stop(): this {
    if (this._audioNode) {
      this._audioNode.stop(0);
      this._audioNode.disconnect(0);
      this._offset = 0;
      this._playing = false;
    }
    return this;
  }
}

export {
  WebAudio
}
