import { formatRFC3339, sub } from 'date-fns';
import { pipe } from 'remeda';
import { ajax } from 'rxjs/ajax';
import { filter, map, switchMap } from 'rxjs/operators';
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

const getSinceTimestamp = (query: Duration['query']) => pipe(sub(Date.now(), query), formatRFC3339, encodeURIComponent);

const since$ = selectedDuration$.pipe(
  map((label) => DURATIONS.find((item) => item.label === label)),
  filter(inputIsNotNullOrUndefined),
  map((period) => getSinceTimestamp(period.query)),
);

export const speedtestData$ = since$.pipe(
  // TODO: externalize URL-creation make dependent on config
  switchMap((since) =>
    decorateRequestWithStatus(ajax.getJSON<Test[]>(`http://local.test:3000/v1/measurements?since=${since}`)),
  ),
);
