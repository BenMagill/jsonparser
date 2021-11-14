import { JSONX } from "./index";

describe('JSON Parser', () => {
    describe('Constants', () => {
        it('Will parse true', () => {
            expect(new JSONX().parse('true')).toBe(true)
        })
    });
});