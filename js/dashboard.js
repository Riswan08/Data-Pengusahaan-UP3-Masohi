

const kpiUP3 = kpiData.map(k=>({no:k.no,name:k.name,sat:k.satuan,bob:k.bobot,grp:k.isGroup,
  target:k.target,realisasi:k.realisasi,pencapaian:k.pencapaian,nilai100:k.nilai100}));
const unitKeys = ['up3','masohi','kairatu','piru','kobisonta','bula'];
const unitIcon = k => k==='up3' ? '🏢' : '📍';
const unitColor = {up3:'#C88F00',masohi:'#0E7D92',kairatu:'#1E8E5A',piru:'#5B54B8',kobisonta:'#C43F37',bula:'#4A76B8'};
let unit9 = 'up3', bulan9 = bulan.length-1; /* default: bulan terakhir yang tersedia */

function kpi9(key){ return key==='up3' ? kpiUP3 : ulpData[key].kpi; }
function fmt9(v,dec){ return (v===null||v===undefined||isNaN(v)) ? '—' : v.toLocaleString('id-ID',{minimumFractionDigits:dec===undefined?2:dec,maximumFractionDigits:dec===undefined?2:dec}); }

/* --- sidebar unit submenu --- */
const sbUnits = document.getElementById('sbUnits');
function sbBtn9(k){
  const u = ulpData[k], v = u.nko[u.nko.length-1];
  const cls = k==='up3' ? 'top' : (v>=100 ? 'ok' : 'warn');
  return `<button class="sb-item sb-unit" id="sbu-${k}" data-u="${k}">
    <span>${unitIcon(k)} ${u.label}</span><span class="nko ${cls}">${fmt9(v)}</span></button>`;
}
sbUnits.innerHTML = `
  <div class="sb-parent">
    ${sbBtn9('up3')}
    <button class="sb-caret open" id="sbCaret" title="Buka/tutup daftar ULP">▾</button>
  </div>
  <div class="sb-sub open" id="sbSubUlp">
    ${unitKeys.filter(k=>k!=='up3').map(sbBtn9).join('')}
  </div>`;
document.getElementById('sbCaret').addEventListener('click', e=>{
  e.stopPropagation();
  document.getElementById('sbSubUlp').classList.toggle('open');
  e.currentTarget.classList.toggle('open');
});
sbUnits.addEventListener('click', e=>{
  const b = e.target.closest('.sb-unit'); if(!b) return;
  setUnit9(b.dataset.u);
  if(b.dataset.u==='up3'){ /* pastikan dropdown ULP terbuka saat UP3 dipilih */
    document.getElementById('sbSubUlp').classList.add('open');
    document.getElementById('sbCaret').classList.add('open');
  }
  document.getElementById('s9').scrollIntoView({behavior:'smooth'});
  if(window.innerWidth<=1100) document.body.classList.remove('sb-open');
});

/* --- in-section unit & month selectors --- */
const segU9 = document.getElementById('segUnit9');
segU9.innerHTML = unitKeys.map(k=>`<button data-u="${k}" class="${k==='up3'?'on':''}">${k==='up3'?'UP3':ulpData[k].label.replace('ULP ','').toUpperCase()}</button>`).join('');
segU9.addEventListener('click', e=>{ if(e.target.tagName==='BUTTON') setUnit9(e.target.dataset.u); });

const segB9 = document.getElementById('segBulan9');
const namaBulanMap = {Jan:'Januari',Feb:'Februari',Mar:'Maret',Apr:'April',Mei:'Mei',Jun:'Juni',Jul:'Juli',Agu:'Agustus',Sep:'September',Okt:'Oktober',Nov:'November',Des:'Desember'};
const namaBulan = bulan.map(b=>namaBulanMap[b]||b);
segB9.innerHTML = bulan.map((b,i)=>`<button data-m="${i}" class="${i===bulan.length-1?'on':''}">${b.toUpperCase()}</button>`).join('');
segB9.addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  bulan9 = +e.target.dataset.m;
  segB9.querySelectorAll('button').forEach(x=>x.classList.toggle('on', +x.dataset.m===bulan9));
  renderUnit9();
});

