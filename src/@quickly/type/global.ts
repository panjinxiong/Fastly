interface Json { [k: string]: any; }
interface JsonType<T> { [k: string]: T; }

export {
  Json,
  JsonType
}
