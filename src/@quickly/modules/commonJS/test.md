<div align="center" style="font-size:4rem">CommonJs模板</div>

## ⚡ 测试代码

```javascript
commonJS.define("test1.js", { sex: "male" });
commonJS.define("a/test2.js", function (module, exports, require) {
  console.log(module.path);
  console.log(require("b/test2.js")); // 循环加载

  module.exports = { name: "pjx" };
});
commonJS.define("b/test3.js", function (module, exports, require) {
  console.log(module.path);
  require("../a/test2.js");
  module.exports = {
    name: require("a/test2.js"),
    age: 18,
  };
});

// require运行模板
console.log(commonJS.require("test1"));
console.dir("");
// 查看所有模板
console.log(commonJS.modules);
console.dir("");
// define运行模板
commonJS.define(function (module, exports, require) {
  console.log(module.path);
  console.log(require("test1"));
  console.log(require("b/test3"));
});
```
