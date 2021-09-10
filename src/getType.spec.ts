import { ValueType } from "."
import getType from "./getType"

describe("getType", () => {
    it("will determine the type as number", () => {
        expect(getType(`123456`)).toBe(ValueType.NUMBER)
    })

    it("will determine the type as string", () => {
        expect(getType(`"test"`)).toBe(ValueType.STRING)
    })

    it("will determine the type as array", () => {
        expect(getType(`[]`)).toBe(ValueType.ARRAY)
    })

    it("will determine the type as object", () => {
        expect(getType(`{}`)).toBe(ValueType.OBJECT)
    })

    it("will determine the type as extension", () => {
        expect(getType(`Extension1()`)).toBe(ValueType.EXTENSION)
    })

    // TODO add fail tests 

})