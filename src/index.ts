/**
 * JSON parser
 * FEATURES
 *  - support for extensions to parse and stringify fields in certain ways
 *      -  when parsing : checks included extensions first when uses preincluded parsers
 *      -  when stringifying : check data using extensions first then use defaults
 *          if is a class or object being parsed check if a function .stringify() exists on it. 
 *          if so run this to get the output for the extension
 *          extensions could use instanceof to see if the class should be stringified 
 * 
 * Setup:
 *  var json2 = new JSON2([
 *      extensions go here
 *  ])
 * 
 *  var parsed = json2.parse(string)
 * 
 *  var string = json2.toString(data)
 * 
 *  extensions I will include 
 *  - objectId parsing for mongodb
 *      if input is a valid objectid when stringify will store as ObjectId(value)
 *      if value starts with ObjectId(value) when parsing will run Mongodb.ObjectId(value)
 * 
 *  inbuild parsers and validators 
 *  - string
 *  - number
 *  - array 
 *  - object
 *  - extension
 * 
 */

// TODO move all parsers from seperate files to within this class

export const numbers = ["0","1","2","3","4","5","6","7","8","9"]

export enum ValueType {
    OBJECT= "OBJECT", 
    ARRAY= "ARRAY",
    STRING= "STRING", 
    NUMBER= "NUMBER",
    EXTENSION="EXTENSION"
}

export type Extension = {
    parse: Function,
    stringify: Function,
    name: string,
    canStringify: Function
}

export type ExtensionInternal = {
    parse: Function,
    stringify: Function,
}

export class JSON2 {
    options = {}
    extensions: {
        [key: string]: ExtensionInternal;
    } = {}

    constructor(options?: Object, extensions?: Extension[]) {
        this.options = options || this.options

        if (extensions) {
            extensions.forEach(extension => {
                if (extension.parse && extension.stringify) {
                    this.extensions[extension.name] = {
                        parse: extension.parse,
                        stringify: extension.stringify,
                    }
                }
            });
        }
    }

    parse(input: string) {
        const type = this.getType(input)

        switch (type) {
            case ValueType.STRING:
                return this._string.parse(input)
            case ValueType.NUMBER:
                return this._number.parse(input)
            case ValueType.ARRAY:
                return this._string.parse(input)
            case ValueType.OBJECT:
                return this._string.parse(input)
            case ValueType.EXTENSION:
                return this._extension.parse(input)
        
            default:
                break;
        }
    }

    stringify(data: any) {

    }

    getType(input: string) {
        if (input[0] === "[") return ValueType.ARRAY
        else if (input[0] === "{") return ValueType.OBJECT
        else if (input[0] === '"') return ValueType.STRING
        else if (numbers.indexOf(input[0]) != -1) return ValueType.NUMBER
        else if (/[a-zA-z][a-zA-Z0-9]+\(/.test(input)) return ValueType.EXTENSION
        else {
            throw new Error("Cant determine type of value :(")
        }
    }

    getEndOf(str: string): number {
        const type = this.getType(str)

        switch (type) {
            case ValueType.STRING:
                return this._string.getEnd(str)
            case ValueType.NUMBER:
                return this._number.getEnd(str)
            case ValueType.ARRAY:
                return this._string.getEnd(str)
            case ValueType.OBJECT:
                return this._string.getEnd(str)
            case ValueType.EXTENSION:
                return this._extension.getEnd(str)
        
            default:
                return str.length
        }
    }

    _string = {
        parse: function(input: string) {
            const inputArr = input.split("")
            var foundEndQuote = false
            var value = ""
            var escapeNext = false
            var i = 0
            while (i < inputArr.length && !foundEndQuote ) {
                let justEscaped = false
                i = i+1
                var char = inputArr[i]
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
            return value
        },
        getEnd: function(input: string) {
            const inputArr = input.split("")
            var foundEndQuote = false
            var value = ""
            var escapeNext = false
            var i = 0
            while (i < inputArr.length && !foundEndQuote ) {
                let justEscaped = false
                i = i+1
                var char = inputArr[i]
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

            return i
        }
    }

    _number = {
        parse: function(input: string) {
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
        },
        getEnd: function(input: string) {
            return input.indexOf(",")-1
        }
    }

    _extension = {
        parse: (input: string): any => {
            const [extensionName, ...rest] = input.split("(")
            console.log({extensionName})
            let restStr = rest.join("(").substring(0, rest.join("(").length-1)
            console.log({restStr})
            console.log(this)
            const extensionArgs = [];

            if (restStr[restStr.length-1] !== ",") restStr += ","
            while (restStr.length > 0) {
                const endOfParam = this.getEndOf(restStr);
                const data = restStr.slice(0, endOfParam+1)
                restStr = restStr.slice(endOfParam+1, restStr.length)
                if (restStr[0]  === ",") restStr = restStr.substring(1).trim()
                extensionArgs.push(this.parse(data))
            }
            // const data = this.parse(restStr)
            // console.log({data})
            console.log({extensionName, extensionArgs})
            return this.extensions[extensionName].parse(...extensionArgs)
        },
        getEnd: (str: string) => {
            // TODO
            return 0
        }
    }

    _array = {
        parse: () => {

        },
        getEnd: () => {

        }
    }

    _object = {
        parse: () => {

        },
        getEnd: () => {

        }
    }
    
}

export default JSON2
