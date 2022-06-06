import path from "path";
import * as Package from "./package.json";
import resolvePlugin from "@rollup/plugin-node-resolve"; // 解析 node_modules 中的模块
import commonjs from "rollup-plugin-commonjs"; // 转换 CJS -> ESM
import json from "@rollup/plugin-json"; // json 文件中导入数据
import { terser } from "rollup-plugin-terser"; // 压缩
import ts from '@rollup/plugin-typescript'; // ts 转换
import clear from "rollup-plugin-clear"; // 清理文件

const Resolve = (p) => path.resolve(__dirname, p);
const ENV = process.env.NODE_ENV; // production | development
const OutputDir = "dist";
let FileName = Package.info.name;
let FileSuffix = ".js";
let Sourcemap = true;
let Terser = false;
let ClearArrs = [];
function OutputPath() { return `${OutputDir}/${FileName}${FileSuffix}` };

switch (ENV) {
  case "production":
    FileSuffix = ".min" + FileSuffix;
    ClearArrs.push(Resolve(OutputPath()));
    Sourcemap = false;
    Terser = true;
    break;
  case "development":
    ClearArrs.push(Resolve(OutputPath()));
    ClearArrs.push(Resolve(`${OutputPath()}.map`));
    break;
}

export default {
  input: Resolve(`src/app.ts`),
  output: {
    format: "umd", // iife | amd | umd | cjs | esm
    name: FileName,
    file: Resolve(OutputPath()),
    sourcemap: Sourcemap
  },
  plugins: [
    clear({ targets: ClearArrs }),
    resolvePlugin(),
    commonjs(),
    json(),
    ts({ tsconfig: Resolve("tsconfig.json") }),
    Terser && terser()
  ],
  watch: {
    include: "src/**",
    exclude: "node_modules/**"
  }
};
