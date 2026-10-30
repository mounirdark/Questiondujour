/* Image « nos réponses » — s'ajoute à la page sans toucher à son design.
   Fichiers à placer à côté de index.html : image-reponses.js, moi.jpg, elle.jpg */
(function () {
  // Ton prénom tel qu'il est enregistré dans Supabase (sans tenir compte des accents ni des majuscules).
  // Ton illustration est moi.png (ou .jpg) ; celle de Hind, elle.png (ou .jpg).
  const PRENOM_LUI = 'Mounir';

  const FQ = 'Fraunces, Georgia, serif', FT = 'Karla, system-ui, sans-serif';
  const CACAO = '#3A2519', CREME = '#F7ECDC', OR = '#D8A94A', BRUME = '#DCC3A8', DISCRET = '#7A5A47';
  const W = 1080, H = 1350;
  const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const loadImg = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = u; });
  // Cherche d'abord moi.png / elle.png, puis moi.jpg / elle.jpg
  const loadPhoto = async (base) => (await loadImg(base + '.png')) || (await loadImg(base + '.jpg'));

  function wrap(c, text, maxW) {
    const out = [];
    text.split('\n').forEach((par) => {
      let line = '';
      par.split(/\s+/).filter(Boolean).forEach((w) => {
        const t = line ? line + ' ' + w : w;
        if (c.measureText(t).width <= maxW) { line = t; return; }
        if (line) out.push(line);
        line = '';
        for (const ch of w) { if (c.measureText(line + ch).width > maxW) { out.push(line); line = ch; } else line += ch; }
      });
      out.push(line);
    });
    return out;
  }
  function fit(c, text, fam, weight, maxW, maxH, maxF, minF) {
    let lines;
    for (let f = maxF; f >= minF; f -= 2) {
      c.font = weight + ' ' + f + 'px ' + fam; lines = wrap(c, text, maxW);
      if (lines.length * f * 1.3 <= maxH) return { f, lines };
    }
    c.font = weight + ' ' + minF + 'px ' + fam; lines = wrap(c, text, maxW);
    const n = Math.max(1, Math.floor(maxH / (minF * 1.3)));
    if (lines.length > n) { lines = lines.slice(0, n); lines[n - 1] = lines[n - 1].replace(/\s*\S*$/, '') + '…'; }
    return { f: minF, lines };
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  // Le teckel du porte-clés de la page, recopié tel quel
  async function teckel() {
    try {
      const defs = document.querySelector('svg[width="0"] defs'), pc = document.querySelector('.porte-cles');
      if (!defs || !pc) return null;
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 118" width="260" height="236">' + defs.outerHTML + pc.innerHTML + '</svg>';
      return await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    } catch (e) { return null; }
  }

  async function dessiner(cv, items) {
    try { await Promise.all([document.fonts.load('600 40px Fraunces'), document.fonts.load('600 30px Karla'), document.fonts.load('400 30px Karla')]); } catch (e) {}
    const tk = await teckel();
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    c.fillStyle = CACAO; c.fillRect(0, 0, W, H);

    // petits cœurs en fond
    const cols = ['#E8A3AE', '#C98E5B', '#D8A94A'];
    c.textAlign = 'center'; c.textBaseline = 'middle';
    [[90, 140, 38, -14], [990, 120, 30, 12], [60, 560, 26, 10], [1020, 620, 34, -10], [80, 1010, 30, -8], [1010, 1040, 26, 14], [150, 1290, 30, 8]].forEach(([x, y, s, r], i) => {
      c.save(); c.translate(x, y); c.rotate(r * Math.PI / 180); c.globalAlpha = .35; c.fillStyle = cols[i % 3]; c.font = s + 'px ' + FT; c.fillText('♥', 0, 0); c.restore();
    });

    if (tk) c.drawImage(tk, W / 2 - 100, 28, 200, 182);
    c.fillStyle = BRUME; c.font = '600 30px ' + FT;
    c.fillText(aujourdhui.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }), W / 2, 244);

    const q = fit(c, question, FQ, 600, 900, 250, 52, 32);
    c.fillStyle = CREME; c.font = '600 ' + q.f + 'px ' + FQ;
    q.lines.forEach((l, i) => c.fillText(l, W / 2, 292 + (i + 0.5) * q.f * 1.3));

    const top = 292 + q.lines.length * q.f * 1.3 + 44, gap = 40, bh = (H - 160 - top - gap) / 2, bx = 70, bw = 940;
    items.forEach((it, n) => {
      const y = top + n * (bh + gap), cy = y + bh / 2;
      c.fillStyle = n ? '#F6D6D9' : CREME; rr(c, bx, y, bw, bh, 16); c.fill();
      c.fillStyle = CACAO; [bx, bx + bw].forEach((x) => { c.beginPath(); c.arc(x, cy, 24, 0, 7); c.fill(); });
      const tx = bx + 50;
      const tw = bx + bw - 46 - tx;
      c.textAlign = 'left'; c.fillStyle = '#C9556A'; c.font = '600 30px ' + FT;
      c.fillText('♥', tx, y + 50);
      c.fillStyle = DISCRET; c.fillText(it.nom, tx + 40, y + 50);
      c.save(); c.setLineDash([2, 9]); c.lineCap = 'round'; c.lineWidth = 3; c.strokeStyle = 'rgba(58,37,25,.35)';
      c.beginPath(); c.moveTo(tx, y + 78); c.lineTo(tx + tw, y + 78); c.stroke(); c.restore();
      const t = fit(c, it.texte, FT, '400', tw, bh - 120, 44, 24);
      c.fillStyle = CACAO; c.font = '400 ' + t.f + 'px ' + FT;
      t.lines.forEach((l, j) => c.fillText(l, tx, y + 104 + (j + 0.5) * t.f * 1.3));
      c.textAlign = 'center';
    });

    for (let i = 0; i < 9; i++) {
      c.fillStyle = cols[i % 3]; c.font = (i % 2 ? 34 : 44) + 'px ' + FT; c.fillText('♥', 100 + i * 110, H - 100);
    }
    c.fillStyle = BRUME; c.font = '600 30px ' + FT;
    c.fillText(items[0].nom + ' ♥ ' + items[1].nom, W / 2, H - 46);
  }

  function injecter() {
    const cartes = scene.querySelectorAll('.reponses .carte');
    if (cartes.length !== 2 || scene.querySelector('#bloc-image')) return;
    let items = [
      { nom: moi, texte: cartes[0].querySelector('.texte').textContent },
      { nom: autre, texte: cartes[1].querySelector('.texte').textContent }
    ];
    if (norm(items[1].nom) === norm(PRENOM_LUI)) items.reverse();

    const bloc = document.createElement('div');
    bloc.id = 'bloc-image'; bloc.style.marginTop = '1.5rem';
    bloc.innerHTML = '<button type="button" id="btn-image">Générer une image avec nos réponses</button>' +
      '<p class="note" id="note-image" style="margin-top:.75rem"></p>' +
      '<div id="res-image" hidden><canvas style="width:100%;height:auto;display:block;margin-top:1rem;border-radius:14px"></canvas>' +
      '<button type="button" id="btn-save" style="margin-right:.6rem">Enregistrer l’image</button>' +
      '<button type="button" id="btn-share">Partager</button></div>';
    scene.querySelector('.reponses').after(bloc);

    const cv = bloc.querySelector('canvas'), note = bloc.querySelector('#note-image');
    const iso = jour;
    const blob = () => new Promise((res, rej) => { try { cv.toBlob((b) => (b ? res(b) : rej(new Error('vide'))), 'image/png'); } catch (e) { rej(e); } });
    const echec = () => { note.textContent = 'Export impossible depuis un fichier local : ouvre la page depuis son adresse en ligne. Sur téléphone, tu peux aussi garder le doigt appuyé sur l’image.'; };
    async function enregistrer() {
      try {
        const url = URL.createObjectURL(await blob());
        const a = document.createElement('a'); a.href = url; a.download = 'nos-reponses-' + iso + '.png';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
      } catch (e) { echec(); }
    }
    bloc.querySelector('#btn-image').addEventListener('click', async (e) => {
      e.target.disabled = true; note.textContent = '';
      try { await dessiner(cv, items); bloc.querySelector('#res-image').hidden = false; } catch (err) { note.textContent = 'La création de l’image a échoué.'; }
      e.target.disabled = false;
    });
    bloc.querySelector('#btn-save').addEventListener('click', enregistrer);
    bloc.querySelector('#btn-share').addEventListener('click', async () => {
      try {
        const f = new File([await blob()], 'nos-reponses.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f] }); else await enregistrer();
      } catch (e) { if (!e || e.name !== 'AbortError') echec(); }
    });
  }

  // Les têtes à côté des prénoms, sur les tickets de la page
  function tetes() {
    scene.querySelectorAll('.reponses .carte, .reponses .scelle').forEach((el) => {
      const nom = el.querySelector('.nom');
      if (!nom || nom.querySelector('img.tete')) return;
      const moiMeme = nom.textContent.indexOf('Ta réponse') === 0;
      const qui = moiMeme ? moi : autre;
      const img = new Image();
      img.className = 'tete'; img.alt = ''; img.setAttribute('aria-hidden', 'true');
      const base = norm(qui) === norm(PRENOM_LUI) ? 'moi' : 'elle';
      img.onerror = () => { img.onerror = null; img.src = base + '.jpg'; };
      img.src = base + '.png';
      img.style.cssText = 'width:2.4rem;height:2.4rem;border-radius:50%;object-fit:cover;object-position:50% 35%;' +
        'vertical-align:middle;margin:0 .5rem 0 0;border:2px solid #fff;box-shadow:0 0 0 1.5px #3A2519';
      nom.prepend(img);
      if (moiMeme) nom.append(' · ' + moi);
    });
  }

  new MutationObserver(() => { tetes(); injecter(); }).observe(scene, { childList: true });
  tetes();
  injecter();
})();
