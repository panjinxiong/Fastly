type TypeEle = { k: any, v: any };
type ForEachFnParam = (key: TypeEle["k"], value: TypeEle["v"]) => boolean | undefined;
type MapsCtorParam = [
  [TypeEle["k"], TypeEle["v"]][]
];

class Maps {
  private _ele!: TypeEle[];
  public get isEmpty(): boolean { return this._ele.length === 0; }
  public get size(): number { return this._ele.length; }

  public constructor(arr?: MapsCtorParam[0]) {
    this.reset(arr);
  }
  /**
   * 清除
   **/
  public clear(): void {
    this._ele = [];
  }
  /**
   * 重置
   * @param arr 值数组
   **/
  public reset(arr?: MapsCtorParam[0]): void {
    this.clear();
    if (arr) {
      for (let a = 0; a < arr.length; a++) {
        this.set(arr[a][0], arr[a][1]);
      }
    }
  }
  /**
   * 设置
   * @param k 值数
   * @param v 值数
   * @return 对象本身
   **/
  public set(k: TypeEle["k"], v: TypeEle["v"]): Maps {
    let index: number = this.indexOf(k);
    if (index > -1) {
      this._ele[index].v = v;
    } else {
      this._ele.push({ k, v });
    }
    return this;
  }
  /**
   * 获取
   * @param k 值数
   **/
  public get(k: TypeEle["k"]): TypeEle | null {
    let index: number = this.indexOf(k);
    if (index > -1) {
      return this._ele[index].v;
    }
    return null;
  }
  /**
   * 判断存在
   * @param k 值数
   **/
  public has(k: TypeEle["k"]): boolean {
    return this.indexOf(k) > -1;
  }
  /**
   * 删除
   * @param k 值数
   * @return 对象本身
   **/
  public delete(k: TypeEle["k"]): Maps {
    let index: number = this.indexOf(k);
    if (index > -1) {
      this._ele.splice(index, 1);
    }
    return this;
  }
  /**
   * 获取位置
   * @param i 位置
   **/
  public index(i: number): TypeEle["v"] | null {
    if (this._ele[i]) {
      return this._ele[i].v
    }
    return null;
  }
  /**
   * 查找值位置
   * @param k 值
   **/
  public indexOf(k: TypeEle["k"]): number {
    for (let i = 0; i < this._ele.length; i++) {
      if (this._ele[i].k === k) {
        return i;
      }
    }
    return -1;
  }
  /**
   * 遍历
   * @param fn 遍历方法
   **/
  public forEach(fn: ForEachFnParam): void {
    for (let i = 0; i < this._ele.length; i++) {
      if (fn(this._ele[i].k, this._ele[i].v) === false) {
        break;
      }
    }
  }
  /**
   * key数组值
   * @param k 值
   **/
  public keys(): TypeEle["k"][] {
    var arr = [];
    for (let i = 0; i < this._ele.length; i++) {
      arr.push(this._ele[i].k);
    }
    return arr;
  }
  /**
   * value数组值
   * @param k 值
   **/
  public values(): TypeEle["v"][] {
    var arr = [];
    for (let i = 0; i < this._ele.length; i++) {
      arr.push(this._ele[i].v);
    }
    return arr;
  }
}

export { Maps }
