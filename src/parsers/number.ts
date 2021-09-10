import { numbers } from "..";

const parse = (input: string) => {
    const inputArr = input.split("")
    var output = ""
    for (let i = 0; i < inputArr.length; i++) {
        const num = inputArr[i];
        if(numbers.includes(num)) {
            output += num
        } else {
            throw new Error(`Invalid number ${input}`)
        }
    }
    return Number(output)
}

export default {
    parse
}