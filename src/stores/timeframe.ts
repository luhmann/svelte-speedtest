/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { formatRFC3339, sub } from 'date-fns';
import { BehaviorSubject, Subject } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import type { Test } from '../../server/utils/database-client';
import { inputIsNotNullOrUndefined } from '../utils/rxjs';

export const DURATIONS: Duration[] = [
  {
    label: 'Last 24h',
    query: { hours: 24 },
  },
  {
    label: 'Last 3 days',
    query: { days: 3 },
  },
  {
    label: 'Last week',
    query: { weeks: 1 },
  },
  {
    label: 'Last month',
    query: { months: 1 },
  },
];

export interface Duration {
  label: string;
  query: { [key: string]: number };
}

export const timeframe$ = new BehaviorSubject<Duration['label']>(DURATIONS[1].label);
// TODO: make this better
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(timeframe$ as any).set = (timeframe$ as any).next;

export const speedtestData$ = timeframe$.pipe(
  tap((item) => console.log(item)),
  map((label) => DURATIONS.find((item) => item.label === label)),
  filter(inputIsNotNullOrUndefined),
  // TODO: use fp-version of lib here
  map((timeframe) => encodeURIComponent(formatRFC3339(sub(Date.now(), timeframe.query)))),
  // TODO: externalize URL-creation make dependent on config
  switchMap((since) => ajax.getJSON<Test[]>(`http://local.test:3000/v1/measurements?since=${since}`)),
);
