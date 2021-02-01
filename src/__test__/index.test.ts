import { checkNowIsInTimeframe, checkIsSameTimeframe, checkTimeframesOverlap, Timeframe } from './../index'

describe('testing checkNowIsInTimeframe input', () => {
    it.each([
        [new Date(), new Date(new Date().setDate(new Date().getDate() + 1)), true],
        [new Date().valueOf(), new Date(new Date().setDate(new Date().getDate() + 1)).valueOf(), true],
        [
            new Date().toDateString(),
            new Date(new Date().setDate(new Date().getDate() + 1)).toDateString(),
            true,
        ],
        [new Date(), null, true],
    ])(
        'check date/number/string/null input (start %s) (end %s) is true',
        (input1: Date | string | number, input2: Date | string | number | null, exp: boolean) => {
            expect(checkNowIsInTimeframe(input1, input2)).toBe(exp)
        },
    )

    it('throws an error if input is incorrect', () => {
        function inputNaN() {
            checkNowIsInTimeframe(NaN, NaN)
        }
        expect(inputNaN).toThrowError('Invalid date: ')
    })

    it('show that error exists and which structure it has', () => {
        try {
            checkNowIsInTimeframe(NaN, null)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect(error).toHaveProperty('message', 'Invalid date: NaN')
        }
    })
})

describe('testing checkIsSameTimeframe', () => {
    it.each([[
        {
            start: new Date().toString(),
            end: new Date(new Date().setDate(new Date().getDate() + 1)).toString()
        },
        {
            start: new Date().toString(),
            end: new Date(new Date().setDate(new Date().getDate() + 1)).toString()
        },
        true],
    [
        {
            start: new Date().toString(),
            end: null
        },
        {
            start: new Date().toString(),
            end: null
        },
        true]
    ])
        ('check if timeframes are equal',
            (arg1: Timeframe, arg2: Timeframe, exp: boolean) => {
                expect(checkIsSameTimeframe(arg1, arg2)).toBe(exp)
            }
        )
});

describe('testing checkTimeframesOverlap', () => {
    it.each([[
        {
            start: new Date().toString(),
            end: null
        },
        {
            start: new Date().toString(),
            end: null
        },
        true],
    [
        {
            start: new Date().toString(),
            end: null
        },
        {
            start: new Date().toString(),
            end: new Date(new Date().setDate(new Date().getDate() + 1)).toString()
        },
        true],
    [
        {
            start: new Date().toString(),
            end: new Date(new Date().setDate(new Date().getDate() + 1)).toString()
        },
        {
            start: new Date().toString(),
            end: null
        },
        true],
    [
        {
            start: new Date().toString(),
            end: new Date(new Date().setDate(new Date().getDate() + 1)).toString()
        },
        {
            start: new Date().toString(),
            end: new Date(new Date().setDate(new Date().getDate() + 1)).toString()
        },
        true]
    ])
        ('check if timeframes are overlaping',
            (arg1: Timeframe, arg2: Timeframe, exp: boolean) => {
                expect(checkTimeframesOverlap(arg1, arg2)).toBe(exp)
            }
        )
});






