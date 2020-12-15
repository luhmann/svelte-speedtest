<script lang="typescript">
  import './main.css';
  import { interval } from 'rxjs';
  import { startWith } from 'rxjs/operators';

  const rxTimer = interval(1000).pipe(startWith(0));
</script>

<div>
  <header class="px-5 bg-green-300 box">
    <p>Page has been open for <code>{$rxTimer}</code> seconds.</p>
  </header>
</div>
