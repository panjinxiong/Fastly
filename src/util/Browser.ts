import { Global_Info, Global_Win, Global_Ua, Global_Doc, Global_Ele, Global_Console } from "@g/Global";
import { Type_Window, Type_HTMLElement, Type_Json } from "@g/Type";

/** 是否 iphone */
let IsIphone: boolean = /iphone/i.test(Global_Ua);
/** 是否 ipad */
let IsIpad: boolean = /ipad/i.test(Global_Ua);
/** 是否 ipod */
let IsIpod: boolean = /ipod/i.test(Global_Ua);
/** 是否 ios */
let IsIOS: boolean = /iphone|ipad|ipod/i.test(Global_Ua);
/** 是否 android */
let IsAndroid: boolean = /android/i.test(Global_Ua);
/** 是否 chrome */
let IsChrome: boolean = /chrome/i.test(Global_Ua);
/** 是否 webkit */
let IsWebkit: boolean = /webkit/i.test(Global_Ua);
/** 是否 safari */
let IsSafari: boolean = /safari/i.test(Global_Ua);
/** 是否 firefox */
let IsFirefox: boolean = /firefox/i.test(Global_Ua);
/** 是否 opera */
let IsOpera: boolean = /opera/i.test(Global_Ua);
/** 是否 ie */
let IsIE: boolean = /msie/i.test(Global_Ua);
/** 浏览器厂商CSS前缀的js值。比如：webkit */
let JsVendor: string = IsWebkit ? "webkit" : IsFirefox ? "moz" : IsOpera ? "o" : IsIE ? "ms" : "";
/** 是否 支持触碰事件 */
let IsTouch: boolean = "ontouchstart" in Global_Win;
/** 是否 支持canvas元素 */
let IsCanvas: boolean = Global_Doc.createElement("canvas").getContext !== null;
/** 是否 本地存储localStorage */
let IsStorage: boolean = false;
try {
  let value = "test";
  localStorage.setItem(value, value);
  localStorage.removeItem(value);
  IsStorage = true;
} catch (e) { }
/** 是否 检测设备方向orientation */
let IsOrientation: boolean = "orientation" in Global_Win || "orientation" in Global_Win.screen;
/** 是否 检测加速度devicemotion */
let IsDevicemotion: boolean = "ondevicemotion" in Global_Win;

/**
 * 添加一个DOM元素事件
 * @param target  DOM元素或Window对象
 * @param type 事件类型
 * @param fn 回调方法
 * @param enabled 指定开启还是关闭。默认值为true
 **/
function EnableEvent(target: Type_HTMLElement | Type_Window, type: string, fn: any, enabled?: boolean): void {
  enabled = enabled !== false;
  if (enabled) target.addEventListener(type, fn, false);
  else target.removeEventListener(type, fn);
}
/**
 * 创建一个DOM元素
 * @param type 要创建的DOM元素的类型
 * @param props 指定DOM元素的属性和样式
 * @return DOM元素
 **/
function CreateElement(type: string, props?: Type_Json<any>): Type_HTMLElement {
  let elem: any = Global_Doc.createElement(type);
  for (let p in props) {
    let val = props[p];
    if (p === "style") for (let s in val) elem.style[s] = val[s];
    else elem[p] = val;
  }
  return elem;
}
/**
 * 获取DOM元素在页面中的内容显示区域
 * @param elem DOM元素
 * @return 可视区域
 **/
interface GetElementRectReturn { left: number; top: number; width: number; height: number; }
function GetElementRect(elem: Type_HTMLElement | any): GetElementRectReturn {
  // 滚轮xy值
  let offsetX = (Global_Win.pageXOffset || Global_Ele.scrollLeft) - (Global_Ele.clientLeft || 0) || 0;
  let offsetY = (Global_Win.pageYOffset || Global_Ele.scrollTop) - (Global_Ele.clientTop || 0) || 0;
  // 内边距 和 边框
  let styles = Global_Win.getComputedStyle !== undefined ? getComputedStyle(elem) : elem.currentStyle;
  let padLeft = parseInt(styles.paddingLeft) + parseInt(styles.borderLeftWidth) || 0;
  let padTop = parseInt(styles.paddingTop) + parseInt(styles.borderTopWidth) || 0;
  let padRight = parseInt(styles.paddingRight) + parseInt(styles.borderRightWidth) || 0;
  let padBottom = parseInt(styles.paddingBottom) + parseInt(styles.borderBottomWidth) || 0;
  // 上下左右位置
  let top = elem.offsetTop || 0;
  let left = elem.offsetLeft || 0;
  let right = elem.offsetLeft + elem.offsetWidth || 0;
  let bottom = elem.offsetTop + elem.offsetHeight || 0;

  return {
    left: left + offsetX + padLeft,
    top: top + offsetY + padTop,
    width: right - padRight - left - padLeft,
    height: bottom - padBottom - top - padTop
  };
}
/**
 * Elements打印组输出
 * @param arr ["字符串1","字符串2"]
 * @example
    ```
    ElementsLog(["test1","test2"]);
    ```
 **/
