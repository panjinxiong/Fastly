<div align="center" style="font-size:4rem">类</div>

## ⚡ 测试代码

```javascript
/**
 * 学校类
 **/
let school = klass.create({
  Static: { address: "china" },
  Prototype: {
    name1: "nwq_1",
    name2: "nwq_2",
    getName1: function () {
      return this.name1;
    },
  },
});

/**
 * 学教室1类
 **/
let classroom1 = klass.create({
  Extends: school,
  Static: { address: "right" },
  Initialize: function () {
    console.log(this.name1);
    classroom1._super(this);
    this.name1 = "1-1";
    console.log(this.name1);
  },
});
/**
 * 学教室2类
 **/
let classroom2 = klass.create({
  Extends: school,
  Static: { position: "left" },
  Prototype: { name1: "1-2", name2: "1.2" },
  Initialize: function () {
    console.log(this.name1, this.name2);
    classroom2._super(this);
    console.log(this.name1, this.name2);
    return true;
  },
});

/**
 * 学生类
 **/
function test() {}
test.prototype.setAge1 = function (age) {
  this.age1.push(age);
};
test.prototype.age1 = [18];
let student = klass.create({
  Extends: classroom2,
  Static: { position: "middle" },
  Mixes: [test, { age2: 18 }],
  Prototype: { age2: 20 },
  Initialize: function () {
    console.log(student._super(this));
    console.log(student._superMethods(this, "getName1"));
    console.log(this.age1, this.age2);
  },
});
/**
  ts 类：
  class student extends classroom2 {
    static position = "middle";
    public age1 = [18];
    public age2 = 20;
    public constructor() {
      super()
      super.getName1();
      console.log(this.age1, this.age2);
    }
  }
*/

console.dir(school);
console.dir(new school());
console.dir("");
console.dir(classroom1);
console.dir(new classroom1());
console.dir("");
console.dir(classroom2);
console.dir(new classroom2());
console.dir("");
console.dir(student);
console.dir(new student());
console.dir("");
console.log(klass.debug(student));

// 注意：数据error
var stu = new student();
stu.setAge1(20);
console.log(stu.age1); // [18, 20]
console.log(student.prototype.age1); // [18, 20]
```
