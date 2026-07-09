/* ================= UTIL ================= */
const idn = n => (n===null||n===undefined||isNaN(n)) ? '—' : Math.round(n).toLocaleString('id-ID');
const f2 = n => (n===null||n===undefined||isNaN(n)) ? '—' : n.toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2});
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ================= METADATA DOKUMEN ================= */
if(typeof META !== 'undefined'){
  const up = s => String(s).toUpperCase();
  const blnAkhir = bulan[bulan.length-1];
  /* posisi dokumen mengikuti bulan terakhir data yang di-update */
  const namaBulanPenuh = {Jan:'Januari',Feb:'Februari',Mar:'Maret',Apr:'April',Mei:'Mei',Jun:'Juni',Jul:'Juli',Agu:'Agustus',Sep:'September',Okt:'Oktober',Nov:'November',Des:'Desember'};
  const posisiDok = (namaBulanPenuh[blnAkhir]||blnAkhir) + ' ' + META.tahun;
  document.title = 'Profil Pengusahaan — UP3 Masohi · ' + posisiDok;
  document.getElementById('docPos').textContent = 'POSISI DATA · ' + up(posisiDok);
  document.getElementById('footPos').textContent = 'Profil pengusahaan UP3 Masohi · posisi data ' + posisiDok;
  document.querySelectorAll('[data-meta="posisi"]').forEach(e => e.textContent = 'DATA ' + up(META.posisiData));
  document.querySelectorAll('[data-meta="monitoring"]').forEach(e => e.textContent = 'MONITORING ' + up(META.monitoringPembangkit));
  document.querySelectorAll('[data-meta="rentang"]').forEach(e => e.textContent = up(bulan[0]) + '–' + up(blnAkhir) + ' ' + META.tahun);
  document.querySelectorAll('.bulan-akhir').forEach(e => e.textContent = blnAkhir);
}

/* ================= TEMA ================= */
const themeBtn = document.getElementById('themeBtn');
function applyTheme(dark){
  document.documentElement.classList.toggle('dark', dark);
  themeBtn.textContent = dark ? '☀ TERANG' : '☾ GELAP';
  Chart.defaults.color = dark ? '#9AA9C2' : '#54647E';
  Chart.defaults.borderColor = dark ? 'rgba(155,180,220,.14)' : 'rgba(16,35,63,.1)';
  Object.values(charts).forEach(ch=>ch && ch.update());
}
const charts = {};
themeBtn.onclick = ()=>{
  const dark = !document.documentElement.classList.contains('dark');
  applyTheme(dark);
  try{ localStorage.setItem('tema', dark ? 'gelap' : 'terang'); }catch(e){}
  if(window.renderUnit9) renderUnit9();
};

/* ================= NERACA ================= */
const tot = neraca.reduce((a,u)=>({p:a.p+u.p, d:a.d+u.d, k:a.k+u.k}), {p:0,d:0,k:0});
document.getElementById('vPlg').textContent = idn(tot.p);
document.getElementById('vDaya').innerHTML = (tot.d/1e6).toFixed(2).replace('.',',')+'<small>MVA</small>';
document.getElementById('vDayaVa').textContent = idn(tot.d)+' VA';

const wilayah = u => u.t==='ULP' ? u.n : (indukNer[u.n]||'—');
const agg = {};
neraca.forEach(u=>{
  const w = wilayah(u);
  agg[w] = agg[w]||{p:0,d:0,k:0};
  agg[w].p+=u.p; agg[w].d+=u.d; agg[w].k+=u.k;
});
const ulpOrder = ['ULP Masohi','ULP Kairatu','ULP Piru','ULP Kobisonta','ULP Bula'];
const terbesar = ulpOrder.reduce((a,b)=>agg[a].p>=agg[b].p?a:b);

