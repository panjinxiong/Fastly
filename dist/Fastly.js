(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Fastly = factory());
})(this, (function () { 'use strict';

    function Mod(fn, nowPath) {
        if (!fn.exports) {
            fn.path = nowPath;
            fn.exports = {};
            fn.call(fn.exports, fn, fn.exports, function (p) {
                if ("." != p.charAt(0))
                    return Require(p);
                let segs = p.split("/");
                let newPath = nowPath.split("/");
                newPath.pop();
                for (let i = 0; i < segs.length; i++) {
                    let seg = segs[i];
                    if (".." == seg)
                        newPath.pop();
                    else if ("." != seg)
                        newPath.push(seg);
                }
                return Require(newPath.join("/"));
            });
        }
        return fn.exports;
    }
    let Modules = {};
    function Define(type, fn) {
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
    function Require(nowPath) {
        nowPath = (Modules[nowPath + ".js"] && nowPath + ".js") || nowPath;
        let mod = Modules[nowPath];
        let back = null;
        switch (typeof mod) {
            case "function":
                back = Mod(mod, nowPath);
                break;
            case "object":
                back = mod;
                break;
        }
        return back;
    }

    var index$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        modules: Modules,
        define: Define,
        require: Require
    });

    function IsOf(a, k) {
        let is = false;
        if (a.length !== 0) {
            for (let f = 0; f < a.length; f++) {
                if (a[f] === k) {
                    is = true;
                    break;
                }
            }
        }
        return is;
    }
    let Filter = {
        Static: ["SUPER", "SUPERCLASSES", "SUBCLASSES", "_super", "_superMethods"]
    };
    let CreateJsonAttr = {
        Extends: function (value) {
            if (value) {
                let __ = function __() { };
                __.prototype = value.prototype;
                let proto = new __();
                let existed = this.prototype;
                Mix(this, [value], Filter.Static);
                Mix(proto, [existed]);
                proto.constructor = this;
                this.prototype = proto;
                this.SUPER = value;
                this.SUPERCLASSES = [value];
                for (let v = value.SUPERCLASSES.length - 1; v >= 0; v--) {
                    this.SUPERCLASSES.push(value.SUPERCLASSES[v]);
                }
                (value.SUBCLASSES.length !== 0 && value.SUBCLASSES.push(this)) || (value.SUBCLASSES = [this]);
            }
        },
        Static: function (value) {
            if (value)
                Mix(this, [value], Filter.Static);
        },
        Mixes: function (value) {
            if (value) {
                for (let v in value)
                    Mix(this.prototype, [value[v].prototype || value[v]]);
            }
        },
        Prototype: function (value) {
            if (value)
                Mix(this.prototype, [value]);
        }
    };
    function Create(props = {}) {
        let clazz = (function (...args) {
            clazz._super(this, args);
        });
        if (props.Initialize) {
            clazz = props.Initialize;
        }
        clazz.SUPER = null;
        clazz.SUPERCLASSES = [];
        clazz.SUBCLASSES = [];
        clazz._super = function (myThis, args = []) {
            return clazz.SUPER && clazz.SUPER.apply(myThis, args);
        };
        clazz._superMethods = function (myThis, attr, args = []) {
            return clazz.SUPER && clazz.SUPER.prototype[attr].apply(myThis, args);
        };
        for (let c in CreateJsonAttr) {
            if (props.hasOwnProperty(c))
                CreateJsonAttr[c].call(clazz, props[c]);
        }
        return clazz;
    }
    function Mix(target, args, filter = []) {
        for (let i = 0; i < args.length; i++) {
            let source = args[i];
            let defineProps;
            for (let key in source) {
                let prop = source[key];
                if (IsOf(filter, key)) {
                    continue;
                }
                if (prop &&
                    typeof prop === "object" &&
                    (prop.value !== undefined ||
                        typeof prop.get === "function" ||
                        typeof prop.set === "function" ||
                        typeof prop.writable === "boolean" ||
                        typeof prop.configurable === "boolean" ||
                        typeof prop.enumerable === "boolean")) {
                    defineProps = defineProps || {};
                    defineProps[key] = prop;
                    continue;
                }
                target[key] = prop;
            }
            if (defineProps) {
                Object.defineProperties(target, defineProps);
            }
        }
        return target;
    }
    function Debug(klass) {
        let s = {};
        let p = {};
        let e = [];
        function _(t, o) {
            for (let k in o)
                t[k] = o[k];
            return t;
        }
        _(s, klass);
        _(p, klass.prototype);
        for (let k = klass.SUPERCLASSES.length - 1; k >= 0; k--) {
            e.push({
                "static": _({}, klass.SUPERCLASSES[k]),
                "prototype": _({}, klass.SUPERCLASSES[k].prototype)
            });
        }
        return { "extends": e, "static": s, "prototype": p };
    }

    var index$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        create: Create,
        mix: Mix,
        debug: Debug
    });

    function Is(l, r) {
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
    function Get(o, i = false) {
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
    function Ls(o, i = false) {
        let a = [];
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

    var index = /*#__PURE__*/Object.freeze({
        __proto__: null,
        is: Is,
        get: Get,
        ls: Ls
    });

    let CopyFn = function (o, r) {
        let types = Get(o);
        if (types === "null" ||
            types === "undefined" ||
            types === "Boolean" ||
            types === "Number" ||
            types === "String" ||
            types === "Symbol")
            return o;
        if (types === "Date")
            return new Date(o.valueOf());
        if (types === "RegExp")
            return new RegExp(o);
        let v = types === "Function" ? new Function("return " + o.toString())() :
            types === "Array" ? [] :
                {};
        for (let i in o)
            v[i] = r ? r(o[i]) : o[i];
        if (r && types === "Function")
            v.prototype = r(o.prototype);
        return v;
    };
    function Clone(obj, deep = false, fn = CopyFn) {
        if (deep) {
            return fn(obj, function (v) {
                return Clone(v, deep, fn);
            });
        }
        return fn(obj);
    }

    function Uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    class Node$1 {
        constructor(element) {
            this.ele = element;
            this.prev = null;
            this.next = null;
        }
    }
    class List {
        constructor(arr) {
            this.reset(arr);
        }
        get getHead() { return this._head; }
        get getTail() { return this._tail; }
        get isEmpty() { return this._length === 0; }
        get size() { return this._length; }
        reset(arr) {
            this._head = null;
            this._tail = null;
            this._length = 0;
            if (arr) {
                for (let a = 0; a < arr.length; a++) {
                    this.append(arr[a]);
                }
            }
        }
        append(element) {
            this.insert(this._length, element);
            return this;
        }
        prepend(element) {
            this.insert(0, element);
            return this;
        }
        find(position) {
            let node = null;
            if (position >= 0 && position < this._length) {
                let index = 0;
                node = this._head;
                while (node && ++index <= position) {
                    node = node.next;
                }
            }
            return node;
        }
        insert(position, element) {
            if (position >= 0 && position <= this._length) {
                let index = 0;
                let node = new Node$1(element);
                let current = this._head;
                let previous = null;
                if (position === 0) {
                    if (!this._head) {
                        this._head = node;
                        this._tail = node;
                        node.prev = node;
                        node.next = node;
                    }
                    else {
                        this._head = node;
                        this._head.prev = this._tail;
                        this._head.next = current;
                        current.prev = node;
                        this._tail.next = node;
                    }
                }
                else if (position === this._length) {
                    current = this._tail;
                    this._tail = node;
                    this._tail.prev = current;
                    this._tail.next = this._head;
                    this._head.prev = node;
                    current.next = node;
                }
                else {
                    while (index++ < position) {
                        previous = current;
                        current = current.next;
                    }
                    node.prev = previous;
                    node.next = current;
                    previous.next = node;
                    current.prev = node;
                }
                this._length++;
                return true;
            }
            else {
                return false;
            }
        }
        remove(position) {
            if (position >= 0 && position < this._length) {
                let index = 0;
                let current = this._head;
                let previous = null;
                if (position === 0) {
                    this._head = current.next;
                    this._head.prev = this._tail;
                    this._tail.next = this._head;
                }
                else if (position === this._length - 1) {
                    this._tail = this._tail.prev;
                    this._head.prev = this._tail;
                    this._tail.next = this._head;
                }
                else {
                    while (index++ < position) {
                        previous = current;
                        current = current.next;
                    }
                    previous.next = current.next;
                    current.next.prev = previous;
                }
                this._length--;
                return true;
            }
            else {
                return false;
            }
        }
        forEach(fn) {
            let current = this._head;
            let index = 0;
            while (current && index++ < this._length) {
                if (fn(index, current.ele) === false) {
                    break;
                }
                current = current.next;
            }
        }
        valueAt(position) {
            let node = this.find(position);
            return node === null ? node : node.ele;
        }
        indexOf(element) {
            let current = this._head;
            let index = 0;
            while (current && index++ < this._length) {
                if (current.ele === element) {
                    return index;
                }
                current = current.next;
            }
            return -1;
        }
        toArray() {
            let current = this._head;
            let index = 0;
            let arr = [];
            while (current && index < this._length) {
                arr.push(current.ele);
                current = current.next;
                index++;
            }
            return arr;
        }
    }

    class Sets {
        constructor(arr) {
            this.reset(arr);
        }
        get isEmpty() { return this.ele.length === 0; }
        get size() { return this.ele.length; }
        clear() {
            this.ele = [];
        }
        reset(arr) {
            this.clear();
            if (arr) {
                for (let a = 0; a < arr.length; a++) {
                    this.add(arr[a]);
                }
            }
        }
        add(element) {
            if (this.indexOf(element) < 0) {
                this.ele.push(element);
            }
            return this;
        }
        delete(element) {
            let index = this.indexOf(element);
            if (index > -1) {
                this.ele.splice(index, 1);
            }
            return this;
        }
        has(element) {
            return this.indexOf(element) > -1;
        }
        indexOf(element) {
            for (let i = 0; i < this.ele.length; i++) {
                if (this.ele[i] === element) {
                    return i;
                }
            }
            return -1;
        }
        forEach(fn) {
            let index = 0;
            while (index++ < this.ele.length) {
                if (fn(index, this.ele[index]) === false) {
                    break;
                }
            }
        }
        union(sets) {
            let tempSets = new Sets(this.ele);
            for (let i = 0; i < sets.ele.length; ++i) {
                if (!tempSets.has(sets.ele[i])) {
                    tempSets.ele.push(sets.ele[i]);
                }
            }
            return tempSets;
        }
        intersect(sets) {
            let tempSets = new Sets();
            for (let i = 0; i < this.ele.length; ++i) {
                if (sets.has(this.ele[i])) {
                    tempSets.add(this.ele[i]);
                }
            }
            return tempSets;
        }
        complement(sets) {
            let tempSets = new Sets();
            for (let i = 0; i < sets.ele.length; ++i) {
                if (!this.has(sets.ele[i])) {
                    tempSets.add(sets.ele[i]);
                }
            }
            return tempSets;
        }
        difference(sets) {
            let tempSet = [];
            tempSet = tempSet.concat(sets.complement(this).ele);
            tempSet = tempSet.concat(this.complement(sets).ele);
            return new Sets(tempSet);
        }
    }

    class Maps {
        constructor(arr) {
            this.reset(arr);
        }
        get isEmpty() { return this._ele.length === 0; }
        get size() { return this._ele.length; }
        clear() {
            this._ele = [];
        }
        reset(arr) {
            this.clear();
            if (arr) {
                for (let a = 0; a < arr.length; a++) {
                    this.set(arr[a][0], arr[a][1]);
                }
            }
        }
        set(k, v) {
            let index = this.indexOf(k);
            if (index > -1) {
                this._ele[index].v = v;
            }
            else {
                this._ele.push({ k, v });
            }
            return this;
        }
        get(k) {
            let index = this.indexOf(k);
            if (index > -1) {
                return this._ele[index].v;
            }
            return null;
        }
        has(k) {
            return this.indexOf(k) > -1;
        }
        delete(k) {
            let index = this.indexOf(k);
            if (index > -1) {
                this._ele.splice(index, 1);
            }
            return this;
        }
        index(i) {
            if (this._ele[i]) {
                return this._ele[i].v;
            }
            return null;
        }
        indexOf(k) {
            for (let i = 0; i < this._ele.length; i++) {
                if (this._ele[i].k === k) {
                    return i;
                }
            }
            return -1;
        }
        forEach(fn) {
            for (let i = 0; i < this._ele.length; i++) {
                if (fn(this._ele[i].k, this._ele[i].v) === false) {
                    break;
                }
            }
        }
        keys() {
            var arr = [];
            for (let i = 0; i < this._ele.length; i++) {
                arr.push(this._ele[i].k);
            }
            return arr;
        }
        values() {
            var arr = [];
            for (let i = 0; i < this._ele.length; i++) {
                arr.push(this._ele[i].v);
            }
            return arr;
        }
    }

    var Quickly = /*#__PURE__*/Object.freeze({
        __proto__: null,
        commonJS: index$2,
        klass: index$1,
        types: index,
        clone: Clone,
        uuid: Uuid,
        list: List,
        sets: Sets,
        maps: Maps
    });

    var info = {
    	name: "Fastly",
    	version: "v1.0.0",
    	developer: "PJX",
    	introduction: "Canvas2D游戏框架",
    	createTime: "2021-7-3",
    	updateTime: "2022-3-20"
    };

    let Global_Info = info;
    let Global_Win = window;
    let Global_Ua = navigator.userAgent;
    let Global_Doc = document;
    let Global_Ele = document.documentElement;
    let Global_Math = Math;
    let Global_AudioContext = AudioContext;
    let Global_Console = console;

    var Global = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Global_Info: Global_Info,
        Global_Win: Global_Win,
        Global_Ua: Global_Ua,
        Global_Doc: Global_Doc,
        Global_Ele: Global_Ele,
        Global_Math: Global_Math,
        Global_AudioContext: Global_AudioContext,
        Global_Console: Global_Console
    });

    function PointContains(x, y, poly) {
        let cross = 0;
        let onBorder = false;
        let minX;
        let maxX;
        let minY;
        let maxY;
        for (let i = 0, len = poly.length; i < len; i++) {
            let p1 = poly[i];
            let p2 = poly[(i + 1) % len];
            if (p1.y == p2.y && y == p1.y) {
                p1.x > p2.x ? ((minX = p2.x), (maxX = p1.x)) : ((minX = p1.x), (maxX = p2.x));
                if (x >= minX && x <= maxX) {
                    onBorder = true;
                    continue;
                }
            }
            p1.y > p2.y ? ((minY = p2.y), (maxY = p1.y)) : ((minY = p1.y), (maxY = p2.y));
            if (y < minY || y > maxY)
                continue;
            let nx = (y - p1.y) * ((p2.x - p1.x) / (p2.y - p1.y)) + p1.x;
            if (nx > x)
                cross++;
            else if (nx == x)
                onBorder = true;
            if (p1.x > x && p1.y == y) {
                let p0 = poly[(len + i - 1) % len];
                if ((p0.y < y && p2.y > y) || (p0.y > y && p2.y < y)) {
                    cross++;
                }
            }
        }
        return onBorder || cross % 2 == 1;
    }
    function PolyContains(poly1, poly2) {
        let result = PolyContains.doSATCheck(poly1, poly2, {
            overlap: -Infinity,
            normal: { x: 0, y: 0 },
        });
        if (result)
            return PolyContains.doSATCheck(poly2, poly1, result);
        return false;
    }
    PolyContains.doSATCheck = function (poly1, poly2, result) {
        let len1 = poly1.length;
        let len2 = poly2.length;
        let currentPoint;
        let nextPoint;
        let distance;
        let min1;
        let max1;
        let min2;
        let max2;
        let dot;
        let overlap;
        let normal = { x: 0, y: 0 };
        for (let i = 0; i < len1; i++) {
            currentPoint = poly1[i];
            nextPoint = poly1[i < len1 - 1 ? i + 1 : 0];
            normal.x = currentPoint.y - nextPoint.y;
            normal.y = nextPoint.x - currentPoint.x;
            distance = Global_Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            normal.x /= distance;
            normal.y /= distance;
            min1 = max1 = poly1[0].x * normal.x + poly1[0].y * normal.y;
            for (let j = 1; j < len1; j++) {
                dot = poly1[j].x * normal.x + poly1[j].y * normal.y;
                if (dot > max1)
                    max1 = dot;
                else if (dot < min1)
                    min1 = dot;
            }
            min2 = max2 = poly2[0].x * normal.x + poly2[0].y * normal.y;
            for (let j = 1; j < len2; j++) {
                dot = poly2[j].x * normal.x + poly2[j].y * normal.y;
                if (dot > max2)
                    max2 = dot;
                else if (dot < min2)
                    min2 = dot;
            }
            if (min1 < min2) {
                overlap = min2 - max1;
                normal.x = -normal.x;
                normal.y = -normal.y;
            }
            else {
                overlap = min1 - max2;
            }
            if (overlap >= 0) {
                return false;
            }
            else if (overlap > result.overlap) {
                result.overlap = overlap;
                result.normal.x = normal.x;
                result.normal.y = normal.y;
            }
        }
        return result;
    };

    var Polygon = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Polygon_PointContains: PointContains,
        Polygon_PolyContains: PolyContains
    });

    let IsIphone = /iphone/i.test(Global_Ua);
    let IsIpad = /ipad/i.test(Global_Ua);
    let IsIpod = /ipod/i.test(Global_Ua);
    let IsIOS = /iphone|ipad|ipod/i.test(Global_Ua);
    let IsAndroid = /android/i.test(Global_Ua);
    let IsChrome = /chrome/i.test(Global_Ua);
    let IsWebkit = /webkit/i.test(Global_Ua);
    let IsSafari = /safari/i.test(Global_Ua);
    let IsFirefox = /firefox/i.test(Global_Ua);
    let IsOpera = /opera/i.test(Global_Ua);
    let IsIE = /msie/i.test(Global_Ua);
    let JsVendor = IsWebkit ? "webkit" : IsFirefox ? "moz" : IsOpera ? "o" : IsIE ? "ms" : "";
    let IsTouch = "ontouchstart" in Global_Win;
    let IsCanvas = Global_Doc.createElement("canvas").getContext !== null;
    let IsStorage = false;
    try {
        let value = "test";
        localStorage.setItem(value, value);
        localStorage.removeItem(value);
        IsStorage = true;
    }
    catch (e) { }
    let IsOrientation = "orientation" in Global_Win || "orientation" in Global_Win.screen;
    let IsDevicemotion = "ondevicemotion" in Global_Win;
    function EnableEvent(target, type, fn, enabled) {
        enabled = enabled !== false;
        if (enabled)
            target.addEventListener(type, fn, false);
        else
            target.removeEventListener(type, fn);
    }
    function CreateElement(type, props) {
        let elem = Global_Doc.createElement(type);
        for (let p in props) {
            let val = props[p];
            if (p === "style")
                for (let s in val)
                    elem.style[s] = val[s];
            else
                elem[p] = val;
        }
        return elem;
    }
    function GetElementRect(elem) {
        let offsetX = (Global_Win.pageXOffset || Global_Ele.scrollLeft) - (Global_Ele.clientLeft || 0) || 0;
        let offsetY = (Global_Win.pageYOffset || Global_Ele.scrollTop) - (Global_Ele.clientTop || 0) || 0;
        let styles = Global_Win.getComputedStyle !== undefined ? getComputedStyle(elem) : elem.currentStyle;
        let padLeft = parseInt(styles.paddingLeft) + parseInt(styles.borderLeftWidth) || 0;
        let padTop = parseInt(styles.paddingTop) + parseInt(styles.borderTopWidth) || 0;
        let padRight = parseInt(styles.paddingRight) + parseInt(styles.borderRightWidth) || 0;
        let padBottom = parseInt(styles.paddingBottom) + parseInt(styles.borderBottomWidth) || 0;
        let top = elem.offsetTop || 0;
        let left = elem.offsetLeft || 0;
        let right = elem.offsetLeft + elem.offsetWidth || 0;
        let bottom = elem.offsetTop + elem.offsetHeight || 0;
        return {
            left: left + offsetX + padLeft,
            top: top + offsetY + padTop,
            width: right - padRight - left - padLeft,
            height: bottom - padBottom - top - padTop
        };
    }
    function ElementsLog(arr) {
        let msg = "";
        let elem = ElementsLog.$DOM;
        for (let a = 0; a < arr.length; a++) {
            let obj = arr[a];
            if (typeof obj === "string")
                obj = obj.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            a === 0 ? (msg = obj) : (msg += " " + obj);
        }
        elem.innerHTML = "> " + msg + "<br/>" + elem.innerHTML;
        elem.scrollTop = elem.scrollHeight - elem.clientHeight;
        Global_Ele.appendChild(elem);
    }
    ElementsLog.$DOM = CreateElement("div", {
        className: Global_Info.name + "-Log",
        style: {
            "position": "absolute",
            "bottom": "0",
            "left": "0",
            "width": "100%",
            "maxHeight": 200 + "px",
            "boxSizing": "border-box",
            "font": "12px Courier New",
            "backgroundColor": "rgba(0,0,0,0.2)",
            "wordWrap": "break-word",
            "wordBreak": "break-all",
            "overflowY": "scroll",
            "padding": "5px",
            "zIndex": 1e6,
        },
    });
    function ConsoleGroup(arr, fn) {
        let str = "";
        let css = [];
        for (let a1 in arr) {
            let cssStr = "";
            for (let a2 in arr[a1][1])
                cssStr += a2 + ":" + arr[a1][1][a2] + ";";
            css.push(cssStr);
            str += "%c" + arr[a1][0];
        }
        Global_Console.group.apply(Global_Console, [str].concat(css));
        fn && fn();
        Global_Console.groupEnd();
    }
    function ConsoleLog(arr) {
        let str = "";
        let css = [];
        for (let a1 in arr) {
            let cssStr = "";
            for (let a2 in arr[a1][1])
                cssStr += a2 + ":" + arr[a1][1][a2] + ";";
            css.push(cssStr);
            str += "%c" + arr[a1][0];
        }
        Global_Console.log.apply(Global_Console, [str].concat(css));
    }

    var Browser = /*#__PURE__*/Object.freeze({
        __proto__: null,
        isIphone: IsIphone,
        isIpad: IsIpad,
        isIpod: IsIpod,
        isIOS: IsIOS,
        isAndroid: IsAndroid,
        isChrome: IsChrome,
        isWebkit: IsWebkit,
        isSafari: IsSafari,
        isFirefox: IsFirefox,
        isOpera: IsOpera,
        isIE: IsIE,
        jsVendor: JsVendor,
        isTouch: IsTouch,
        isCanvas: IsCanvas,
        get isStorage () { return IsStorage; },
        isOrientation: IsOrientation,
        isDevicemotion: IsDevicemotion,
        enableEvent: EnableEvent,
        createElement: CreateElement,
        getElementRect: GetElementRect,
        elementsLog: ElementsLog,
        consoleGroup: ConsoleGroup,
        consoleLog: ConsoleLog
    });

    function UniqueName(prefix = Global_Info.name) {
        UniqueName.UID[prefix] || (UniqueName.UID[prefix] = 0);
        return prefix + "_" + (++UniqueName.UID[prefix]).toString();
    }
    UniqueName.UID = {};
    function MixinsClass(target, sources, skip = false) {
        sources.forEach(source => {
            Object.getOwnPropertyNames(source.prototype).forEach(name => {
                if (name !== "constructor" && (skip || !target.prototype.hasOwnProperty(name))) {
                    target.prototype[name] = source.prototype[name];
                }
            });
        });
        return target;
    }
    function MixinsClassDecorator(sources, skip = false) {
        return function (target) {
            MixinsClass(target, sources, skip);
        };
    }
    function MixinsJson(target, sources, skip = false) {
        sources.forEach(source => {
            Object.getOwnPropertyNames(source).forEach(name => {
                if (skip || target.hasOwnProperty(name)) {
                    target[name] = source[name];
                }
            });
        });
        return target;
    }
    function MixinsJsonDecorator(sources, skip = false) {
        return function (target) {
            MixinsJson(target, sources, skip);
        };
    }
    function GetJsonVal(target, key, options = 0) {
        let value = undefined;
        if (target && target.hasOwnProperty(key)) {
            switch (options) {
                case 0:
                    value = target[key];
                    break;
                case 1:
                    value = Clone(target[key]);
                    break;
                case 2:
                    value = Clone(target[key], true);
                    break;
            }
        }
        return value;
    }
    function GetRandomValue(value, variances) {
        return variances ? value + (Global_Math.random() - 0.5) * 2 * variances : value;
    }
    function NowDate() {
        return new Global_Win.Date().getTime();
    }

    var Util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        uniqueName: UniqueName,
        mixinsClass: MixinsClass,
        mixinsClassDecorator: MixinsClassDecorator,
        mixinsJson: MixinsJson,
        mixinsJsonDecorator: MixinsJsonDecorator,
        getJsonVal: GetJsonVal,
        getRandomValue: GetRandomValue,
        nowDate: NowDate
    });

    class Panel {
        constructor() {
            this._min = Infinity;
            this._max = 0;
        }
        update(value, maxValue) {
            let round = Global_Math.round;
            this._min = Global_Math.min(this._min, value);
            this._max = Global_Math.max(this._max, value);
            return {
                min: round(this._min),
                max: round(this._max),
                val: round(value),
                pct: value / maxValue
            };
        }
    }
    class Stats {
        constructor(props = {}) {
            this._prevTime = this._beginTime = NowDate();
            this._frames = 0;
            this._fps = new Panel();
            this._ms = new Panel();
            this.onFPS = props.onFPS || function () { };
            this.onMS = props.onMS || function () { };
        }
        begin() {
            this._beginTime = NowDate();
        }
        update() {
            this._beginTime = this.end();
        }
        end() {
            this._frames++;
            let time = Date.now();
            this.onMS(this._ms.update(time - this._beginTime, 200));
            if (time >= this._prevTime + 1000) {
                this.onFPS(this._fps.update((this._frames * 1000) / (time - this._prevTime), 100));
                this._prevTime = time;
                this._frames = 0;
            }
            return time;
        }
    }

    var PerfMon = /*#__PURE__*/Object.freeze({
        __proto__: null,
        panel: Panel,
        stats: Stats
    });

    class Camera {
        constructor(props = {}) {
            this.bound = GetJsonVal(props, "bound", 1);
            this.x = GetJsonVal(props, "x") || 0;
            this.y = GetJsonVal(props, "y") || 0;
            this.width = GetJsonVal(props, "width") || 0;
            this.height = GetJsonVal(props, "height") || 0;
            this.zoom = GetJsonVal(props, "zoom") || 1;
            this.target = GetJsonVal(props, "target") || null;
            this.deadzone = GetJsonVal(props, "deadzone", 1) || null;
        }
        tick(tickParam) {
            if (this.target) {
                let viewX;
                let viewY;
                let target = this.target;
                let zoom = this.zoom;
                let deadzone = this.deadzone;
                let point = { x: target.x * zoom, y: target.y * zoom };
                let bound = [
                    this.bound[0] * zoom,
                    this.bound[1] * zoom,
                    this.bound[2] * zoom - this.width,
                    this.bound[3] * zoom - this.height,
                ];
                if (deadzone) {
                    viewX = Global_Math.min(Global_Math.max(point.x - this.x, deadzone[0]), deadzone[0] + deadzone[2]);
                    viewY = Global_Math.min(Global_Math.max(point.y - this.y, deadzone[1]), deadzone[1] + deadzone[3]);
                }
                else {
                    viewX = this.width / 2;
                    viewY = this.height / 2;
                }
                this.x = point.x - viewX;
                this.y = point.y - viewY;
                if (bound) {
                    this.x = Global_Math.min(Global_Math.max(this.x, bound[0]), bound[0] + bound[2]);
                    this.y = Global_Math.min(Global_Math.max(this.y, bound[1]), bound[1] + bound[3]);
                }
            }
        }
        follow(target) {
            this.target = target;
            this.tick();
        }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    class EventEmitterMixins {
        static CTOR(target) {
            target._listeners = {};
        }
        on(type, callback, total = -1) {
            let eventListeners = (this._listeners[type] = this._listeners[type] || []);
            for (let i = 0; i < eventListeners.length; i++) {
                if (eventListeners[i].callback === callback)
                    return this;
            }
            eventListeners.push({ callback: callback, complete: 0, total: total });
            return this;
        }
        off(type, callback) {
            if (arguments.length === 0)
                this._listeners = {};
            else if (type && this._listeners[type]) {
                if (arguments.length === 1)
                    delete this._listeners[type];
                else {
                    let eventListeners = this._listeners[type];
                    for (let i = 0; i < eventListeners.length; i++) {
                        if (eventListeners[i].callback === callback) {
                            eventListeners.splice(i, 1);
                            if (eventListeners.length === 0)
                                delete this._listeners[type];
                            break;
                        }
                    }
                }
            }
            return this;
        }
        emit(detail) {
            if (!this._listeners)
                return false;
            let eventListeners = this._listeners[detail.type];
            if (eventListeners) {
                let event = detail;
                let eventListenersCopy = eventListeners.slice(0);
                for (let i = 0; i < eventListenersCopy.length; i++) {
                    let el = eventListenersCopy[i];
                    if (el.total > -1) {
                        if (el.total > el.complete) {
                            el.callback.call(this, event);
                            el.complete++;
                        }
                        if (el.total <= el.complete) {
                            let index = eventListeners.indexOf(el);
                            if (index > -1)
                                eventListeners.splice(index, 1);
                        }
                    }
                    else {
                        el.callback.call(this, event);
                    }
                }
                if (eventListeners.length === 0)
                    delete this._listeners[detail.type];
                return true;
            }
            return false;
        }
        emitFn(type, fn) {
            if (!this._listeners)
                return;
            let eventListeners = this._listeners[type];
            if (eventListeners) {
                let eventListenersCopy = eventListeners.slice(0);
                for (let i = 0; i < eventListenersCopy.length; i++) {
                    let el = eventListenersCopy[i];
                    if (el.total > -1) {
                        if (el.total > el.complete) {
                            el.callback.call(this, fn(el));
                            el.complete++;
                        }
                        if (el.total <= el.complete) {
                            let index = eventListeners.indexOf(el);
                            if (index > -1)
                                eventListeners.splice(index, 1);
                        }
                    }
                    else {
                        el.callback.call(this, fn(el));
                    }
                }
                if (eventListeners.length === 0)
                    delete this._listeners[type];
            }
        }
    }

    class Matrix {
        constructor(...args) {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.tx = 0;
            this.ty = 0;
            if (args.length === 6) {
                this.set(args[0], args[1], args[2], args[3], args[4], args[5]);
            }
        }
        set(...args) {
            this.a = args[0];
            this.b = args[1];
            this.c = args[2];
            this.d = args[3];
            this.tx = args[4];
            this.ty = args[5];
            return this;
        }
        identity() {
            return this.set(1, 0, 0, 1, 0, 0);
        }
        copyTo(mat) {
            this.a = mat.a;
            this.b = mat.b;
            this.c = mat.c;
            this.d = mat.d;
            this.tx = mat.tx;
            this.ty = mat.ty;
            return this;
        }
        clone() {
            return new Matrix().copyTo(this);
        }
        equals(mat) {
            return (mat instanceof Matrix &&
                this.a === mat.a &&
                this.b === mat.b &&
                this.c === mat.c &&
                this.d === mat.d &&
                this.tx === mat.tx &&
                this.ty === mat.ty);
        }
        toArray() {
            return [this.a, this.b, this.c, this.d, this.tx, this.ty];
        }
        translate(x, y) {
            this.tx += x;
            this.ty += y;
            return this;
        }
        scale(x, y) {
            return this.append(x, 0, 0, y, 0, 0);
        }
        rotate(angle) {
            let sin = Global_Math.sin(angle);
            let cos = Global_Math.cos(angle);
            return this.append(cos, sin, -sin, cos, 0, 0);
        }
        skew(x, y) {
            return this.append(1, Global_Math.tan(y), Global_Math.tan(x), 1, 0, 0);
        }
        prepend(a, b, c, d, tx, ty) {
            if (a instanceof Matrix) {
                return this.prepend(a.a, a.b, a.c, a.d, a.tx, a.ty);
            }
            if (a !== undefined && b !== undefined && c !== undefined && d !== undefined && tx !== undefined && ty !== undefined) {
                let a1 = this.a;
                let b1 = this.b;
                let c1 = this.c;
                let d1 = this.d;
                let tx1 = this.tx;
                let ty1 = this.ty;
                this.a = a * a1 + b * c1;
                this.b = a * b1 + b * d1;
                this.c = c * a1 + d * c1;
                this.d = c * b1 + d * d1;
                this.tx = tx * a1 + ty * c1 + tx1;
                this.ty = tx * b1 + ty * d1 + ty1;
            }
            return this;
        }
        append(a, b, c, d, tx, ty) {
            if (a instanceof Matrix) {
                return this.append(a.a, a.b, a.c, a.d, a.tx, a.ty);
            }
            if (a !== undefined && b !== undefined && c !== undefined && d !== undefined && tx !== undefined && ty !== undefined) {
                let a1 = this.a;
                let b1 = this.b;
                let c1 = this.c;
                let d1 = this.d;
                let tx1 = this.tx;
                let ty1 = this.ty;
                this.a = a * a1 + c * b1;
                this.b = b * a1 + d * b1;
                this.c = a * c1 + c * d1;
                this.d = b * c1 + d * d1;
                this.tx = a * tx1 + c * ty1 + tx;
                this.ty = b * tx1 + d * ty1 + ty;
            }
            return this;
        }
        invert() {
            let a = this.a;
            let b = this.b;
            let c = this.c;
            let d = this.d;
            let tx = this.tx;
            let ty = this.ty;
            let n = a * d - c * b;
            this.a = d / n;
            this.b = -b / n;
            this.c = -c / n;
            this.d = a / n;
            this.tx = (c * ty - d * tx) / n;
            this.ty = (b * tx - a * ty) / n;
            return this;
        }
    }

    class Vector {
        constructor(x, y) {
            this.set(x || 0, y || 0);
        }
        get length() { return Global_Math.sqrt(this.x * this.x + this.y * this.y); }
        get angle() { return Global_Math.atan2(this.y, this.x); }
        set(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
        copyTo(v) {
            this.x = v.x;
            this.y = v.y;
            return this;
        }
        clone() {
            return new Vector().copyTo(this);
        }
        equal(v) {
            return this.x === v.x && this.y === v.y;
        }
        dotProduct(x, y) {
            if (x instanceof Vector) {
                return this.x * x.x + this.y * x.y;
            }
            else {
                return this.x * x + this.y * (y === undefined ? x : y);
            }
        }
        normalize() {
            let length = this.length;
            this.x = this.x / length;
            this.y = this.y / length;
            return this;
        }
        inverse() {
            this.x *= -1;
            this.y *= -1;
            return this;
        }
        scale(x, y) {
            this.x *= x;
            this.y *= y === undefined ? x : y;
            return this;
        }
        rotate(angle) {
            let x = this.x;
            let y = this.y;
            this.x = x * Math.cos(angle) - y * Math.sin(angle);
            this.y = x * Math.sin(angle) + y * Math.cos(angle);
            return this;
        }
        toArray() {
            return [this.x, this.y];
        }
        toAdd(x, y) {
            if (x instanceof Vector) {
                this.x += x.x;
                this.y += x.y;
            }
            else if (x !== undefined && y !== undefined) {
                this.x += x;
                this.y += y;
            }
            return this;
        }
        toSubtract(x, y) {
            if (x instanceof Vector) {
                this.x -= x.x;
                this.y -= x.y;
            }
            else if (x !== undefined && y !== undefined) {
                this.x -= x;
                this.y -= y;
            }
            return this;
        }
        toDistance(v) {
            return Global_Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
        }
        toTransform(m, round) {
            let x = this.x * m.a + this.y * m.c + m.tx;
            let y = this.x * m.b + this.y * m.d + m.ty;
            if (round) {
                x = (x + 0.5) >> 0;
                y = (y + 0.5) >> 0;
            }
            this.x = x;
            this.y = y;
            return this;
        }
    }

    class Event {
        constructor(props = {}) {
            this.timeStamp = NowDate();
            this.type = GetJsonVal(props, "type") || "";
            this.target = GetJsonVal(props, "target") || null;
        }
    }

    class PointerEvent extends Event {
        constructor(props = {}) {
            super(props);
            this._stopPropagationed = false;
            this.type = GetJsonVal(props, "type") || "";
            this.target = GetJsonVal(props, "target") || null;
            this.eventTarget = GetJsonVal(props, "eventTarget") || null;
            this.prevTarget = GetJsonVal(props, "prevTarget") || null;
            this.mode = GetJsonVal(props, "mode") || "mouse";
            this.pointX = GetJsonVal(props, "pointX") || 0;
            this.pointY = GetJsonVal(props, "pointY") || 0;
        }
        get stopPropagationed() {
            return this._stopPropagationed;
        }
        stopPropagation() {
            this._stopPropagationed = true;
        }
    }
    class PointerMixinsNode {
        static CTOR(target, props = {}) {
            target._isMouseOver = false;
            target.pointerEnabled = GetJsonVal(props, "pointerEnabled") || true;
            target.pointerCursor = GetJsonVal(props, "pointerCursor") || "";
        }
        pointerEmitEvent(e) {
            e.target = this;
            this.emit(e);
            if (e.type === "mousemove" || e.type === "touchmove") {
                if (!this._isMouseOver) {
                    this._isMouseOver = true;
                    let overEvent = MixinsJson(new PointerEvent(), [e], true);
                    overEvent.type = overEvent.mode === "mouse" ? "mouseover" : "touchover";
                    this.emit(overEvent);
                }
            }
            else if (e.type === "mouseout" || e.type === "touchout") {
                this._isMouseOver = false;
            }
            let parent = this.parent;
            if (!e.stopPropagationed && parent) {
                if (e.type === "mouseout" || e.type === "touchout") {
                    if (!parent.hitTestPoint(e.pointX, e.pointY))
                        parent.pointerEmitEvent(e);
                }
                else {
                    parent.pointerEmitEvent(e);
                }
            }
        }
    }
    class PointerDOM {
        constructor(stage) {
            this._pointerPrevTarget = null;
            this.stage = stage;
            this._domEvent = this._domEvent.bind(this);
        }
        _domEvent(e) {
            let pointerEvent = new PointerEvent();
            let viewport = this.stage.viewport;
            let prevTaget = this._pointerPrevTarget;
            let posObj = e;
            let type = e.type;
            let mode = type.indexOf("touch") === 0 ? "touch" : "mouse";
            let leave = type === "mouseout" || type === "touchout";
            if (mode === "touch") {
                let t = e.touches;
                let c = e.changedTouches;
                posObj = t && t.length ? t[0] : c && c.length ? c[0] : null;
            }
            let x = posObj.pageX || posObj.clientX;
            let y = posObj.pageY || posObj.clientY;
            pointerEvent.pointX = x = (x - ((viewport && viewport.left) || 0)) / this.stage.layers.scale[0];
            pointerEvent.pointY = y = (y - ((viewport && viewport.top) || 0)) / this.stage.layers.scale[1];
            pointerEvent.type = type;
            pointerEvent.mode = mode;
            let obj = this.stage.layers.getNodeAtPoint(x, y, false, true) || this.stage.layers;
            if (prevTaget && (leave || prevTaget !== obj)) {
                let out = "";
                if (type === "touchmove") {
                    out = "touchout";
                }
                else if (type === "mousemove") {
                    out = "mouseout";
                }
                else if (leave || !obj) {
                    out = mode === "touch" ? "touchout" : "mouseout";
                }
                if (out) {
                    let outEvent = MixinsJson(new PointerEvent(), [pointerEvent], true);
                    outEvent.type = out;
                    outEvent.eventTarget = prevTaget;
                    prevTaget.pointerEmitEvent(outEvent);
                }
                pointerEvent.prevTarget = prevTaget;
                this._pointerPrevTarget = null;
            }
            if (obj.pointerEnabled && (type !== "mouseout" || type !== "touchout")) {
                pointerEvent.eventTarget = this._pointerPrevTarget = obj;
                obj.pointerEmitEvent(pointerEvent);
            }
            if (mode === "mouse" && obj instanceof Node) {
                this.stage.element.style.cursor = obj.pointerEnabled && obj.pointerCursor ? obj.pointerCursor : "";
            }
            if (IsAndroid && type === "touchmove") {
                e.preventDefault();
            }
        }
        enable(enabled = true) {
            let types = IsTouch ? ["touchstart", "touchmove", "touchend", "touchout"] : ["mousedown", "mousemove", "mouseup", "mouseout"];
            for (let i = 0; i < types.length; i++) {
                EnableEvent(this.stage.element, types[i], this._domEvent, enabled);
            }
        }
    }

    let Node = class Node {
        constructor(props = {}) {
            this.id = Uuid();
            this.depth = -1;
            this.parent = null;
            EventEmitterMixins.CTOR(this);
            PointerMixinsNode.CTOR(this);
            this.name = GetJsonVal(props, "name") || UniqueName("Node");
            this.x = GetJsonVal(props, "x") || 0;
            this.y = GetJsonVal(props, "y") || 0;
            this.height = GetJsonVal(props, "height") || 0;
            this.width = GetJsonVal(props, "width") || 0;
            this.alpha = GetJsonVal(props, "alpha") || 1;
            this.background = GetJsonVal(props, "background") || "";
            this.visible = GetJsonVal(props, "visible") || true;
            this.blendMode = GetJsonVal(props, "blendMode") || "source-over";
            this.boundsArea = GetJsonVal(props, "boundsArea") || null;
            this.drawable = GetJsonVal(props, "drawable") || null;
            this.mask = GetJsonVal(props, "mask") || null;
            this.anchor = GetJsonVal(props, "anchor", 1) || [0, 0];
            this.rotate = GetJsonVal(props, "rotate") || 0;
            this.scale = GetJsonVal(props, "scale", 1) || [1, 1];
            this.skew = GetJsonVal(props, "skew") || [0, 0];
            this.transform = GetJsonVal(props, "transform", 1) || [];
            this._zIndex = GetJsonVal(props, "zIndex") || 0;
            this.onRenderStart = GetJsonVal(props, "onRenderStart") || null;
            this.onRenderEnd = GetJsonVal(props, "onRenderEnd") || null;
        }
        get scaledWidth() { return this.width * this.scale[0]; }
        get scaledHeight() { return this.height * this.scale[1]; }
        get zIndex() { return this._zIndex; }
        set zIndex(value) {
            this._zIndex = value;
            this.parent && this.parent.renderSort();
        }
        addTo(container, index) {
            if (typeof index === "number")
                container.addChildAt(this, index);
            else
                container.addChild(this);
            return this;
        }
        hasParents(node) {
            while (node.parent && (node = node.parent)) {
                if (node === this)
                    return true;
            }
            return false;
        }
        swapNode(node) {
            if (!this.hasParents(node) && !node.hasParents(this)) {
                let parent = this.parent;
                let nodeParent = node.parent;
                let depth = this.depth;
                let nodeDepth = node.depth;
                if (parent) {
                    parent.addChildAt(node, depth - 1);
                }
                else if (nodeParent) {
                    node.removeParent();
                }
                if (nodeParent) {
                    nodeParent.addChildAt(this, nodeDepth - 1);
                }
                else if (parent) {
                    this.removeParent();
                }
                return true;
            }
            return false;
        }
        removeParent() {
            let parent = this.parent;
            if (parent)
                parent.removeChild(this);
            return this;
        }
        toName() {
            let result = "";
            let obj = this;
            while (obj) {
                result = result ? obj.name + "." + result : obj.name;
                obj = obj.parent;
            }
            return result;
        }
        renderStartDraw(renderer, tickParam) { return renderer.startDraw(this); }
        renderTransform(renderer, tickParam) { renderer.transform(this); }
        renderDraw(renderer, tickParam) { renderer.draw(this); }
        renderEndDraw(renderer, tickParam) { renderer.endDraw(); }
        render(renderer, tickParam) {
            if (this.onRenderStart && !this.onRenderStart(tickParam))
                return;
            if (this.renderStartDraw(renderer, tickParam)) {
                this.renderTransform(renderer, tickParam);
                this.renderDraw(renderer, tickParam);
                this.renderEndDraw(renderer, tickParam);
            }
            this.onRenderEnd && this.onRenderEnd(tickParam);
        }
        getTransformMatrix() {
            let mtx = new Matrix();
            let deg = Global_Math.PI / 180;
            let transform = this.transform;
            if (transform.length !== 0) {
                for (let t = 0; t < transform.length; t++) {
                    let myTransform = transform[t];
                    mtx.append(myTransform.a, myTransform.b, myTransform.c, myTransform.d, myTransform.tx, myTransform.ty);
                }
            }
            else {
                mtx.translate(-this.anchor[0], -this.anchor[1]);
                mtx.skew(this.skew[0] * deg, this.skew[1] * deg);
                mtx.rotate(this.rotate * deg);
                mtx.scale(this.scale[0], this.scale[1]);
                mtx.translate(this.x, this.y);
            }
            return mtx;
        }
        getConcatMatrix(ancestor) {
            let mtx = new Matrix();
            for (let o = this; o !== ancestor && o.parent; o = o.parent) {
                mtx.append(o.getTransformMatrix());
            }
            return mtx;
        }
        getBounds() {
            let mtx = this.getConcatMatrix();
            let w = this.width;
            let h = this.height;
            let vertex = [];
            let poly = this.boundsArea || [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
            for (let i = 0; i < poly.length; i++) {
                vertex[i] = new Vector(poly[i].x, poly[i].y).toTransform(mtx, true);
            }
            return vertex;
        }
        hitTestPoint(x, y) {
            return PointContains(x, y, this.getBounds());
        }
        hitTestObject(object) {
            return PolyContains(this.getBounds(), object.getBounds());
        }
    };
    Node = __decorate([
        MixinsClassDecorator([EventEmitterMixins, PointerMixinsNode])
    ], Node);

    class Container extends Node {
        constructor(props = {}) {
            super(props);
            this._isRenderChildren = false;
            this._renderChildren = [];
            this.name = GetJsonVal(props, "name") || UniqueName("Container");
            this.children = GetJsonVal(props, "children") || [];
            this.pointChildrenEnabled = GetJsonVal(props, "pointChildrenEnabled") || true;
            if (this.children.length !== 0)
                this._updateChildren();
        }
        get childCount() {
            return this.children.length;
        }
        _updateChildren(start, end) {
            let children = this.children;
            start = start || 0;
            end = end || children.length;
            for (let i = start; i < end; i++) {
                let my = children[i];
                my.depth = i + 1;
                my.parent = this;
            }
            this._isRenderChildren = true;
        }
        renderDraw(renderer, tickParam) {
            super.renderDraw(renderer, tickParam);
            this._isRenderChildren && this.renderSort();
            let children = this._renderChildren.slice(0);
            for (let i = 0; i < children.length; i++) {
                let my = children[i];
                if (my.parent === this)
                    my.render(renderer, tickParam);
            }
        }
        hasChild(child) {
            while (child.parent && (child = child.parent)) {
                if (child === this)
                    return true;
            }
            return false;
        }
        getChildAt(index) {
            let children = this.children;
            if (index < 0 || index >= children.length)
                return null;
            return children[index];
        }
        getChildById(id) {
            let children = this.children;
            for (let i = 0; i < children.length; i++) {
                let my = children[i];
                if (my.id === id)
                    return my;
            }
            return null;
        }
        getChildIndex(child) {
            return this.children.indexOf(child);
        }
        addChildAt(child, index) {
            let children = this.children;
            let len = children.length;
            let parent = child.parent;
            index = index < 0 ? 0 : index > len ? len : index;
            let childIndex = this.getChildIndex(child);
            if (childIndex === index)
                return this;
            else if (childIndex >= 0) {
                children.splice(childIndex, 1);
                index = index === len ? len - 1 : index;
            }
            else if (parent) {
                parent.removeChild(child);
            }
            children.splice(index, 0, child);
            if (childIndex < 0)
                this._updateChildren(index);
            else {
                let startIndex = childIndex < index ? childIndex : index;
                let endIndex = childIndex < index ? index : childIndex;
                this._updateChildren(startIndex, endIndex + 1);
            }
            return this;
        }
        addChild(...args) {
            let total = this.children.length;
            for (let i = 0; i < args.length; i++)
                this.addChildAt(args[i], total + i);
            return this;
        }
        removeChildAt(index) {
            let children = this.children;
            if (index < 0 || index >= children.length)
                return null;
            let child = children[index];
            if (child) {
                child.parent = null;
                child.depth = -1;
            }
            children.splice(index, 1);
            this._updateChildren(index);
            return child;
        }
        removeChild(child) {
            return this.removeChildAt(this.getChildIndex(child));
        }
        removeAllChildren() {
            while (this.children.length)
                this.removeChildAt(0);
            return this;
        }
        removeChildById(id) {
            let children = this.children;
            for (let i = 0; i < children.length; i++) {
                let my = children[i];
                if (my.id === id) {
                    this.removeChildAt(i);
                    return my;
                }
            }
            return null;
        }
        setChildIndex(child, index) {
            let children = this.children;
            let oldIndex = children.indexOf(child);
            if (oldIndex >= 0 && oldIndex !== index) {
                let len = children.length;
                index = index < 0 ? 0 : index >= len ? len - 1 : index;
                children.splice(oldIndex, 1);
                children.splice(index, 0, child);
                this._updateChildren();
            }
            return this;
        }
        renderSort() {
            this._renderChildren = this.children.slice(0);
            this._renderChildren.sort(function (a, b) { return a["zIndex"] - b["zIndex"]; });
            this._isRenderChildren = false;
        }
        getNodeAtPoint(x, y, global, eventMode = false) {
            this._isRenderChildren && this.renderSort();
            let result = [];
            let children = this._renderChildren.slice(0);
            for (let i = children.length - 1; i >= 0; i--) {
                let obj = null;
                let child = children[i];
                if (!child || !child.visible || child.alpha <= 0 || (eventMode && !child.pointerEnabled))
                    continue;
                if (child instanceof Container && child.children.length && !(eventMode && !child.pointChildrenEnabled)) {
                    obj = child.getNodeAtPoint(x, y, global, eventMode);
                }
                if (obj) {
                    if (!global)
                        return obj;
                    else if (obj instanceof Array)
                        result = result.concat(obj);
                }
                else if (child.hitTestPoint(x, y)) {
                    if (!global)
                        return child;
                    else
                        result.push(child);
                }
            }
            return global && result.length ? result : null;
        }
    }

    class Drawable {
        constructor(props) {
            this.offset = null;
            if (props)
                this.init(props);
        }
        init(props) {
            this.image = props.image || this.image;
            (props.rect && (this.rect = props.rect)) ||
                (this.rect = [0, 0, this.image.width, this.image.height]);
            props.offset && (this.offset = props.offset);
            return this;
        }
    }

    let PropsDefault = {
        "x": 0,
        "y": 0,
        "rotate": 0,
        "alpha": 1,
        "vx": 0,
        "vy": 0,
        "ax": 0,
        "ay": 0,
        "scaleFix": 1,
        "vScaleFix": 0,
        "vRotate": 0,
        "vAlpha": 0,
        "life": 1,
    };
    class Particle extends Node {
        constructor(props = {}) {
            super(props);
            this._died = false;
            this._time = 0;
            this.name = GetJsonVal(props, "name") || UniqueName("Particle");
            this.system = GetJsonVal(props, "system") || null;
            this.init(props);
        }
        static create(cfg) {
            let particle;
            if (Particle.diedParticles.length > 0) {
                particle = Particle.diedParticles.pop();
                particle.init(cfg);
            }
            else {
                particle = new Particle(cfg);
            }
            return particle;
        }
        renderStartDraw(renderer, tickParam) {
            if (this.system && tickParam && tickParam.deltaTime) {
                if (this._died)
                    return false;
                let dt = tickParam.deltaTime * 0.001;
                this._time += dt;
                this.vx += (this.ax + this.system.gx) * dt;
                this.vy += (this.ay + this.system.gy) * dt;
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.scaleFix += this.vScaleFix;
                this.scale[0] = this.scale[1] = this.scaleFix;
                this.rotate += this.vRotate;
                if (this._time > 0.1)
                    this.alpha += this.vAlpha;
                if (this._time >= this.life || this.alpha <= 0) {
                    this.destroy();
                    return false;
                }
            }
            return super.renderStartDraw(renderer, tickParam);
        }
        init(cfg) {
            if (cfg.system) {
                this.system = cfg.system;
                this._died = false;
                this._time = 0;
                this.alpha = 1;
                for (let p in PropsDefault) {
                    this[p] = GetRandomValue(cfg[p] === undefined
                        ? PropsDefault[p]
                        : cfg[p], cfg[p + "Var"]);
                }
                this.x += this.system.emitterX;
                this.y += this.system.emitterY;
                if (cfg.image && cfg.frames) {
                    let frames = cfg.frames;
                    let frame;
                    if (frames && frames.length)
                        frame = frames[(Global_Math.random() * frames.length) >> 0];
                    else
                        frame = [0, 0, cfg.image.width, cfg.image.height];
                    this.drawable = this.drawable || new Drawable();
                    this.width = frame[2];
                    this.height = frame[3];
                    this.drawable.rect = frame;
                    this.drawable.image = cfg.image;
                    if (cfg.anchor && cfg.anchor[0] !== undefined && cfg.anchor[1] !== undefined) {
                        this.anchor[0] = cfg.anchor[0] * frame[2];
                        this.anchor[1] = cfg.anchor[1] * frame[3];
                    }
                }
            }
        }
        destroy() {
            this._died = true;
            this.alpha = 0;
            this.removeParent();
            Particle.diedParticles.push(this);
        }
    }
    Particle.diedParticles = [];

    class ParticleSystem extends Container {
        constructor(props = {}) {
            super(props);
            this._isRun = false;
            this._currentRunTime = 0;
            this._emitTime = 0;
            this._totalRunTime = 0;
            this.name = GetJsonVal(props, "name") || UniqueName("ParticleSystem");
            this.gx = GetJsonVal(props, "gx") || 0;
            this.gy = GetJsonVal(props, "gy") || 0;
            this.emitterX = GetJsonVal(props, "emitterX") || 0;
            this.emitterY = GetJsonVal(props, "emitterY") || 0;
            this.emitTime = GetJsonVal(props, "emitTime") || 0.2;
            this.emitTimeVar = GetJsonVal(props, "emitTimeVar") || 0;
            this.emitNum = GetJsonVal(props, "emitNum") || 10;
            this.emitNumVar = GetJsonVal(props, "emitNumVar") || 0;
            this.totalTime = GetJsonVal(props, "totalTime") || Infinity;
            this.particle = GetJsonVal(props, "particle") || {};
            this.particle.system = this;
        }
        renderStartDraw(renderer, tickParam) {
            if (this._isRun && tickParam && tickParam.deltaTime) {
                let dt = tickParam.deltaTime * 0.001;
                if ((this._currentRunTime += dt) >= this._emitTime) {
                    this._currentRunTime = 0;
                    this._emitTime = GetRandomValue(this.emitTime, this.emitTimeVar);
                    for (let i = 0; i < GetRandomValue(this.emitNum, this.emitNumVar) >> 0; i++) {
                        this.addChild(Particle.create(this.particle));
                    }
                }
                if ((this._totalRunTime += dt) >= this.totalTime)
                    this.stop();
            }
            return super.renderStartDraw(renderer, tickParam);
        }
        start() {
            this.stop(true);
            this._isRun = true;
            this._currentRunTime = 0;
            this._totalRunTime = 0;
            this._emitTime = GetRandomValue(this.emitTime, this.emitTimeVar);
        }
        stop(clear) {
            this._isRun = false;
            if (clear) {
                for (let i = this.children.length - 1; i >= 0; i--)
                    this.children[i].destroy();
            }
        }
        reset(cfg) {
            MixinsJson(this, [cfg]);
            this.particle.system = this;
        }
    }

    function ParseTextureFrames(atlasData) {
        let frameData = atlasData.frames;
        let frames = [];
        if (!frameData)
            return null;
        if (frameData instanceof Array) {
            for (let i = 0; i < frameData.length; i++) {
                frames[i] = {
                    image: atlasData.image,
                    rect: frameData[i],
                };
            }
        }
        else {
            let frameWidth = frameData.frameWidth;
            let frameHeight = frameData.frameHeight;
            let cols = (atlasData.width / frameWidth) | 0;
            let rows = (atlasData.height / frameHeight) | 0;
            let numFrames = frameData.numFrames || cols * rows;
            for (let i = 0; i < numFrames; i++) {
                frames[i] = {
                    image: atlasData.image,
                    rect: [(i % cols) * frameWidth, ((i / cols) | 0) * frameHeight, frameWidth, frameHeight],
                };
            }
        }
        return frames;
    }
    function ToFrameSprite(frame, sprite) {
        let frameSprite = {
            image: frame.image,
            rect: frame.rect
        };
        if (sprite) {
            frameSprite.name = sprite.name || null;
            frameSprite.duration = sprite.duration || 0;
            frameSprite.stop = !!sprite.stop;
            frameSprite.next = sprite.next !== undefined ? sprite.next : null;
            frameSprite.callback = sprite.callback || null;
        }
        return frameSprite;
    }
    function ParseTextureSprites(atlasData, frames) {
        let spriteData = atlasData.sprites;
        let frameSpritesJson = {};
        if (!spriteData)
            return null;
        for (let s in spriteData) {
            let frameSprites = [];
            let sprite = spriteData[s];
            if (typeof sprite === "number") {
                frameSprites = ToFrameSprite(frames[sprite]);
            }
            else if (sprite instanceof Array) {
                for (let i = 0; i < sprite.length; i++) {
                    let mySprite = sprite[i];
                    if (typeof mySprite === "number")
                        frameSprites[i] = ToFrameSprite(frames[mySprite]);
                    else
                        frameSprites[i] = ToFrameSprite(frames[mySprite.framesIndex], mySprite);
                }
            }
            else {
                for (let i = sprite.from; i <= sprite.to; i++) {
                    frameSprites[i - sprite.from] = ToFrameSprite(frames[i], sprite[i]);
                }
            }
            frameSpritesJson[s] = frameSprites;
        }
        return frameSpritesJson;
    }
    class TextureAtlas {
        constructor(props) {
            this._frames = null;
            this._sprites = null;
            this._frames = ParseTextureFrames(props);
            this._frames && (this._sprites = ParseTextureSprites(props, this._frames));
        }
        getFrame(index) {
            let frames = this._frames;
            return frames && frames[index];
        }
        getSprite(id) {
            let sprites = this._sprites;
            return sprites && sprites[id];
        }
    }

    class Bitmap extends Node {
        constructor(props = {}) {
            super(props);
            this.name = GetJsonVal(props, "name") || UniqueName("Bitmap");
            this.drawable = new Drawable();
            this.setImage(props);
        }
        setImage(props) {
            if (this.drawable) {
                let drawable = this.drawable.init(props);
                if (props.rect) {
                    this.width = props.rect[2];
                    this.height = props.rect[3];
                }
                else if (!this.width || !this.height) {
                    this.width = drawable.rect[2];
                    this.height = drawable.rect[3];
                }
            }
            return this;
        }
    }

    class BitmapText extends Container {
        constructor(props = {}) {
            super(props);
            this.name = GetJsonVal(props, "name") || UniqueName("BitmapText");
            this.glyphs = GetJsonVal(props, "glyphs") || null;
            this.text = GetJsonVal(props, "text") || "";
            this.letterSpacing = GetJsonVal(props, "letterSpacing") || 0;
            this.textAlign = GetJsonVal(props, "textAlign") || "left";
            let text = this.text + "";
            if (text) {
                this.text = "";
                this.setText(text);
            }
            this.pointChildrenEnabled = false;
        }
        static createGlyphs(text, image, col, row) {
            col = col || text.length;
            row = row || 1;
            let glyphs = {};
            let w = image.width / col;
            let h = image.height / row;
            for (let i = 0; i < text.length; i++) {
                glyphs[text.charAt(i)] = {
                    image: image,
                    rect: [w * (i % col), h * Global_Math.floor(i / col), w, h],
                };
            }
            return glyphs;
        }
        _createBitmap(cfg) {
            let bmp;
            if (BitmapText._pool.length) {
                bmp = BitmapText._pool.pop();
                bmp.setImage({ image: cfg.image, rect: cfg.rect });
            }
            else {
                bmp = new Bitmap({ image: cfg.image, rect: cfg.rect });
            }
            return bmp;
        }
        _releaseBitmap(bmp) {
            BitmapText._pool.push(bmp);
        }
        setText(text) {
            let self = this;
            let str = text.toString();
            let len = str.length;
            if (self.text === str)
                return this;
            let width = 0;
            let height = 0;
            let charGlyph;
            let charObj;
            self.text = str;
            for (let i = 0; i < len; i++) {
                charGlyph = self.glyphs && self.glyphs[str.charAt(i)];
                if (charGlyph) {
                    if (self.children[i]) {
                        charObj = self.children[i];
                        charObj.setImage({ image: charGlyph.image, rect: charGlyph.rect });
                    }
                    else {
                        charObj = self._createBitmap(charGlyph);
                        self.addChild(charObj);
                    }
                    charObj.x = width + (width > 0 ? self.letterSpacing : 0);
                    width = charObj.x + charGlyph.rect[2];
                    height = Global_Math.max(height, charGlyph.rect[3]);
                }
            }
            for (let i = self.children.length - 1; i >= len; i--) {
                self._releaseBitmap(self.children[i]);
                self.children[i].removeParent();
            }
            self.width = width;
            self.height = height;
            this.setTextAlign();
            return self;
        }
        setTextAlign(textAlign) {
            this.textAlign = textAlign || this.textAlign;
            switch (this.textAlign) {
                case "center":
                    this.anchor[0] = this.width * 0.5;
                    break;
                case "right":
                    this.anchor[0] = this.width;
                    break;
                case "left":
                default:
                    this.anchor[0] = 0;
                    break;
            }
            return this;
        }
        hasGlyphs(str) {
            let glyphs = this.glyphs;
            if (!glyphs)
                return false;
            str = str.toString();
            for (let i = 0; i < str.length; i++) {
                if (!glyphs[str.charAt(i)])
                    return false;
            }
            return true;
        }
    }
    BitmapText._pool = [];

    class Button extends Node {
        constructor(props = {}) {
            super(props);
            this.name = GetJsonVal(props, "name") || UniqueName("Button");
            this.upState = GetJsonVal(props, "upState") || null;
            this.overState = GetJsonVal(props, "overState") || null;
            this.downState = GetJsonVal(props, "downState") || null;
            this.disabledState = GetJsonVal(props, "disabledState") || null;
            this.state = GetJsonVal(props, "state") || "";
            this.enabled = GetJsonVal(props, "enabled") || true;
            this.drawable = new Drawable(props);
            this.pointerCursor = "pointer";
            this.setState(Button.UP);
        }
        emit(detail) {
            if (!this.enabled)
                return false;
            switch (detail.type) {
                case "mousedown":
                case "touchstart":
                case "touchmove":
                    this.setState(Button.DOWN);
                    break;
                case "mouseover":
                case "touchover":
                    this.setState(Button.OVER);
                    break;
                case "mouseup":
                case "touchend":
                    if (this.overState)
                        this.setState(Button.OVER);
                    else if (this.upState)
                        this.setState(Button.UP);
                    break;
                case "touchout":
                case "mouseout":
                    this.setState(Button.UP);
                    break;
            }
            return super.emit(detail);
        }
        setEnabled(enabled) {
            if (this.enabled !== enabled) {
                if (!enabled)
                    this.setState(Button.DISABLED);
                else
                    this.setState(Button.UP);
            }
            return this;
        }
        setState(state) {
            if (this.state !== state) {
                let stateObj;
                this.state = state;
                this.pointerEnabled = this.enabled = state !== Button.DISABLED;
                switch (state) {
                    case Button.UP:
                        stateObj = this.upState;
                        break;
                    case Button.OVER:
                        stateObj = this.overState;
                        break;
                    case Button.DOWN:
                        stateObj = this.downState;
                        break;
                    case Button.DISABLED:
                        stateObj = this.disabledState;
                        break;
                }
                stateObj && this.drawable && this.drawable.init(stateObj);
            }
            return this;
        }
    }
    Button.UP = "up";
    Button.OVER = "over";
    Button.DOWN = "down";
    Button.DISABLED = "disabled";

    let Context$1 = (CreateElement("canvas").getContext("2d"));
    class Graphics extends Node {
        constructor(props = {}) {
            super(props);
            this._actions = [];
            this._hasStroke = false;
            this._hasFill = false;
            this.name = GetJsonVal(props, "name") || UniqueName("Graphics");
            this.lineWidth = GetJsonVal(props, "lineWidth") || 1;
            this.lineAlpha = GetJsonVal(props, "lineAlpha") || 1;
            this.lineCap = GetJsonVal(props, "lineCap") || null;
            this.lineJoin = GetJsonVal(props, "lineJoin") || null;
            this.miterLimit = GetJsonVal(props, "miterLimit") || 10;
            this.strokeStyle = GetJsonVal(props, "strokeStyle") || "0";
            this.fillStyle = GetJsonVal(props, "fillStyle") || "0";
            this.fillAlpha = GetJsonVal(props, "fillAlpha") || 0;
        }
        get hasStroke() {
            return this._hasStroke;
        }
        get hasFill() {
            return this._hasFill;
        }
        _getSVGParams(str) {
            let p = str
                .substring(1)
                .replace(/[\s]+$|^[\s]+/g, "")
                .split(/[\s]+/);
            if (p[0].length === 0)
                p.shift();
            for (let i = 0; i < p.length; i++)
                p[i] = parseFloat(p[i]);
            return p;
        }
        _convertToAbsolute(currentPoint, data) {
            for (let i = 0; i < data.length; i++) {
                if (i % 2 === 0)
                    data[i] += currentPoint.x;
                else
                    data[i] += currentPoint.y;
            }
        }
        _setCurrentPoint(currentPoint, x, y) {
            currentPoint.x = x;
            currentPoint.y = y;
        }
        _getReflectionPoint(centerPoint, point) {
            return {
                x: centerPoint.x * 2 - point.x,
                y: centerPoint.y * 2 - point.y,
            };
        }
        _addAction(action) {
            this._actions.push(action);
            return this;
        }
        renderDraw(renderer, tickParam) {
            let context = renderer.context;
            let actions = this._actions;
            let contextJsonAny = context;
            context.beginPath();
            for (let i = 0; i < actions.length; i++) {
                let action = actions[i];
                let f = action[0];
                let args = action.length > 1 ? action.slice(1) : null;
                if (typeof contextJsonAny[f] === "function") {
                    contextJsonAny[f].apply(context, args);
                }
                else {
                    contextJsonAny[f] = action[1];
                }
            }
        }
        lineStyle(thickness = 1, lineColor = "0", lineAlpha = 1, lineCap, lineJoin, miterLimit) {
            this._addAction(["lineWidth", (this.lineWidth = thickness)]);
            this._addAction(["strokeStyle", (this.strokeStyle = lineColor)]);
            this._addAction(["lineAlpha", (this.lineAlpha = lineAlpha)]);
            if (lineCap !== undefined)
                this._addAction(["lineCap", (this.lineCap = lineCap)]);
            if (lineJoin !== undefined)
                this._addAction(["lineJoin", (this.lineJoin = lineJoin)]);
            if (miterLimit !== undefined)
                this._addAction(["miterLimit", (this.miterLimit = miterLimit)]);
            this._hasStroke = true;
            return this;
        }
        setLineDash(segments) {
            return this._addAction(["setLineDash", segments]);
        }
        beginFill(fill, alpha = 1) {
            this._addAction(["fillStyle", (this.fillStyle = fill)]);
            this._addAction(["fillAlpha", (this.fillAlpha = alpha)]);
            this._hasFill = true;
            return this;
        }
        endFill() {
            if (this._hasStroke)
                this._addAction(["stroke"]);
            if (this._hasFill)
                this._addAction(["fill"]);
            return this;
        }
        beginLinearGradientFill(x0, y0, x1, y1, colors, ratios) {
            let gradient = Context$1.createLinearGradient(x0, y0, x1, y1);
            for (let i = 0; i < colors.length; i++)
                gradient.addColorStop(ratios[i], colors[i]);
            this._hasFill = true;
            return this._addAction(["fillStyle", (this.fillStyle = gradient)]);
        }
        beginRadialGradientFill(x0, y0, r0, x1, y1, r1, colors, ratios) {
            let gradient = Context$1.createRadialGradient(x0, y0, r0, x1, y1, r1);
            for (let i = 0; i < colors.length; i++)
                gradient.addColorStop(ratios[i], colors[i]);
            this._hasFill = true;
            return this._addAction(["fillStyle", (this.fillStyle = gradient)]);
        }
        beginBitmapFill(image, repetition = "") {
            let pattern = Context$1.createPattern(image, repetition) || "0";
            this._hasFill = true;
            return this._addAction(["fillStyle", (this.fillStyle = pattern)]);
        }
        beginPath() {
            return this._addAction(["beginPath"]);
        }
        closePath() {
            return this._addAction(["closePath"]);
        }
        moveTo(x, y) {
            return this._addAction(["moveTo", x, y]);
        }
        lineTo(x, y) {
            return this._addAction(["lineTo", x, y]);
        }
        quadraticCurveTo(cpx, cpy, x, y) {
            return this._addAction(["quadraticCurveTo", cpx, cpy, x, y]);
        }
        bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
            return this._addAction(["bezierCurveTo", cp1x, cp1y, cp2x, cp2y, x, y]);
        }
        drawRect(x, y, width, height) {
            return this._addAction(["rect", x, y, width, height]);
        }
        drawRoundRectComplex(x, y, width, height, cornerTL, cornerTR, cornerBR, cornerBL) {
            this._addAction(["moveTo", x + cornerTL, y]);
            this._addAction(["lineTo", x + width - cornerTR, y]);
            this._addAction(["arc", x + width - cornerTR, y + cornerTR, cornerTR, -Global_Math.PI / 2, 0, false]);
            this._addAction(["lineTo", x + width, y + height - cornerBR]);
            this._addAction(["arc", x + width - cornerBR, y + height - cornerBR, cornerBR, 0, Global_Math.PI / 2, false]);
            this._addAction(["lineTo", x + cornerBL, y + height]);
            this._addAction([
                "arc",
                x + cornerBL,
                y + height - cornerBL,
                cornerBL,
                Global_Math.PI / 2,
                Global_Math.PI,
                false,
            ]);
            this._addAction(["lineTo", x, y + cornerTL]);
            this._addAction(["arc", x + cornerTL, y + cornerTL, cornerTL, Global_Math.PI, (Global_Math.PI * 3) / 2, false]);
            return this;
        }
        drawRoundRect(x, y, width, height, cornerSize) {
            return this.drawRoundRectComplex(x, y, width, height, cornerSize, cornerSize, cornerSize, cornerSize);
        }
        drawCircle(x, y, radius) {
            return this._addAction(["arc", x + radius, y + radius, radius, 0, Global_Math.PI * 2, 0]);
        }
        drawEllipse(x, y, width, height) {
            if (width === height)
                return this.drawCircle(x, y, width);
            let w = width / 2;
            let h = height / 2;
            let C = 0.5522847498307933;
            let cx = C * w;
            let cy = C * h;
            x = x + w;
            y = y + h;
            this._addAction(["moveTo", x + w, y]);
            this._addAction(["bezierCurveTo", x + w, y - cy, x + cx, y - h, x, y - h]);
            this._addAction(["bezierCurveTo", x - cx, y - h, x - w, y - cy, x - w, y]);
            this._addAction(["bezierCurveTo", x - w, y + cy, x - cx, y + h, x, y + h]);
            this._addAction(["bezierCurveTo", x + cx, y + h, x + w, y + cy, x + w, y]);
            return this;
        }
        drawSVGPath(pathData) {
            let currentPoint = { x: 0, y: 0 };
            let lastControlPoint = { x: 0, y: 0 };
            let controlPoint;
            let lastCmd;
            let path = pathData
                .replace(/,/g, " ")
                .replace(/-/g, " -")
                .split(/(?=[a-zA-Z])/);
            this._addAction(["beginPath"]);
            for (let i = 0; i < path.length; i++) {
                let str = path[i];
                if (!str.length)
                    continue;
                let realCmd = str[0];
                let cmd = realCmd.toUpperCase();
                let p = this._getSVGParams(str);
                let useRelative = cmd !== realCmd;
                switch (cmd) {
                    case "M":
                        if (useRelative)
                            this._convertToAbsolute(currentPoint, p);
                        this._addAction(["moveTo", p[0], p[1]]);
                        this._setCurrentPoint(currentPoint, p[0], p[1]);
                        break;
                    case "L":
                        if (useRelative)
                            this._convertToAbsolute(currentPoint, p);
                        this._addAction(["lineTo", p[0], p[1]]);
                        this._setCurrentPoint(currentPoint, p[0], p[1]);
                        break;
                    case "H":
                        if (useRelative)
                            p[0] += currentPoint.x;
                        this._addAction(["lineTo", p[0], currentPoint.y]);
                        currentPoint.x = p[0];
                        break;
                    case "V":
                        if (useRelative)
                            p[0] += currentPoint.y;
                        this._addAction(["lineTo", currentPoint.x, p[0]]);
                        currentPoint.y = p[0];
                        break;
                    case "Z":
                        this._addAction(["closePath"]);
                        break;
                    case "C":
                        if (useRelative)
                            this._convertToAbsolute(currentPoint, p);
                        this._addAction(["bezierCurveTo", p[0], p[1], p[2], p[3], p[4], p[5]]);
                        lastControlPoint.x = p[2];
                        lastControlPoint.y = p[3];
                        this._setCurrentPoint(currentPoint, p[4], p[5]);
                        break;
                    case "S":
                        if (useRelative)
                            this._convertToAbsolute(currentPoint, p);
                        if (lastCmd === "C" || lastCmd === "S") {
                            controlPoint = this._getReflectionPoint(currentPoint, lastControlPoint);
                        }
                        else {
                            controlPoint = currentPoint;
                        }
                        this._addAction(["bezierCurveTo", controlPoint.x, controlPoint.y, p[0], p[1], p[2], p[3]]);
                        lastControlPoint.x = p[0];
                        lastControlPoint.y = p[1];
                        this._setCurrentPoint(currentPoint, p[2], p[3]);
                        break;
                    case "Q":
                        if (useRelative)
                            this._convertToAbsolute(currentPoint, p);
                        this._addAction(["quadraticCurveTo", p[0], p[1], p[2], p[3]]);
                        lastControlPoint.x = p[0];
                        lastControlPoint.y = p[1];
                        this._setCurrentPoint(currentPoint, p[2], p[3]);
                        break;
                    case "T":
                        if (useRelative)
                            this._convertToAbsolute(currentPoint, p);
                        if (lastCmd === "Q" || lastCmd === "T") {
                            controlPoint = this._getReflectionPoint(currentPoint, lastControlPoint);
                        }
                        else {
                            controlPoint = currentPoint;
                        }
                        this._addAction(["quadraticCurveTo", controlPoint.x, controlPoint.y, p[0], p[1]]);
                        lastControlPoint = controlPoint;
                        this._setCurrentPoint(currentPoint, p[0], p[1]);
                        break;
                }
                lastCmd = cmd;
            }
            return this;
        }
        clear() {
            this._actions.length = 0;
            this.strokeStyle = "0";
            this.lineWidth = 1;
            this.lineAlpha = 1;
            this.lineCap = null;
            this.lineJoin = null;
            this.miterLimit = 10;
            this._hasStroke = false;
            this._hasFill = false;
            this.fillStyle = "0";
            this.fillAlpha = 1;
            return this;
        }
    }

    class Sprite extends Node {
        constructor(props = {}) {
            super(props);
            this._frames = [];
            this._frameNames = {};
            this._frameElapsed = 0;
            this._firstRender = true;
            this._currentFrame = 0;
            this.name = GetJsonVal(props, "name") || UniqueName("Sprite");
            this.paused = GetJsonVal(props, "paused") || false;
            this.loop = GetJsonVal(props, "loop") || true;
            this.timeBased = GetJsonVal(props, "timeBased") || false;
            this.interval = GetJsonVal(props, "interval") || 1;
            this.onEnterFrame = GetJsonVal(props, "onEnterFrame") || null;
            this.drawable = new Drawable();
            if (props.frames)
                this.addFrame(props.frames);
        }
        get framesCount() { return this._frames ? this._frames.length : 0; }
        get currentFrame() { return this._currentFrame; }
        _nextFrame(delta) {
            let frameIndex = this._currentFrame;
            let total = this._frames.length;
            let frame = this._frames[frameIndex];
            let duration = frame.duration || this.interval;
            let value = frameIndex === 0 && !this.drawable ? 0 : this._frameElapsed + (this.timeBased ? delta : 1);
            this._frameElapsed = value < duration ? value : 0;
            if (frame.stop || (!this.loop && frameIndex >= total - 1))
                this.stop();
            if (!this.paused && this._frameElapsed === 0) {
                if (frame.next !== null && frame.next !== undefined)
                    frameIndex = this.getFrameIndex(frame.next);
                else if (frameIndex >= total - 1)
                    frameIndex = 0;
                else if (this.drawable)
                    frameIndex++;
            }
            return frameIndex;
        }
        renderStartDraw(renderer, tickParam) {
            if (tickParam && tickParam.deltaTime) {
                let lastFrameIndex = this._currentFrame;
                let frameIndex;
                if (this._firstRender) {
                    this._firstRender = false;
                    frameIndex = lastFrameIndex;
                }
                else {
                    frameIndex = this._nextFrame(tickParam.deltaTime);
                }
                if (frameIndex !== lastFrameIndex) {
                    let callback = this._frames[frameIndex].callback;
                    this._currentFrame = frameIndex;
                    callback && callback.call(this);
                    this.onEnterFrame && this.onEnterFrame.call(this);
                }
                this.drawable && this.drawable.init(this._frames[frameIndex]);
            }
            return super.renderStartDraw(renderer, tickParam);
        }
        play() {
            this.paused = false;
            return this;
        }
        stop() {
            this.paused = true;
            return this;
        }
        goto(indexOrName, pause) {
            let total = this._frames.length;
            let index = this.getFrameIndex(indexOrName);
            this._currentFrame = index < 0 ? 0 : index >= total ? total - 1 : index;
            this.paused = pause;
            this._firstRender = true;
            return this;
        }
        addFrame(frame, startIndex) {
            let start = startIndex ? startIndex : this._frames.length;
            if (frame instanceof Array) {
                for (let i = 0; i < frame.length; i++)
                    this.setFrame(frame[i], start + i);
            }
            else {
                this.setFrame(frame, start);
            }
            return this;
        }
        getFrame(indexOrName) {
            if (typeof indexOrName === "number") {
                let frames = this._frames;
                if (indexOrName < 0 || indexOrName >= frames.length)
                    return null;
                return frames[indexOrName];
            }
            return this._frameNames[indexOrName];
        }
        getFrameIndex(frameValue) {
            let index = -1;
            if (typeof frameValue === "number") {
                index = frameValue;
            }
            else if (typeof frameValue === "string" && this._frameNames[frameValue]) {
                for (let i = 0; i < this._frames.length; i++) {
                    if (this._frameNames[frameValue] === this._frames[i]) {
                        index = i;
                        break;
                    }
                }
            }
            return index;
        }
        setFrame(frame, index) {
            let frames = this._frames;
            let total = frames.length;
            index = index < 0 ? 0 : index > total ? total : index;
            frames[index] = frame;
            if (frame.name)
                this._frameNames[frame.name] = frame;
            if ((index === 0 && !this.width) || !this.height) {
                this.width = frame.rect[2];
                this.height = frame.rect[3];
            }
            return this;
        }
        setFrameCallback(frame, callback) {
            let getFramesSprites = this.getFrame(frame);
            if (getFramesSprites)
                getFramesSprites.callback = callback;
            return this;
        }
    }

    class Text extends Node {
        constructor(props = {}) {
            super(props);
            this._textWidth = 0;
            this._textHeight = 0;
            this.name = GetJsonVal(props, "name") || UniqueName("Text");
            this.text = GetJsonVal(props, "text") || "";
            this.color = GetJsonVal(props, "color") || "#000";
            this.textAlign = GetJsonVal(props, "textAlign") || "left";
            this.textVAlign = GetJsonVal(props, "textVAlign") || "top";
            this.outline = GetJsonVal(props, "outline") || false;
            this.lineSpacing = GetJsonVal(props, "lineSpacing") || 0;
            this.maxWidth = GetJsonVal(props, "maxWidth") || 200;
            this.font = GetJsonVal(props, "font") || "12px arial";
            this._fontHeight = Text.measureFontHeight(this.font);
        }
        static measureFontHeight(font) {
            let fontHeight;
            let docElement = Global_Ele;
            let elem = CreateElement("div", { style: { font: font, position: "absolute" }, innerHTML: "M" });
            docElement.appendChild(elem);
            fontHeight = elem.offsetHeight;
            docElement.removeChild(elem);
            return fontHeight;
        }
        get textWidth() {
            return this._textWidth;
        }
        get textHeight() {
            return this._textHeight;
        }
        _drawTextLine(context, text, y) {
            let x = 0;
            let width = this.width;
            switch (this.textAlign) {
                case "center":
                    x = width >> 1;
                    break;
                case "right":
                case "end":
                    x = width;
                    break;
            }
            if (this.outline)
                context.strokeText(text, x, y);
            else
                context.fillText(text, x, y);
        }
        _draw(context) {
            let self = this;
            if (!self.text)
                return;
            let text = self.text;
            let lines = text.split(/\r\n|\r|\n|<br(?:[ \/])*>/);
            let width = 0;
            let height = 0;
            let lineHeight = self._fontHeight + self.lineSpacing;
            let line;
            let drawLines = [];
            context.font = self.font;
            context.textAlign = self.textAlign;
            context.textBaseline = "top";
            for (let i = 0; i < lines.length; i++) {
                line = lines[i];
                let w = context.measureText(line).width;
                if (w <= self.maxWidth) {
                    drawLines.push({ text: line, y: height });
                    if (width < w)
                        width = w;
                    height += lineHeight;
                    continue;
                }
                let str = "";
                let oldWidth = 0;
                let newWidth;
                let word;
                for (let j = 0, wlen = line.length; j < wlen; j++) {
                    word = line[j];
                    newWidth = context.measureText(str + word).width;
                    if (newWidth > self.maxWidth) {
                        drawLines.push({ text: str, y: height });
                        if (width < oldWidth)
                            width = oldWidth;
                        height += lineHeight;
                        str = word;
                    }
                    else {
                        oldWidth = newWidth;
                        str += word;
                    }
                    if (j === wlen - 1) {
                        drawLines.push({ text: str, y: height });
                        if (str !== word && width < newWidth)
                            width = newWidth;
                        height += lineHeight;
                    }
                }
            }
            self._textWidth = width;
            self._textHeight = height;
            if (!self.width)
                self.width = width;
            if (!self.height)
                self.height = height;
            let startY = 0;
            switch (self.textVAlign) {
                case "middle":
                    startY = (self.height - self._textHeight) >> 1;
                    break;
                case "bottom":
                    startY = self.height - self._textHeight;
                    break;
            }
            if (self.background) {
                context.fillStyle = self.background;
                context.fillRect(0, 0, self.width, self.height);
            }
            if (self.outline)
                context.strokeStyle = self.color;
            else
                context.fillStyle = self.color;
            for (let i = 0; i < drawLines.length; i++) {
                line = drawLines[i];
                self._drawTextLine(context, line.text, startY + line.y);
            }
        }
        renderDraw(renderer, tickParam) {
            this._draw(renderer.context);
        }
        setFont(font) {
            if (this.font !== font) {
                this.font = font;
                this._fontHeight = Text.measureFontHeight(font);
            }
            return this;
        }
    }

    class KeyboardEvent extends Event {
        constructor(props = {}) {
            super(props);
            this.type = GetJsonVal(props, "type") || "";
            this.target = GetJsonVal(props, "target") || null;
            this.parentEvent = GetJsonVal(props, "parentEvent") || null;
            this.key = GetJsonVal(props, "key") || "";
            this.keys = GetJsonVal(props, "keys") || [];
            this.splitKeys = GetJsonVal(props, "splitKeys") || "";
            this.keyDownKeys = GetJsonVal(props, "keyDownKeys") || [];
            this.keyDownSplitKeys = GetJsonVal(props, "keyDownSplitKeys") || "";
            this.isRepeat = GetJsonVal(props, "isRepeat") || false;
        }
        get isShift() { return this.keys.indexOf("Shift") !== -1; }
        isCtrl() { return this.keys.indexOf("Control") !== -1; }
        isAlt() { return this.keys.indexOf("Alt") !== -1; }
        isMeta() { return this.keys.indexOf("Meta") !== -1; }
        isKeys(k) { return this.keys.indexOf(k) !== -1; }
        isKeyDown() { return this.keyDownKeys.length === 0; }
        isKeyDownKeys(k) { return this.keyDownKeys.indexOf(k) !== -1; }
    }
    class KeyboardDOM {
        constructor(stage) {
            this._keysDown = [];
            this._reg = [];
            this.splitKey = "+";
            this.stage = stage;
            this._domEvent = this._domEvent.bind(this);
            this._domClearKey = this._domClearKey.bind(this);
        }
        get reg() { return this._reg; }
        _domEvent(e) {
            let copyKeysDown = this._keysDown.slice(0);
            let event = {
                "type": e.type,
                "key": e.key,
                "isRepeat": e.repeat,
            };
            if (event.type === "keydown") {
                if (this._keysDown.indexOf(event.key) === -1) {
                    this._keysDown.push(event.key);
                    copyKeysDown = this._keysDown.slice(0);
                }
            }
            else if (event.type === "keyup") {
                let k = this._keysDown.indexOf(event.key);
                if (k > -1)
                    this._keysDown.splice(k, 1);
            }
            event["keys"] = copyKeysDown;
            event["splitKeys"] = event.keys.join(this.splitKey);
            event["keyDownKeys"] = this._keysDown.slice(0);
            event["keyDownSplitKeys"] = event.keyDownKeys.join(this.splitKey);
            for (let r = 0; r < this._reg.length; r++) {
                let myReg = this._reg[r];
                myReg.emitFn(event.type, function (el) {
                    let copyMy = Clone(event);
                    copyMy.target = myReg;
                    copyMy.parentEvent = e;
                    return new KeyboardEvent(copyMy);
                });
                myReg.emitFn(event.type + " " + event.splitKeys, function (el) {
                    let copyMy = Clone(event);
                    copyMy.type = copyMy.type + " " + copyMy.splitKeys;
                    copyMy.target = myReg;
                    copyMy.parentEvent = e;
                    return new KeyboardEvent(copyMy);
                });
            }
        }
        _domClearKey(e) {
            this._keysDown = [];
        }
        reset(obj) {
            if (obj.length !== 0) {
                this._reg = obj;
            }
            else {
                this._reg = [];
            }
        }
        has(obj) {
            return this.get(obj) !== -1;
        }
        get(obj) {
            return this._reg.indexOf(obj);
        }
        add(obj) {
            if (obj instanceof Array)
                this._reg.concat(obj);
            else
                this._reg.push(obj);
            return this;
        }
        set(index, obj) {
            let i = index instanceof Node ? this._reg.indexOf(index) : index;
            (i >= 0 || i < this._reg.length) && (this._reg[i] = obj);
            return this;
        }
        remove(index) {
            let i = index instanceof Node ? this._reg.indexOf(index) : index;
            (i >= 0 || i < this._reg.length) && this._reg.splice(i, 1);
            return this;
        }
        enable(enabled = true) {
            let types = ["keydown", "keyup"];
            for (let i = 0; i < types.length; i++) {
                EnableEvent(Global_Win, types[i], this._domEvent, enabled);
            }
            EnableEvent(Global_Win, 'focus', this._domClearKey, enabled);
            EnableEvent(Global_Win, 'blur', this._domClearKey, enabled);
        }
    }

    class CanvasRenderer {
        constructor(props = {}) {
            this.renderType = "canvas";
            this.layers = new Container();
            this.blendMode = "source-over";
            this.viewport = null;
            this.element = GetJsonVal(props, "element") || CreateElement("canvas");
            this.context = this.element.getContext("2d");
            let viewport = this.updateViewport();
            this.layers.scale = GetJsonVal(props, "scale", 1) || [1, 1];
            this.resize(GetJsonVal(props, "width") || (viewport && viewport.width) || 480, GetJsonVal(props, "height") || (viewport && viewport.height) || 320);
        }
        get height() { return this.layers.height; }
        get width() { return this.layers.width; }
        get scale() { return this.layers.scale; }
        set height(value) { this.resize(this.width, value); }
        set width(value) { this.resize(value, this.height); }
        set scale(value) {
            this.layers.scale = value;
            this.resize(this.width, this.height);
        }
        updateViewport() {
            let element = this.element;
            this.viewport = element.parentNode ? GetElementRect(element) : null;
            return this.viewport;
        }
        resize(w, h) {
            if (this.width !== w || this.height !== h) {
                this.element.width = this.layers.width = w;
                this.element.height = this.layers.height = h;
                this.element.style.width = w * this.layers.scale[0] + "px";
                this.element.style.height = h * this.layers.scale[1] + "px";
                this.updateViewport();
            }
        }
        startDraw(target) {
            if (target.visible && target.alpha > 0) {
                if (target === this.layers) {
                    this.clear(0, 0, target.width, target.height);
                }
                if (target.blendMode !== this.blendMode) {
                    this.context.globalCompositeOperation = this.blendMode = target.blendMode;
                }
                this.context.save();
                return true;
            }
            return false;
        }
        transform(target) {
            let ctx = this.context;
            let mtx = target.getTransformMatrix();
            if (target.mask) {
                target.mask.render(this);
                ctx.clip();
            }
            ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
            if (target.alpha > 0)
                ctx.globalAlpha *= target.alpha;
        }
        draw(target) {
            let ctx = this.context;
            let bg = target.background;
            let w = target.width;
            let h = target.height;
            if (bg) {
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, w, h);
            }
            let drawable = target.drawable;
            let image = drawable && drawable.image;
            if (drawable && image) {
                let rect = drawable.rect;
                let sw = rect[2];
                let sh = rect[3];
                if (!sw || !sh)
                    return;
                if (!w && !h) {
                    w = target.width = sw;
                    h = target.height = sh;
                }
                if (drawable.offset) {
                    let offsetX = drawable.offset[0] || 0;
                    let offsetY = drawable.offset[1] || 0;
                    ctx.translate(offsetX - sw * 0.5, offsetY - sh * 0.5);
                }
                ctx.drawImage(image, rect[0], rect[1], sw, sh, 0, 0, w, h);
            }
        }
        endDraw() {
            this.context.restore();
        }
        clear(x, y, w, h) {
            this.context.clearRect(x, y, w, h);
        }
    }

    class Stage {
        constructor(props = {}) {
            this.id = Uuid();
            this.keyboardDOM = new KeyboardDOM(this);
            this.pointerDOM = new PointerDOM(this);
            this.paused = (props && props.paused) || false;
            this._renderer = new CanvasRenderer(props);
        }
        get element() { return this._renderer.element; }
        get layers() { return this._renderer.layers; }
        get height() { return this._renderer.height; }
        get width() { return this._renderer.width; }
        get scale() { return this._renderer.scale; }
        get viewport() { return this._renderer.viewport || this._renderer.updateViewport(); }
        set height(value) { this._renderer.height = value; }
        set width(value) { this._renderer.width = value; }
        set scale(value) { this._renderer.scale = value; }
        tick(tickParam) {
            if (!this.paused)
                this.layers.render(this._renderer, tickParam);
        }
    }

    class Rectangle {
        constructor(x, y, width, height) {
            this.set(x, y, width, height);
        }
        get top() { return this.y; }
        get bottom() { return this.y + this.height; }
        get left() { return this.x; }
        get right() { return this.x + this.width; }
        get topLeft() { return new Vector(this.left, this.top); }
        get bottomRight() { return new Vector(this.right, this.bottom); }
        set top(top) {
            this.height += this.y - top;
            this.y = top;
        }
        set bottom(bottom) {
            this.height = bottom - this.y;
        }
        set left(left) {
            this.width += this.x - left;
            this.x = left;
        }
        set right(right) {
            this.width = right - this.x;
        }
        set topLeft(v) {
            this.top = v.y;
            this.left = v.x;
        }
        set bottomRight(v) {
            this.bottom = v.y;
            this.right = v.x;
        }
        set(x = 0, y = 0, width = 0, height = 0) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            return this;
        }
        contains(x, y) {
            let is = false;
            if (x instanceof Vector) {
                is = this.contains(x.x, x.y);
            }
            else if (x !== undefined && y !== undefined) {
                is = x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
            }
            return is;
        }
        equal(r) {
            return r instanceof Rectangle && r.x === this.x && r.y === this.y && r.width === this.width && r.height === this.height;
        }
        toArray() {
            return [this.x, this.y, this.width, this.height];
        }
    }

    var WebAudio_1;
    let Context = null;
    try {
        if (Global_AudioContext)
            Context = new Global_AudioContext();
    }
    catch (e) { }
    let WebAudio = WebAudio_1 = class WebAudio {
        constructor(props = {}) {
            this._loaded = false;
            this._playing = false;
            this._startTime = 0;
            this._offset = 0;
            this._duration = 0;
            this._volume = 1;
            this._muted = false;
            EventEmitterMixins.CTOR(this);
            this.data = props.data;
            this.loop = GetJsonVal(props, "loop") || false;
            this.autoPlay = GetJsonVal(props, "autoPlay") || false;
            if (Context) {
                this._context = Context;
                this._gainNode = this._context.createGain();
                this._gainNode.connect(this._context.destination);
            }
        }
        get loaded() { return this._loaded; }
        get playing() { return this._playing; }
        get duration() { return this._duration; }
        get volume() { return this._volume; }
        get muted() { return this._muted; }
        set volume(value) { this._volume !== value && (this._gainNode.gain.value = this._volume = value); }
        set muted(value) {
            if (this._muted !== value) {
                this._muted = value;
                this._gainNode.gain.value = value ? 0 : this._volume;
            }
        }
        _doPlay() {
            let self = this;
            if (this._audioNode) {
                this._audioNode.onended = null;
                this._audioNode.disconnect(0);
            }
            this._audioNode = this._context.createBufferSource();
            this._gainNode.gain.value = this._muted ? 0 : this._volume;
            this._startTime = this._context.currentTime;
            this._audioNode.buffer = this._buffer;
            this._audioNode.onended = function () {
                self._playing = false;
                self._offset = 0;
                self.emit(new Event({ "type": WebAudio_1.END, "target": self }));
                if (self.loop)
                    self._doPlay();
            };
            this._audioNode.connect(this._gainNode);
            this._audioNode.start(0, this._offset);
            this._playing = true;
        }
        load() {
            let self = this;
            this._context.decodeAudioData(this.data, function (audioBuffer) {
                self._buffer = audioBuffer;
                self._loaded = true;
                self._duration = audioBuffer.duration;
                self.emit(new Event({ "type": WebAudio_1.LOAD, "target": self }));
                if (self.autoPlay)
                    self._doPlay();
            }, function () {
                self.emit(new Event({ "type": WebAudio_1.ERROR, "target": self }));
            });
            return this;
        }
        play() {
            if (this._loaded) {
                this._doPlay();
            }
            else {
                this.autoPlay = true;
                this.load();
            }
            return this;
        }
        pause() {
            if (this._audioNode && this._playing) {
                this._audioNode.stop(0);
                this._audioNode.disconnect(0);
                this._offset += this._context.currentTime - this._startTime;
                this._playing = false;
            }
            return this;
        }
        stop() {
            if (this._audioNode) {
                this._audioNode.stop(0);
                this._audioNode.disconnect(0);
                this._offset = 0;
                this._playing = false;
            }
            return this;
        }
    };
    WebAudio.isSupported = Context !== null;
    WebAudio.LOAD = "load";
    WebAudio.ERROR = "error";
    WebAudio.END = "end";
    WebAudio = WebAudio_1 = __decorate([
        MixinsClassDecorator([EventEmitterMixins])
    ], WebAudio);

    class Ajax {
        constructor(props = {}) {
            let url = props.url;
            let data = GetJsonVal(props, "data") || "";
            let method = GetJsonVal(props, "method") || "get";
            let async = GetJsonVal(props, "async") || true;
            let responseType = GetJsonVal(props, "responseType") || null;
            let timeout = GetJsonVal(props, "timeout") || 0;
            let withCredentials = GetJsonVal(props, "withCredentials") || false;
            let headers = GetJsonVal(props, "headers") || {};
            let mime = GetJsonVal(props, "mime") || "text/xml";
            let onabort = GetJsonVal(props, "onabort") || null;
            let onerror = GetJsonVal(props, "onerror") || null;
            let onload = GetJsonVal(props, "onload") || null;
            let onloadend = GetJsonVal(props, "onloadend") || null;
            let onloadstart = GetJsonVal(props, "onloadstart") || null;
            let onprogress = GetJsonVal(props, "onprogress") || null;
            let onupload = GetJsonVal(props, "onupload") || null;
            let ontimeout = GetJsonVal(props, "ontimeout") || null;
            this.xhr = new XMLHttpRequest();
            if (method.toLowerCase() === "get") {
                let qs = Object.keys(data)
                    .map((key) => key + "=" + data[key])
                    .join("&");
                url += url.indexOf("?") < 0 ? "?" + qs : "&" + qs;
            }
            this.xhr.open(method, url, async);
            for (let h in headers)
                this.xhr.setRequestHeader(h, headers[h]);
            this.xhr.overrideMimeType(mime);
            if (responseType)
                this.xhr.responseType = responseType;
            this.xhr.timeout = timeout;
            this.xhr.withCredentials = withCredentials;
            if (onabort)
                this.xhr.onabort = onabort.bind(this);
            if (onerror)
                this.xhr.onerror = onerror.bind(this);
            if (onload)
                this.xhr.onload = onload.bind(this);
            if (onloadend)
                this.xhr.onloadend = onloadend.bind(this);
            if (onloadstart)
                this.xhr.onloadstart = onloadstart.bind(this);
            if (onprogress)
                this.xhr.onprogress = onprogress.bind(this);
            if (onupload)
                this.xhr.upload.onprogress = onupload.bind(this);
            if (ontimeout)
                this.xhr.ontimeout = ontimeout.bind(this);
            this.xhr.send(data);
        }
        get readyState() { return this.xhr.readyState; }
        get response() { return this.xhr.response; }
        get responseType() { return this.xhr.responseType; }
        get responseText() { return this.xhr.responseText; }
        get responseURL() { return this.xhr.responseURL; }
        get responseXML() { return this.xhr.responseXML; }
        get status() { return this.xhr.status; }
        get statusText() { return this.xhr.statusText; }
        abort() {
            this.xhr.abort();
        }
        responseHeaders() {
            let headers = {};
            let str = this.xhr.getAllResponseHeaders();
            let arr = str.split("\n");
            for (let a of arr) {
                let i = a.indexOf(":");
                let k = a.slice(0, i).trim();
                let v = a.slice(i + 1).trim();
                if (headers[k]) {
                    if (!Array.isArray(headers[k]))
                        headers[k] = [headers[k]];
                    headers[k].push(v);
                }
                else if (k) {
                    headers[k] = v;
                }
            }
            return headers;
        }
    }

    var LoadQueue_1;
    function ImageLoader(data, next) {
        let image = new Image();
        if (data.crossOrigin)
            image.crossOrigin = "Anonymous";
        image.onload = function (e) {
            let target = e.target;
            target.onload = target.onerror = target.onabort = null;
            next("load", target);
        };
        image.onerror = image.onabort = function (e) {
            let target = e.target;
            target.onload = target.onerror = target.onabort = null;
            next("error", e);
        };
        image.src = data.src + (data.noCache ? (data.src.indexOf("?") === -1 ? "?" : "&") + "t=" + NowDate() : "");
    }
    function ScriptLoader(data, next) {
        let src = data.src;
        let script = document.createElement("script");
        if (data.noCache)
            src += (src.indexOf("?") === -1 ? "?" : "&") + "t=" + NowDate();
        if (data.id)
            script.id = data.id;
        script.type = "text/javascript";
        script.async = true;
        script.src = src;
        script.onload = function (e) {
            let target = e.target;
            target.onload = target.onerror = null;
            next("load", target);
        };
        script.onerror = function (e) {
            let target = e.target;
            target.onload = target.onerror = null;
            next("error", e);
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    function AudioLoader(data, next) {
        let src = data.src;
        if (data.noCache)
            src += (src.indexOf("?") === -1 ? "?" : "&") + "t=" + NowDate();
        new Ajax({
            "url": src,
            "responseType": "arraybuffer",
            "onload": function (e) {
                let target = e.target;
                target.onload = target.onerror = null;
                next("load", target.response);
            },
            "onerror": function (e) {
                let target = e.target;
                target.onload = target.onerror = null;
                next("error", e);
            },
        });
    }
    class LoadQueueEvent extends Event {
        constructor(props = {}) {
            super(props);
            this.type = GetJsonVal(props, "type") || "";
            this.source = GetJsonVal(props, "source") || null;
        }
    }
    let LoadQueue = LoadQueue_1 = class LoadQueue {
        constructor(source = {}) {
            this._source = [];
            this._currentIndex = -1;
            this._connections = 0;
            this._loaded = 0;
            this.maxConnections = 2;
            EventEmitterMixins.CTOR(this);
            source && this.add(source);
        }
        get loaded() { return this._loaded; }
        get total() { return this._source.length; }
        _getLoader(item) {
            if (!item.loader) {
                switch (item.type) {
                    case "img":
                        item.loader = ImageLoader;
                        break;
                    case "js":
                        item.loader = ScriptLoader;
                        break;
                    case "audio":
                        item.loader = AudioLoader;
                        break;
                }
            }
            return item.loader;
        }
        _loadNext() {
            let self = this;
            let source = self._source;
            if (self._loaded >= source.length) {
                self.emit(new LoadQueueEvent({ type: LoadQueue_1.COMPLETE, target: self }));
                return;
            }
            if (self._currentIndex < source.length - 1 && self._connections < self.maxConnections) {
                let index = ++self._currentIndex;
                let item = source[index];
                let loader = self._getLoader(item);
                let next = function (type, value) {
                    if (type === LoadQueue_1.LOAD || type === LoadQueue_1.ERROR) {
                        item.loaded = type === LoadQueue_1.LOAD ? true : false;
                        item.content = value;
                        self._connections--;
                        self._loaded++;
                        self.emit(new LoadQueueEvent({ type: type, target: self, source: [item] }));
                        self._loadNext();
                    }
                };
                if (loader)
                    self._connections++;
                self._loadNext();
                loader && loader(item, next);
            }
        }
        start() {
            this._loadNext();
            return this;
        }
        add(source) {
            this._source = this._source.concat(source);
            return this;
        }
        getSource(id) {
            let source = this._source;
            for (let i = 0; i < source.length; i++) {
                let item = source[i];
                if (item.id === id || item.src === id)
                    return item;
            }
            return null;
        }
        removeContent(id) {
            let source = this._source;
            for (let i = 0; i < source.length; i++) {
                let item = source[i];
                if (item.id === id || item.src === id) {
                    source.splice(i, 1);
                    return true;
                }
            }
            return false;
        }
    };
    LoadQueue.COMPLETE = "complete";
    LoadQueue.LOAD = "load";
    LoadQueue.ERROR = "error";
    LoadQueue = LoadQueue_1 = __decorate([
        MixinsClassDecorator([EventEmitterMixins])
    ], LoadQueue);

    class Ticker {
        constructor(fps = 60) {
            this._isRAF = false;
            this._paused = false;
            this._tickers = [];
            this._targetFPS = 0;
            this._measuredFPS = 0;
            this._interval = 0;
            this._intervalId = null;
            this._lastTime = 0;
            this._tickCount = 0;
            this._tickTime = 0;
            this._targetFPS = fps;
            this._interval = 1000 / this._targetFPS;
        }
        get measuredFPS() { return Global_Math.min(this._measuredFPS, this._targetFPS); }
        _tick() {
            if (this._paused)
                return;
            let startTime = NowDate();
            let deltaTime = startTime - this._lastTime;
            if (++this._tickCount >= this._targetFPS) {
                this._measuredFPS = (1000 / (this._tickTime / this._tickCount) + 0.5) >> 0;
                this._tickCount = 0;
                this._tickTime = 0;
            }
            else {
                this._tickTime += deltaTime;
            }
            this._lastTime = startTime;
            let tickersCopy = this._tickers.slice(0);
            for (let i = 0, len = tickersCopy.length; i < len; i++) {
                tickersCopy[i].tick({ deltaTime });
            }
        }
        start(useRAF) {
            if (this._intervalId)
                return;
            let self = this;
            let runLoop = null;
            let raf = Global_Win.requestAnimationFrame;
            useRAF = useRAF !== false;
            this._lastTime = NowDate();
            if (useRAF && raf && this._interval < 17) {
                this._isRAF = useRAF;
                runLoop = function () {
                    self._intervalId = raf(runLoop);
                    self._tick();
                };
            }
            else {
                runLoop = function () {
                    self._intervalId = Global_Win.setTimeout(runLoop, self._interval);
                    self._tick();
                };
            }
            this._paused = false;
            runLoop();
        }
        stop() {
            if (this._isRAF) {
                Global_Win.cancelAnimationFrame(this._intervalId);
            }
            else {
                Global_Win.clearTimeout(this._intervalId);
            }
            this._intervalId = null;
            this._lastTime = 0;
            this._paused = true;
        }
        pause() {
            this._paused = true;
        }
        resume() {
            this._paused = false;
        }
        addTick(tickObject) {
            if (!tickObject || typeof tickObject.tick !== "function") {
                throw new Error("Ticker: The tick object must implement the tick method.");
            }
            this._tickers.push(tickObject);
        }
        removeTick(tickObject) {
            let tickers = this._tickers;
            let index = tickers.indexOf(tickObject);
            if (index >= 0)
                tickers.splice(index, 1);
        }
        nextTick(callback) {
            let self = this;
            let tickObj = {
                "tick": function (tickParam) {
                    self.removeTick(tickObj);
                    callback(tickParam);
                }
            };
            self.addTick(tickObj);
            return tickObj;
        }
        timeoutTick(callback, duration) {
            let self = this;
            let targetTime = NowDate() + duration;
            let tickObj = {
                tick: function (tickParam) {
                    if (NowDate() - targetTime >= 0) {
                        self.removeTick(tickObj);
                        callback(tickParam);
                    }
                },
            };
            self.addTick(tickObj);
            return tickObj;
        }
        interval(callback, duration) {
            let targetTime = NowDate() + duration;
            let tickObj = {
                tick: function (tickParam) {
                    let nowTime = NowDate(), dt = nowTime - targetTime;
                    if (dt >= 0) {
                        if (dt < duration)
                            nowTime -= dt;
                        targetTime = nowTime + duration;
                        callback(tickParam);
                    }
                },
            };
            this.addTick(tickObj);
            return tickObj;
        }
    }

    let PI$1 = Global_Math.PI;
    let HALFPI = PI$1 * 0.5;
    let Sin$1 = Global_Math.sin;
    let Cos$1 = Global_Math.cos;
    let Pow$1 = Global_Math.pow;
    let Sqrt$1 = Global_Math.sqrt;
    let Asin$1 = Global_Math.asin;
    let Ease = {
        linear: function (x) {
            return x;
        },
        quad: {
            easeIn: function (x) {
                return x * x;
            },
            easeOut: function (x) {
                return -x * (x - 2);
            },
            easeInOut: function (x) {
                return (x *= 2) < 1 ? 0.5 * x * x : -0.5 * (--x * (x - 2) - 1);
            },
        },
        cubic: {
            easeIn: function (x) {
                return x * x * x;
            },
            easeOut: function (x) {
                return --x * x * x + 1;
            },
            easeInOut: function (x) {
                return (x *= 2) < 1 ? 0.5 * x * x * x : 0.5 * ((x -= 2) * x * x + 2);
            },
        },
        quart: {
            easeIn: function (x) {
                return x * x * x * x;
            },
            easeOut: function (x) {
                return -(--x * x * x * x - 1);
            },
            easeInOut: function (x) {
                return (x *= 2) < 1 ? 0.5 * x * x * x * x : -0.5 * ((x -= 2) * x * x * x - 2);
            },
        },
        quint: {
            easeIn: function (x) {
                return x * x * x * x * x;
            },
            easeOut: function (x) {
                return (x = x - 1) * x * x * x * x + 1;
            },
            easeInOut: function (x) {
                return (x *= 2) < 1 ? 0.5 * x * x * x * x * x : 0.5 * ((x -= 2) * x * x * x * x + 2);
            },
        },
        sine: {
            easeIn: function (x) {
                return -Cos$1(x * HALFPI) + 1;
            },
            easeOut: function (x) {
                return Sin$1(x * HALFPI);
            },
            easeInOut: function (x) {
                return -0.5 * (Cos$1(PI$1 * x) - 1);
            },
        },
        expo: {
            easeIn: function (x) {
                return x === 0 ? 0 : Pow$1(2, 10 * (x - 1));
            },
            easeOut: function (x) {
                return x === 1 ? 1 : -Pow$1(2, -10 * x) + 1;
            },
            easeInOut: function (x) {
                if (x === 0 || x === 1)
                    return x;
                if ((x *= 2) < 1)
                    return 0.5 * Pow$1(2, 10 * (x - 1));
                return 0.5 * (-Pow$1(2, -10 * (x - 1)) + 2);
            },
        },
        circ: {
            easeIn: function (x) {
                return -(Sqrt$1(1 - x * x) - 1);
            },
            easeOut: function (x) {
                return Sqrt$1(1 - --x * x);
            },
            easeInOut: function (x) {
                if ((x /= 0.5) < 1)
                    return -0.5 * (Sqrt$1(1 - x * x) - 1);
                return 0.5 * (Sqrt$1(1 - (x -= 2) * x) + 1);
            },
        },
        elastic: {
            props: {
                a: 1,
                p: 0.4,
                s: 0.1,
                config: function (amplitude, period) {
                    Ease.elastic.props.a = amplitude;
                    Ease.elastic.props.p = period;
                    Ease.elastic.props.s = (period / (2 * PI$1)) * Asin$1(1 / amplitude) || 0;
                },
            },
            easeIn: function (x) {
                return -(Ease.elastic.props.a *
                    Pow$1(2, 10 * (x -= 1)) *
                    Sin$1(((x - Ease.elastic.props.s) * (2 * PI$1)) / Ease.elastic.props.p));
            },
            easeOut: function (x) {
                return (Ease.elastic.props.a * Pow$1(2, -10 * x) * Sin$1(((x - Ease.elastic.props.s) * (2 * PI$1)) / Ease.elastic.props.p) + 1);
            },
            easeInOut: function (x) {
                return (x *= 2) < 1
                    ? -0.5 *
                        (Ease.elastic.props.a *
                            Pow$1(2, 10 * (x -= 1)) *
                            Sin$1(((x - Ease.elastic.props.s) * (2 * PI$1)) / Ease.elastic.props.p))
                    : Ease.elastic.props.a *
                        Pow$1(2, -10 * (x -= 1)) *
                        Sin$1(((x - Ease.elastic.props.s) * (2 * PI$1)) / Ease.elastic.props.p) *
                        0.5 +
                        1;
            },
        },
        bounce: {
            easeIn: function (x) {
                return 1 - Ease.bounce.easeOut(1 - x);
            },
            easeOut: function (x) {
                if ((x /= 1) < 0.36364) {
                    return 7.5625 * x * x;
                }
                else if (x < 0.72727) {
                    return 7.5625 * (x -= 0.54545) * x + 0.75;
                }
                else if (x < 0.90909) {
                    return 7.5625 * (x -= 0.81818) * x + 0.9375;
                }
                else {
                    return 7.5625 * (x -= 0.95455) * x + 0.984375;
                }
            },
            easeInOut: function (x) {
                return x < 0.5 ? Ease.bounce.easeIn(x * 2) * 0.5 : Ease.bounce.easeOut(x * 2 - 1) * 0.5 + 0.5;
            },
        },
        back: {
            props: {
                o: 1.70158,
                s: 2.59491,
                config: function (overshoot) {
                    Ease.back.props.o = overshoot;
                    Ease.back.props.s = overshoot * 1.525;
                },
            },
            easeIn: function (x) {
                return x * x * ((Ease.back.props.o + 1) * x - Ease.back.props.o);
            },
            easeOut: function (x) {
                return (x = x - 1) * x * ((Ease.back.props.o + 1) * x + Ease.back.props.o) + 1;
            },
            easeInOut: function (x) {
                return (x *= 2) < 1
                    ? 0.5 * (x * x * ((Ease.back.props.s + 1) * x - Ease.back.props.s))
                    : 0.5 * ((x -= 2) * x * ((Ease.back.props.s + 1) * x + Ease.back.props.s) + 2);
            },
        },
    };

    let PI = Global_Math.PI;
    let Sin = Global_Math.sin;
    let Cos = Global_Math.cos;
    let Abs = Global_Math.abs;
    let Pow = Global_Math.pow;
    let Sqrt = Global_Math.sqrt;
    let Asin = Global_Math.asin;
    let EaseSports = {
        linear(t, b, c, d) {
            return (c * t) / d + b;
        },
        quad: {
            easeIn(t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOut(t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOut(t, b, c, d) {
                if ((t /= d / 2) < 1)
                    return (c / 2) * t * t + b;
                return (-c / 2) * (--t * (t - 2) - 1) + b;
            },
        },
        cubic: {
            easeIn(t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOut(t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOut(t, b, c, d) {
                if ((t /= d / 2) < 1)
                    return (c / 2) * t * t * t + b;
                return (c / 2) * ((t -= 2) * t * t + 2) + b;
            },
        },
        quart: {
            easeIn(t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOut(t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOut(t, b, c, d) {
                if ((t /= d / 2) < 1)
                    return (c / 2) * t * t * t * t + b;
                return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
            },
        },
        quint: {
            easeIn(t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOut(t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOut(t, b, c, d) {
                if ((t /= d / 2) < 1)
                    return (c / 2) * t * t * t * t * t + b;
                return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
            },
        },
        sine: {
            easeIn(t, b, c, d) {
                return t === d ? b + c : -c * Cos((t / d) * (PI / 2)) + c + b;
            },
            easeOut(t, b, c, d) {
                return c * Sin((t / d) * (PI / 2)) + b;
            },
            easeInOut(t, b, c, d) {
                return (-c / 2) * (Cos((PI * t) / d) - 1) + b;
            },
        },
        expo: {
            easeIn(t, b, c, d) {
                return t === 0 ? b : c * Pow(2, 10 * (t / d - 1)) + b;
            },
            easeOut(t, b, c, d) {
                return t === d ? b + c : c * (-Pow(2, (-10 * t) / d) + 1) + b;
            },
            easeInOut(t, b, c, d) {
                if (t === 0)
                    return b;
                if (t === d)
                    return b + c;
                if ((t /= d / 2) < 1)
                    return (c / 2) * Pow(2, 10 * (t - 1)) + b;
                return (c / 2) * (-Pow(2, -10 * --t) + 2) + b;
            },
        },
        circ: {
            easeIn(t, b, c, d) {
                return -c * (Sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOut(t, b, c, d) {
                return c * Sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOut(t, b, c, d) {
                if ((t /= d / 2) < 1)
                    return (-c / 2) * (Sqrt(1 - t * t) - 1) + b;
                return (c / 2) * (Sqrt(1 - (t -= 2) * t) + 1) + b;
            },
        },
        elastic: {
            easeIn(t, b, c, d) {
                let s = 1.70158;
                let p = 0;
                let a = c;
                if (t === 0)
                    return b;
                if ((t /= d) === 1)
                    return b + c;
                if (!p)
                    p = d * 0.3;
                if (a < Abs(c)) {
                    a = c;
                    s = p / 4;
                }
                else {
                    s = (p / (2 * PI)) * Asin(c / a);
                }
                return -(a * Pow(2, 10 * (t -= 1)) * Sin(((t * d - s) * (2 * PI)) / p)) + b;
            },
            easeOut(t, b, c, d) {
                let s = 1.70158;
                let p = 0;
                let a = c;
                if (t === 0)
                    return b;
                if ((t /= d) === 1)
                    return b + c;
                if (!p)
                    p = d * 0.3;
                if (a < Abs(c)) {
                    a = c;
                    s = p / 4;
                }
                else {
                    s = (p / (2 * PI)) * Asin(c / a);
                }
                return a * Pow(2, -10 * t) * Sin(((t * d - s) * (2 * PI)) / p) + c + b;
            },
            easeInOut(t, b, c, d) {
                let s = 1.70158;
                let p = 0;
                let a = c;
                if (t === 0)
                    return b;
                if ((t /= d / 2) === 2)
                    return b + c;
                if (!p)
                    p = d * (0.3 * 1.5);
                if (a < Abs(c)) {
                    a = c;
                    s = p / 4;
                }
                else {
                    s = (p / (2 * PI)) * Asin(c / a);
                }
                if (t < 1)
                    return -0.5 * (a * Pow(2, 10 * (t -= 1)) * Sin(((t * d - s) * (2 * PI)) / p)) + b;
                return a * Pow(2, -10 * (t -= 1)) * Sin(((t * d - s) * (2 * PI)) / p) * 0.5 + c + b;
            },
        },
        bounce: {
            easeIn(t, b, c, d) {
                return c - EaseSports.bounce.easeOut(d - t, 0, c, d) + b;
            },
            easeOut(t, b, c, d) {
                if ((t /= d) < 1 / 2.75) {
                    return c * (7.5625 * t * t) + b;
                }
                else if (t < 2 / 2.75) {
                    return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
                }
                else if (t < 2.5 / 2.75) {
                    return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
                }
                else {
                    return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
                }
            },
            easeInOut(t, b, c, d) {
                if (t < d / 2)
                    return EaseSports.bounce.easeIn(t * 2, 0, c, d) * 0.5 + b;
                return EaseSports.bounce.easeOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
            },
        },
        back: {
            easeIn(t, b, c, d, s = 1.70158) {
                return t === d ? b + c : c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOut(t, b, c, d, s = 1.70158) {
                return t === 0 ? b : c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOut(t, b, c, d, s = 1.70158) {
                if ((t /= d / 2) < 1)
                    return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
                return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
            },
        },
    };

    let NodeDefault = {
        "x": 0,
        "y": 0,
        "height": 0,
        "width": 0,
        "alpha": 0,
        "background": "",
        "anchor": [0, 0],
        "rotate": 0,
        "scale": [0, 0],
        "skew": [0, 0],
        "transform": [1, 0, 0, 1, 0, 0],
    };
    class Tween {
        constructor(props = {}) {
            this._startTime = 0;
            this._seekTime = 0;
            this._pausedTime = 0;
            this._pausedStartTime = 0;
            this._reverseFlag = 1;
            this._repeatCount = 0;
            this._next = null;
            this._isStart = false;
            this._isComplete = false;
            this.time = 0;
            this.target = props.target;
            this.fromProps = GetJsonVal(props, "fromProps", 2) || null;
            this.toProps = GetJsonVal(props, "toProps", 2) || null;
            this.duration = GetJsonVal(props, "duration") || 1000;
            this.delay = GetJsonVal(props, "delay") || 0;
            this.paused = GetJsonVal(props, "paused") || false;
            this.loop = GetJsonVal(props, "loop") || false;
            this.reverse = GetJsonVal(props, "reverse") || false;
            this.repeat = GetJsonVal(props, "repeat") || 0;
            this.repeatDelay = GetJsonVal(props, "repeatDelay") || 0;
            this.ease = GetJsonVal(props, "ease") || Ease.linear;
            this.onStart = GetJsonVal(props, "onStart") || null;
            this.onUpdate = GetJsonVal(props, "onUpdate") || null;
            this.onComplete = GetJsonVal(props, "onComplete") || null;
            this.onDestroyed = GetJsonVal(props, "onDestroyed") || null;
        }
        static add(tween) {
            let tweens = Tween._tweens;
            if (tweens.indexOf(tween) === -1)
                tweens.push(tween);
            return Tween;
        }
        static fromto(props) {
            let tween = new Tween(props);
            tween.start();
            return tween;
        }
        static remove(tweenOrTarget) {
            let tweens = Tween._tweens;
            if (tweenOrTarget instanceof Tween) {
                let i = tweens.indexOf(tweenOrTarget);
                if (i > -1)
                    tweens.splice(i, 1);
            }
            else {
                for (let i = 0; i < tweens.length; i++) {
                    if (tweens[i].target === tweenOrTarget) {
                        tweens.splice(i, 1);
                        i--;
                    }
                }
            }
            return Tween;
        }
        static removeAll() {
            Tween._tweens.length = 0;
            return Tween;
        }
        static tick() {
            let tweens = Tween._tweens;
            for (let i = 0; i < tweens.length; i++) {
                let tween = tweens[i];
                if (tween && tween.update(NowDate())) {
                    tweens.splice(i, 1);
                    i--;
                    tween.onDestroyed && tween.onDestroyed.call(tween);
                }
            }
            return Tween;
        }
        get isStart() {
            return this._isStart;
        }
        get isComplete() {
            return this._isComplete;
        }
        _renderFromTo(ratio) {
            let target = this.target;
            let fromProps = this.fromProps;
            let toProps = this.toProps;
            for (let p in fromProps)
                target[p] = fromProps[p] + (toProps[p] - fromProps[p]) * ratio;
        }
        setProps(fromProps = null, toProps = null) {
            let propNames = fromProps || toProps;
            if (propNames) {
                let newFromProps = fromProps || this.target;
                let newToProps = toProps || this.target;
                let nodeTweenDefault = Clone(NodeDefault, true);
                this.fromProps = {};
                this.toProps = {};
                for (let p in propNames) {
                    this.toProps[p] = newToProps[p] || nodeTweenDefault[p];
                    this.target[p] = this.fromProps[p] = newFromProps[p] || nodeTweenDefault[p];
                }
            }
            return this;
        }
        start() {
            this._startTime = NowDate() + this.delay;
            this._seekTime = 0;
            this._pausedTime = 0;
            this._reverseFlag = 1;
            this._repeatCount = 0;
            this.paused = false;
            this._isStart = false;
            this._isComplete = false;
            Tween.add(this);
            return this;
        }
        stop() {
            Tween.remove(this);
            return this;
        }
        pause() {
            this.paused = true;
            this._pausedStartTime = NowDate();
            return this;
        }
        resume() {
            this.paused = false;
            if (this._pausedStartTime)
                this._pausedTime += NowDate() - this._pausedStartTime;
            this._pausedStartTime = 0;
            return this;
        }
        seek(time, pause = false) {
            let current = NowDate();
            this._startTime = current;
            this._seekTime = time;
            this._pausedTime = 0;
            if (pause)
                this.paused = pause;
            this.update(current, true);
            Tween.add(this);
            return this;
        }
        link(tween, isDuration = false) {
            let delay = tween.delay;
            let startTime = this._startTime;
            tween._startTime = isDuration ? startTime + this.duration + delay : startTime + delay;
            this._next = tween;
            Tween.remove(tween);
            return tween;
        }
        update(time, forceUpdate = false) {
            if (this.paused && !forceUpdate)
                return false;
            if (this._isComplete)
                return true;
            let elapsed = time - this._startTime - this._pausedTime + this._seekTime;
            if (elapsed < 0)
                return false;
            let ratio = elapsed / this.duration;
            ratio = ratio <= 0 ? 0 : ratio >= 1 ? 1 : ratio;
            let easeRatio = this.ease(ratio);
            if (this.reverse && this._isStart) {
                if (this._reverseFlag < 0) {
                    ratio = 1 - ratio;
                    easeRatio = 1 - easeRatio;
                }
                if (ratio < 1e-7) {
                    if ((this.repeat > 0 && this._repeatCount++ >= this.repeat) || (this.repeat === 0 && !this.loop)) {
                        this._isComplete = true;
                    }
                    else {
                        this._startTime = NowDate();
                        this._pausedTime = 0;
                        this._reverseFlag *= -1;
                    }
                }
            }
            if (!this._isStart) {
                this.setProps(this.fromProps, this.toProps);
                this._isStart = true;
                this.onStart && this.onStart.call(this);
            }
            this.time = elapsed;
            this._renderFromTo(easeRatio);
            this.onUpdate && this.onUpdate.call(this, easeRatio);
            if (ratio >= 1) {
                if (this.reverse) {
                    this._startTime = NowDate();
                    this._pausedTime = 0;
                    this._reverseFlag *= -1;
                }
                else if (this.loop || (this.repeat > 0 && this._repeatCount++ < this.repeat)) {
                    this._startTime = NowDate() + this.repeatDelay;
                    this._pausedTime = 0;
                }
                else
                    this._isComplete = true;
            }
            let next = this._next;
            if (next && next.time <= 0) {
                if (next._startTime > 0 && next._startTime <= time) {
                    next._renderFromTo(ratio);
                    next.time = elapsed;
                    Tween.add(next);
                }
                else if (this._isComplete && (next._startTime < 0 || next._startTime > time))
                    next.start();
            }
            if (this._isComplete) {
                this.onComplete && this.onComplete.call(this);
                return true;
            }
            return false;
        }
    }
    Tween._tweens = [];

    var app = {
        Quickly,
        Global,
        "display": {
            Camera,
            Node,
            Container,
            Particle,
            ParticleSystem,
            Drawable,
            TextureAtlas,
            Bitmap,
            BitmapText,
            Button,
            Graphics,
            Sprite,
            Text,
            Stage
        },
        "event": {
            Event,
            EventEmitter_Mixins: EventEmitterMixins,
        },
        "geom": {
            Matrix,
            Polygon,
            Rectangle,
            Vector,
        },
        "media": {
            WebAudio,
        },
        "net": {
            Ajax,
        },
        "resource": {
            LoadQueue,
        },
        "system": {
            Ticker,
        },
        "tween": {
            Ease,
            EaseSports,
            Tween,
        },
        "util": {
            Browser,
            Util,
            PerfMon,
        }
    };

    return app;

}));
//# sourceMappingURL=Fastly.js.map
