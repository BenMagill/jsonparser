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

const constants = {
    "true": true,
    "false": false,
    "null": null
}

const whitespace = [
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
        return this.data[this.index];
    }

    hasNext() {
        if (this.data[this.index+1]) {
            return true;
        } else {
            return false;
        }
    }

}
function run(data: string, outer = true) {
    let output;

    const store = new InputStore(data);

    while (store.hasNext()) {
        const char = store.getNextChar();

        if (whitespace.includes(char)) {
            debug('skipping whitespace')
            continue;
        }
    
        // if have an output then shouldnt be anything after
        if (output) {
            throw Error(`unexpected char: ${char}`)
        }
        console.log(char)
    
        if (char === `"`) {
            debug('parsing string')
            output = parseString(store)
        } else if (char === `[`) {
            // array
        } else if (char === `{`) {
    
        } else if (char === `-` || /[0-9]/.test(char)) {

        } else if (/[a-zA-Z]/.test(char)) {
            // char is constant or extension
        } else {
            debug(`unknown char: ${char}`)
        }
    }

    return output;
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

const input = `"deoweod"   `;

console.log(`
::::::::debug::::::::
`)
const result = run(input)

console.log(`
::::::::Output::::::::
`)
console.log(result)
