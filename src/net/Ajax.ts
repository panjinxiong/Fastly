/*
  XMLHttpRequest API：https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
    setRequestHeader：表示你要发出去的内容的头部信息
    overrideMimeType：表示不管服务端返回什么请求头给你一律不予理会 按照你自己写的头来处理
  实例:
    let test = new Ajax({
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      url: "xxx",
      data: { test: 1 },
    });
*/
import * as Util from "@/util/Util";
import {
  Type_XMLHttpRequest,
  Type_XMLHttpRequestResponseType,
  Type_Json
} from "@g/Type";

type AjaxCtorParam = [
  {
    /** 请求URL */
    url: string;
    /** 请求方法 */
    method?: string;
    /** 发送数据 */
    data?: any;
    /** 异步请求 */
    async?: boolean;
    /** 属性：[单位毫秒] 最大请求时间 */
    timeout?: number;
    /** 属性：响应数据的类型 */
    responseType?: Type_XMLHttpRequestResponseType;
    /** 属性：头部授权 */
    withCredentials?: boolean;
    /** 方法：设置请求头部 */
    headers?: Type_Json<string>;
    /** 方法：服务器返回指定类型：["text/xml" | "text/plain" | ……] */
    mime?: string;
    /** 事件：停止时触发 */
    onabort?: (this: Ajax, e: any) => any;
    /** 事件：错误时触发 */
    onerror?: (this: Ajax, e: any) => any;
    /** 事件：请求成功完成时触发 */
    onload?: (this: Ajax, e: any) => any;
    /** 事件：当请求结束时触发, 无论请求成功还是失败时触发 */
    onloadend?: (this: Ajax, e: any) => any;
    /** 事件：接收到响应数据时触发 */
    onloadstart?: (this: Ajax, e: any) => any;
    /** 事件：当请求接收到更多数据时，周期性地触发 */
    onprogress?: (this: Ajax, e: any) => any;
    /** 事件：当请求上传到更多数据时，周期性地触发 */
    onupload?: (this: Ajax, e: any) => any;
    /** 事件：在预设时间内没有接收到响应时触发 */
    ontimeout?: (this: Ajax, e: any) => any;
  }
];

/**
 * Ajax类
 **/
class Ajax {
  /** XMLHttpRequest对象 */
  public xhr: Type_XMLHttpRequest;
  /** XMLHttpRequest属性 */
  public get readyState() { return this.xhr.readyState; }
  public get response() { return this.xhr.response; }
  public get responseType() { return this.xhr.responseType; }
  public get responseText() { return this.xhr.responseText; }
  public get responseURL() { return this.xhr.responseURL; }
  public get responseXML() { return this.xhr.responseXML; }
  public get status() { return this.xhr.status; }
  public get statusText() { return this.xhr.statusText; }

  /**
   * @param props 初始化参数
   **/
  public constructor(props: AjaxCtorParam[0] = <any>{}) {
    // 初始化参数
    let url = props.url;
    let data = Util.getJsonVal(props, "data") || "";
    let method = Util.getJsonVal(props, "method") || "get";
    let async = Util.getJsonVal(props, "async") || true;
    let responseType = Util.getJsonVal(props, "responseType") || null;
    let timeout = Util.getJsonVal(props, "timeout") || 0;
    let withCredentials = Util.getJsonVal(props, "withCredentials") || false;
    let headers = Util.getJsonVal(props, "headers") || {};
    let mime = Util.getJsonVal(props, "mime") || "text/xml";
    let onabort = Util.getJsonVal(props, "onabort") || null;
    let onerror = Util.getJsonVal(props, "onerror") || null;
    let onload = Util.getJsonVal(props, "onload") || null;
    let onloadend = Util.getJsonVal(props, "onloadend") || null;
    let onloadstart = Util.getJsonVal(props, "onloadstart") || null;
    let onprogress = Util.getJsonVal(props, "onprogress") || null;
    let onupload = Util.getJsonVal(props, "onupload") || null;
    let ontimeout = Util.getJsonVal(props, "ontimeout") || null;

    // 创建xhr对象
    this.xhr = new XMLHttpRequest();

    // get请求处理
    if (method.toLowerCase() === "get") {
      let qs = Object.keys(data)
        .map((key) => key + "=" + data[key])
        .join("&");
      url += url.indexOf("?") < 0 ? "?" + qs : "&" + qs;
    }

    // 方法
    this.xhr.open(method, url, async);
    for (let h in headers) this.xhr.setRequestHeader(h, headers[h]);
    this.xhr.overrideMimeType(mime);

    // 属性
    if (responseType) this.xhr.responseType = responseType;
    this.xhr.timeout = timeout;
    this.xhr.withCredentials = withCredentials;

    // 事件
    if (onabort) this.xhr.onabort = onabort.bind(this);
    if (onerror) this.xhr.onerror = onerror.bind(this);
    if (onload) this.xhr.onload = onload.bind(this);
    if (onloadend) this.xhr.onloadend = onloadend.bind(this);
    if (onloadstart) this.xhr.onloadstart = onloadstart.bind(this);
    if (onprogress) this.xhr.onprogress = onprogress.bind(this);
    if (onupload) this.xhr.upload.onprogress = onupload.bind(this);
    if (ontimeout) this.xhr.ontimeout = ontimeout.bind(this);

    this.xhr.send(data);
  }
  /** 立刻中止请求 */
  public abort(): void {
    this.xhr.abort();
  }
  /** 获取响应头部 */
  public responseHeaders(): Type_Json<string> {
    let headers: Type_Json<any> = {};
    let str = this.xhr.getAllResponseHeaders();
    let arr = str.split("\n");

    for (let a of arr) {
      let i = a.indexOf(":");
      let k = a.slice(0, i).trim();
      let v = a.slice(i + 1).trim();
      if (headers[k]) {
        if (!Array.isArray(headers[k])) headers[k] = [headers[k]];
        headers[k].push(v);
      } else if (k) {
        headers[k] = v;
      }
    }

    return headers;
  }
}

export {
  Ajax
}
