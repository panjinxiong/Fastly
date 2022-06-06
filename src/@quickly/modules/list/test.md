<div align="center" style="font-size:4rem">双向循环链表</div>

## ⚡ 测试代码

```javascript
// 栈：先进先出
var s = [1, 2, 3, 4];
s.push(5);
s.pop();
console.log(s); // [1, 2, 3, 4]

// 队列：先进后出
var q = [1, 2, 3, 4];
q.push(5);
q.shift();
console.log(q); // [2, 3, 4, 5]

// 链
var l = new list(["a", "b", "c", "d", "e", "f", "g", "h"]);
l.append(1);
l.prepend(0);
console.log(l.find(5));
l.insert(4, "insert");
l.remove(3);
console.log(l.valueAt(5));
console.log(l.indexOf("h"));
l.forEach(function (item, index) {
  console.log(item, index);
});
console.log(l.toArray());
l.reset([1, 2, 3]);
console.log(l);
```
