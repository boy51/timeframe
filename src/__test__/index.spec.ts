import faker from 'faker'
import { checkNowIsInTimeframe } from '..'

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
