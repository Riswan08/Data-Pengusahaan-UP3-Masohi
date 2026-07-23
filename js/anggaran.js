/* ================= 10 · ANGGARAN INVESTASI ================= */
(function(){
  if(typeof anggaran === 'undefined') return;
  const L = anggaran.luncuran, M = anggaran.murni;
  const tot = {
    pagu: L.pagu + M.pagu,
    kontrak: L.kontrak + M.kontrak,
    terkontrak: L.terkontrak + M.terkontrak,
    terbayar: L.terbayar + M.terbayar
  };
  const rpM = v => (v/1e9).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2});
  const rp  = v => Math.round(v).toLocaleString('id-ID');
  const pct = (a,b,dec) => b ? (a/b*100).toLocaleString('id-ID',{minimumFractionDigits:dec===undefined?1:dec,maximumFractionDigits:dec===undefined?1:dec}) : '0';
  const warnaFungsi = {Pemasaran:'#0E4C92', Keandalan:'#C88F00', Efisiensi:'#1E8E5A'};

  /* ---- kartu ringkasan gabungan ---- */
  document.getElementById('aiCards').innerHTML = `
    <div class="card acc blue"><div class="lbl">Pagu AI · gabungan</div><div class="val">${rpM(tot.pagu)}<small>M</small></div><div class="sub">Rp ${rp(tot.pagu)} · ${tot.kontrak} kontrak</div></div>
    <div class="card acc green"><div class="lbl">Terkontrak</div><div class="val">${rpM(tot.terkontrak)}<small>M</small></div><span class="delta d-up">${pct(tot.terkontrak,tot.pagu)}% dari pagu</span></div>
    <div class="card acc amber"><div class="lbl">Terbayar</div><div class="val">${rpM(tot.terbayar)}<small>M</small></div><span class="delta d-info">${pct(tot.terbayar,tot.terkontrak)}% dari terkontrak</span></div>
    <div class="card acc red"><div class="lbl">Belum terbayar</div><div class="val">${rpM(tot.terkontrak-tot.terbayar)}<small>M</small></div><span class="delta d-warn">${pct(tot.terkontrak-tot.terbayar,tot.terkontrak)}% · rencana s.d. Des</span></div>`;

  /* ---- panel per sumber (Luncuran / Murni) dengan bar per fungsi ---- */
  function panel(s, aksen){
    const barFungsi = s.fungsi.map(f => `
      <div class="ai-frow">
        <div class="ai-ftop"><span class="ai-fnama"><span class="dot" style="background:${warnaFungsi[f.n]}"></span>${f.n}</span>
          <span class="mono ai-fval">Rp ${rp(f.pagu)}</span></div>
        <div class="ai-bar"><div class="ai-fill" style="width:${Math.min(f.terkontrak/f.pagu*100,100)}%;background:${warnaFungsi[f.n]}"></div></div>
        <div class="ai-bawah"><span>Terkontrak ${pct(f.terkontrak,f.pagu)}%</span><span>Terbayar <b>${pct(f.terbayar,f.terkontrak)}%</b></span></div>
      </div>`).join('');
    return `
    <div class="card ai-panel" style="border-top:3px solid ${aksen}">
      <div class="ai-head">
        <div><div class="lbl">${s.label.toUpperCase()} · ${s.dasar.toUpperCase()}</div>
          <div class="val" style="font-size:24px">${rpM(s.pagu)}<small>M pagu</small></div></div>
        <span class="pill p-info" style="align-self:flex-start">${s.kontrak} KONTRAK</span>
      </div>
      <div class="ai-duo">
        <div><span class="lbl">Terkontrak</span><b>${rpM(s.terkontrak)} M</b><span class="ai-pct" style="color:var(--hijau)">${pct(s.terkontrak,s.pagu)}%</span></div>
        <div><span class="lbl">Terbayar</span><b>${rpM(s.terbayar)} M</b><span class="ai-pct" style="color:var(--kuning)">${pct(s.terbayar,s.terkontrak)}%</span></div>
      </div>
      ${barFungsi}
    </div>`;
  }
  document.getElementById('aiSumber').innerHTML = panel(L, '#28456E') + panel(M, '#C88F00');

  /* ---- grafik rencana bayar per bulan (stacked) ---- */
  const namaBln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  charts.aiBulan = new Chart(document.getElementById('chAiBulan'), {
    type:'bar',
    data:{labels:namaBln, datasets:[
      {label:'Luncuran 2025', data:L.bayarBulan, backgroundColor:'#4A76B8', borderRadius:4, stack:'a'},
      {label:'Murni 2026', data:M.bayarBulan, backgroundColor:'#C88F00', borderRadius:4, stack:'a'}
    ]},
    options:{maintainAspectRatio:false,
      plugins:{legend:{position:'top',align:'end',labels:{boxWidth:11}}},
      scales:{x:{stacked:true}, y:{stacked:true, ticks:{precision:0}}}}
  });

  /* ---- tabel rincian program ---- */
  const semua = [
    ...L.program.map(p=>({...p, sumber:'luncuran', sLabel:'Luncuran'})),
    ...M.program.map(p=>({...p, sumber:'murni', sLabel:'Murni'}))
  ];
  const tb = document.querySelector('#tblAi tbody');
  let fAi = 'semua', cAi = '';
  function statusAi(p){
    const b = p.terkontrak ? p.terbayar/p.terkontrak : 0;
    if(b >= 0.99) return '<span class="pill p-ok">LUNAS</span>';
    if(b > 0) return '<span class="pill p-info">BERJALAN</span>';
    return '<span class="pill p-warn">KONTRAK</span>';
  }
  function renderAi(){
    const rows = semua.filter(p => (fAi==='semua'||p.sumber===fAi) &&
      (p.u.toLowerCase().includes(cAi) || p.prk.toLowerCase().includes(cAi) || p.f.toLowerCase().includes(cAi)));
    let html = rows.map(p => `<tr${p.rekap?' style="opacity:.75"':''}>
      <td class="mono" style="font-size:11.5px;white-space:nowrap">${p.prk}</td>
      <td><span class="pill ${p.sumber==='murni'?'p-warn':'p-info'}">${p.sLabel.toUpperCase()}</span></td>
      <td style="white-space:nowrap"><span class="dot" style="background:${warnaFungsi[p.f]||'var(--faint)'}"></span>${p.f}</td>
      <td>${p.u}</td>
      <td class="num">${rp(p.pagu)}</td>
      <td class="num">${p.kontrak}</td>
      <td class="num">${rp(p.terkontrak)}</td>
      <td class="num">${pct(p.terkontrak,p.pagu)}%</td>
      <td class="num">${p.terbayar ? rp(p.terbayar) : '—'}</td>
      <td class="num">${pct(p.terbayar,p.terkontrak)}%</td>
      <td>${statusAi(p)}</td></tr>`).join('');
    const s = rows.reduce((a,p)=>({pagu:a.pagu+p.pagu, k:a.k+p.kontrak, tk:a.tk+p.terkontrak, tb:a.tb+p.terbayar}), {pagu:0,k:0,tk:0,tb:0});
    html += `<tr class="total"><td colspan="4">Jumlah (${rows.length} baris)</td>
      <td class="num">${rp(s.pagu)}</td><td class="num">${s.k}</td><td class="num">${rp(s.tk)}</td>
      <td class="num">${pct(s.tk,s.pagu)}%</td><td class="num">${rp(s.tb)}</td><td class="num">${pct(s.tb,s.tk)}%</td><td></td></tr>`;
    tb.innerHTML = html;
    document.getElementById('cntAi').textContent = rows.length + ' program';
  }
  renderAi();
  document.getElementById('segAi').addEventListener('click', e=>{
    if(e.target.tagName!=='BUTTON') return;
    document.querySelectorAll('#segAi button').forEach(b=>b.classList.remove('on'));
    e.target.classList.add('on'); fAi = e.target.dataset.f; renderAi();
  });
  document.getElementById('cariAi').addEventListener('input', e=>{ cAi = e.target.value.toLowerCase(); renderAi(); });
})();
