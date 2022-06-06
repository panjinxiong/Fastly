/**
 * 类型判断，相当于 instanceof
 * @param l 对象.__proto__(实例化对象)
 * @param r 对象.prototype(原型对象)
 **/
function Is(l: any, r: any): boolean {
  let p = r.prototype;

  l = l.__proto__;
  while (true) {
    if (l === null || l === undefined) {
      return false;
    }
    if (p === l) {
      return true;
    }

    l = l.__proto__;
  }
}

/**
 * 获取类型
 * @param o 对象.prototype(原型对象) | 对象.__proto__(实例化对象)
 * @param i [ true：原型对象 | false：实例化对象 ]
 * @return 类型字符串
 **/
function Get(o: any, i: boolean = false): string {
  let s = "";

  if (arguments.length !== 0) {
    if (o === null || o === undefined) {
      s = String(o);
    }
    else {
      let n = i ? o.prototype : o.__proto__;
      if (n !== null && n !== undefined) {
        s = n.constructor.name;
      }
    }
  }

  return s;
}

/**
 * 获取类型列
 * @param o 对象.prototype(原型对象) | 对象.__proto__(实例化对象)
 * @param i [ true：原型对象 | false：实例化对象 ]
 * @return 类型字符串
 **/
function Ls(o: any, i: boolean = false): string[] {
  let a: string[] = [];

  if (arguments.length !== 0) {
    if (o === null || o === undefined) {
      a.push(String(o));
    }
    else {
      let n = i ? o.prototype : o.__proto__;
      while (true) {
        if (n === null || n === undefined) {
          break;
        }
        a.push(n.constructor.name);
        n = n.__proto__;
      }
    }
  }

  return a;
}

export {
  Is as is,
  Get as get,
  Ls as ls
}