function ElementsLog(arr: any[]): void {
  let msg = "";
  let elem = ElementsLog.$DOM;
  for (let a = 0; a < arr.length; a++) {
    let obj = arr[a];
    if (typeof obj === "string") obj = obj.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    a === 0 ? (msg = obj) : (msg += " " + obj);
  }
  elem.innerHTML = "> " + msg + "<br/>" + elem.innerHTML;
  elem.scrollTop = elem.scrollHeight - elem.clientHeight;
  Global_Ele.appendChild(elem);
}
ElementsLog.$DOM = CreateElement(
  "div",
  {
    className: Global_Info.name + "-Log",
    style: {
      "position": "absolute",
      "bottom": "0",
      "left": "0",
      "width": "100%",
      "maxHeight": 200 + "px",
      "boxSizing": "border-box",
      "font": "12px Courier New",
      "backgroundColor": "rgba(0,0,0,0.2)",
      "wordWrap": "break-word",
      "wordBreak": "break-all",
      "overflowY": "scroll",
      "padding": "5px",
      "zIndex": 1e6,
    },
  }
)
/**
 * f12打印组输出
 * @param arr [["字符串",{ "xx": "xx" }]]
 * @param fn  打印组内容
 * @example
    ```
    ConsoleGroup(
      [
        ["test", {"background": "#1475b2","text-align": "left","color": "#fff","padding": "2px 7px","border-radius": "3px"}]
      ],
      function (){ console.log(1); }
    );
    ```
 **/
function ConsoleGroup(arr: [string, Type_Json<string>][], fn?: () => void): void {
  let str = "";
  let css = [];
  for (let a1 in arr) {
    let cssStr = "";
    for (let a2 in arr[a1][1]) cssStr += a2 + ":" + arr[a1][1][a2] + ";";
    css.push(cssStr);
    str += "%c" + arr[a1][0];
  }
  Global_Console.group.apply(Global_Console, [str].concat(css));
  fn && fn();
  Global_Console.groupEnd();
}
/**
 * f12打印输出
 * @param arr [["字符串",{ "xx": "xx" }]]
 * @example
    ```
    提示格式：
      ConsoleLog([
        ["test", {"background": "#1475b2","text-align": "left","color": "#fff","padding": "2px 7px","border-radius": "3px"}]
      ]);
    信息格式：
      ConsoleLog([
        ["test", {"background": "#1475b2","text-align": "center","color": "#fff","padding": "2px 7px","border-top-left-radius": "3px","border-bottom-left-radius": "3px"}],
        ["test", {"background": "#606060","text-align": "left","color": "#fff","padding": "2px 7px","border-top-right-radius": "3px","border-bottom-right-radius": "3px"}]
      ]);
    ```
 **/
function ConsoleLog(arr: [string, Type_Json<string>][]): void {
  let str = "";
  let css = [];
  for (let a1 in arr) {
    let cssStr = "";
    for (let a2 in arr[a1][1]) cssStr += a2 + ":" + arr[a1][1][a2] + ";";
    css.push(cssStr);
    str += "%c" + arr[a1][0];
  }
  Global_Console.log.apply(Global_Console, [str].concat(css));
}

export {
  IsIphone as isIphone,
  IsIpad as isIpad,
  IsIpod as isIpod,
  IsIOS as isIOS,
  IsAndroid as isAndroid,
  IsChrome as isChrome,
  IsWebkit as isWebkit,
  IsSafari as isSafari,
  IsFirefox as isFirefox,
  IsOpera as isOpera,
  IsIE as isIE,
  JsVendor as jsVendor,
  IsTouch as isTouch,
  IsCanvas as isCanvas,
  IsStorage as isStorage,
  IsOrientation as isOrientation,
  IsDevicemotion as isDevicemotion,
  EnableEvent as enableEvent,
  CreateElement as createElement,
  GetElementRect as getElementRect,
  GetElementRectReturn as getElementRectReturn,
  ElementsLog as elementsLog,
  ConsoleGroup as consoleGroup,
  ConsoleLog as consoleLog
}
