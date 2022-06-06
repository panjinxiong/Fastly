type TypeEle = any;
type ForEachFnParam = (index: number, item: TypeEle) => boolean | undefined;

class Node {
  public ele: TypeEle;
  public prev: Node | null;
  public next: Node | null;

  public constructor(element: TypeEle) {
    this.ele = element;
    this.prev = null;
    this.next = null;
  }
}

class List {
  private _head!: Node | null; // 非空断言："_head!" 将从 "_head" 值域中排除 null 和 undefined
  private _tail!: Node | null;
  private _length!: number;
  public get getHead(): Node | null { return this._head; }
  public get getTail(): Node | null { return this._tail; }
  public get isEmpty(): boolean { return this._length === 0; }
  public get size(): number { return this._length; }

  public constructor(arr?: TypeEle[]) {
    this.reset(arr);
  }
  /**
   * 重置
   * @param arr 值数组
   **/
  public reset(arr?: TypeEle[]): void {
    this._head = null;
    this._tail = null;
    this._length = 0;

    if (arr) {
      for (let a = 0; a < arr.length; a++) {
        this.append(arr[a]);
      }
    }
  }
  /**
   * 最后一个添加
   * @param element 值
   * @return 对象本身
   **/
  public append(element: TypeEle): List {
    this.insert(this._length, element)
    return this;
  }
  /**
   * 前面一个添加
   * @param element 值
   * @return 对象本身
   **/
  public prepend(element: TypeEle): List {
    this.insert(0, element);
    return this;
  }
  /**
   * 查找
   * @param position [0,length)
   **/
  public find(position: number): Node | null {
    let node: Node | null = null;

    if (position >= 0 && position < this._length) {
      let index: number = 0;
      node = <Node>this._head;
      while (node && ++index <= position) {
        node = <Node>node.next;
      }
    }

    return node;
  }
  /**
   * 插入
   * @param position [0,length]
   **/
  public insert(position: number, element: TypeEle): boolean {
    if (position >= 0 && position <= this._length) {
      let index: number = 0;
      let node: Node = new Node(element);
      let current: Node = <Node>this._head;
      let previous: Node | null = null;

      if (position === 0) {
        if (!this._head) {
          this._head = node;
          this._tail = node;
          node.prev = node;
          node.next = node;
        } else {
          this._head = node;
          this._head.prev = this._tail;
          this._head.next = current;
          current.prev = node;
          (<Node>this._tail).next = node
        }
      } else if (position === this._length) {
        current = <Node>this._tail;
        this._tail = node;
        this._tail.prev = current;
        this._tail.next = this._head;
        (<Node>this._head).prev = node
        current.next = node;
      } else {
        while (index++ < position) {
          previous = current;
          current = <Node>current.next;
        }
        node.prev = <Node>previous;
        node.next = current;
        (<Node>previous).next = node;
        current.prev = node;
      }

      this._length++;

      return true;
    } else {
      return false;
    }
  }
  /**
   * 删除
   * @param position [0,length)
   **/
  public remove(position: number): boolean {
    if (position >= 0 && position < this._length) {
      let index: number = 0;
      let current: Node = <Node>this._head;
      let previous: Node | null = null;

      if (position === 0) {
        this._head = current.next;
        (<Node>this._head).prev = this._tail;
        (<Node>this._tail).next = this._head;
      } else if (position === this._length - 1) {
        this._tail = (<Node>this._tail).prev;
        (<Node>this._head).prev = this._tail;
        (<Node>this._tail).next = this._head;
      } else {
        while (index++ < position) {
          previous = current;
          current = <Node>current.next;
        }
        (<Node>previous).next = current.next;
        (<Node>current.next).prev = previous;
      }

      this._length--;

      return true;
    } else {
      return false;
    }
  }
  /**
   * 遍历
   * @param fn 遍历方法
   **/
  public forEach(fn: ForEachFnParam): void {
    let current = this._head;
    let index: number = 0;

    while (current && index++ < this._length) {
      if (fn(index, current.ele) === false) {
        break;
      }
      current = current.next;
    }
  }
  /**
   * 获取值
   * @param position [0,length)
   **/
  public valueAt(position: number): TypeEle | null {
    let node = this.find(position);
    return node === null ? node : node.ele;
  }
  /**
   * 查找值位置
   * @param element 值
   **/
  public indexOf(element: TypeEle): number {
    let current = this._head;
    let index: number = 0;

    while (current && index++ < this._length) {
      if (current.ele === element) {
        return index;
      }
      current = <Node>current.next;
    }

    return -1;
  }
  /**
   * 转数组
   **/
  public toArray(): Node[] {
    let current: Node = <Node>this._head;
    let index: number = 0;
    let arr: Node[] = [];

    while (current && index < this._length) {
      arr.push(current.ele);
      current = <Node>current.next;
      index++;
    }

    return arr;
  }
}

export { List }