function setUnit9(key){
  unit9 = key;
  segU9.querySelectorAll('button').forEach(x=>x.classList.toggle('on', x.dataset.u===key));
  document.querySelectorAll('.sb-unit').forEach(x=>x.classList.toggle('active', x.dataset.u===key));
  renderUnit9();
}

function renderUnit9(){
  const u = ulpData[unit9], m = bulan9, arr = kpi9(unit9);
  document.getElementById('u9Title').textContent = u.label;
  document.getElementById('u9Sub').textContent = u.subtitle + ' · Data ' + bulan[0] + '–' + bulan[bulan.length-1] + ' ' + (typeof META!=='undefined'?META.tahun:'');
  document.getElementById('u9TblTitle').textContent = 'Rekapitulasi indikator kinerja — ' + u.label + ' · ' + namaBulan[m] + ' 2026';

  /* cards */
  const subs = arr.filter(k=>!k.grp && k.pencapaian[m]!==null && !isNaN(k.pencapaian[m]));
  const tercapai = subs.filter(k=>k.pencapaian[m]>=100).length;
  const perhatian = subs.length - tercapai;
  const avg = subs.reduce((s,k)=>s+k.pencapaian[m],0)/(subs.length||1);
  const nkoM = u.nko[m];
  const dM = (m>0 && nkoM!==null && nkoM!==undefined && u.nko[m-1]!==null && u.nko[m-1]!==undefined) ? nkoM-u.nko[m-1] : null;
  document.getElementById('u9Cards').innerHTML = `
    <div class="card acc amber"><div class="lbl">NKO ${namaBulan[m]}</div><div class="val">${fmt9(nkoM)}</div>
      ${dM===null?'<div class="sub">skala nilai 110</div>':`<span class="delta ${dM>=0?'d-up':'d-warn'}">${dM>=0?'▲ +':'▼ '}${fmt9(dM)} dari ${namaBulan[m-1]}</span>`}</div>
    <div class="card green"><div class="lbl">Sub-indikator tercapai</div><div class="val">${tercapai}<small>/ ${subs.length}</small></div><div class="sub">pencapaian ≥ 100%</div></div>
    <div class="card blue"><div class="lbl">Rata-rata pencapaian</div><div class="val">${fmt9(avg,1)}<small>%</small></div><div class="sub">rerata sub-indikator ${namaBulan[m]}</div></div>
    <div class="card ${perhatian>0?'red':'green'}"><div class="lbl">Perlu perhatian</div><div class="val">${perhatian}</div><div class="sub">sub-indikator &lt; 100%</div></div>`;

  /* table */
  document.querySelector('#tblKpi9 tbody').innerHTML = arr.map(k=>{
    const isGrp = k.grp;
    const p = k.pencapaian[m];
    const status = isGrp ? '' :
      (p===null||isNaN(p)) ? '' :
      p>=100 ? '<span class="pill p-ok">TERCAPAI</span>' :
      p>=90 ? '<span class="pill p-warn">HAMPIR</span>' : '<span class="pill p-bad">PERHATIAN</span>';
    return `<tr class="${isGrp?'kgrp':''}">
      <td class="num">${k.no}</td><td>${k.name}</td><td>${k.sat||'—'}</td>
      <td class="num">${k.bob}</td>
      <td class="num">${fmt9(k.target[m])}</td>
      <td class="num">${fmt9(k.realisasi[m])}</td>
      <td class="num">${fmt9(p,1)}${(p===null||isNaN(p))?'':'%'}</td>
      <td class="num"><b>${fmt9(k.nilai100[m])}</b></td>
      <td>${status}</td></tr>`;
  }).join('');

  const note = document.getElementById('u9NoteUp3');
  note.style.display = unit9==='up3' ? 'block' : 'none';
  note.innerHTML = '💡 Dua sub-KPI UP3 yang memerlukan perhatian khusus per Mei: <b>daya tersambung</b> (68,9% dari target) dan <b>aset RUPTL</b> (90%, prognosa Juni 109% pasca rekon) — rincian pada bab 08.';

  /* charts */
  const clr = unitColor[unit9];
  if(charts.u9Nko) charts.u9Nko.destroy();
  const ds = [{label:u.label,data:u.nko,borderColor:clr,backgroundColor:clr,borderWidth:2.4,pointRadius:3.5,tension:.3}];
  if(unit9!=='up3') ds.push({label:'UP3 Masohi (referensi)',data:ulpData.up3.nko,borderColor:'rgba(200,143,0,.55)',borderDash:[6,4],borderWidth:1.6,pointRadius:0,tension:.3});
  ds.push({label:'Target 110',data:bulan.map(()=>110),borderColor:'rgba(196,63,55,.7)',borderDash:[7,5],borderWidth:1.4,pointRadius:0});
  charts.u9Nko = new Chart(document.getElementById('chU9Nko'),{type:'line',
    data:{labels:bulan,datasets:ds},
    options:{maintainAspectRatio:false,plugins:{legend:{position:'top',align:'end',labels:{boxWidth:10,boxHeight:10}}},scales:{y:{min:80,max:115}}}});
  document.getElementById('u9TrenTitle').textContent = unit9==='up3' ? 'Tren NKO UP3 Masohi' : 'Tren NKO ' + u.label + ' vs UP3';

  if(charts.u9Bobot) charts.u9Bobot.destroy();
  /* indikator utama = baris tanpa sufiks huruf pada nomor (grup + indikator tunggal) */
  const use = unit9==='up3'
    ? mainKPIs.map(k=>({name:k.name,bob:k.bobot,val:k.nilai100[m]}))
    : arr.filter(k=>!/[a-z]$/i.test(String(k.no)))
         .sort((a,b)=>parseInt(a.no)-parseInt(b.no))
         .map(k=>({name:k.name,bob:k.bob,val:k.nilai100[m]}));
  charts.u9Bobot = new Chart(document.getElementById('chU9Bobot'),{type:'bar',
    data:{labels:use.map(g=>g.name),datasets:[
      {label:'Bobot',data:use.map(g=>g.bob),backgroundColor:'rgba(120,135,160,.35)',borderRadius:4},
      {label:'Nilai '+bulan[m],data:use.map(g=>g.val),backgroundColor:clr,borderRadius:4}]},
    options:{maintainAspectRatio:false,indexAxis:'y',
      plugins:{legend:{position:'top',align:'end',labels:{boxWidth:10}}},
      scales:{y:{ticks:{font:{size:10}}}}}});

  buildGauges9(m);
  buildPerhatian9(m);
}


