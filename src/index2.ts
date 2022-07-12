const debug_print = true;
function debug(...args: any[]) {
    if (debug_print) {
        console.log(...args)
    }
} 

function throwUnexpectedCharError(store: InputStore) {
    throw new Error(`Unexpected char ${store.getCurrentChar()} at position ${store.index-1}`)
}

const constants: { [key: string]: any } = {
    "true": true,
    "false": false,
    "null": null
}

const whitespace = [
    " ",
    " ",
    "\n",
    "\u0020",
    "\u000A",
    "\u000D",
    "\u0009",
]

class UnprocessedExtension {
    name: string

    args: any[]

    constructor(name: string, args: any[]) {
        this.name = name
        this.args = args
    }
}

class InputStore {
    data: string[];
    index: number;

    constructor(input: string) {
        this.data = input.split('')
        this.index = 0;
    }

    getNextChar() {
        return this.data[this.index++];
    }

    getCurrentChar() {
        return this.data[this.index-1];
    }

    hasNext() {
        if (this.data[this.index]) {
            return true;
        } else {
            return false;
        }
    }

    getNextNonWhitespace() {
        let i = this.index;
        while (i < this.data.length) {
            const char = this.data[i++]
            if (whitespace.includes(char)) {
                debug('skipping whitespace')
                continue;
            } else {
                this.index = i;
                return char;
            }
        }
    }

    peekNextNonWhitespace() {
        let i = this.index;
        while (i < this.data.length) {
            const char = this.data[i++]
            if (whitespace.includes(char)) {
                debug('skipping whitespace')
                continue;
            } else {
                return char;
            }
        }
    }

    goBack() {
        this.index--
    }
}
function run(data: string, outer = true) {
    let output;

    const store = new InputStore(data);

    output = parseValue(store);

    if (store.getNextNonWhitespace()) {
        throwUnexpectedCharError(store)
    }

    return output;
}

// Parse any value
function parseValue(store: InputStore) {
    let output;
    const char = store.getNextNonWhitespace();

    if (!char) {
        return null
    } else if (char === `"`) {
        debug('parsing string')
        output = parseString(store)
    } else if (char === `[`) {
        // array
        output = parseArray(store)
    } else if (char === `{`) {
        output = parseObject(store)
    } else if (char === `-` || /[0-9]/.test(char)) {
        // number
        store.goBack()
        output = parseNumber(store)
    } else if (/[a-zA-Z]/.test(char)) {
        // char is constant or extension
        store.goBack()
        output = parseSomething(store)
    } else {
        // debug(`unknown char: ${char}`)
        throwUnexpectedCharError(store)
    }

    return output
}

function parseString(store: InputStore) {
    let output = '';
    while (true) {
        const char = store.getNextChar();
        // TODO check for escape chars
        if (char === `"`) {
            break;
        }
        else {
            output+=char
        }
    }
    return output;
}

function parseArray(store: InputStore, endChar = `]`) {
    let output: any[] = [];
    while (store.hasNext()) {        
        let char = store.peekNextNonWhitespace();

        if (char === endChar) {
            store.getNextNonWhitespace()
            console.log('end')
            break;
        } else if (char === `,` && output.length !== 0) {
            store.getNextNonWhitespace()
        }

        const value = parseValue(store)
        console.log(value)
        output.push(value)        
    }

    return output
}

function parseObject(store: InputStore) {
    let output: {
        [index: string]: any
    } = {};
    
    
    while (true) {        
        let char = store.getNextNonWhitespace();
    
        if (char === `}`) {
            break;
        } else if (char === `,` && Object.keys(output).length !== 0) {
            char = store.getNextNonWhitespace()
        }

        // getting a key value

        if (char !== `"`) {
            throwUnexpectedCharError(store)
        }

        const keyName = parseString(store)

        // find next non whitespace char
        const nextChar = store.getNextNonWhitespace();

        if (nextChar !== `:`) {
            throwUnexpectedCharError(store);
        }

        const value = parseValue(store);

        output[keyName] = value
    }

    return output;
}

function parseSomething(store: InputStore) {
    let word = '';
    let output;
    while (store.hasNext()) {
        const char = store.getNextChar();
        if (/[a-zA-Z0-9]/.test(char)) {
            word+=char
        } else if (char === `(` && word !== '') {
            // prevent an extension with constant name
            if (word in constants) {
                throw new Error(`Invalid extension name: ${word}`)
            }
            output = parseExtension(word, store) 
            break
        } else {
            if (word in constants) {
                output = constants[word];
                break
            } else {
                throw new Error(`Unknown constant `)
            }
        }
    }

    return output;
}

function parseExtension(name: string, store: InputStore) {
    const args = parseArray(store, `)`);

    // TODO check if extension exists, if so process, if not return name and args
    // should it be a class or pure object?
    return new UnprocessedExtension(name, args)
}

// TODO finish
function parseNumber(store: InputStore) {
    let buffer = ''
    while (store.hasNext()) {
        const char = store.getNextChar();
        console.log(char)
    }
}

// const input = `"deoweod"  `;
// const input = `["valie", "val2", 202]`;
// const input = `{"key": "value" , "key2" : "value2", "obj": {"in": "out"}}`;
// const input = `["hello", "fjdjd", {"test": "valu"} ]`;
// const input = ` null()  `
const input = `923`

console.log(`
::::::::debug::::::::
`)
const result = run(input)

console.log(`
::::::::Output::::::::
`)
console.log(result)