document.getElementById('neracaCards').innerHTML = `
  <div class="card blue"><div class="lbl">Total pelanggan</div><div class="val">${idn(tot.p)}</div><div class="sub">31 unit (5 ULP + 26 KP)</div></div>
  <div class="card blue"><div class="lbl">Daya tersambung</div><div class="val">${(tot.d/1e6).toFixed(2).replace('.',',')}<small>MVA</small></div><div class="sub">${idn(tot.d)} VA</div></div>
  <div class="card blue"><div class="lbl">Penjualan bulanan (Mei)</div><div class="val">${(tot.k/1e6).toFixed(2).replace('.',',')}<small>GWh</small></div><div class="sub">${idn(tot.k)} kWh</div></div>
  <div class="card green"><div class="lbl">Wilayah pelanggan terbesar</div><div class="val" style="font-size:22px">${terbesar}</div><span class="delta d-up">${idn(agg[terbesar].p)} pelanggan (induk + KP)</span></div>`;

const tbNer = document.querySelector('#tblNer tbody');
const cntNer = document.getElementById('cntNer');
let fU='semua', fN='';
function renderNer(){
  const rows = neraca.filter(u=>(fU==='semua'||u.t===fU) && u.n.toLowerCase().includes(fN));
  let html = rows.map(u=>`<tr${u.t==='ULP'?' class="group"':''}>
    <td>${u.n}</td>
    <td><span class="pill ${u.t==='ULP'?'p-info':'p-warn'}">${u.t}</span></td>
    <td>${wilayah(u)}</td>
    <td class="num">${idn(u.p)}</td>
    <td class="num">${idn(u.d)}</td>
    <td class="num">${idn(u.k)}</td></tr>`).join('');
  const s = rows.reduce((a,u)=>({p:a.p+u.p,d:a.d+u.d,k:a.k+u.k}),{p:0,d:0,k:0});
  html += `<tr class="total"><td colspan="3">Jumlah (${rows.length} unit)</td><td class="num">${idn(s.p)}</td><td class="num">${idn(s.d)}</td><td class="num">${idn(s.k)}</td></tr>`;
  tbNer.innerHTML = html;
  cntNer.textContent = rows.length + ' unit';
}
renderNer();
document.getElementById('segNer').addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  document.querySelectorAll('#segNer button').forEach(b=>b.classList.remove('on'));
  e.target.classList.add('on'); fU = e.target.dataset.f; renderNer();
});
document.getElementById('cariNer').addEventListener('input', e=>{fN=e.target.value.toLowerCase(); renderNer();});

/* ================= SISTEM ================= */
const tbSis = document.querySelector('#tblSis tbody');
const cntSis = document.getElementById('cntSis');
let fJ='semua';
function renderSis(){
  const rows = sistem.filter(s=>fJ==='semua'||s.st===fJ);
  tbSis.innerHTML = rows.map(s=>{
    const load = s.bp/s.dm*100;
    const lp = load>=90?'p-bad':load>=75?'p-warn':'p-ok';
    return `<tr><td>${s.n}<div style="font-size:11px;color:var(--faint)">ULP ${s.u}</div></td>
      <td><span class="pill ${s.st==='Aman'?'p-ok':'p-bad'}">${s.st.toUpperCase()}</span></td>
      <td class="num">${s.j} jam</td>
      <td class="num">${f2(s.dp)}</td><td class="num">${f2(s.dm)}</td>
      <td class="num">${f2(s.bp)}</td><td class="num">${f2(s.cad)}</td>
      <td class="num"><span class="pill ${lp}">${load.toFixed(0)}%</span></td></tr>`;
  }).join('');
  cntSis.textContent = rows.length + ' sistem';
}
renderSis();
document.getElementById('segSis').addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  document.querySelectorAll('#segSis button').forEach(b=>b.classList.remove('on'));
  e.target.classList.add('on'); fJ = e.target.dataset.f; renderSis();
});

