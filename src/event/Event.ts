import * as Util from "@/util/Util";

type EventCtorParam = [
  {
    type?: string;
    target?: any;
  }
];

/**
 * 事件类
 **/
class Event {
  /** 触发事件时间 */
  public readonly timeStamp: number;
  /** 事件类型 */
  public type: string;
  /** 目标对象 */
  public target: any;

  /**
   * @param props 初始化参数
   **/
  public constructor(props: EventCtorParam[0] = <any>{}) {
    this.timeStamp = Util.nowDate();
    this.type = Util.getJsonVal(props, "type") || "";
    this.target = Util.getJsonVal(props, "target") || null;
  }
}

export {
  EventCtorParam as Event_CtorParam,
  Event
}

