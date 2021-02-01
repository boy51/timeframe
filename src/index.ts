import moment from 'moment'

export type Timeframe = {
  start: string
  end: string | null
}

/**
 * Takes a timeframe and determines whether the user's time falls within it.
 * @param {Date|string} start Starting point of timeframe. Must be a valid date, date string or ISO date number. Timeframe must have a start.
 * @param {Date|string|null} end End point of timeframe. Must be a valid date, date string or ISO date number. If null, it means the timeframe has no end.
 */
export function checkNowIsInTimeframe(
  start: Date | string | number,
  end: Date | string | number | null,
): boolean {
  const s =
    typeof start === 'string' || typeof start === 'number'
      ? new Date(start).getTime()
      : start.getTime()
  const e =
    typeof end === 'string' || typeof end === 'number'
      ? new Date(end).getTime()
      : end
        ? end.getTime()
        : null

  if (isNaN(s)) throw new Error('Invalid date: ' + start)
  if (e !== null && isNaN(e)) throw new Error('Invalid date: ' + end)

  const now = new Date().getTime()

  return s <= now && (!e || e > now)
}

type TSerialDate<T = number> = [start: T, end: T | null]
/**
 * Takes two timeframes and determines whether they are the same timeframe.
 * @param arg1 First timeframe.
 * @param arg2 Second timeframe.
 */
export function checkIsSameTimeframe(arg1: Timeframe, arg2: Timeframe): boolean {
  const one: TSerialDate = [
    new Date(arg1.start).getTime(),
    !arg1.end ? null : new Date(arg1.end).getTime(),
  ]
  const two: TSerialDate = [
    new Date(arg2.start).getTime(),
    !arg2.end ? null : new Date(arg2.end).getTime(),
  ]

  const isSame = JSON.stringify(one) === JSON.stringify(two)
  return isSame
}

/**
 * Takes two timeframes and determines if they overlap at any point (i.e. there are points in time that are inside both timeframes).
 * @param arg1 First timeframe.
 * @param arg2 Second timeframe.
 */
export function checkTimeframesOverlap(arg1: Timeframe, arg2: Timeframe): boolean {
  let tf
  switch (true) {
    //beide kein Ende
    case !arg1.end && !arg2.end:
      return true
    //1 kein Ende, 2 hat Ende
    case !arg1.end && arg2.end && true:
      tf = [moment(arg2.start), moment(arg2.end)]
      if (tf[0].isSameOrAfter(arg1.start) || tf[1].isAfter(arg1.start)) return true
      break
    //1 Ende, 2 kein Ende
    case !arg2.end && arg1.end && true:
      tf = [moment(arg1.start), moment(arg1.end)]
      if (tf[0].isSameOrAfter(arg2.start) || tf[1].isAfter(arg2.start)) return true
      break

    case arg2.end && arg1.end && true:
      tf = [moment(arg1.start), moment(arg1.end)]
      if (tf[0].isSameOrBefore(arg2.start) && tf[1].isAfter(arg2.start)) return true
      if (tf[0].isBefore(arg2.end) && tf[1].isSameOrAfter(arg2.end)) return true

      tf = [moment(arg2.start), moment(arg2.end)]
      if (tf[0].isSameOrBefore(arg1.start) && tf[1].isAfter(arg1.start)) return true
      if (tf[0].isBefore(arg1.end) && tf[1].isSameOrAfter(arg1.end)) return true

      break

    default:
      throw new Error('Unexpected')
  }

  return false
}