/* ================= PETA ================= */
const peta = L.map('peta', {scrollWheelZoom:false});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(peta);
peta.fitBounds([[-4.8,127.8],[-2.6,131.9]]);
const grup = L.layerGroup().addTo(peta);
const legendEl = document.getElementById('mapLegend');
function titik(latlng,color,r,label,perm){
  const m = L.circleMarker(latlng,{radius:r,color:'#FFFFFF',weight:1.5,fillColor:color,fillOpacity:.95});
  if(perm) m.bindTooltip(label,{permanent:true,direction:'top',offset:[0,-6],className:'lbl-tip'});
  return m;
}
function drawMap(lay){
  grup.clearLayers();
  if(lay==='sistem'){
    sistem.forEach(s=>{
      const warna = s.st==='Aman' ? '#1E8E5A' : '#C88F00';
      const m = titik(s.c, warna, Math.max(4.5,Math.min(13,3+Math.sqrt(s.dm)*2)), s.n, s.dm>=5);
      const load = (s.bp/s.dm*100).toFixed(1).replace('.',',');
      m.bindPopup(`<b>${s.n}</b><br>ULP ${s.u} · ${s.j} jam · <b>${s.st}</b><br>DM ${f2(s.dm)} MW · BP ${f2(s.bp)} MW<br>Cadangan ${f2(s.cad)} MW · beban ${load}%`);
      grup.addLayer(m);
    });
    legendEl.innerHTML = `<span><span class="dot" style="background:#1E8E5A"></span>Sistem aman</span>
      <span><span class="dot" style="background:#C88F00"></span>Sistem siaga</span>
      <span>Ukuran titik ∝ daya mampu</span>`;
  } else {
    neraca.forEach(u=>{
      const p = koorNer[u.n]; if(!p) return;
      const isUlp = u.t==='ULP';
      const warna = warnaUlp[isUlp?u.n:indukNer[u.n]] || '#0E7D92';
      const m = titik(p, warna, isUlp?9:5.5, u.n, isUlp);
      m.bindPopup(`<b>${u.n}</b>${isUlp?'':' · '+(indukNer[u.n]||'')}<br>Pelanggan ${idn(u.p)}<br>Daya ${idn(u.d)} VA<br>Penjualan Mei ${idn(u.k)} kWh`);
      grup.addLayer(m);
    });
    legendEl.innerHTML = ulpOrder.map(u=>`<span><span class="dot" style="background:${warnaUlp[u]}"></span>${u.replace('ULP ','Wil. ')}</span>`).join('') + '<span>Titik besar = ULP induk · kecil = KP</span>';
  }
}
drawMap('unit');
document.getElementById('segMap').addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  document.querySelectorAll('#segMap button').forEach(b=>b.classList.remove('on'));
  e.target.classList.add('on'); drawMap(e.target.dataset.lay);
});

/* ================= CHARTS ================= */
Chart.defaults.font.family = "'IBM Plex Sans',sans-serif";
Chart.defaults.font.size = 12;

charts.peg = new Chart(document.getElementById('chPeg'), {
  type:'doughnut',
  data:{labels:['UP3 (kantor induk)','ULP Masohi','ULP Bula','ULP Kairatu','ULP Kobisonta','ULP Piru'],
    datasets:[{data:[38,15,15,12,12,10],
      backgroundColor:['#C88F00','#0E7D92','#4A76B8','#1E8E5A','#C43F37','#5B54B8'],borderWidth:0}]},
  options:{maintainAspectRatio:false,cutout:'58%',
    plugins:{legend:{position:'right',labels:{boxWidth:11,padding:10}}}}
});

charts.nerPlg = new Chart(document.getElementById('chNerPlg'), {
  type:'bar',
  data:{labels:ulpOrder.map(u=>u.replace('ULP ','')),
    datasets:[{label:'Pelanggan (induk + KP)',data:ulpOrder.map(u=>agg[u].p),
      backgroundColor:ulpOrder.map(u=>warnaUlp[u]),borderRadius:6}]},
  options:{maintainAspectRatio:false,plugins:{legend:{display:false},
    tooltip:{callbacks:{label:c=>' '+idn(c.raw)+' pelanggan'}}},
    scales:{y:{ticks:{callback:v=>idn(v)}}}}
});

