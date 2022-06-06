import * as Quickly from "@quickly";
import { Global_Info, Global_Math, Global_Win } from "@g/Global";
import { Type_Json } from "@g/Type";

/**
 * 获取一个全局唯一的id。如Stage1等
 * @param prefix 生成id的前缀
 * @return 获取新id
 **/
function UniqueName(prefix: string = Global_Info.name): string {
  UniqueName.UID[prefix] || (UniqueName.UID[prefix] = 0);
  return prefix + "_" + (++UniqueName.UID[prefix]).toString();
}
UniqueName.UID = <Type_Json<number>>{};

/**
 * 混合类（伪继承，虽然是混合到目标对象，但是混合对象方法this要用混合对象属性和方法 不要用目标对象属性和方法）
 * @param derivedCtor 目标对象（class）
 * @param baseCtors 混合对象（class）
 * @param skip 是否跳过检查目标对象属性、方法
 **/
function MixinsClass(target: any, sources: any[], skip: boolean = false): any {
  sources.forEach(source => {
    Object.getOwnPropertyNames(source.prototype).forEach(name => {
      if (name !== "constructor" && (skip || !target.prototype.hasOwnProperty(name))) {
        target.prototype[name] = source.prototype[name];
      }
    });
  });
  return target;
}
function MixinsClassDecorator(sources: any[], skip: boolean = false) {
  return function (target: any) {
    MixinsClass(target, sources, skip);
  }
}

/**
 * 继承json
 * @param target 复制目标对象
 * @param source 复制源对象
 * @param skip 是否跳过检查目标对象属性、方法
 * @example
    ```
    var a={on:1,off:2};
    var b={on:2,emit:4};
    MixinsJson(a,[b]); // a {on:2,off:2};
    // MixinsJson(a,[b],true); // a {on:2,off:2,emit:4};
    ```
 **/
function MixinsJson(target: any, sources: any[], skip: boolean = false): any {
  sources.forEach(source => {
    Object.getOwnPropertyNames(source).forEach(name => {
      if (skip || target.hasOwnProperty(name)) {
        target[name] = source[name];
      }
    });
  });
  return target;
}
function MixinsJsonDecorator(sources: any[], skip: boolean = false) {
  return function (target: any) {
    MixinsJson(target, sources, skip);
  }
}

/**
 * 检查json值
 * @param target 目标对象
 * @param key 目标对象属性
 * @param options [0：原值 | 1：浅拷贝值 | 2：深拷贝值] json变化值
 **/
function GetJsonVal(target: Type_Json<any>, key: string, options: 0 | 1 | 2 = 0): any | undefined {
  let value: any = undefined;
  if (target && target.hasOwnProperty(key)) {
    switch (options) {
      case 0: value = target[key]; break;
      case 1: value = Quickly.clone(target[key]); break;
      case 2: value = Quickly.clone(target[key], true); break;
    }
  }
  return value;
}

/**
 * 获取变化量随机数
 *  @param value 随机值
 *  @param variances 随机变化量
 **/
function GetRandomValue(value: number, variances?: number): number {
  return variances ? value + (Global_Math.random() - 0.5) * 2 * variances : value;
}

/**
 * 获取当前时间
 **/
function NowDate(): number {
  return new Global_Win.Date().getTime(); // +new Date() 等于 new Date().getTime()
}

export {
  UniqueName as uniqueName,
  MixinsClass as mixinsClass,
  MixinsClassDecorator as mixinsClassDecorator,
  MixinsJson as mixinsJson,
  MixinsJsonDecorator as mixinsJsonDecorator,
  GetJsonVal as getJsonVal,
  GetRandomValue as getRandomValue,
  NowDate as nowDate
}
