import * as Util from "@/util/Util";
import { Event, Event_CtorParam } from "@/event/Event";
import { EventEmitter_Mixins } from "@/event/EventEmitter";
import { Ajax } from "@/net/Ajax";

type EventType = "complete" | "load" | "error";
type Next = (type: EventType, value: LoaderJson["content"]) => void;
type LoaderJson = {
  /** 是否加载完成 */
  loaded?: boolean;
  /** 加载完毕内容 */
  content?: any;
}
type ImageLoaderJson = {
  /** cors 请求 */
  crossOrigin?: boolean;
}
type Source = LoaderJson & ImageLoaderJson & {
  /** 资源id */
  id: string;
  /** 资源类型 */
  type: string;
  /** 资源路径 */
  src: string;
  /** 资源是否缓存 */
  noCache?: boolean;
  /** 资源加载器 */
  loader?: (data: Source, next: Next) => void;
};
type LoadQueueEventCtorParam = [
  (
    Event_CtorParam[0] &
    {
      type?: EventType;
      source?: Source[];
    }
  )
];
type LoadQueueCtorParam = [
  Source[]
];

/**
 * 图片加载器
 * @param data 资源对象
 * @param next 调用下一个资源方法
 **/
function ImageLoader(data: Source, next: Next): void {
  let image = new Image();

  if (data.crossOrigin) image.crossOrigin = "Anonymous";
  image.onload = function (e: any) {
    let target = e.target;
    target.onload = target.onerror = target.onabort = null;
    next("load", target);
  };
  image.onerror = image.onabort = function (e: any) {
    let target = e.target;
    target.onload = target.onerror = target.onabort = null;
    next("error", e);
  };

  image.src = data.src + (data.noCache ? (data.src.indexOf("?") === -1 ? "?" : "&") + "t=" + Util.nowDate() : "");
}
/**
 * js加载器
 * @param data 资源对象
 * @param next 调用下一个资源方法
 **/
function ScriptLoader(data: Source, next: Next): void {
  let src = data.src;
  let script = document.createElement("script");

  if (data.noCache) src += (src.indexOf("?") === -1 ? "?" : "&") + "t=" + Util.nowDate();
  if (data.id) script.id = data.id;
  script.type = "text/javascript";
  script.async = true;
  script.src = src;
  script.onload = function (e: any) {
    let target = e.target;
    target.onload = target.onerror = null;
    next("load", target);
  };
  script.onerror = function (e: any) {
    let target = e.target;
    target.onload = target.onerror = null;
    next("error", e);
  };

  document.getElementsByTagName("head")[0].appendChild(script);
}
/**
 * 音频加载器
 * @param data 资源对象
 * @param next 调用下一个资源方法
 **/
function AudioLoader(data: Source, next: Next): void {
  let src = data.src;

  if (data.noCache) src += (src.indexOf("?") === -1 ? "?" : "&") + "t=" + Util.nowDate();
  new Ajax({
    "url": src,
    "responseType": "arraybuffer",
    "onload": function (e: any) {
      let target = e.target;
      target.onload = target.onerror = null;
      next("load", target.response);
    },
    "onerror": function (e: any) {
      let target = e.target;
      target.onload = target.onerror = null;
      next("error", e);
    },
  });
}

/**
 * 队列下载工具事件类
 **/
class LoadQueueEvent extends Event {
  /** @overwrite */
  public type: EventType;
  /** 资源数组 */
  public source: Source[] | null;

  /**
   * @param props 初始化参数
   **/
  public constructor(props: LoadQueueEventCtorParam[0] = <any>{}) {
    super(props);

    this.type = Util.getJsonVal(props, "type") || "";
    this.source = Util.getJsonVal(props, "source") || null;
  }
}
/**
 * 队列下载工具类
 **/
interface LoadQueue extends EventEmitter_Mixins { }
@Util.mixinsClassDecorator([EventEmitter_Mixins])
class LoadQueue {
  /** 全部加载完毕 */
  public static readonly COMPLETE: EventType = "complete";
  /** 加载完毕 */
  public static readonly LOAD: EventType = "load";
  /** 加载错误 */
  public static readonly ERROR: EventType = "error";
  /** 资源数组 */
  private _source: Source[] = [];
  /** 加载资源顺序 */
  private _currentIndex: number = -1;
  /** 下载数量 */
  private _connections: number = 0;
  /** 加载完成资源数量 */
  private _loaded: number = 0;
  /** 同时下载的最大连接数 */
  public maxConnections: number = 2;
  /** 获取已下载的资源数量 */
  public get loaded(): number { return this._loaded; }
  /** 获取所有资源的数量 */
  public get total(): number { return this._source.length; }

  /**
   * @param source 资源对象数组
   **/
  public constructor(source: LoadQueueCtorParam[0] = <any>{}) {
    EventEmitter_Mixins.CTOR(this);
    source && this.add(source);
  }
  /**
   * 获取加载器类型
   * @param item 资源对象
   * @return 加载器
   **/
  private _getLoader(item: Source): Source["loader"] {
    if (!item.loader) {
      switch (item.type) {
        case "img": item.loader = ImageLoader; break;
        case "js": item.loader = ScriptLoader; break;
        case "audio": item.loader = AudioLoader; break;
      }
    }
    return item.loader;
  }
  /**
   * 队列加载
   **/
  private _loadNext(): void {
    let self = this;
    let source = self._source;

    if (self._loaded >= source.length) {
      self.emit(new LoadQueueEvent({ type: LoadQueue.COMPLETE, target: self }));
      return;
    }

    if (self._currentIndex < source.length - 1 && self._connections < self.maxConnections) {
      let index = ++self._currentIndex;
      let item = source[index];
      let loader = self._getLoader(item);
      let next = function (type: EventType, value: LoaderJson["content"]) {
        if (type === LoadQueue.LOAD || type === LoadQueue.ERROR) {
          item.loaded = type === LoadQueue.LOAD ? true : false;
          item.content = value;

          self._connections--;
          self._loaded++;
          self.emit(new LoadQueueEvent({ type: type, target: self, source: [item] }));
          self._loadNext();
        }
      };

      if (loader) self._connections++;

      self._loadNext();

      loader && loader(item, next); // 开始加载
    }
  }
  /**
   * 开始下载队列
   * @return 对象本身
   **/
  public start(): this {
    this._loadNext();
    return this;
  }
  /**
   * 增加要下载的资源
   * @param source 资源对象数组
   * @return 对象本身
   **/
  public add(source: Source[]): this {
    this._source = this._source.concat(source);
    return this;
  }
  /**
   * 根据id或src地址获取资源内容
   * @param id 指定资源的id或src
   * @return 资源对象
   **/
  public getSource(id: string): Source | null {
    let source = this._source;
    for (let i = 0; i < source.length; i++) {
      let item = source[i];
      if (item.id === id || item.src === id) return item;
    }
    return null;
  }
  /**
   * 根据id或src地址删除资源内容
   * @param id 指定资源的id或src
   * @return 是否删除成功
   **/
  public removeContent(id: string): boolean {
    let source = this._source;
    for (let i = 0; i < source.length; i++) {
      let item = source[i];
      if (item.id === id || item.src === id) {
        source.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}

export {
  LoadQueue
}
