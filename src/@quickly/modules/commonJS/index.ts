import { Json } from "../../type/global";

type DefineFn = {
  (module: ModFn, exports: Json, require: (nowPath: string) => Json | null): void;
};
type ModFn = DefineFn & {
  path?: string; // [只读] 当前路径
  exports?: Json; // [只读] 模板参数
};

/**
 * 生产模块
 * @param fn 模板方法
 * @param nowPath 当前路径
 * @return 创建完毕模板返回值
 **/
function Mod(fn: ModFn, nowPath: string): Json {
  if (!fn.exports) {
    fn.path = nowPath;
    fn.exports = {};
    fn.call(fn.exports, fn, fn.exports, function (p: string): Json | null {
      // 处理路径：a/test.js
      if ("." != p.charAt(0)) return Require(p);

      // 处理路径：./test.js 、 ../test.js
      let segs = p.split("/");
      let newPath = nowPath.split("/");

      // 去掉最后一个数组，例子：['a','b.js'] => ['a']
      newPath.pop();

      for (let i = 0; i < segs.length; i++) {
        let seg = segs[i];
        if (".." == seg) newPath.pop();
        else if ("." != seg) newPath.push(seg);
      }

      return Require(newPath.join("/"));
    });
  }

  return fn.exports;
}

/**
 * 缓存模块
 **/
let Modules: { [propName: string]: Json | ModFn | undefined } = {};

/**
 * 添加模块
 * @param type 模板名 | 模板方法
 * @param fn 模板方法 | 模板对象
 * @return
 **/
function Define(type: DefineFn): Json;
function Define(type: string, fn: Json | DefineFn): null;
function Define(type: string | DefineFn, fn?: Json | DefineFn): Json | null {
  let back = null;

  switch (typeof type) {
    case "string":
      Modules[type] = fn;
      break;
    case "function":
      back = Mod(type, "");
      break;
  }

  return back;
}

/**
 * 导出模板
 * @param nowPath 当前路径
 * @return 创建完毕模板返回值
 **/
function Require(nowPath: string): Json | null {
  nowPath = (Modules[nowPath + ".js"] && nowPath + ".js") || nowPath; // 自动添加path参数加".js"后缀名

  let mod = Modules[nowPath];
  let back = null;

  switch (typeof mod) {
    case "function":
      back = Mod(<ModFn>mod, nowPath);
      break;
    case "object":
      back = mod;
      break;
  }

  return back;
}

export {
  Modules as modules,
  Define as define,
  Require as require
}
