<div align="center" style="font-size:4rem">类型功能</div>

## 🌴 JavaScript 类型

基础类型：值访问，拷贝值

- Number 数字
- String 字符串
- Boolean 布尔值
- Symbol 原生类型
- Null 没有对象
- Undefined 没有定义

引用类型： 值访问，内存中的引用地址

- Object 对象
- Function 函数
- Array 数组
- Date 日期
- RegExp 正则匹配
- ……

## 🌴 JavaScript 原型对象、实例化对象

对象属性

- 对象.prototype：原型对象
- 对象.\_\_proto\_\_：实例化对象

注意：对象属性 可以同时存在 实例化对象 和 原型对象，例如：console.dir(function a(){})

## ⚡ 测试代码

```javascript
// 1 等于 Number(1)
let Num = 1;

// "1" 等于 String("1")
let Str = "1";

// true 等于 Boolean(true)
let Bool = true;

/**
 * function(){ return 1; }; 等于 Function(" return 1; ")
 * 返回值：实例化对象 和 原型对象
 **/
let Fn = function () {
  return 1;
};

class Class {}

console.log(types.is(Num, Number)); // true
console.log(types.is(Str, String)); // true
console.log(types.is(Bool, Boolean)); // true
console.log(types.is(Fn, Function)); // true
console.log(types.is(new Fn(), Fn)); // true
console.log(types.is(Class, Function)); // true
console.log(types.is(new Class(), Class)); // true

console.log(types.get(1)); // "Number"
console.log(types.get(1, true)); // 没有原型对象，结果：""
console.log(types.get(Function)); // "Function"
console.log(types.get(Fn)); // "Function"
console.log(types.get(Fn, true)); // "Fn"
console.log(types.get(new Fn())); // "Fn"
console.log(types.get(Class)); // "Function"
console.log(types.get(Class, true)); // "Class"
console.log(types.get(new Class())); // "Class"

console.log(types.ls(1)); // ["Number", "Object"]
console.log(types.ls(1, true)); // 没有原型对象，结果：[]
console.log(types.ls(Function)); // ["Function", "Object"]
console.log(types.ls(Fn)); // ["Function", "Object"]
console.log(types.ls(Fn, true)); // ["Fn", "Object"]
console.log(types.ls(new Fn())); // ["Fn", "Object"]
console.log(types.ls(Class)); // ["Class", "Object"]
console.log(types.ls(Class, true)); // ["Function", "Object"]
console.log(types.ls(new Class())); // ["Class", "Object"]
```
