import { Json } from "../../type/global";

type Fn = {
  /** 构造函数 */
  (): void;
  (...arge: any[]): void;
  /** 静态参数 */
  [staticName: string]: any;
  /** 原型参数 */
  prototype: any;
};
type CreateJson = {
  Extends?: Constructor; //继承
  Static?: Json; // 静态
  Mixes?: (Function | Json)[]; // 混合：选项将以恰当的方式进行“合并”，发生冲突时以原型数据优先
  Prototype?: Json; // 原型
  Initialize?: Fn; // 构造函数
};
type Constructor = Fn & {
  /** 静态参数 */
  SUPER: Constructor | null; // 父类构造
  SUPERCLASSES: Constructor[]; // 父类构造数组
  SUBCLASSES: Constructor[]; // 子类构造数组
  _super: (myThis: any, args?: any[]) => any;
  _superMethods: (myThis: any, attr: string, args?: any[]) => any;
};

function IsOf(a: any[], k: string): boolean {
  let is = false;

  if (a.length !== 0) {
    for (let f = 0; f < a.length; f++) {
      if (a[f] === k) {
        is = true;
        break;
      }
    }
  }

  return is;
}

let Filter = {
  Static: ["SUPER", "SUPERCLASSES", "SUBCLASSES", "_super", "_superMethods"]
};

let CreateJsonAttr: Json = {
  /**
   * 继承父类，不可以用实例对象
   * @param value 属性、方法
   **/
  Extends: function (this: Constructor, value: CreateJson["Extends"]): void {
    if (value) {
      let __: any = function __() { };
      __.prototype = value.prototype;

      let proto = new __(); // { __proto__:{……} }
      let existed = this.prototype;

      Mix(this, [value], Filter.Static); // 父类构造静态 赋值 当前构造静态
      Mix(proto, [existed]); // { existed, { __proto__: {……} } }
      proto.constructor = this; // { constructor:this, existed, { __proto__:{……} } }
      // 当前构造.原型对象
      this.prototype = proto;
      // 当前构造.父类构造
      this.SUPER = value;
      // 当前构造.父类构造数组
      this.SUPERCLASSES = [value];
      for (let v = value.SUPERCLASSES.length - 1; v >= 0; v--) {
        this.SUPERCLASSES.push(value.SUPERCLASSES[v]);
      }
      //  当前构造.子类构造数组
      (value.SUBCLASSES.length !== 0 && value.SUBCLASSES.push(this)) || (value.SUBCLASSES = [this]);
    }
  },
  /**
   * 类静态
   * @param value 属性、方法
   **/
  Static: function (this: Constructor, value: CreateJson["Static"]): void {
    if (value) Mix(this, [value], Filter.Static);
  },
  /**
   * 混入成员集合对象
   * @param value 属性、方法
   **/
  Mixes: function (this: Constructor, value: CreateJson["Mixes"]): void {
    if (value) {
      for (let v in value) Mix(this.prototype, [value[v].prototype || value[v]]);
    }
  },
  /**
   * 类成员
   * @param value 属性、方法
   **/
  Prototype: function (this: Constructor, value: CreateJson["Prototype"]): void {
    if (value) Mix(this.prototype, [value]);
  }
};

/**
 * 类
 * @param props 属性、方法
 * @return 构造函数
 **/
function Create(props: CreateJson = {}): Constructor {
  let clazz = <Constructor>(function (this: any, ...args: any[]) {
    clazz._super(this, args);
  });

  if (props.Initialize) {
    clazz = <Constructor>props.Initialize
  }

  clazz.SUPER = null;
  clazz.SUPERCLASSES = [];
  clazz.SUBCLASSES = [];
  clazz._super = function (myThis: any, args: any[] = []) {
    return clazz.SUPER && clazz.SUPER.apply(myThis, args);
  }
  clazz._superMethods = function (myThis: any, attr: string, args: any[] = []) {
    return clazz.SUPER && clazz.SUPER.prototype[attr].apply(myThis, args);
  }

  for (let c in CreateJsonAttr) {
    if (props.hasOwnProperty(c)) CreateJsonAttr[c].call(clazz, (<Json>props)[c]);
  }

  return clazz;
}

/**
 * 混入属性、方法
 * @param target 目标对象
 * @param args 混入属性、方法
 * @param filter 过滤名
 * @return 目标对象
 **/
function Mix(target: any, args: any[], filter: string[] = []): any {
  for (let i = 0; i < args.length; i++) {
    let source = args[i];
    let defineProps: any;

    for (let key in source) {
      let prop = source[key];

      if (IsOf(filter, key)) {
        continue;
      }

      if (
        prop &&
        typeof prop === "object" &&
        (
          prop.value !== undefined ||
          typeof prop.get === "function" ||
          typeof prop.set === "function" ||
          typeof prop.writable === "boolean" ||
          typeof prop.configurable === "boolean" ||
          typeof prop.enumerable === "boolean"
        )
      ) {
        defineProps = defineProps || {};
        defineProps[key] = prop;
        continue;
      }

      target[key] = prop;
    }

    if (defineProps) {
      // 另一个方法：(function (obj, props) {for (let prop in props) {if (props.hasOwnProperty(prop)) {let desc = props[prop];if ('value' in desc) obj[prop] = desc.value;if ('get' in desc) obj.__defineGetter__(prop, desc.get);if ('set' in desc) obj.__defineSetter__(prop, desc.set);}}})(target, defineProps);
      Object.defineProperties(target, defineProps);
    }
  }

  return target;
}

/**
 * debugger
 * @param klass klass类
 * @return klass类结构
 **/
function Debug(klass: Constructor): Json {
  let s: Json = {};
  let p: Json = {};
  let e: Json[] = [];

  function _(t: any, o: any): any {
    for (let k in o) t[k] = o[k];
    return t;
  }

  _(s, klass);
  _(p, klass.prototype);
  for (let k = klass.SUPERCLASSES.length - 1; k >= 0; k--) {
    e.push({
      "static": _({}, klass.SUPERCLASSES[k]),
      "prototype": _({}, klass.SUPERCLASSES[k].prototype)
    });
  }

  return { "extends": e, "static": s, "prototype": p };
}

export {
  Create as create,
  Mix as mix,
  Debug as debug
}
