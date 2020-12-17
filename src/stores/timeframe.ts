import { formatRFC3339, sub } from 'date-fns';
import { ajax } from 'rxjs/ajax';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import type { Test } from '../../server/utils/database-client';
import { decorateRequestWithStatus, getSvelteSubject, inputIsNotNullOrUndefined } from '../utils/rxjs';

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

export const selectedDuration$ = getSvelteSubject<Duration['label']>(DURATIONS[1].label);

const since$ = selectedDuration$.pipe(
  map((label) => DURATIONS.find((item) => item.label === label)),
  filter(inputIsNotNullOrUndefined),
  // TODO: use fp-version of lib
  map((timeframe) => encodeURIComponent(formatRFC3339(sub(Date.now(), timeframe.query)))),
);

export const speedtestData$ = since$.pipe(
  // TODO: externalize URL-creation make dependent on config
  switchMap((since) =>
    decorateRequestWithStatus(ajax.getJSON<Test[]>(`http://local.test:3000/v1/measurements?since=${since}`)),
  ),
);
