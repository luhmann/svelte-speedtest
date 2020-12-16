<script lang="typescript">
  import './main.css';
  import Graphs from './graphs/graphs.svelte';
  import DurationSelection from './duration-selection/duration-selection.svelte';
</script>

<div class="container mx-auto px-4">
  <header class="pt-5 pb-8">
    <h1 class="text-4xl pb-2 box text-gray-700 font-mono font-bold tracking-wider">How slow?</h1>
    <div class="text-l text-gray-500 font-mono">How little bandwidth is my cable-provider giving me today?</div>
  </header>
  <div class="flex justify-end">
    <DurationSelection />
  </div>
  <Graphs />

  <!-- TODO: display how often the minimum was not reached below charts-->
</div>
