<script lang="typescript">
  import { ajax } from 'rxjs/ajax';
  import Chart from 'svelte-frappe-charts';
  import { map } from 'rxjs/operators';
  import type { Test } from '../../server/utils/database-client';
  import { formatDate } from '../utils/date-format';

  const BYTE_MBIT_FACTOR = 125_000;
  const GRAPH_BASE_CONFIG = {
    type: 'line',
    axisOptions: {
      xIsSeries: true,
      xAxisMode: 'tick',
    },
    lineOptions: {
      hideDots: 1,
      spline: 1,
      regionFill: 1,
    },
    tooltipOptions: {
      formatTooltipY: (data: string) => `${data} Mbps/s`,
    },
  };
  const GRAPH_DOWNLOAD_REGIONS = {
    yMarkers: [
      {
        label: 'Minimal',
        value: 600,
      },
      {
        label: 'Normal',
        value: 800,
      },
      {
        label: 'Maximal',
        value: 1000,
      },
    ],
  };

  const GRAPH_UPLOAD_REGIONS = {
    yMarkers: [
      {
        label: 'Minimal',
        value: 30,
      },
      {
        label: 'Normal',
        value: 40,
      },
      {
        label: 'Maximal',
        value: 50,
      },
    ],
  };

  const promise = ajax
    .getJSON<Test[]>('http://local.test:3000/v1/measurements?since=2020-12-10T00:00:00Z')
    .pipe(
      map((measurements) =>
        measurements.map((measurement) => [
          formatDate(measurement.timestamp),
          (measurement.downloadBandwidth / BYTE_MBIT_FACTOR).toFixed(2),
          (measurement.uploadBandwidth / BYTE_MBIT_FACTOR).toFixed(2),
        ]),
      ),
      map((measurements) =>
        measurements.reduce(
          (acc, [label, download, upload]) => ({
            labels: [...(acc.labels ?? []), label],
            download: [...(acc.download ?? []), download],
            upload: [...(acc.upload ?? []), upload],
          }),
          {} as any,
        ),
      ),
      map(({ labels, upload, download }) => ({
        download: {
          data: {
            labels,
            datasets: [{ name: 'Download Bandwidth', values: download }],
            ...GRAPH_DOWNLOAD_REGIONS,
          },
          ...GRAPH_BASE_CONFIG,
          colors: ['#60A5FA'],
        },
        upload: {
          data: {
            labels,
            datasets: [{ name: 'Upload Bandwidth', values: upload }],
            ...GRAPH_UPLOAD_REGIONS,
          },
          ...GRAPH_BASE_CONFIG,
          colors: ['#F472B6'],
        },
      })),
    )
    .toPromise();
</script>

<div id="chart-container">
  {#await promise}
    <p>Fetching data ...</p>
  {:then config}
    <Chart {...config.download} />
    <Chart {...config.upload} />
  {:catch error}
    <p>Something went wrong: {error.message}</p>
  {/await}
</div>
