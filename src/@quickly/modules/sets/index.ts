type TypeEle = any;
type ForEachFnParam = (key: TypeEle, value: number) => boolean | undefined;

class Sets {
  public ele!: TypeEle[];
  public get isEmpty(): boolean { return this.ele.length === 0; }
  public get size(): number { return this.ele.length; }

  public constructor(arr?: TypeEle[]) {
    this.reset(arr);
  }
  /**
   * 清除
   **/
  public clear(): void {
    this.ele = [];
  }
  /**
   * 重置
   * @param arr 值数组
   **/
  public reset(arr?: TypeEle[]): void {
    this.clear();
    if (arr) {
      for (let a = 0; a < arr.length; a++) {
        this.add(arr[a]);
      }
    }
  }
  /**
   * 添加
   * @param element 值
   * @return 对象本身
   **/
  public add(element: TypeEle): Sets {
    if (this.indexOf(element) < 0) {
      this.ele.push(element);
    }
    return this;
  }
  /**
   * 删除
   * @param element 值
   * @return 对象本身
   **/
  public delete(element: TypeEle): Sets {
    let index = this.indexOf(element);
    if (index > -1) {
      this.ele.splice(index, 1);
    }
    return this;
  }
  /**
   * 判断存在
   * @param element 值
   **/
  public has(element: TypeEle): boolean {
    return this.indexOf(element) > -1
  }
  /**
   * 查找值位置
   * @param element 值
   **/
  public indexOf(element: TypeEle): number {
    for (let i = 0; i < this.ele.length; i++) {
      if (this.ele[i] === element) {
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
    let index: number = 0;

    while (index++ < this.ele.length) {
      if (fn(index, this.ele[index]) === false) {
        break;
      }
    }
  }
  /**
   * 并集
   * @param sets 对象
   * @retrun 新Sets对象
   **/
  public union(sets: Sets): Sets {
    let tempSets = new Sets(this.ele);
    for (let i = 0; i < sets.ele.length; ++i) {
      if (!tempSets.has(sets.ele[i])) {
        tempSets.ele.push(sets.ele[i]);
      }
    }
    return tempSets;
  }
  /**
   * 交集
   * @param sets 对象
   * @retrun 新Sets对象
   **/
  public intersect(sets: Sets): Sets {
    let tempSets = new Sets();
    for (let i = 0; i < this.ele.length; ++i) {
      if (sets.has(this.ele[i])) {
        tempSets.add(this.ele[i]);
      }
    }
    return tempSets;
  }
  /**
   * 补集
   * @param sets 对象
   * @retrun 新Sets对象
   **/
  public complement(sets: Sets): Sets {
    let tempSets = new Sets();
    for (let i = 0; i < sets.ele.length; ++i) {
      if (!this.has(sets.ele[i])) {
        tempSets.add(sets.ele[i]);
      }
    }
    return tempSets;
  }
  /**
   * 对称差
   * @param sets 对象
   * @retrun 新Sets对象
   **/
  public difference(sets: Sets): Sets {
    let tempSet: TypeEle[] = [];
    tempSet = tempSet.concat(sets.complement(this).ele);
    tempSet = tempSet.concat(this.complement(sets).ele);
    return new Sets(tempSet);
  }
}

export { Sets }
