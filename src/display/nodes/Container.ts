
import * as Util from "@/util/Util";
import { CanvasRenderer } from "@/system/CanvasRenderer";
import { Ticker_TickParam } from "@/system/Ticker";
import { Node, Node_CtorParam } from "@/display/nodes/Node";

type ContainerCtorParam = [
  (
    Node_CtorParam[0] &
    {
      children?: Node[];
      pointChildrenEnabled?: boolean;
    }
  )
];

/**
 * 容器类
 **/
class Container extends Node {
  private _isRenderChildren: boolean = false;
  /** 渲染容器的子元素列表 */
  private _renderChildren: Node[] = [];
  /** 容器的子元素列表 */
  public children: Node[];
  /** 是否能响应point获取子容器 */
  public pointChildrenEnabled: boolean;
  /** 容器的子元素的数量 */
  public get childCount(): number {
    return this.children.length;
  }

  /**
   * @param props 初始化参数
   * @param prev 子类构造默认参数
   **/
  public constructor(props: ContainerCtorParam[0] = <any>{}) {
    super(props);

    this.name = Util.getJsonVal(props, "name") || Util.uniqueName("Container");
    this.children = Util.getJsonVal(props, "children") || [];
    this.pointChildrenEnabled = Util.getJsonVal(props, "pointChildrenEnabled") || true;

    if (this.children.length !== 0) this._updateChildren();
  }
  /**
   * 更新子元素深度
   * @param start 容器子元素列表开始位置
   * @param end   容器子元素列表结束位置
   **/
  private _updateChildren(start?: number, end?: number): void {
    let children = this.children;

    start = start || 0;
    end = end || children.length;
    for (let i = start; i < end; i++) {
      let my = children[i];
      my.depth = i + 1;
      my.parent = this;
    }

    this._isRenderChildren = true;
  }
  /**
   * @overwrite
   **/
  public renderDraw(renderer: CanvasRenderer, tickParam?: Ticker_TickParam): void {
    super.renderDraw(renderer, tickParam);

    this._isRenderChildren && this.renderSort();

    let children = this._renderChildren.slice(0);
    for (let i = 0; i < children.length; i++) {
      let my = children[i];
      if (my.parent === this) my.render(renderer, tickParam);
    }
  }
  /**
   * 容器是否包含指定的子元素
   * @param child 指定的子元素
   * @return 指定的子元素是否包含
   **/
  public hasChild(child: Node): boolean {
    while (child.parent && (child = child.parent)) {
      if (child === this) return true;
    }
    return false;
  }
  /**
   * 获取指定索引位置的子元素
   * @param index 指定要返回的子元素的索引值，从0开始
   * @return 子容器对象
   **/
  public getChildAt(index: number): Node | null {
    let children = this.children;
    if (index < 0 || index >= children.length) return null;
    return children[index];
  }
  /**
   * 返回指定id的子元素
   * @param  id  指定要返回的子元素的id
   * @return  子容器对象
   **/
  public getChildById(id: string): Node | null {
    let children = this.children;
    for (let i = 0; i < children.length; i++) {
      let my = children[i];
      if (my.id === id) return my;
    }
    return null;
  }
  /**
   * 返回指定子元素的索引值
   * @param  child 指定要返回索引值的子元素对象
   * @return  子容器对象
   **/
  public getChildIndex(child: Node): number {
    return this.children.indexOf(child);
  }
  /**
   * 在指定索引位置添加子元素
   * @param child 添加的子元素
   * @param index 指定的索引位置，从0开始
   * @param isSort 是否排序
   * @return 对象本身
   **/
  public addChildAt(child: Node, index: number): this {
    let children = this.children;
    let len = children.length;
    let parent = child.parent;

    index = index < 0 ? 0 : index > len ? len : index;

    // 查不到child位置，就是其他地方
    let childIndex = this.getChildIndex(child);

    if (childIndex === index) return this;
    else if (childIndex >= 0) {
      children.splice(childIndex, 1);
      index = index === len ? len - 1 : index;
    } else if (parent) {
      // child对象有其他父对象，就要删除
      parent.removeChild(child);
    }
    children.splice(index, 0, child);

    // 直接插入，影响插入位置之后的深度
    if (childIndex < 0) this._updateChildren(index);
    // 只是移动时影响中间段的深度
    else {
      let startIndex = childIndex < index ? childIndex : index;
      let endIndex = childIndex < index ? index : childIndex;
      this._updateChildren(startIndex, endIndex + 1);
    }

    return this;
  }
  /**
   * 在最上面添加子元素
   * @param args 添加子元素
   * @return 对象本身
   **/
  public addChild(...args: Node[]): this {
    let total = this.children.length;
    for (let i = 0; i < args.length; i++) this.addChildAt(args[i], total + i);
    return this;
  }
  /**
   * 在指定索引位置删除子元素
   * @param index 指定删除元素的索引位置，从0开始
   * @param isSort 是否排序
   * @return 被删除的对象
   **/
  public removeChildAt(index: number): Node | null {
    let children = this.children;
    if (index < 0 || index >= children.length) return null;
    let child = children[index];
    if (child) {
      child.parent = null;
      child.depth = -1;
    }
    children.splice(index, 1);
    this._updateChildren(index);
    return child;
  }
  /**
   * 删除指定的子元素
   * @param child 指定要删除的子元素
   * @return 被删除的对象
   **/
  public removeChild(child: Node): Node | null {
    return this.removeChildAt(this.getChildIndex(child));
  }
  /**
   * 删除所有的子元素
   * @return 对象本身
   **/
  public removeAllChildren(): this {
    while (this.children.length) this.removeChildAt(0);
    return this;
  }
  /**
   * 删除指定id的子元素
   * @param id 指定要删除的子元素的id
   * @return 被删除的对象
   **/
  public removeChildById(id: string): Node | null {
    let children = this.children;
    for (let i = 0; i < children.length; i++) {
      let my = children[i];
      if (my.id === id) {
        this.removeChildAt(i);
        return my;
      }
    }
    return null;
  }
  /**
   * 设置子元素的索引位置
   * @param child  指定要设置的子元素
   * @param index  指定要设置的索引值
   * @return  对象本身
   **/
  public setChildIndex(child: Node, index: number): this {
    let children = this.children;
    let oldIndex = children.indexOf(child);
    if (oldIndex >= 0 && oldIndex !== index) {
      let len = children.length;
      index = index < 0 ? 0 : index >= len ? len - 1 : index;
      children.splice(oldIndex, 1);
      children.splice(index, 0, child);
      this._updateChildren();
    }
    return this;
  }
  /**
   * 根据zIndex排序
   **/
  public renderSort(): void {
    this._renderChildren = this.children.slice(0);
    this._renderChildren.sort(function (a: Node, b: Node) { return a["zIndex"] - b["zIndex"]; });
    this._isRenderChildren = false;
  }
  /**
   * 获取由point指定下子容器
   * @param x 指定点的x轴坐标
   * @param y 指定点的y轴坐标
   * @param global 使用此标志表明将查找所有符合的对象，即全局匹配
   * @param eventMode 使用此标志表明将在事件模式下查找对象。鼠标或触屏模式下就用true
   * @return 子容器对象
   **/
  public getNodeAtPoint(x: number, y: number, global: false, eventMode: boolean): Node | null
  public getNodeAtPoint(x: number, y: number, global: true, eventMode: boolean): Node[]
  public getNodeAtPoint(
    x: number,
    y: number,
    global: any,
    eventMode: boolean = false
  ): Node | Node[] | null {
    this._isRenderChildren && this.renderSort();

    let result: Node[] = [];
    let children = this._renderChildren.slice(0);

    for (let i = children.length - 1; i >= 0; i--) {
      let obj: Node[] | Node | null = null;
      let child: Container | Node = children[i];

      // child -> 没有 || 隐藏 || 透明为0 || 不是鼠标交互
      if (!child || !child.visible || child.alpha <= 0 || (eventMode && !child.pointerEnabled)) continue;

      // 是容器 && 容器是有子容器 && 容器是鼠标交互
      if (child instanceof Container && child.children.length && !(eventMode && !child.pointChildrenEnabled)) {
        obj = child.getNodeAtPoint(x, y, global, eventMode);
      }

      // 判断是否容器对象
      if (obj) {
        // 匹配一个符合条件，返回Node对象
        if (!global) return obj;
        // 匹配所有符合条件，返回Node[]对象
        else if (obj instanceof Array) result = result.concat(obj);
      } else if (child.hitTestPoint(x, y)) {
        if (!global) return child;
        else result.push(child);
      }
    }

    return global && result.length ? result : null;
  }
}

export {
  ContainerCtorParam as Container_CtorParam,
  Container
}
