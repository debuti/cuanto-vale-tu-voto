<script lang="ts">
  import { m } from '#lib/i18n';
  import { SITE } from '#lib/site';
  import { app } from '#lib/state.svelte';

  let { weight }: { weight: string } = $props();
  let copied = $state(false);
  const url = () => `${SITE}/?${app.query()}`;

  async function share() {
    const data = { title: m.app.name, text: m.result.shareText, url: url() };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(data.url);
      copied = true;
      setTimeout(() => (copied = false), 2500);
    } catch {
      /* cancelled */
    }
  }

  function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number): number {
    let line = '';
    for (const word of text.split(' ')) {
      if (g.measureText(line + word).width > max && line) {
        g.fillText(line.trim(), x, y);
        y += lh;
        line = '';
      }
      line += word + ' ';
    }
    g.fillText(line.trim(), x, y);
    return y + lh;
  }

  // The poster carries only the place and its weight (never the chosen option) plus the URL.
  async function poster() {
    await document.fonts.ready;
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1080;
    const g = cv.getContext('2d');
    if (!g) return;
    g.fillStyle = '#fff8ee';
    g.fillRect(0, 0, 1080, 1080);
    g.fillStyle = '#ffe0ec';
    g.beginPath();
    g.arc(980, 80, 300, 0, 7);
    g.fill();
    g.fillStyle = '#dcefff';
    g.beginPath();
    g.arc(60, 1040, 280, 0, 7);
    g.fill();
    g.fillStyle = '#fff';
    g.strokeStyle = '#2a2440';
    g.lineWidth = 6;
    g.beginPath();
    g.roundRect(70, 250, 940, 560, 48);
    g.fill();
    g.stroke();
    g.fillStyle = '#2a2440';
    g.textAlign = 'center';
    g.font = '600 76px "Fredoka Variable", sans-serif';
    g.fillText(m.app.name, 540, 170);
    g.font = '700 52px "Nunito Variable", sans-serif';
    wrap(g, app.constituency.name, 540, 350, 860, 60);
    g.fillStyle = '#5b3fd6';
    g.font = '600 260px "Fredoka Variable", sans-serif';
    g.fillText(`×${weight}`, 540, 630);
    g.fillStyle = '#2a2440';
    g.font = '800 50px "Nunito Variable", sans-serif';
    g.fillText(m.result.weightTile, 540, 730);
    g.font = '600 38px "Nunito Variable", sans-serif';
    wrap(g, m.app.tagline, 540, 890, 900, 50);
    g.font = '800 40px "Nunito Variable", sans-serif';
    g.fillStyle = '#5b3fd6';
    g.fillText(SITE.replace('https://', ''), 540, 1020);
    const a = document.createElement('a');
    a.download = 'cuanto-vale-tu-voto.png';
    a.href = cv.toDataURL('image/png');
    a.click();
  }
</script>

<div class="share">
  <button class="btn primary" type="button" onclick={share}>📣 {m.result.share}</button>
  <button class="btn" type="button" onclick={poster}>🖼️ {m.result.poster}</button>
  <span class="note" role="status">{copied ? m.result.copied : ''}</span>
</div>

<style>
  .share {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.7rem;
    margin-top: 1.2rem;
  }
</style>
