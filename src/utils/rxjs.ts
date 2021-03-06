import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import type { AjaxError } from 'rxjs/ajax';
import { catchError, distinctUntilKeyChanged, map, take, tap } from 'rxjs/operators';
import { create } from 'rxjs-spy';
import { tag } from 'rxjs-spy/cjs/operators';

const activateRxJsSpy = () => {
  const spy = create();
  // spy.log();
};

activateRxJsSpy();

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

export const decorateRequestWithStatus = <T>() => {
  const status$ = new BehaviorSubject<Status>(Status.INITIAL);
  const data$ = new BehaviorSubject<RequestWithStatus<T>['data']>(undefined);

  return (request$: Observable<T>): Observable<RequestWithStatus<T>> => {
    status$.next(Status.LOADING);

    request$
      .pipe(
        tag('measurementsRequest'),
        tap((data) => {
          data$.next(data as any);
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

    return combineLatest([status$, data$]).pipe(
      map(([status, data]) => ({ data, status })),
      distinctUntilKeyChanged('status'),
    );
  };
};

export const mapDataForSuccess = <T, R>(mapFunction: (data: T) => R) => (
  requestWithStatus: RequestWithStatus<T>,
): RequestWithStatus<T | R> => {
  const { status, data } = requestWithStatus;
  if (status === Status.SUCCESS) {
    return { status, data: mapFunction(data as T) };
  }

  return requestWithStatus;
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
