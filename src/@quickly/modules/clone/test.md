<div align="center" style="font-size:4rem">对象克隆</div>

```javascript
function test1() {}
test1.myName = "pjx1";
test1.prototype = {
  myAge: 18,
};
var test2 = {
  myName: "pjx2",
  myAge: 20,
};

var s = {
  num: NaN,
  str: "1",
  bool: false,
  null: null,
  undef: undefined,
  symbol: Symbol(1),
  date: new Date(),
  exp: /1/,
  fn: test1,
  arr: [1, 2, test1, test2],
  obj1: {
    a: {
      b: 2,
    },
    test1,
    test2,
  },
  obj2: test2,
};

var shallow = types.shallow(s); // 浅拷贝：基础类型
var deep = types.deep(s);
deep.fn.myName = "pjx1_fn";
deep.fn.prototype.myAge = "18_fn";
deep.arr[2].myName = "pjx1_arr[2]";
deep.arr[2].prototype.myAge = "18_arr[2]";
deep.arr[3].myName = "pjx1_arr[3]";
deep.arr[3].myAge = "18_arr[3]";
deep.obj1.test1.myName = "pjx1_obj1_test1";
deep.obj1.test1.prototype.myAge = "18_obj1_test1";
deep.obj1.test2.myName = "pjx1_obj2_test2";
deep.obj1.test2.myAge = "18_obj2_test2";
deep.obj2.myName = "pjx1_obj2_test2";
deep.obj2.myAge = "18_obj2_test2";
```