/* ===== Gauge SVG (diadaptasi dari Dashboard_Multi_Unit_2026) ===== */
function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function makeGaugeSVG(pct){
  const isNul = (pct===null||pct===undefined||isNaN(pct));
  const val = isNul ? 0 : Math.min(Math.max(pct,0),110);
  const W=220,H=135,cx=110,cy=118,RO=100,RI=70;
  const toRad=d=>d*Math.PI/180;
  const pt=(deg,r)=>{const a=toRad(deg);return [+(cx+r*Math.cos(a)).toFixed(3),+(cy-r*Math.sin(a)).toFixed(3)];};
  const vDeg=v=>180-(v/110)*180;
  function donut(v1,v2,ro,ri){
    const a1=vDeg(v1),a2=vDeg(v2),lg=(a1-a2)>=180?1:0;
    const [ox1,oy1]=pt(a1,ro),[ox2,oy2]=pt(a2,ro),[ix2,iy2]=pt(a2,ri),[ix1,iy1]=pt(a1,ri);
    return `M${ox1},${oy1} A${ro},${ro} 0 ${lg},1 ${ox2},${oy2} L${ix2},${iy2} A${ri},${ri} 0 ${lg},0 ${ix1},${iy1} Z`;
  }
  const dark = document.documentElement.classList.contains('dark');
  const track = dark ? '#1B2942' : '#E6E1D5';
  const surface = dark ? '#152036' : '#FFFFFF';
  const tickClr = dark ? '#9AA9C2' : '#54647E';
  const tickLine = dark ? '#66748E' : '#8A96AB';
  const majors=[0,20,40,60,80,90,100,110], minors=[10,30,50,70];
  let ticks='';
  minors.forEach(v=>{const d=vDeg(v);const [x1,y1]=pt(d,RO+2),[x2,y2]=pt(d,RI-1);
    ticks+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tickLine}" stroke-width="1" opacity="0.5"/>`;});
  majors.forEach(v=>{const d=vDeg(v);const [x1,y1]=pt(d,RO+3),[x2,y2]=pt(d,RI-4),[lx,ly]=pt(d,RI-16);
    const anc=lx<cx-5?'end':lx>cx+5?'start':'middle';
    ticks+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tickLine}" stroke-width="2" opacity="0.85"/>`;
    ticks+=`<text x="${lx}" y="${ly}" text-anchor="${anc}" dominant-baseline="middle" font-size="9" font-weight="700" fill="${tickClr}" opacity="0.92" font-family="IBM Plex Mono,monospace">${v}</text>`;});
  const nDeg=vDeg(val);
  const [ntx,nty]=pt(nDeg,RO-5),[nbx,nby]=pt(nDeg+180,12);
  const pw=4.5,pr=toRad(nDeg+90);
  const nl=[+(cx+pw*Math.cos(pr)).toFixed(2),+(cy-pw*Math.sin(pr)).toFixed(2)];
  const nr=[+(cx-pw*Math.cos(pr)).toFixed(2),+(cy+pw*Math.sin(pr)).toFixed(2)];
  const needleClr=val>=90?'#16a34a':val>=80?'#d97706':'#dc2626';
  const pctTextClr=val>=90?'#4ade80':val>=80?'#fbbf24':'#f87171';
  const label=isNul?'–':(val>=110?'110':Number.isInteger(val)?String(val):val.toFixed(1));
  const needleFill = dark ? '#FFFFFF' : '#10233F';
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <path d="${donut(0,110,RO,RI)}" fill="${track}"/>
    <path d="${donut(0,80,RO,RI)}" fill="#dc2626"/>
    <path d="${donut(80,90,RO,RI)}" fill="#f59e0b"/>
    <path d="${donut(90,110,RO,RI)}" fill="#16a34a"/>
    ${ticks}
    <polygon points="${ntx},${nty} ${nl[0]},${nl[1]} ${nbx},${nby} ${nr[0]},${nr[1]}" fill="${needleFill}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" stroke-linejoin="round"/>
    <circle cx="${cx}" cy="${cy}" r="10" fill="${surface}" stroke="${needleFill}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="4.5" fill="${needleClr}"/>
    <rect x="${cx-26}" y="${cy-54}" width="52" height="20" rx="10" fill="rgba(0,0,0,0.6)"/>
    <text x="${cx}" y="${cy-44}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="800" fill="${pctTextClr}" font-family="IBM Plex Mono,monospace">${label}%</text>
  </svg>`;
}

/* ===== Pencapaian sub-indikator (gauges) ===== */
function buildGauges9(m){
  const arr = kpi9(unit9);
  const find = q => {
    const k = arr.find(k=>!k.grp && String(k.name).toLowerCase().includes(q));
    return k ? {pct:k.pencapaian[m],target:k.target[m],realisasi:k.realisasi[m]} : {pct:null,target:null,realisasi:null};
  };
  const G = [
    ['Penjualan Tenaga Listrik','GWh',find('penjualan tenaga')],
    ['Susut Distribusi','%',find('susut distribusi')],
    ['SAIDI','mnt/plg',find('saidi')],
    ['SAIFI','kali/plg',find('saifi')],
    ['ENS','MWh',find('ens')],
    ['Penambahan Pelanggan','Plg',find('penambahan pelanggan')],
    ['Daya Tersambung','MVA',find('daya tersambung')],
    ['Biaya Penyambungan','Rp M',find('biaya penyambungan')],
    ['Pelanggan Lisdes','Plg',find('lisdes')],
    ['Response Time','menit',find('response time')],
    ['Auto Dispatch','%',find('auto dispatch')],
    ['Gangguan TM','kali',find('gangguan tm')],
    ['Perolehan kWh P2TL','kWh',find('p2tl')],
    ['Ganti Meter','Unit',find('ganti meter')],
    ['Pelunasan PRR','Rp Juta',find('pelunasan prr')],
    ['Anggaran Investasi','%',find('anggaran')]
  ];
  const fv = v => (v!==null&&v!==undefined&&!isNaN(v)) ? v.toLocaleString('id-ID',{maximumFractionDigits:2}) : '–';
  document.getElementById('u9GaugeBulan').textContent = namaBulan[m];
  document.getElementById('u9GaugeGrid').innerHTML = G.map(([nm,sat,g])=>`
    <div class="speedo-card">
      ${makeGaugeSVG(g.pct)}
      <div class="gauge-name">${nm}</div>
      <div class="gauge-vals">
        <div class="gv-item">Target<span>${fv(g.target)} ${sat}</span></div>
        <div class="gv-sep"></div>
        <div class="gv-item">Realisasi<span>${fv(g.realisasi)} ${sat}</span></div>
      </div>
    </div>`).join('');
}

/* ===== Perlu perhatian (< 100%) ===== */
function buildPerhatian9(m){
  const arr = kpi9(unit9);
  const items = arr.filter(k=>!k.grp && k.pencapaian[m]!==null && !isNaN(k.pencapaian[m]) && k.pencapaian[m]<100)
                   .sort((a,b)=>a.pencapaian[m]-b.pencapaian[m]);
  const fv = v => (v!==null&&v!==undefined&&!isNaN(v)) ? v.toLocaleString('id-ID',{maximumFractionDigits:2}) : '–';
  document.getElementById('u9PhN').textContent = items.length;
  document.getElementById('u9PhBulan').textContent = namaBulan[m];
  const card = document.getElementById('u9PhCard');
  card.style.borderColor = items.length ? '' : 'var(--hijau)';
  card.style.borderTopColor = items.length ? '' : 'var(--hijau)';
  card.querySelector('.ttl').style.color = items.length ? '' : 'var(--hijau)';
  card.querySelector('.n').style.color = items.length ? '' : 'var(--hijau)';
  document.getElementById('u9PhList').innerHTML = items.length ? items.map(k=>{
    const pct = k.pencapaian[m];
    const clr = pct<50 ? '#dc2626' : pct<80 ? '#ea7317' : '#d9a406';
    return `<div class="ph-item" style="border-left-color:${clr}">
      <div class="ph-top"><div class="ph-name">${k.name.replace(/^\u00b7\s*/,'')}</div><div class="ph-pct" style="color:${clr}">${pct.toFixed(1)}%</div></div>
      <div class="ph-bar"><div class="ph-fill" style="width:${Math.max(pct,0).toFixed(1)}%;background:${clr}"></div></div>
      <div class="ph-tr"><span>Target: <b>${fv(k.target[m])} ${k.sat}</b></span><span>Realisasi: <b style="color:${clr}">${fv(k.realisasi[m])} ${k.sat}</b></span></div>
    </div>`;
  }).join('') : `<div class="ph-ok">✅ Semua sub-indikator tercapai (≥ 100%) pada ${namaBulan[m]} 2026</div>`;
}

/* --- dropdown grup sidebar --- */
function sbGroupToggle(btnId, caretId, subId){
  document.getElementById(btnId).addEventListener('click', ()=>{
    document.getElementById(subId).classList.toggle('open');
    document.getElementById(caretId).classList.toggle('open');
  });
}
sbGroupToggle('sbProfilBtn','sbProfilCaret','sbSubProfil');
sbGroupToggle('sbKinerjaBtn','sbKinerjaCaret','sbSubKinerja');

/* --- sidebar toggle --- */
const sbBtn = document.getElementById('sbToggle');
function initSb(){ if(window.innerWidth>1100) document.body.classList.add('sb-open'); } /* sidebar terbuka saat dimuat hanya di desktop */
const sbToggleAll = ()=>document.body.classList.toggle('sb-open');
sbBtn.onclick = sbToggleAll;
document.getElementById('sbToggleIn').onclick = sbToggleAll;
initSb();

setUnit9('up3');
