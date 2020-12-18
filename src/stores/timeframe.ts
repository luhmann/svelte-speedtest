import { formatRFC3339, sub } from 'date-fns';
import { pipe } from 'remeda';
import { combineLatest, timer } from 'rxjs';
import { tag } from 'rxjs-spy/cjs/operators';
import { ajax } from 'rxjs/ajax';
import { filter, map, share, switchMap } from 'rxjs/operators';
import type { Test } from '../../server/utils/database-client';
import { getApiUrl } from '../utils/api-urls';
import { decorateRequestWithStatus, getSvelteSubject, inputIsNotNullOrUndefined } from '../utils/rxjs';

export const POLLING_INTERVAL = 60_000;

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

const measurementsRequest = decorateRequestWithStatus();

export const speedtestData$ = combineLatest([timer(0, POLLING_INTERVAL), since$]).pipe(
  map(([, since]) => since),
  switchMap((since) =>
    pipe(
      since,
      (since) => getApiUrl(`/measurements`, { since }),
      (apiUrl: string) => ajax.getJSON<Test[]>(apiUrl),
      measurementsRequest,
    ),
  ),
  tag('speedtestData$:end'),
  share(),
);
