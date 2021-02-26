import faker from 'faker'
import {
  checkIsSameTimeframe,
  checkNowIsInTimeframe,
  checkTimeframesOverlap,
  getUniqueTimeframes,
  Timeframe,
} from '..'

describe('checkNowIsInTimeframe', () => {
  it('returns true if now is in timeframe', () => {
    const s = faker.date.past()
    const e = faker.date.future()

    expect(checkNowIsInTimeframe(s, e)).toBe(true)
  })

  it('returns false if now is not in timeframe', () => {
    const s = faker.date.future()
    const e = new Date(s.getTime() + 100_000)

    expect(checkNowIsInTimeframe(s, e)).toBe(false)
  })

  describe('calls as expected', () => {
    it.each([
      [new Date(), new Date(new Date().setDate(new Date().getDate() + 1)), true],
      [
        new Date().valueOf(),
        new Date(new Date().setDate(new Date().getDate() + 1)).valueOf(),
        true,
      ],
      [
        new Date().toDateString(),
        new Date(new Date().setDate(new Date().getDate() + 1)).toDateString(),
        true,
      ],
      [new Date(), null, true],
    ])(
      'checkNowIsInTimeframe(%s, %s) returns %s',
      (input1: Date | string | number, input2: Date | string | number | null, exp: boolean) => {
        expect(checkNowIsInTimeframe(input1, input2)).toBe(exp)
      },
    )

    it('NaN throws error', () => {
      function inputNaN() {
        checkNowIsInTimeframe(NaN, NaN)
      }
      expect(inputNaN).toThrowError('Invalid date: ')
    })
  })
})

describe('checkIsSameTimeframe', () => {
  it.each([
    [
      {
        start: new Date().toString(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)).toString(),
      },
      {
        start: new Date().toString(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)).toString(),
      },
      true,
    ],
    [
      {
        start: new Date().toString(),
        end: null,
      },
      {
        start: new Date().toString(),
        end: null,
      },
      true,
    ],
  ])('%s and %s returns %s', (arg1: Timeframe, arg2: Timeframe, exp: boolean) => {
    expect(checkIsSameTimeframe(arg1, arg2)).toBe(exp)
  })
})

describe('checkTimeframesOverlap', () => {
  it.each([
    [
      {
        start: new Date().toString(),
        end: null,
      },
      {
        start: new Date().toString(),
        end: null,
      },
      true,
    ],
    [
      {
        start: new Date().toString(),
        end: null,
      },
      {
        start: new Date().toString(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)).toString(),
      },
      true,
    ],
    [
      {
        start: new Date().toString(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)).toString(),
      },
      {
        start: new Date().toString(),
        end: null,
      },
      true,
    ],
    [
      {
        start: new Date().toString(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)).toString(),
      },
      {
        start: new Date().toString(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)).toString(),
      },
      true,
    ],
  ])('%s and %s returns %s', (arg1: Timeframe, arg2: Timeframe, exp: boolean) => {
    expect(checkTimeframesOverlap(arg1, arg2)).toBe(exp)
  })
})

describe('getUniqueTimeframes', () => {
  const baseA = faker.date.future()
  const tfFut = {
    start: baseA,
    end: new Date(baseA.getTime() + 100_000_000),
  }

  const baseB = faker.date.past()
  const tfPast = {
    start: baseB,
    end: new Date(baseB.getTime() + 100_000_000),
  }

  it('sorts timeframes by start from earliest to latest', () => {
    const arr = [{ ...tfFut }, { ...tfPast }, { ...tfPast }, { ...tfPast }]

    expect(JSON.stringify(getUniqueTimeframes(arr))).toEqual(
      JSON.stringify([{ ...tfPast }, { ...tfFut }]),
    )
  })
})
