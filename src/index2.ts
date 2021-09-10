import { readFileSync } from "fs"

// var validJSON = JSON.stringify({
//     str: '"', num: 111, bruh: "jj\\   \"  \\", keep: " keep string    whitespace    "
// })


// TODO:
// Fix breaking on object in obj
// Add array support
// Add empty object support

var validJSON2 = readFileSync("json.txt", {encoding: "utf-8"})

// console.trace(validJSON)
// console.trace(JSON.parse(validJSON))

var whitespace = [
    " ",
    "\n",
] 

var escapeable = [
    '"',
    "n",
    "b",
    "f",
    "r",
    "t",
    "u"
]

enum ValueType {
    OBJECT= "OBJECT", 
    ARRAY= "ARRAY" ,
    STRING= "STRING", 
    NUMBER= "NUMBER" ,
}

var numbers = ["0","1","2","3","4","5","6","7","8","9"]

// removeWhitespace(validJSON)

const _parse = (input: string) =>  {

    input = Parser.removeWhitespace(input)

    // input in format can be gone over
    const inputArr = input.split("")
    
    for (let pos = 0; pos < inputArr.length; pos++) {
        const character = inputArr[pos];

        // ignore whitespace
        if (whitespace.indexOf(character) === -1) {
            // first char should be { or ]
            if (character === "{") {
                // find corresponding } 
                var charsCP = [...inputArr]
                charsCP.splice(0, pos + 1)
                console.trace(charsCP)
                var endLocation = findEndofObj(charsCP) + pos
                console.trace(endLocation)
                var obj = inputArr.slice(pos, endLocation + 1)
                console.trace({obj})
                Parser.parseJSONObject(obj.join(""))
            } else if (character === "[") {
                console.trace("found array")
            }
        }

        
    }
}

const _parse2 = (input: string) =>  {
    
    input = Parser.removeWhitespace(input)
    console.log(input.length)
    // input in format can be gone over
    const inputArr = input.split("")
    
    var character = input[0]
    var pos = 0
    if (character === "{") {
        // find corresponding } 
        var charsCP = [...inputArr]
        charsCP.splice(0, pos + 1)
        var endLocation = findEndofObj2(charsCP.join("")) + pos
        console.trace(endLocation)
        var obj = inputArr.slice(pos, endLocation + 1)
        console.trace({obj})
        Parser.parseJSONObject(obj.join(""))
    } else if (character === "[") {
        console.trace("found array")
    }

        
}

// provide chars[] with first { removed
const findEndofObj = (charsIn: Array<string>): number => {
    var level = 0
    var inString = false
    var endPos = 0
    // add empty item to start to prevent error with checking for escaped strings
    var chars = [" ", ...charsIn]
    var escapeNext = false
    for (let i = 0; i < chars.length; i++) {
        var justEscaped = false
        const char = chars[i];
        // console.trace(char)

        if (char === "\\" && !escapeNext) {
            escapeNext = true
            justEscaped = true
        } 
        else if (char === '"' && !escapeNext) inString = !inString 
        else if (char === "{" && !inString) {
            level += 1
            console.trace("going up")
        }
        else if (char === "}" && !inString) {
            level -= 1
            console.trace("going down")
        }
        if (char === "}" && !inString && level === 0) {
            endPos = i; 
            console.trace("end")
            break
        }

        if (!justEscaped && escapeNext) escapeNext = false

    }
    
    console.trace({level, inString, endPos})
    return endPos
}

const findEndofObj2 = (input: string) => {
    // looks like {"a": "b", "c": {"d": "e"}}
    console.trace(input)
    if (input[0] != "{") throw new Error()  
    var level = 0
    var escaped = false
    var endChar = 0
    for (let i = 0; i < input.split("").length; i++) {
        const character = input.split("")[i];
        var justEscaped = false

        if (!escaped) {
            if (character === "\\" ) {
                escaped = true
                justEscaped = true
            } else if (character === "{") {
                level += 1
            } else if (character === "}") {
                level -= 1
            }
        }

        if (level === 0) {
            endChar = i
            break
        }

        if (!justEscaped && escaped) {
            escaped = false
        }
    }
    return endChar
}

class Parser {

    static parse = (input: string) => {
        var type = Parser.determineType(input[0])
        
        let foundComma = false
        let valueData: any = ""
        if (type === ValueType.NUMBER) {
            var output = ""
            for (let i = 0; i < input.split("").length; i++) {
                const element = input.split("") [i];
                output += element
            }
            return Number(output)
        } else if (type === ValueType.STRING) {
            var [endPos, output] = Parser.findEndOfString(input.split(""))
            return String(output)

        } else if (type === ValueType.OBJECT) {
            var end = Parser.findEndOfObject(input)
            var objString = input.slice(0, end+1)
            console.log(objString)
        } else if (type === ValueType.ARRAY) {

        }
    }
    
    static removeWhitespace = (input: string) => {
        var outputArr = []
        var inString = false
        const inputArr = ["", ...input.split("")]
        var escapeNext = false
        for (let i = 0; i < inputArr.length; i++) {
            const character = inputArr[i];
            // console.trace(whitespace.indexOf(character))
            var keep = true
            if (escapeNext) {
                escapeNext = false
            }
    
            else if (character === "\\" && !escapeNext) {
                escapeNext = true
            } 
            else if (character === '"' && !escapeNext) {
                    inString = !inString
            }
            else if (!inString && whitespace.indexOf(character) !== -1) {
                keep = false
            }
            
    
            if (keep) outputArr.push(character)
            
        }
    
        return outputArr.join("")
    }

