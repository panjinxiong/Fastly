<div align="center" style="font-size:4rem">映射</div>

## ⚡ 测试代码

```javascript
var m = new maps([
  [1, 2],
  ["a", "string"],
]);

m.set(true, "boolean");
m.forEach(function (key, value) {
  console.log(key, value);
});
console.log(m.has(true));
console.log(m.index(1));
console.log(m.indexOf(true));
console.log(m.get(true));
m.delete(true);
console.log(m.keys());
console.log(m.values());
```
