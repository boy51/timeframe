import moment from 'moment'
import { Interval, DateTime } from 'luxon'

/**
 * Basic timeframe where end can be null.
 * @more Dates can be expressed as valid datestrings, numbers or JS dates.
 * If not specified otherwise with type parameter, defaults to using strings.
 */
export type Timeframe<T extends string | number | Date = string> = {
  start: T
  end: T | null
}
/** Timeframe where values are intersection between string, number or date */
type SerializableTimeframe = Timeframe<string | number | Date>

/**
 * Takes a timeframe and determines whether the user's time falls within it.
 * @param {Date|string} start Starting point of timeframe. Must be a valid date, date string or ISO date number. Timeframe must have a start.
 * @param {Date|string|null} end End point of timeframe. Must be a valid date, date string or ISO date number. If null, it means the timeframe has no end.
 */
export function checkNowIsInTimeframe(
  start: SerializableTimeframe['start'],
  end: SerializableTimeframe['end'],
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

/**
 * Serialized timeframe tuple.
 */
type TSerialDate<T = number> = [start: T, end: T | null]
/**
 * Takes two timeframes and determines whether they are the same timeframe.
 * @param arg1 First timeframe.
 * @param arg2 Second timeframe.
 */
export function checkIsSameTimeframe(
  arg1: SerializableTimeframe,
  arg2: SerializableTimeframe,
): boolean {
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
    case !arg1.end && !arg2.end:
      return true

    case !arg1.end && arg2.end && true:
      tf = [moment(arg2.start), moment(arg2.end)]
      if (tf[0].isSameOrAfter(arg1.start) || tf[1].isAfter(arg1.start)) return true
      break

    case !arg2.end && arg2.start && true:
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

/**
 * Takes two timeframes and determines the timeframe where they overlap.
 * @return {Timeframe | null} Overlapping timeframe, or null if the timeframes don't overlap.
 */
export function getOverlappingTimeframe(arg1: Timeframe, arg2: Timeframe): Timeframe | null {
  // Timeframe don't overlap
  if (!checkTimeframesOverlap(arg1, arg2)) return null

  // Check if one of the time frames is open ended
  if (!arg1.end || !arg2.end) {
    // At least one timeframe is open ended
    const start1 = toDateTime(arg1.start).toUTC()
    const start2 = toDateTime(arg2.start).toUTC()
    let end: string | null

    // Check which timeframe ends first
    if (arg1.end !== null) {
      end = toDateTime(arg1.end).toUTC().toISO()
    } else if (arg2.end !== null) {
      end = toDateTime(arg2.end).toUTC().toISO()
    } else {
      end = null
    }
    if (start1 > start2) return { start: start1.toISO(), end }
    else return { start: start2.toISO(), end }
  } else {
    // Not Open Ended
    const interval1 = Interval.fromDateTimes(
      toDateTime(arg1.start).toUTC(),
      toDateTime(arg1.end).toUTC(),
    )
    const interval2 = Interval.fromDateTimes(
      toDateTime(arg2.start).toUTC(),
      toDateTime(arg2.end).toUTC(),
    )
    const overlapInterval = interval1.intersection(interval2) as Interval

    return {
      start: overlapInterval.start.toISO(),
      end: overlapInterval.end.toISO(),
    }
  }
}
/**
 * Takes string, number or JsDate and converts to luxon DateTime in UTC
 * @param {string | number | Date} date
 * @return {DateTime}
 */
function toDateTime(date: string | number | Date) {
  switch (typeof date) {
    case 'string':
      return DateTime.fromISO(date)
    case 'number':
      return DateTime.fromMillis(date)
    default:
      return DateTime.fromJSDate(date)
  }
}

/**
 * Takes array of timeframes and determines unique (distinct) timeframes that are included.
 * @param {Timeframe<string | number | Date>[]} of Array to find unqiue timeframes of.
 * @return {Timeframe[]} Array of unique timeframes which is sorted by start from earliest to latest.
 */
export function getUniqueTimeframes(of: SerializableTimeframe[]): Timeframe[] {
  const initial: TSerialDate[] = of.map<TSerialDate>((r) => [
    new Date(r.start).getTime(),
    !r.end ? null : new Date(r.end).getTime(),
  ])

  if (initial.length < 1) return []
  const res = [...new Set(initial.map((tf) => JSON.stringify(tf)))].map<TSerialDate>((v) =>
    JSON.parse(v),
  )
  const sorted = res.sort((a, b) => a[0] - b[0])

  return sorted.map((v) => ({
    start: new Date(v[0]).toISOString(),
    end: v[1] ? new Date(v[1]).toISOString() : null,
  }))
}