charts.nerKwh = new Chart(document.getElementById('chNerKwh'), {
  type:'bar',
  data:{labels:ulpOrder.map(u=>u.replace('ULP ','')),
    datasets:[{label:'GWh',data:ulpOrder.map(u=>+(agg[u].k/1e6).toFixed(3)),
      backgroundColor:ulpOrder.map(u=>warnaUlp[u]),borderRadius:6}]},
  options:{maintainAspectRatio:false,plugins:{legend:{display:false},
    tooltip:{callbacks:{label:c=>' '+f2(c.raw)+' GWh'}}}}
});

charts.aset = new Chart(document.getElementById('chAset'), {
  type:'bar',
  data:{labels:['Masohi','Bula','Piru','Kairatu','Kobisonta'],
    datasets:[
      {label:'JTM (kms)',data:[454.11,411.36,384.19,273.72,269.58],backgroundColor:'#0E4C92',borderRadius:5},
      {label:'JTR (kms)',data:[327.73,186.00,179.79,137.66,178.49],backgroundColor:'#C88F00',borderRadius:5}
    ]},
  options:{maintainAspectRatio:false,indexAxis:'y',
    plugins:{legend:{position:'top',align:'end',labels:{boxWidth:11}}},
    scales:{x:{stacked:false}}}
});

const dsNko = Object.entries(nko).map(([k,v])=>({label:k,data:v.d,borderColor:v.c,backgroundColor:v.c,borderWidth:v.w,pointRadius:3.5,tension:.3}));
const refT = {label:'Target NKO (110)',data:bulan.map(()=>110),borderColor:'rgba(196,63,55,.75)',borderDash:[7,5],borderWidth:1.6,pointRadius:0,tension:0,order:99};
charts.nko = new Chart(document.getElementById('chNko'), {
  type:'line', data:{labels:bulan,datasets:[...dsNko,refT]},
  options:{maintainAspectRatio:false,
    plugins:{legend:{position:'top',align:'end',labels:{boxWidth:10,boxHeight:10,padding:12}}},
    scales:{y:{min:80,max:115}}}
});
document.getElementById('segNko').addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  document.querySelectorAll('#segNko button').forEach(b=>b.classList.remove('on'));
  e.target.classList.add('on');
  const f = e.target.dataset.f;
  charts.nko.data.datasets.forEach(ds=>{
    if(ds.order===99) return;
    ds.hidden = f==='up3' ? ds.label!=='UP3 Masohi'
              : f==='ulp' ? ds.label==='UP3 Masohi' : false;
  });
  charts.nko.update();
});

const mei = Object.entries(nko).map(([k,v])=>({n:k,jan:v.d[0],mei:v.d[v.d.length-1],c:v.c}));
charts.nkoBar = new Chart(document.getElementById('chNkoBar'), {
  type:'bar',
  data:{labels:mei.map(m=>m.n.replace('ULP ','')),
    datasets:[{label:'NKO Mei',data:mei.map(m=>m.mei),backgroundColor:mei.map(m=>m.c),borderRadius:6}]},
  options:{maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:90,max:112}}}
});

const rank = mei.filter(m=>m.n!=='UP3 Masohi').sort((a,b)=>(b.mei??-1)-(a.mei??-1));
document.querySelector('#tblRank tbody').innerHTML = rank.map((m,i)=>{
  const d = (m.mei===null||m.mei===undefined||m.jan===null||m.jan===undefined) ? null : m.mei-m.jan;
  return `<tr><td class="num">${i+1}</td><td>${m.n}</td>
    <td class="num">${f2(m.jan)}</td><td class="num"><b>${f2(m.mei)}</b></td>
    <td class="num">${d===null?'—':`<span class="pill ${d>=0?'p-ok':'p-bad'}">${d>=0?'▲ +':'▼ '}${f2(d)}</span>`}</td></tr>`;
}).join('');

/* tema awal: ikuti pilihan tersimpan, atau preferensi sistem */
let temaAwal = false;
try{
  const t = localStorage.getItem('tema');
  temaAwal = t ? t === 'gelap' : window.matchMedia('(prefers-color-scheme: dark)').matches;
}catch(e){}
applyTheme(temaAwal);

