<script lang="typescript">
  import { pipe } from 'remeda';
  import { bufferTime, filter, map, tap } from 'rxjs/operators';
  import Chart from 'svelte-frappe-charts';
  import type { Test } from '../../server/utils/database-client';
  import Spinner from '../spinner/spinner.svelte';
  import { speedtestData$ } from '../stores/timeframe';
  import { formatDate } from '../utils/date-format';
  import { mapDataForSuccess, Status } from '../utils/rxjs';
  import { tag } from 'rxjs-spy/cjs/operators';

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
        label: 'Regular',
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
        label: 'Regular',
        value: 40,
      },
      {
        label: 'Maximal',
        value: 50,
      },
    ],
  };

  interface FrappeChartConfig {
    download: Load;
    upload: Load;
  }

  interface Load {
    data: Data;
  }

  interface Data {
    labels: string[];
    datasets: Dataset[];
    yMarkers: YMarker[];
  }

  interface Dataset {
    name: string;
    values: string[];
    chartType?: string;
  }

  interface YMarker {
    label: string;
    value: number;
  }

  const getGraphConfig = (measurements: Test[]): FrappeChartConfig =>
    pipe(
      measurements,
      (measurements) =>
        measurements.map((measurement) => [
          formatDate(measurement.timestamp),
          (measurement.downloadBandwidth / BYTE_MBIT_FACTOR).toFixed(2),
          (measurement.uploadBandwidth / BYTE_MBIT_FACTOR).toFixed(2),
        ]),
      (measurements) =>
        measurements.reduce(
          (acc, [label, download, upload]) => ({
            labels: [...(acc.labels ?? []), label],
            download: [...(acc.download ?? []), download],
            upload: [...(acc.upload ?? []), upload],
          }),
          {} as { [key: string]: string[] },
        ),
      ({ labels, upload, download }) => ({
        download: {
          data: {
            labels,
            datasets: [{ name: 'Download Bandwidth', values: download }],
            ...GRAPH_DOWNLOAD_REGIONS,
          },
          ...GRAPH_BASE_CONFIG,
          colors: ['#88e1f2'],
        },
        upload: {
          data: {
            labels,
            datasets: [{ name: 'Upload Bandwidth', values: upload }],
            ...GRAPH_UPLOAD_REGIONS,
          },
          ...GRAPH_BASE_CONFIG,
          colors: ['#ff7c7c'],
        },
      }),
    );

  const isLoading$ = speedtestData$.pipe(
    bufferTime(400),
    filter((statusStates) => statusStates.length > 0),
    map((statusStates) => (statusStates.pop()?.status ?? Status.SUCCESS) === Status.LOADING),
  );

  const measurementReq$ = speedtestData$.pipe(
    map(mapDataForSuccess<any, FrappeChartConfig>(getGraphConfig)),
    tag('measurementReq$'),
  );
</script>

<section class="p-1">
  {#if $measurementReq$}
    {#if $isLoading$}
      <div
        class="full flex flex-col justify-center items-center absolute top-0 left-0 w-screen h-screen bg-opacity-70 bg-gray-200 z-10">
        <Spinner />
        <div class="pt-3">Fetching Data</div>
      </div>
    {/if}
    {#if $measurementReq$.status === Status.ERROR}
      <!-- TODO: something cute -->
      <div>A heinous error occured</div>
    {:else if $measurementReq$.status !== Status.INITIAL && $measurementReq$.data}
      <div class="pb-3">
        <h2 class="text-gray-800">Downstream</h2>
        <Chart {...$measurementReq$.data.download} />
      </div>
      <h2 class="text-gray-800">Upstream</h2>
      <Chart {...$measurementReq$.data.upload} />
    {/if}
  {/if}
</section>
