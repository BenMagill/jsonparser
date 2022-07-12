/**
 * Extensions
 * 
 * name()
 */

const debug_print = true;
function debug(...args: any[]) {
    if (debug_print) {
        console.log(...args)
    }
} 

function throwUnexpectedCharError(store: InputStore) {
    throw new Error(`Unexpected char ${store.getCurrentChar()} at position ${store.index-1}`)
}

const constants = {
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
        if (this.data[this.index+1]) {
            return true;
        } else {
            return false;
        }
    }

    getNextNonWhitespace() {
        let i = this.index;
        while (i < this.data.length) {
            const char = this.data[i++]
            console.log(char)
            if (whitespace.includes(char)) {
                debug('skipping whitespace')
                continue;
            } else {
                this.index = i;
                return char;
            }
        }
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

    console.log(char)
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

    } else if (/[a-zA-Z]/.test(char)) {
        // char is constant or extension
    } else {
        debug(`unknown char: ${char}`)
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

// TODO not working
function parseArray(store: InputStore) {
    let output: any[] = [];
    while (true) {        
        let char = store.getNextNonWhitespace();
    
        if (char === `]`) {
            break;
        } else if (char === `,` && output.length !== 0) {
            char = store.getNextNonWhitespace()
        }

        const value = parseValue(store)

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
    
        // console.log(char)
    
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

        console.log(keyName)

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

// const input = `"deoweod"  `;
// const input = `["valie", "val2", 202]`;
// const input = `{"key": "value" , "key2" : "value2", "obj": {"in": "out"}}`;
const input = `["hello"]`;

console.log(`
::::::::debug::::::::
`)
const result = run(input)

console.log(`
::::::::Output::::::::
`)
console.log(result)
