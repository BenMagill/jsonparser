const parse = (input: string): string => {
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
}

const getEnd = (input: string) => {
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

export default {
    parse,
    getEnd
}

