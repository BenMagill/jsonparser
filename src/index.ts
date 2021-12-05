export enum ValueType {
    OBJECT= "OBJECT", 
    ARRAY= "ARRAY",
    STRING= "STRING", 
    NUMBER= "NUMBER",
    EXTENSION="EXTENSION",
    CONSTANT="CONSTANT",
    UNKNOWN="UNKNOWN"
}

export type Extension = {
    parse: Function,
    stringify: Function,
    isValid: Function,
    name: string,
}

export type ExtensionInternal = {
    parse: Function,
    stringify: Function,
    isValid: Function,
}

type Extensions = {
    [ExtensionName: string]: ExtensionInternal;
}

type InternalParseResult<T = any> = [T, number];

const numbers = ["0","1","2","3","4","5","6","7","8","9"]

const whitespace = [
    " ",
    "\u0020",
    "\u000A",
    "\u000D",
    "\u0009",
]

const controlCharacters = [
    "\"",
    "\\",
    "/",
    "b",
    "f",
    "n",
    "r",
    "t",
    // TODO if the below then the next 4 chars after are important
    "u"
]

const constants: any = {
    "true": true,
    "false": false,
    "null": null
}

class UnexpectedCharError extends Error {
    constructor(character: string, poition: number) {
        super(`Unexpected character ${character} at position ${poition}`);
        this.name = "UnexpectedCharacter"
      }
}

export class JSONX {
    options = {
        // Insert default options here
        ignoreBrokenExtension: true,
         
    }

    extensions: Extensions = {
        Test1: {
            parse: (...args: any) => {
                console.log(args)
                return args
            },
            stringify: () => {

            },
            isValid: () => {
                
            }
        }
    }

    constructor(options: Object = {}, extensions?: Extension[]) {
        this.options = { ...this.options, ...options }

        if (extensions) {
            extensions.forEach(extension => {
                if (extension.parse && extension.stringify && extension.name) {
                    this.extensions[extension.name] = {
                        parse: extension.parse,
                        stringify: extension.stringify,
                        isValid: extension.isValid,
                    }
                } else {
                    if (!this.options.ignoreBrokenExtension) {
                        throw new Error(`Extension "${extension.name}" is missing properties`);
                    }
                }
            });
        }
    }

