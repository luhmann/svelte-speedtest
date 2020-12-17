import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import type { AjaxError } from 'rxjs/ajax';
import { catchError, map, take, tap } from 'rxjs/operators';

export function inputIsNotNullOrUndefined<T>(input: null | undefined | T): input is T {
  return input !== null && input !== undefined;
}

export enum Status {
  INITIAL,
  LOADING,
  SUCCESS,
  ERROR,
}

export interface RequestWithStatus<T> {
  data: T | Error | undefined;
  status: Status;
}

export const decorateRequestWithStatus = <T>(request$: Observable<T>): Observable<RequestWithStatus<T>> => {
  const status$ = new BehaviorSubject<Status>(Status.LOADING);
  const data$ = new BehaviorSubject<RequestWithStatus<T>['data']>(undefined);

  request$
    .pipe(
      tap((data) => {
        data$.next(data);
        status$.next(Status.SUCCESS);
      }),
      catchError((error: AjaxError) => {
        data$.next(error);
        status$.next(Status.ERROR);
        return of(error);
      }),
      take(1),
    )
    .subscribe();

  return combineLatest([status$, data$]).pipe(map(([status, data]) => ({ data, status })));
};

export const mapDataForSuccess = <T, R>(mapFunction: (data: T) => R) => (
  requestWithStatus: RequestWithStatus<T>,
): RequestWithStatus<T | R> => {
  const { status, data } = requestWithStatus;
  if (status === Status.LOADING || status === Status.ERROR) {
    return requestWithStatus;
  }

  return { status, data: mapFunction(data as T) };
};

interface SvelteSubject<T> extends BehaviorSubject<T> {
  set: BehaviorSubject<T>['next'];
}

export const getSvelteSubject = <T>(initialValue: T): SvelteSubject<T> => {
  const subject$ = new BehaviorSubject<T>(initialValue) as SvelteSubject<T>;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  subject$.set = subject$.next;

  return subject$;
};
