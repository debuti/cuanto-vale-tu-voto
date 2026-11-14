<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  // Accessible dialog on top of <dialog>: focus trap and Esc come from the browser.
  // The content is always in the HTML (also when prerendering), so crawlers read it.
  let { open, onclose, label, children }: { open: boolean; onclose: () => void; label: string; children: Snippet } = $props();
  let el: HTMLDialogElement | undefined = $state();
  let ready = $state(false);
  // Fixed at creation on purpose: afterwards the effect below drives the dialog.
  const inline = untrack(() => open);

  $effect(() => {
    ready = true;
    if (!el) return;
    const modal = el.matches(':modal');
    if (open && !modal) {
      // Shown inline by the prerendered HTML: drop that without firing `close`.
      el.removeAttribute('open');
      el.showModal();
    } else if (!open && modal) el.close();
    else if (!open) el.removeAttribute('open');
  });
</script>

<!-- Before hydration `open` shows it inline (no script, crawlers); afterwards it is a real modal. -->
<dialog
  bind:this={el}
  open={inline ? true : undefined}
  class:inline={!ready}
  aria-label={label}
  onclose={onclose}
  onclick={(e) => e.target === el && onclose()}
>
  <div class="box">{@render children()}</div>
</dialog>

<style>
  dialog {
    border: 0;
    padding: 0;
    background: transparent;
    width: min(560px, 100% - 1.5rem);
    max-height: calc(100dvh - 1.5rem);
    color: var(--ink);
  }
  dialog.inline {
    position: static;
    margin: 1rem auto;
  }
  dialog::backdrop {
    background: rgba(42, 36, 64, 0.55);
  }
  .box {
    background: #fff;
    border: 3px solid var(--ink);
    border-radius: 28px;
    padding: clamp(1.1rem, 4vw, 1.75rem);
    box-shadow: 0 6px 0 var(--ink);
    margin-bottom: 6px;
  }
</style>