    getType(charsArr: string[]) {
        const chars = charsArr.join("");
        console.log(chars)
        if (chars[0] === "[") return ValueType.ARRAY
        else if (chars[0] === "{") return ValueType.OBJECT
        else if (chars[0] === '"') return ValueType.STRING
        // Starts with numbers
        else if (/^[0-9]/.test(chars)) return ValueType.NUMBER
        // Starts with letters then a bracket
        else if (/[a-zA-Z][a-zA-Z0-9]*\(/.test(chars)) return ValueType.EXTENSION
        else if (/^[a-zA-Z]*/.test(chars)) return ValueType.CONSTANT
        return ValueType.UNKNOWN
    }

    // These will return that data and how many chars to move forward
    parsers = {
        string: (chars: string[], currIndex: number): InternalParseResult<string>  => {
            var output = ""
            // First char will be " so skip
            var index = 1
            while (index < chars.length) {
                const char = chars[index++]
                if (char === "\\") {
                    // TODO handle escape characters better (should handle unicode characters)
                    output+= "\\" + chars[index++]
                } else if (char === '"') {
                    return [output, index]
                } else {
                    output+=char
                }
            }
            // TODO if gets to end and no " then error
            throw Error("unexpected EOF")
            return ["", 0]
        },
        number: (chars: string[], currIndex: number): InternalParseResult<number>  => {
            // TODO this need to be improved a lot to follow the spec
            var index = 0;
            var output = ""
            while (index < chars.length) {
                const char = chars[index++]
                if (numbers.includes(char)) {
                    output += char
                } else {
                    return [Number(output), --index]
                }
            }
            return [Number(output), index]
        },
        object: (chars: string[], currIndex: number): InternalParseResult<object> => {
            // Skip assumed { and then whitespace
            var index = this.skipWhitespace(chars.slice(1))+1;
            var output: any = {}
            console.log(index)

            while (index < chars.length) {
                index+=this.skipWhitespace(chars.slice(index))
                const char = chars[index++]
                // Expect a string for the key
                if (char === '"') {
                    index--
                    const [key, skip] = this.parsers.string(chars.slice(index), index)
                    console.log({key, skip})
                    index+=skip
                    // get next characters index, ignoring whitespace
                    index+=this.skipWhitespace(chars.slice(index))
                    if (chars[index] !== ":") {
                        throw new UnexpectedCharError(chars[index], currIndex+index)
                    }
                    index++
                    // skip whitespace again
                    index+=this.skipWhitespace(chars.slice(index))

                    // Parse the value
                    const [value, valueSkip] = this.parseInternal(chars.slice(index))
                    console.log({value, valueSkip})
                    output[key] = value

                    index+=valueSkip
                    index+=this.skipWhitespace(chars.slice(index))
                    const char = chars[index++]
                    if ( char === ",") {
                        // go for another round
                    } else if (char === "}") {
                        // end of object
                        return [output, index+1]
                    } else {
                        throw new UnexpectedCharError(char, currIndex+index)
                    }

                    console.log(chars.slice(index))
                } else if (char === "}") {
                    // end of object
                    return [output, index+1]
                } else {
                    // unexpected {char} at pos
                    throw new UnexpectedCharError(char, currIndex+index)
                }
            }
            return [{}, 0]
        },
        array: (chars: string[], currIndex: number): InternalParseResult<any[]> => {
            var index = this.skipWhitespace(chars.slice(1))+1;
            var output: any[] = []

            while (index < chars.length) {
                console.log(chars.slice(index).join(""))
                const [data, skip] = this.parseInternal(chars.slice(index))
                console.log({data, skip})
                output.push(data)
                index+=skip
                index+=this.skipWhitespace(chars.slice(index))
                const char = chars[index++]
                console.log(char)

                if (char === "]") {
                    return [output, index]
                } else if (char !== ",") {
                    throw new UnexpectedCharError(char, currIndex+index-1)
                }
                // expect a , 
                index+=this.skipWhitespace(chars.slice(index))
            }

            return [[], 0]
        },
        // TODO finsh later
        extension: (chars: string[], currIndex: number): InternalParseResult<unknown> => {
            var index = this.skipWhitespace(chars.slice(1));
            var name = ""
            while (index < chars.length) {
                const char = chars[index++]
                if (/[a-zA-Z\d]+/.test(char)) {
                    name += char
                } else if (char === "(") {
                    var parameters = []
                    // check extension exists
                    if (!this.extensions[name]) {
                        // TODO create proper error
                        throw new Error("No extension with name " + name)
                    } 
                    // Start parsing data
                    while (index < chars.length) {
                        index+=this.skipWhitespace(chars.slice(index))
                        if (chars[index] === ")") {
                            // execute extension (its already been checked if it exists)
                            return [this.extensions[name].parse(...parameters), ++index]
                        }
                        console.log(chars.slice(index).join(""))
                        const [data, skip] = this.parseInternal(chars.slice(index))
                        console.log({data, skip})
                        parameters.push(data)
                        index+=skip
                        index+=this.skipWhitespace(chars.slice(index))
                        const char = chars[index++]
                        console.log(char)
        
                        if (char === ")") {
                            // execute extension (its already been checked if it exists)
                            return [this.extensions[name].parse(...parameters), index]
                        } else if (char !== ",") {
                            throw new UnexpectedCharError(char, currIndex+index-1)
                        }
                        // expect a , 
                        index+=this.skipWhitespace(chars.slice(index))
                    }
                } else {
                    throw new UnexpectedCharError(char, currIndex+index-1)
                }
            }
            return [null, 0]
        },
        constant: (chars: string[], currIndex: number): InternalParseResult<any> => {
            var index = this.skipWhitespace(chars.slice(1));
            var name = ""
            while (index < chars.length) {
                const char = chars[index++]
                if (/[a-zA-Z\d]+/.test(char)) {
                    name += char
                } else {
                    return [constants[name], index]
                }
            }
            if (name in constants) {
                return [constants[name], index]
            } else {
                // TODO throw error 
                throw new UnexpectedCharError(chars[this.skipWhitespace(chars.slice(1))], currIndex+this.skipWhitespace(chars.slice(1)))
            }
        }
    }

    // Parse and allow for extra characters to be at the end
    parseInternal(chars: string[]): [any, number] {
        var pointer = 0;
        pointer+=this.skipWhitespace(chars)
        // now no whitespace at start
        var type = this.getType(chars.slice(pointer));

        // now parse
        console.log(type)
            
        if (type === ValueType.STRING) {
            return this.parsers.string(chars.slice(pointer), pointer)
        } else if (type === ValueType.NUMBER) {
            return this.parsers.number(chars.slice(pointer), pointer)
        } else if (type === ValueType.OBJECT) {
            return this.parsers.object(chars.slice(pointer), pointer)
        } else if (type === ValueType.ARRAY) {
            return this.parsers.array(chars.slice(pointer), pointer)
        } else if (type === ValueType.EXTENSION) {
            console.log("extension")
            return this.parsers.extension(chars.slice(pointer), pointer)
        } else if (type === ValueType.CONSTANT) {
            return this.parsers.constant(chars.slice(pointer), pointer)
        }

        // var length = chats.length
        // var type;
        // var output: any;
    
        // while (pointer < length) {
        //     var char = chars[pointer++]
            
        // }
        return [null, 0]
    }

    // Parser accessed by users
    parse(input: string) {
        const [data, pointer] = this.parseInternal(input.split(""))
        console.log({data, pointer})
        console.log(input.split("").length)
        if (pointer+this.skipWhitespace(input.split("").slice(pointer)) >= input.split("").length) {
            return data
        } else {
            throw new UnexpectedCharError(input.split("")[pointer+this.skipWhitespace(input.split("").slice(pointer))], pointer+this.skipWhitespace(input.split("").slice(pointer)))
        }
        // TODO ensure all characters consumed
    }

    skipWhitespace(chars: string[]) {
        var index = 0;
        while (whitespace.includes(chars[index])) {
            index += 1
        }
        return index
    }
    
}

// new JSONX().parse('"hi there"')
// console.log(new JSONX().parsers.string('"1"'.split(""), 0))
// console.log(new JSONX().parsers.number('123'.split(""), 0))
// console.log(new JSONX().parsers.object('{   "hi"   : 111, "key2": "value2"}    '.split(""), 0))
// console.log(new JSONX().parsers.object('{"a":1, "obj":"{}"}'.split(""), 0))
// console.log(new JSONX().parsers.array('["hello", "hi", 123, "hi"]'.split(""), 0))
// console.log(new JSONX().parsers.constant('false'.split(""), 0))
// console.log(new JSONX().parseInternal('{   "hi"   : 111, "key2": "value2"}    '.split("")))
// console.log(new JSONX().parsers.extension('Test1()'.split(""), 0))
// console.log(new JSONX().parse('Test1()'))