    static determineType = (input: string) => {
        // provide a string and get out what it is
        // eg provide "qweqe" and get string
        // provide 1231 and get number
        if (input[0] === "[") return ValueType.ARRAY
        else if (input[0] === "{") return ValueType.OBJECT
        else if (input[0] === '"') return ValueType.STRING
        else if (numbers.indexOf(input[0]) != -1) return ValueType.NUMBER
        else {
            throw new Error("Cant determine type of value :(")
        }
    }

    // TODO: redo
    static parseJSONObject = (input: string) => {
        // FOR NOW expect it to only contain whitespace within strings
        /**
         * looks like {
         *  "key": value
         * }
         */
        // console.trace(input)
        var obj: any = {}
        var inputArr = input.split("")
        // remove start and end {}
        inputArr = inputArr.slice(1, inputArr.length-1)
        var kvPairs = []
        // console.trace(inputArr)

        // Get key value pairs 
        var inString = false
        var escapeNext = false
        var expectKey = true
        var expectValue = false

        var currKVPair = []
        for (let i = 0; i < inputArr.length; i++) {
            // console.trace({i, value : inputArr[i]})
            const character = inputArr[i];
            if (character === '"' && !escapeNext && expectKey) {
                console.trace("next is a key")
                inString = true
                var [shift, keyName] = Parser.findEndOfString(inputArr.slice(i, inputArr.length))
                // console.trace({shift, keyName})
                i += shift
                expectKey = false
                expectValue = true
                currKVPair.push(keyName)
                console.trace(keyName)
            } else if (character === ":") {
                console.trace("next is a value")
                var type = Parser.determineType(inputArr[i+1])
                console.trace(type)
                
                let foundComma = false
                let valueData: any = ""
                if (type === ValueType.NUMBER) {
                    let position = i
                    while (!foundComma) {
                        position +=1
                        let char = inputArr[position]
                        if (char === ",") foundComma = true
                    }
                    var numStr = inputArr.slice(i+1, position).join("") 
                    i = position
                    // TODO PARSE properly
                    valueData = Number(numStr)
                    
                } else if (type === ValueType.STRING) {
                    var [loc, value] = Parser.findEndOfString(inputArr.slice(i+1, inputArr.length))
                    // console.trace({loc, value})
                    i += loc+1
                    valueData = value

                } else if (type === ValueType.OBJECT) {
                    // TODO still broken
                    // console.trace(inputArr.slice(i+1, inputArr.length))
                    var endPos = findEndofObj2(inputArr.slice(i+1, inputArr.length+1).join(""))
                    console.trace(i+endPos)
                    console.trace(inputArr[i+endPos])
                    // console.trace(inputArr.slice(1, inputArr.length))
                    
                    // i += endPos
                    // TODO PARSE properly
                    // valueData = inputArr.slice(i+1, endPos).join("")
                    // console.trace({valueData})
                    i += 16
                } else if (type === ValueType.ARRAY) {
                    // TODO add array support
                }

                // i++
                currKVPair.push(valueData)
                kvPairs.push(currKVPair)
                currKVPair = []
                console.trace(valueData)
                expectValue = false
                expectKey = true
            }
        }
        console.trace({kvPairs})
        // add to obj
        kvPairs.forEach(pair => {
            obj[pair[0]] = pair[1]
        });

        console.trace(obj)

        return obj
    }

    
    static findEndOfString = (input: string[]): [number, string] => {
        var foundEndQuote = false
        var value = ""
        var escapeNext = false
        var i = 0
        while (i < input.length && !foundEndQuote ) {
            let justEscaped = false
            i = i+1
            var char = input[i]
            if (char === "\\" && !escapeNext) {
                escapeNext = true
                justEscaped = true
            } 
            if (!escapeNext &&  char === '"') {
                foundEndQuote = true
            } else {
                value += char
            }
            
            if (!justEscaped) {
                escapeNext = false
            }
        }

        return [i, value]
    }

    static findEndOfObject = (input: string) => {
        // looks like {"a": "b", "c": {"d": "e"}}
        console.log(input.length)
        if (input[0] != "{") throw new Error()  
        var level = 0
        var escaped = false
        var endChar = 0
        for (let i = 0; i < input.length; i++) {
            const character = input[i];
            var justEscaped = false

            if (!escaped) {
                if (character === "\\" ) {
                    escaped = true
                    justEscaped = true
                } else if (character === "{") {
                    level += 1
                } else if (character === "}") {
                    level -= 1
                }
            }

            if (level === 0) {
                endChar = i
                break
            }

            if (!justEscaped && escaped) {
                escaped = false
            }
        }
        return endChar
    }

}

// _parse2(validJSON2) 
// console.trace('{"a": "b", "c": {"ddd": "e"}}'.length)
// console.trace(findEndofObj2('{"a": "b", "c": {"ddd": "e"}}'))

console.log(Parser.parse(Parser.removeWhitespace(validJSON2)))

export default {
    parse: _parse
}

