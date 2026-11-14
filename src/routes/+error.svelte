<script lang="ts">
  import { m } from '#lib/i18n';
  import { href } from '#lib/site';
  import Urni from '#lib/components/Urni.svelte';
</script>

<div class="wrap" style="text-align:center;padding:3rem 0">
  <Urni size={120} mood="think" />
  <h1>404</h1>
  <p><a class="btn primary" href={href()}>{m.nav.back}</a></p>
</div>
