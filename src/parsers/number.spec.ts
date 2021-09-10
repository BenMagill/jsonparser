import _number from "./number"

describe("number parser", () => {
    it("will parse a number", () => {
        expect(_number.parse("1392013")).toBe(1392013)
    })
})