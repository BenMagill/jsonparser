import { numbers, ValueType } from "./index"

export default (input: string) => {
    if (input[0] === "[") return ValueType.ARRAY
    else if (input[0] === "{") return ValueType.OBJECT
    else if (input[0] === '"') return ValueType.STRING
    else if (numbers.indexOf(input[0]) != -1) return ValueType.NUMBER
    else if (/[a-zA-z][a-zA-Z0-9]+\(/.test(input)) return ValueType.EXTENSION
    else {
        throw new Error("Cant determine type of value :(")
    }

}