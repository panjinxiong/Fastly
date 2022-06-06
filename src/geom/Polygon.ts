import { Global_Math } from "@/@global/Global";
import { Vector_FmtJson } from "@/geom/Vector";

type FmtArr = Vector_FmtJson[];

/**
 * 多边形碰撞检测
 * @param x x点
 * @param y y点
 * @param poly 所有点碰撞检测
 * @return 是否碰撞
 * @example
    ```
    Point(
        10, 100,
        [{ x: 150, y: 50 }, { x: 237, y: 100 }, { x: 187, y: 187 }, { x: 100, y: 137 }]
    );
    ```
 **/
function PointContains(x: number, y: number, poly: FmtArr): boolean {
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
    if (y < minY || y > maxY) continue;

    // 斜率公式：x = yk + b; k = (y2 - y1) / (x2 - x1);
    let nx = (y - p1.y) * ((p2.x - p1.x) / (p2.y - p1.y)) + p1.x;

    // 只统计单边交点，即点的正向方向
    if (nx > x) cross++;
    else if (nx == x) onBorder = true;

    // 当射线和多边形相交
    if (p1.x > x && p1.y == y) {
      let p0 = poly[(len + i - 1) % len]; // 上一个点

      // 当交点的两边在射线两旁
      if ((p0.y < y && p2.y > y) || (p0.y > y && p2.y < y)) {
        cross++;
      }
    }
  }

  return onBorder || cross % 2 == 1;
}

/**
 * 两个多边形碰撞检测
 * @param poly1 所有点碰撞检测
 * @param poly2 所有点碰撞检测
 * @return 是否碰撞
 **/
function PolyContains(poly1: FmtArr, poly2: FmtArr): boolean {
  let result = PolyContains.doSATCheck(poly1, poly2, {
    overlap: -Infinity,
    normal: { x: 0, y: 0 },
  });

  if (result) return PolyContains.doSATCheck(poly2, poly1, result);

  return false;
}
PolyContains.doSATCheck = function (poly1: FmtArr, poly2: FmtArr, result: any): boolean {
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
      if (dot > max1) max1 = dot;
      else if (dot < min1) min1 = dot;
    }
    min2 = max2 = poly2[0].x * normal.x + poly2[0].y * normal.y;
    for (let j = 1; j < len2; j++) {
      dot = poly2[j].x * normal.x + poly2[j].y * normal.y;
      if (dot > max2) max2 = dot;
      else if (dot < min2) min2 = dot;
    }
    if (min1 < min2) {
      overlap = min2 - max1;
      normal.x = -normal.x;
      normal.y = -normal.y;
    } else {
      overlap = min1 - max2;
    }

    if (overlap >= 0) {
      return false;
    } else if (overlap > result.overlap) {
      result.overlap = overlap;
      result.normal.x = normal.x;
      result.normal.y = normal.y;
    }
  }

  return result;
};

export {
  FmtArr as Polygon_FmtArr,
  PointContains as Polygon_PointContains,
  PolyContains as Polygon_PolyContains
}
