<script lang="typescript">
  import { DURATIONS, timeframe$ } from '../stores/timeframe';
</script>

<select bind:value={$timeframe$} class="py-2 text-gray-800" name="duration">
  {#each DURATIONS as duration}
    <option value={duration.label}>{duration.label}</option>
  {/each}
</select>
