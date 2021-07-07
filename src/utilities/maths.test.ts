import {roundUp} from "./maths";

describe("Function roundUp() ", () => {

    it("It should return a rounded number", async () => {
        let roundedNumber = roundUp(66.6666666666666666, 2);
        expect(roundedNumber).toEqual(66.67);

        roundedNumber = roundUp(66.6666666666666666, 0);
        expect(roundedNumber).toEqual(67);

        roundedNumber = roundUp(66.6666666666666666, 1);
        expect(roundedNumber).toEqual(66.7);

    });
});
