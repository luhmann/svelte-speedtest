<script lang="typescript">
  import { map, tap } from 'rxjs/operators';
  import Chart from 'svelte-frappe-charts';
  import { speedtestData$ } from '../stores/timeframe';
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
    truncateLegends: true,
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

  const promise$ = speedtestData$.pipe(
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
    tap((data) => console.log(data)),
  );
</script>

<section class="p-1">
  {#if $promise$}
    <div class="pb-3">
      <h2 class="text-gray-800">Downstream</h2>
      <Chart {...$promise$.download} />
    </div>
    <h2 class="text-gray-800">Upstream</h2>
    <Chart {...$promise$.upload} />
  {/if}
</section>
