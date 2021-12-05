import { JSONX } from "./index";

describe('JSON Parser', () => {
    describe('Constant', () => {
        it('should parse true', () => {
            expect(new JSONX().parse('true')).toBe(true)
        })
        it('should parse false', () => {
            expect(new JSONX().parse('false')).toBe(false)
        })
        it('should parse null', () => {
            expect(new JSONX().parse('null')).toBe(null)
        })
        it('should fail to parse random junk', () => {
            expect(() => {new JSONX().parse('dkwqodsdkal')}).toThrow()
        })
    });
    describe('Number', () => {
        it('should parse a basic number',  () => {
            expect(new JSONX().parse('123')).toBe(123)
        })
        it('should parse decimals',  () => {
            expect(new JSONX().parse('123.1')).toBe(123.1)
        })
        it('should parse a negative number',  () => {
            expect(new JSONX().parse('-44')).toBe(-44)
        })
        it('should parse an exponential number',  () => {
            expect(new JSONX().parse('22e+2')).toBe(22e+2)
        })
    });
    describe('String', () => {
        it('will parse an empty string', () => {
            expect(new JSONX().parse('""')).toBe("")
        });
        it('will parse a string', () => {
            expect(new JSONX().parse('"test"')).toBe("test")
        });
        it('will parse a string with escaped quote', () => {
            expect(new JSONX().parse('"test\\"test"')).toBe("test\\\"test")
        });
    });
    describe('Array', () => {
        it('will parse an empty array', () => {
            expect(new JSONX().parse('[]')).toStrictEqual([])
        });
        it('will parse an array with string', () => {
            expect(new JSONX().parse('[""]')).toStrictEqual([""])
        });
        it('will parse an array with number', () => {
            expect(new JSONX().parse('[1234]')).toStrictEqual([1234])
        });
        it('will parse an array with constant', () => {
            expect(new JSONX().parse('[true]')).toStrictEqual([true])
        });
        it('will parse an array with array', () => {
            expect(new JSONX().parse('[[""]]')).toStrictEqual([[""]])
        });
        it('will parse an array with object', () => {
            expect(new JSONX().parse('[{"test":"yes"}]')).toStrictEqual([{"test":"yes"}])
        });
        it('will parse an array with whitespace', () => {
            expect(new JSONX().parse('[ "" ]')).toStrictEqual([ "" ])
        });
        it('will parse an array with multiple items', () => {
            expect(new JSONX().parse('[ "test1", "test2" ]')).toStrictEqual([ "test1", "test2" ])
        });
    });
    describe('Object', () => {
        it('will parse an empty object', () => {
            expect(new JSONX().parse('{}')).toStrictEqual({})
        });
        it('will parse an object with values', () => {
            expect(new JSONX().parse('{"a":1, "obj":"{}"}')).toStrictEqual({"a":1, "obj":"{}"})
        });
        it('will parse an object with whitespace', () => {
            expect(new JSONX().parse('{ "a" : 1 , "obj" : { } }')).toStrictEqual({"a":1, "obj":{}})
        });
    });
    describe('Extension', () => {
        it('will parse an extension with no params', () => {
            expect(new JSONX().parse('Test1()')).toStrictEqual([])
        });
        it('will parse an extension with 1 param', () => {
            expect(new JSONX().parse('Test1("test")')).toStrictEqual(["test"])
        });
        it('will parse an extension with multiple params', () => {
            expect(new JSONX().parse('Test1("test", 123)')).toStrictEqual(["test", 123])
        });
        it('will parse an extension with whitespace', () => {
            expect(new JSONX().parse('Test1( "test" , 123 )')).toStrictEqual(["test", 123])
        });
    });
    describe('Other', () => {
        it.todo('Will ignore all types of whitespace' )
    });
});