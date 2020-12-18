import { pipe } from 'remeda';
import config from '../config.json';

type UrlQuery = { [key: string]: string };

const getQueryString = (query: UrlQuery) =>
  pipe(
    query,
    (query: UrlQuery) =>
      Object.entries(query)
        // ! does not handle values that are arrays, solve when you need it
        .map(([name, value]) => `${name}=${value}`)
        .join('&'),
    (queryString: string) => `?${queryString}`,
  );

export const getApiUrl = (path: string, query?: UrlQuery): string =>
  `${config.apiUrl}${path}${query ? getQueryString(query) : ''}`;
