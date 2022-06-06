<div align="center" style="font-size:4rem">集合</div>

## ⚡ 测试代码

```javascript
var s = new sets([1, 2, 3, 3, 4, 1, 2, 3, 4, 7, 8]);
var d = new sets([3, 4, 10]);

s.add(11);
s.delete(1);
console.log(s.has(4));
console.log(s.indexOf(4));
s.forEach(function (key, value) {
  console.log(key, value);
});
s.union(d);
s.intersect(d);
s.complement(d);
s.difference(d);
```
