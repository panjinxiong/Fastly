import { Global_Math } from "@/@global/Global";

type Fn = (x: number) => number;

let PI = Global_Math.PI;
let HALFPI = PI * 0.5;
let Sin = Global_Math.sin;
let Cos = Global_Math.cos;
let Pow = Global_Math.pow;
let Sqrt = Global_Math.sqrt;
let Asin = Global_Math.asin;

/**
 * 缓动->经典型
 * @explain 经典型：二维图（x,y轴图）x、y
 **/
let Ease = {
  /**
   * 线性匀速缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  linear: function (x: number): number {
    return x;
  },
  /**
   * 二次缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  quad: {
    easeIn: function (x: number): number {
      return x * x;
    },
    easeOut: function (x: number): number {
      return -x * (x - 2);
    },
    easeInOut: function (x: number): number {
      return (x *= 2) < 1 ? 0.5 * x * x : -0.5 * (--x * (x - 2) - 1);
    },
  },
  /**
   * 三次缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  cubic: {
    easeIn: function (x: number): number {
      return x * x * x;
    },
    easeOut: function (x: number): number {
      return --x * x * x + 1;
    },
    easeInOut: function (x: number): number {
      return (x *= 2) < 1 ? 0.5 * x * x * x : 0.5 * ((x -= 2) * x * x + 2);
    },
  },
  /**
   * 四次缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  quart: {
    easeIn: function (x: number): number {
      return x * x * x * x;
    },
    easeOut: function (x: number): number {
      return -(--x * x * x * x - 1);
    },
    easeInOut: function (x: number): number {
      return (x *= 2) < 1 ? 0.5 * x * x * x * x : -0.5 * ((x -= 2) * x * x * x - 2);
    },
  },
  /**
   * 五次缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  quint: {
    easeIn: function (x: number): number {
      return x * x * x * x * x;
    },
    easeOut: function (x: number): number {
      return (x = x - 1) * x * x * x * x + 1;
    },
    easeInOut: function (x: number): number {
      return (x *= 2) < 1 ? 0.5 * x * x * x * x * x : 0.5 * ((x -= 2) * x * x * x * x + 2);
    },
  },
  /**
   * 正弦缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  sine: {
    easeIn: function (x: number): number {
      return -Cos(x * HALFPI) + 1;
    },
    easeOut: function (x: number): number {
      return Sin(x * HALFPI);
    },
    easeInOut: function (x: number): number {
      return -0.5 * (Cos(PI * x) - 1);
    },
  },
  /**
   * 指数缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  expo: {
    easeIn: function (x: number): number {
      return x === 0 ? 0 : Pow(2, 10 * (x - 1));
    },
    easeOut: function (x: number): number {
      return x === 1 ? 1 : -Pow(2, -10 * x) + 1;
    },
    easeInOut: function (x: number): number {
      if (x === 0 || x === 1) return x;
      if ((x *= 2) < 1) return 0.5 * Pow(2, 10 * (x - 1));
      return 0.5 * (-Pow(2, -10 * (x - 1)) + 2);
    },
  },
  /**
   * 圆形缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  circ: {
    easeIn: function (x: number): number {
      return -(Sqrt(1 - x * x) - 1);
    },
    easeOut: function (x: number): number {
      return Sqrt(1 - --x * x);
    },
    easeInOut: function (x: number): number {
      if ((x /= 0.5) < 1) return -0.5 * (Sqrt(1 - x * x) - 1);
      return 0.5 * (Sqrt(1 - (x -= 2) * x) + 1);
    },
  },
  /**
   * 弹性缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  elastic: {
    props: {
      a: 1,
      p: 0.4,
      s: 0.1,
      config: function (amplitude: number, period: number): void {
        Ease.elastic.props.a = amplitude;
        Ease.elastic.props.p = period;
        Ease.elastic.props.s = (period / (2 * PI)) * Asin(1 / amplitude) || 0;
      },
    },
    easeIn: function (x: number): number {
      return -(
        Ease.elastic.props.a *
        Pow(2, 10 * (x -= 1)) *
        Sin(((x - Ease.elastic.props.s) * (2 * PI)) / Ease.elastic.props.p)
      );
    },
    easeOut: function (x: number): number {
      return (
        Ease.elastic.props.a * Pow(2, -10 * x) * Sin(((x - Ease.elastic.props.s) * (2 * PI)) / Ease.elastic.props.p) + 1
      );
    },
    easeInOut: function (x: number): number {
      return (x *= 2) < 1
        ? -0.5 *
        (Ease.elastic.props.a *
          Pow(2, 10 * (x -= 1)) *
          Sin(((x - Ease.elastic.props.s) * (2 * PI)) / Ease.elastic.props.p))
        : Ease.elastic.props.a *
        Pow(2, -10 * (x -= 1)) *
        Sin(((x - Ease.elastic.props.s) * (2 * PI)) / Ease.elastic.props.p) *
        0.5 +
        1;
    },
  },
  /**
   * 弹跳缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  bounce: {
    easeIn: function (x: number): number {
      return 1 - Ease.bounce.easeOut(1 - x);
    },
    easeOut: function (x: number): number {
      if ((x /= 1) < 0.36364) {
        return 7.5625 * x * x;
      } else if (x < 0.72727) {
        return 7.5625 * (x -= 0.54545) * x + 0.75;
      } else if (x < 0.90909) {
        return 7.5625 * (x -= 0.81818) * x + 0.9375;
      } else {
        return 7.5625 * (x -= 0.95455) * x + 0.984375;
      }
    },
    easeInOut: function (x: number): number {
      return x < 0.5 ? Ease.bounce.easeIn(x * 2) * 0.5 : Ease.bounce.easeOut(x * 2 - 1) * 0.5 + 0.5;
    },
  },
  /**
   * 向后缓动函数
   * @param x x轴值
   * @return y轴值
   **/
  back: {
    props: {
      o: 1.70158,
      s: 2.59491,
      config: function (overshoot: number): void {
        Ease.back.props.o = overshoot;
        Ease.back.props.s = overshoot * 1.525;
      },
    },
    easeIn: function (x: number): number {
      return x * x * ((Ease.back.props.o + 1) * x - Ease.back.props.o);
    },
    easeOut: function (x: number): number {
      return (x = x - 1) * x * ((Ease.back.props.o + 1) * x + Ease.back.props.o) + 1;
    },
    easeInOut: function (x: number): number {
      return (x *= 2) < 1
        ? 0.5 * (x * x * ((Ease.back.props.s + 1) * x - Ease.back.props.s))
        : 0.5 * ((x -= 2) * x * ((Ease.back.props.s + 1) * x + Ease.back.props.s) + 2);
    },
  },
};

export {
  Fn as Ease_Fn,
  Ease
}
