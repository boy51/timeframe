import faker from 'faker'
import { checkNowIsInTimeframe, getUniqueTimeframes } from '..'

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

    console.log(
      JSON.stringify(getUniqueTimeframes(arr), null, 2),
      JSON.stringify([{ ...tfPast }, { ...tfFut }], null, 2),
    )

    expect(JSON.stringify(getUniqueTimeframes(arr))).toEqual(
      JSON.stringify([{ ...tfPast }, { ...tfFut }]),
    )
  })
})
