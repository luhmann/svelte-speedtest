<script lang="typescript">
  import './main.css';
  import { interval } from 'rxjs';
  import { startWith } from 'rxjs/operators';
  import Graph from './graph/graph.svelte';

  const rxTimer = interval(1000).pipe(startWith(0));
</script>

<div>
  <header class="px-5 bg-green-300 box">How slow?</header>
  <Graph />
</div>
