import { Global_Math } from "@/@global/Global";

let PI = Global_Math.PI;
let Sin = Global_Math.sin;
let Cos = Global_Math.cos;
let Abs = Global_Math.abs;
let Pow = Global_Math.pow;
let Sqrt = Global_Math.sqrt;
let Asin = Global_Math.asin;

/**
 * 缓动->运动型
 * @param t 当前时间
 * @param b 初始值
 * @param c 变化值
 * @param d 持续时间
 * @param s 过冲时间，此值数值越大，过冲越大
 * @explain 运动型：时间、距离
 **/
let EaseSports = {
  linear(t: number, b: number, c: number, d: number): number {
    return (c * t) / d + b;
  },
  quad: {
    easeIn(t: number, b: number, c: number, d: number): number {
      return c * (t /= d) * t + b;
    },
    easeOut(t: number, b: number, c: number, d: number): number {
      return -c * (t /= d) * (t - 2) + b;
    },
    easeInOut(t: number, b: number, c: number, d: number): number {
      if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
      return (-c / 2) * (--t * (t - 2) - 1) + b;
    },
  },
  cubic: {
    easeIn(t: number, b: number, c: number, d: number): number {
      return c * (t /= d) * t * t + b;
    },
    easeOut(t: number, b: number, c: number, d: number): number {
      return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOut(t: number, b: number, c: number, d: number): number {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
      return (c / 2) * ((t -= 2) * t * t + 2) + b;
    },
  },
  quart: {
    easeIn(t: number, b: number, c: number, d: number): number {
      return c * (t /= d) * t * t * t + b;
    },
    easeOut(t: number, b: number, c: number, d: number): number {
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOut(t: number, b: number, c: number, d: number): number {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t + b;
      return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
    },
  },
  quint: {
    easeIn(t: number, b: number, c: number, d: number): number {
      return c * (t /= d) * t * t * t * t + b;
    },
    easeOut(t: number, b: number, c: number, d: number): number {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOut(t: number, b: number, c: number, d: number): number {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
      return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
    },
  },
  sine: {
    easeIn(t: number, b: number, c: number, d: number): number {
      return t === d ? b + c : -c * Cos((t / d) * (PI / 2)) + c + b;
    },
    easeOut(t: number, b: number, c: number, d: number): number {
      return c * Sin((t / d) * (PI / 2)) + b;
    },
    easeInOut(t: number, b: number, c: number, d: number): number {
      return (-c / 2) * (Cos((PI * t) / d) - 1) + b;
    },
  },
  expo: {
    easeIn(t: number, b: number, c: number, d: number): number {
      return t === 0 ? b : c * Pow(2, 10 * (t / d - 1)) + b;
    },
    easeOut(t: number, b: number, c: number, d: number): number {
      return t === d ? b + c : c * (-Pow(2, (-10 * t) / d) + 1) + b;
    },
    easeInOut(t: number, b: number, c: number, d: number): number {
      if (t === 0) return b;
      if (t === d) return b + c;
      if ((t /= d / 2) < 1) return (c / 2) * Pow(2, 10 * (t - 1)) + b;
      return (c / 2) * (-Pow(2, -10 * --t) + 2) + b;
    },
  },
  circ: {
    easeIn(t: number, b: number, c: number, d: number): number {
      return -c * (Sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOut(t: number, b: number, c: number, d: number): number {
      return c * Sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOut(t: number, b: number, c: number, d: number): number {
      if ((t /= d / 2) < 1) return (-c / 2) * (Sqrt(1 - t * t) - 1) + b;
      return (c / 2) * (Sqrt(1 - (t -= 2) * t) + 1) + b;
    },
  },
  elastic: {
    easeIn(t: number, b: number, c: number, d: number): number {
      let s = 1.70158;
      let p = 0;
      let a = c;
      if (t === 0) return b;
      if ((t /= d) === 1) return b + c;
      if (!p) p = d * 0.3;
      if (a < Abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = (p / (2 * PI)) * Asin(c / a);
      }
      return -(a * Pow(2, 10 * (t -= 1)) * Sin(((t * d - s) * (2 * PI)) / p)) + b;
    },
    easeOut(t: number, b: number, c: number, d: number): number {
      let s = 1.70158;
      let p = 0;
      let a = c;
      if (t === 0) return b;
      if ((t /= d) === 1) return b + c;
      if (!p) p = d * 0.3;
      if (a < Abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = (p / (2 * PI)) * Asin(c / a);
      }
      return a * Pow(2, -10 * t) * Sin(((t * d - s) * (2 * PI)) / p) + c + b;
    },
    easeInOut(t: number, b: number, c: number, d: number): number {
      let s = 1.70158;
      let p = 0;
      let a = c;
      if (t === 0) return b;
      if ((t /= d / 2) === 2) return b + c;
      if (!p) p = d * (0.3 * 1.5);
      if (a < Abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = (p / (2 * PI)) * Asin(c / a);
      }
      if (t < 1) return -0.5 * (a * Pow(2, 10 * (t -= 1)) * Sin(((t * d - s) * (2 * PI)) / p)) + b;
      return a * Pow(2, -10 * (t -= 1)) * Sin(((t * d - s) * (2 * PI)) / p) * 0.5 + c + b;
    },
  },
  bounce: {
    easeIn(t: number, b: number, c: number, d: number): number {
      return c - EaseSports.bounce.easeOut(d - t, 0, c, d) + b;
    },
    easeOut(t: number, b: number, c: number, d: number): number {
      if ((t /= d) < 1 / 2.75) {
        return c * (7.5625 * t * t) + b;
      } else if (t < 2 / 2.75) {
        return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
      } else if (t < 2.5 / 2.75) {
        return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
      } else {
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
      }
    },
    easeInOut(t: number, b: number, c: number, d: number): number {
      if (t < d / 2) return EaseSports.bounce.easeIn(t * 2, 0, c, d) * 0.5 + b;
      return EaseSports.bounce.easeOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    },
  },
  back: {
    easeIn(t: number, b: number, c: number, d: number, s: number = 1.70158): number {
      return t === d ? b + c : c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOut(t: number, b: number, c: number, d: number, s: number = 1.70158): number {
      return t === 0 ? b : c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOut(t: number, b: number, c: number, d: number, s: number = 1.70158): number {
      if ((t /= d / 2) < 1) return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
      return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    },
  },
};

export {
  EaseSports
}