/* ================= CETAK / PDF (dengan pilihan bab) ================= */
const printSections = [
  {id:'s1', label:'01 · Identitas unit & diagram satu garis'},
  {id:'s3', label:'02 · Organisasi & SDM'},
  {id:'s2', label:'03 · Wilayah kerja & elektrifikasi'},
  {id:'s4', label:'04 · Data pengusahaan pokok'},
  {id:'s5', label:'05 · Neraca pelanggan & penjualan'},
  {id:'s6', label:'06 · Aset jaringan distribusi'},
  {id:'s7', label:'07 · Sistem pembangkitan & kelistrikan'},
  {id:'s8', label:'08 · Realisasi kinerja'},
  {id:'s9', label:'09 · Dashboard kinerja per unit'}
];
const printModal = document.getElementById('printModal');
const pmList = document.getElementById('pmList');
pmList.innerHTML = printSections.map(s =>
  `<label class="pm-item"><input type="checkbox" value="${s.id}" checked> ${s.label}</label>`).join('');
const pmBoxes = () => [...pmList.querySelectorAll('input')];
const pmGo = document.getElementById('pmCetak');
function pmSync(){ pmGo.disabled = !pmBoxes().some(b=>b.checked); }
pmList.addEventListener('change', pmSync);
document.querySelector('.pm-presets').addEventListener('click', e=>{
  const p = e.target.dataset.p; if(!p) return;
  pmBoxes().forEach(b=>{
    b.checked = p==='semua' ? true : p==='kinerja' ? (b.value==='s8'||b.value==='s9') : false;
  });
  pmSync();
});
/* Pembersihan kelas .no-print HANYA setelah dialog cetak benar-benar ditutup
   (afterprint). Di ponsel, window.print() tidak menunggu — membersihkan lebih
   awal membuat semua bab ikut tercetak. */
function pmBersih(){
  printSections.forEach(s=>{
    const el = document.getElementById(s.id);
    if(el) el.classList.remove('no-print');
  });
}
window.addEventListener('afterprint', pmBersih);
const pmOpen = ()=>{ pmBersih(); printModal.classList.add('open'); };
const pmClose = ()=>printModal.classList.remove('open');
document.getElementById('printBtn').onclick = pmOpen;
document.getElementById('pmBatal').onclick = pmClose;
document.getElementById('pmClose').onclick = pmClose;
printModal.addEventListener('click', e=>{ if(e.target===printModal) pmClose(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') pmClose(); });
pmGo.onclick = ()=>{
  const pilih = new Set(pmBoxes().filter(b=>b.checked).map(b=>b.value));
  if(!pilih.size) return;
  printSections.forEach(s=>{
    const el = document.getElementById(s.id);
    if(el) el.classList.toggle('no-print', !pilih.has(s.id));
  });
  pmClose();
  setTimeout(()=>window.print(), 120);
};

/* ================= KEMBALI KE ATAS ================= */
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', ()=>toTop.classList.toggle('show', window.scrollY > 600), {passive:true});
toTop.onclick = ()=>window.scrollTo({top:0, behavior:'smooth'});

/* ================= SCROLL-SPY SIDEBAR ================= */
const spyLinks = [...document.querySelectorAll('#sbSubProfil a[href^="#"]')];
const spyMap = {};
spyLinks.forEach(a=>{ spyMap[a.getAttribute('href').slice(1)] = a; });
const spyObs = new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(!en.isIntersecting) return;
    spyLinks.forEach(a=>a.classList.remove('active'));
    const a = spyMap[en.target.id];
    if(a) a.classList.add('active');
  });
}, {rootMargin:'-25% 0px -65% 0px'});
Object.keys(spyMap).forEach(id=>{ const el = document.getElementById(id); if(el) spyObs.observe(el); });

/* sidebar: tutup otomatis di layar kecil setelah memilih bab */
spyLinks.forEach(a=>a.addEventListener('click', ()=>{
  if(window.innerWidth<=1100) document.body.classList.remove('sb-open');
}));
