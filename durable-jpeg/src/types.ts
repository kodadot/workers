export type Value = string
export type KeyValue = Map<string, Value>
export type Optional<T> = T | undefined
export type KeyValueRequest = {
  key: string,
  value: Value
}
export type KeyValueObject = Record<string, Value>
