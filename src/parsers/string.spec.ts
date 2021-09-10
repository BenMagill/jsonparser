import stringParse from "./string";

describe('String parser', () => {
    it("will parse a string", () => {
        var input = `"string"`
        expect(stringParse.parse(input)).toBe("string")
    })

    it("will parse a string with escaped characters", () => {
        var input = `"string\\"\\"\\naaaa"`
        expect(stringParse.parse(input)).toBe('string\\"\\"\\naaaa')
    })

    it("will get the closing quote position", () => {
        expect(stringParse.getEnd(`"test"`)).toBe(5)
    })

    it("will get the closing quote position when includes escaped quotes", () => {
        expect(stringParse.getEnd(`"te\\"st"`)).toBe(7)
    })
});