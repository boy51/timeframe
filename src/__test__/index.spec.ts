import faker from 'faker'
import {
  checkIsSameTimeframe,
  checkNowIsInTimeframe,
  checkTimeframesOverlap,
  getUniqueTimeframes,
  Timeframe,
  getOverlappingTimeframe,
} from '..'
import { DateTime } from 'luxon'

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

describe('getOverlappingTimeframe', () => {
  it('returns null if timeframes dont overlap', () => {
    const t1: Timeframe = {
      start: faker.date.past(2).toISOString(),
      end: faker.date.past(1).toISOString(),
    }
    const t2 = {
      start: faker.date.future(1).toISOString(),
      end: faker.date.future(2).toISOString(),
    }

    expect(getOverlappingTimeframe(t1, t2)).toBe(null)
  })

  describe('calls as expected', () => {
    const tf1 = { start: '2021-01-01T00:01:00.000Z', end: '2021-01-05T23:59:00.000Z' }
    const tf2 = { start: '2021-01-03T00:01:00.000Z', end: '2021-01-10T23:59:00.000Z' }
    const expected12 = { start: '2021-01-03T00:01:00.000Z', end: '2021-01-05T23:59:00.000Z' }

    const tf3 = {
      // same as tf1 but different timezone
      start: DateTime.fromISO(tf1.start).setZone('Europe/Istanbul').toISO(),
      end: DateTime.fromISO(tf1.end).setZone('Europe/Istanbul').toISO(),
    }
    const tf4 = tf2
    const expected34 = expected12

    const tf5 = { start: '2021-01-01T00:01:00.000Z', end: null }
    const tf6 = { start: '2021-01-03T00:01:00.000Z', end: '2021-01-10T23:59:00.000Z' }
    const expected56 = { start: '2021-01-03T00:01:00.000Z', end: '2021-01-10T23:59:00.000Z' }

    const tf7 = { start: '2021-01-01T00:01:00.000Z', end: '2021-01-05T23:59:00.000Z' }
    const tf8 = { start: '2021-01-03T00:01:00.000Z', end: null }
    const expected78 = { start: '2021-01-03T00:01:00.000Z', end: '2021-01-05T23:59:00.000Z' }

    const tf9 = { start: '2021-01-01T00:01:00.000Z', end: null }
    const tf10 = { start: '2021-01-03T00:01:00.000Z', end: null }
    const expected910 = { start: '2021-01-03T00:01:00.000Z', end: null }

    test.each`
      a      | b       | expected
      ${tf1} | ${tf2}  | ${expected12}
      ${tf3} | ${tf4}  | ${expected34}
      ${tf5} | ${tf6}  | ${expected56}
      ${tf7} | ${tf8}  | ${expected78}
      ${tf9} | ${tf10} | ${expected910}
    `('$a >> $b => $expected', ({ a, b, expected }) => {
      expect(getOverlappingTimeframe(a, b)).toEqual(expected)
    })
  })
})
