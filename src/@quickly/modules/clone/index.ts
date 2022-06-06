import * as Types from "../types";

// 拷贝递归方法：null undefined Number String Boolean Symbol Date Function [Arguments|Array] Object
type ShallowFn = (o: any) => any;
type DeepFn = (o: any, r?: (obj: any) => any) => any;

let CopyFn = <ShallowFn | DeepFn>function (o, r) {
  let types = Types.get(o);

  if (types === "null" ||
    types === "undefined" ||
    types === "Boolean" ||
    types === "Number" ||
    types === "String" ||
    types === "Symbol") return o;
  if (types === "Date") return new Date(o.valueOf());
  if (types === "RegExp") return new RegExp(o);
  let v: any =
    types === "Function" ? new Function("return " + o.toString())() :
      types === "Array" ? [] :
        {};
  for (let i in o) v[i] = r ? r(o[i]) : o[i];
  if (r && types === "Function") v.prototype = r(o.prototype);
  return v;
};

/**
 * 拷贝对象
 * @param obj 复制目标实例化对象
 * @param deep 是否深拷贝
 * @param fn 拷贝方法
 * @return 复制对象
 **/
function Clone<T = any>(obj: T, deep = false, fn: DeepFn = CopyFn): T {
  if (deep) {
    return fn(
      obj,
      function (v: T) {
        return Clone(v, deep, fn);
      }
    );
  }
  return fn(obj);
}

export { Clone }
