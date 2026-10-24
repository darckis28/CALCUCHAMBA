(function(root){const DAY=86400000;function parse(s){const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s).trim());if(!m)return null;const d=+m[1],mo=+m[2],y=+m[3];if(y<1900||y>9999)return null;const t=Date.UTC(y,mo-1,d),v=new Date(t);return v.getUTCFullYear()===y&&v.getUTCMonth()===mo-1&&v.getUTCDate()===d?t/DAY:null}function count(r,inclusive){return r.type==='days'?r.days:r.end-r.start+(inclusive?1:0)}function calculate(rows,inclusive,merge){let intervals=rows.filter(r=>r.type==='dates').map(r=>[r.start,r.end+(inclusive?1:0)]).sort((a,b)=>a[0]-b[0]);let union=0,start=null,end=null;for(const [a,b] of intervals){if(start===null){start=a;end=b}else if(a<=end){end=Math.max(end,b)}else{union+=end-start;start=a;end=b}}if(start!==null)union+=end-start;const dateSum=rows.filter(r=>r.type==='dates').reduce((s,r)=>s+count(r,inclusive),0);const days=rows.filter(r=>r.type==='days').reduce((s,r)=>s+r.days,0);return {total:days+(merge?union:dateSum),overlap:dateSum-union}}function mask(s){const v=s.replace(/\D/g,'').slice(0,8);return v.slice(0,2)+(v.length>2?'/'+v.slice(2,4):'')+(v.length>4?'/'+v.slice(4):'')}function conflicts(r,rows,inc){return rows.filter(x=>x.type==='dates'&&x.id!==r.id&&Math.max(r.start,x.start)<Math.min(r.end+(inc?1:0),x.end+(inc?1:0)))}function today(now=new Date()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return parse(v.day+'/'+v.month+'/'+v.year)}function isPast(r,now=new Date()){return r.type!=='dates'||(r.start<today(now)&&r.end<today(now))}function addMonths(day,n){const d=new Date(day*DAY),y=d.getUTCFullYear(),m=d.getUTCMonth()+n;const first=new Date(Date.UTC(y,m,1));const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();return Date.UTC(first.getUTCFullYear(),first.getUTCMonth(),Math.min(d.getUTCDate(),last))/DAY}function duration(start,end){if(!Number.isInteger(start)||!Number.isInteger(end)||end<start)throw new RangeError('Periodo inválido');const a=new Date(start*DAY),b=new Date(end*DAY);let months=(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth();if(addMonths(start,months)>end)months--;return {years:Math.floor(months/12),months:months%12,days:end-addMonths(start,months)}}function referenceDay(rows,fallback){const dated=rows.filter(r=>r.type==='dates');if(dated.length)return dated.reduce((min,r)=>Math.min(min,r.start),Infinity);if(Number.isInteger(fallback))return fallback;const now=today();const year=new Date(now*DAY).getUTCFullYear();return Math.min(Date.UTC(year,0,1)/DAY,now-1)}function calendarTotal(rows,inclusive,merge,fallback){const total=calculate(rows,inclusive,merge).total;const start=referenceDay(rows,fallback);return duration(start,start+total)}function validRecord(r){if(!r||typeof r!=='object')return false;if(r.type==='days')return Number.isSafeInteger(r.days)&&r.days>0&&r.days<=1000000;return r.type==='dates'&&Number.isInteger(r.start)&&Number.isInteger(r.end)&&r.start>=parse('01/01/1900')&&r.end<=parse('31/12/9999')&&r.end>=r.start}function normalizeDateInput(s){const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(iso)return iso[3]+'/'+iso[2]+'/'+iso[1];const parts=/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/.exec(s);if(parts)return parts[1].padStart(2,'0')+'/'+parts[2].padStart(2,'0')+'/'+parts[3];if(/^\d{8}$/.test(s))return mask(s);return null}root.Calc={referenceDay,validRecord,normalizeDateInput,parse,count,calculate,mask,conflicts,today,isPast,duration,calendarTotal};if(typeof module!=='undefined')module.exports=root.Calc})(typeof window==='undefined'?globalThis:window);

;(function(){
'use strict';
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('es-PE');
const KEY = 'experiencia-clara-v1';
let rows = [], type = 'dates', editing = null, toastTimer, lastDay = Calc.today();
let reference = Calc.referenceDay([]);

function newId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return crypto.randomUUID();
  let id;
  do { id = 'periodo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2); }
  while (rows.some(row => row.id === id));
  return id;
}
function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3500);
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({rows, inclusive: $('inclusive').checked, merge: $('merge').checked, reference}));
    return true;
  } catch {
    $('storagewarning').hidden = false;
    return false;
  }
}
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved && Array.isArray(saved.rows)) {
    const seen = new Set();
    rows = saved.rows.filter(Calc.validRecord).map(row => {
      let id = typeof row.id === 'string' && row.id && !seen.has(row.id) ? row.id : newId();
      while (seen.has(id)) id = newId();
      seen.add(id);
      return row.type === 'dates' ? {id, type:'dates', start:row.start, end:row.end} : {id, type:'days', days:row.days};
    });
    if (Number.isInteger(saved.reference) && saved.reference >= Calc.parse('01/01/1900') && saved.reference < Calc.today()) reference = saved.reference;
    $('inclusive').checked = saved.inclusive !== false;
    $('merge').checked = saved.merge !== false;
    if (rows.length !== saved.rows.length) $('storagewarning').textContent = 'Algunos registros guardados estaban dañados y no se cargaron. Los registros válidos se conservaron.';
    $('storagewarning').hidden = rows.length === saved.rows.length;
  }
} catch { $('storagewarning').hidden = false; }

function date(day) { return new Date(day * 86400000).toISOString().slice(0,10).split('-').reverse().join('/'); }
function iso(day) { return new Date(day * 86400000).toISOString().slice(0,10); }
function eligible(list) { return list.filter(row => Calc.validRecord(row) && Calc.isPast(row)); }
function refreshDateLimits() {
  const max = iso(Calc.today() - 1);
  for (const id of ['startpicker', 'endpicker', 'reference']) { $(id).min = '1900-01-01'; $(id).max = max; }
}
function syncPicker(id) {
  const day = Calc.parse($(id).value);
  $(id + 'picker').value = day === null ? '' : iso(day);
}
function candidate(strict = false) {
  const row = {id: editing || '__draft__', type};
  if (type === 'days') {
    const value = $('days').value.trim();
    if (!value && !strict) return {row:null, error:''};
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > 1000000)
      return {row:null, error:'Ingresa un número entero entre 1 y 1 000 000 días.', field:'days'};
    row.days = Number(value);
    return {row, error:''};
  }
  for (const id of ['start', 'end']) {
    row[id] = Calc.parse($(id).value);
    if (row[id] === null && (strict || $(id).value.length >= 10))
      return {row:null, error:`La fecha de ${id === 'start' ? 'inicio' : 'fin'} no es válida. Usa dd/mm/aaaa y un día real del mes (desde 1900).`, field:id};
    if (row[id] !== null && row[id] >= Calc.today())
      return {row:null, error:`La fecha de ${id === 'start' ? 'inicio' : 'fin'} debe ser anterior a hoy (${date(Calc.today())}, hora de Perú).`, field:id};
  }
  if (row.start === null || row.end === null) return {row:null, error:''};
  if (row.end < row.start) return {row:null, error:'La fecha de fin no puede ser anterior al inicio.', field:'end'};
  if (row.end === row.start && !$('inclusive').checked)
    return {row:null, error:'Este periodo suma 0 días. Incluye ambos extremos para contar ese día trabajado.', field:'end'};
  // Employment dates overlap regardless of the display/counting convention.
  const hits = Calc.conflicts(row, rows, true);
  if (hits.length) return {row:null, error:'Este periodo se cruza con ' + hits.map(x => date(x.start) + ' – ' + date(x.end)).join('; ') + '. Corrige las fechas.', field:'end'};
  return {row, error:''};
}
function displayError(error = '', field) {
  $('error').textContent = error;
  for (const id of ['start','end','days']) $(id).setAttribute('aria-invalid', String(!!error && id === field));
}
function updateTotals() {
  refreshDateLimits();
  const {row, error, field} = candidate();
  displayError(error, field);
  const current = row ? (editing ? rows.map(x => x.id === editing ? row : x) : [...rows, row]) : rows;
  const valid = eligible(current), inclusive = $('inclusive').checked, merge = $('merge').checked;
  const result = Calc.calculate(valid, inclusive, merge), cal = Calc.calendarTotal(valid, inclusive, merge, reference);
  $('years').textContent = fmt(cal.years); $('months').textContent = fmt(cal.months); $('remaining').textContent = fmt(cal.days);
  const anchor = Calc.referenceDay(valid, reference);
  $('referenceinfo').textContent = `Referencia: ${date(anchor)}${valid.some(x=>x.type==='dates') ? ' · inicio más antiguo.' : ' · ajustable para días sin fechas.'}`;
  $('referencecontrol').hidden = !valid.length || valid.some(x=>x.type==='dates');
  $('total').textContent = fmt(result.total); $('count').textContent = rows.length;
  $('previewbadge').hidden = !row;
  $('live').textContent = row ? `${fmt(Calc.count(row, inclusive))} días · Vista previa ${editing ? 'de la edición' : 'sin guardar'}. Presiona Enter para guardar.` : '';
  $('copy').disabled = rows.length === 0;
  const notices = [];
  if (result.overlap) notices.push(`${fmt(result.overlap)} días superpuestos en registros anteriores. ${merge ? 'Se excluyen del total.' : 'Se cuentan más de una vez.'}`);
  const invalid = current.length - valid.length;
  if (invalid) notices.push(`${invalid} periodo(s) con fechas de hoy o futuras excluidos del total. Edítalos para corregirlos.`);
  if (valid.some(x => x.type === 'days')) notices.push('Los días manuales se suman completos; sin fechas no se pueden verificar cruces.');
  $('overlap').hidden = !notices.length; $('overlap').textContent = notices.join(' ');
}
function setType(value) {
  type = value;
  $('dates').hidden = value !== 'dates'; $('daysfield').hidden = value !== 'days';
  for (const id of ['start','end','startpicker','endpicker']) $(id).disabled = value !== 'dates';
  $('days').disabled = value !== 'days';
  for (const [id, mode] of [['bydate','dates'],['bydays','days']]) {
    $(id).classList.toggle('active', value === mode); $(id).setAttribute('aria-pressed', String(value === mode));
  }
  updateTotals();
}
function reset() {
  $('form').reset(); editing = null;
  $('cancel').hidden = true; $('submit').textContent = '＋ Agregar experiencia ↵';
  $('formtitle').textContent = 'Agrega un periodo';
  setType(type);
}
for (const [id, mode] of [['bydate','dates'],['bydays','days']]) $(id).onclick = () => {
  if (mode === type) return;
  // Switching mode exits editing instead of accidentally overwriting a different type.
  reset(); setType(mode); $(mode === 'dates' ? 'start' : 'days').focus();
};
for (const id of ['start','end']) {
  const input = $(id);
  input.addEventListener('keydown', e => {
    const a = input.selectionStart, b = input.selectionEnd;
    if (a !== b) return;
    if (e.key === 'Backspace' && a > 0 && input.value[a - 1] === '/') input.setSelectionRange(Math.max(0,a - 2), a);
    if (e.key === 'Delete' && input.value[a] === '/') input.setSelectionRange(a, a + 2);
  });
  input.addEventListener('input', e => {
    const raw = input.value, pos = input.selectionStart;
    let digitsBefore = raw.slice(0,pos).replace(/\D/g,'').length;
    let digits = raw.replace(/\D/g,'').slice(0,8);
    input.value = Calc.mask(digits);
    let caret = 0, seen = 0;
    while (caret < input.value.length && seen < digitsBefore) { if (/\d/.test(input.value[caret])) seen++; caret++; }
    if (input.value[caret] === '/' && !String(e.inputType).startsWith('delete')) caret++;
    input.setSelectionRange(caret,caret); syncPicker(id); updateTotals();
  });
  input.addEventListener('paste', e => {
    const text = e.clipboardData?.getData('text').trim();
    if (!text) return;
    const normalized = Calc.normalizeDateInput(text);
    if (normalized !== null) { e.preventDefault(); input.value = normalized; syncPicker(id); updateTotals(); }
  });
  $(id+'picker').onchange = () => { input.value = $(id+'picker').value ? $(id+'picker').value.split('-').reverse().join('/') : ''; updateTotals(); };
  $(id+'picker').addEventListener('focus', refreshDateLimits);
}
$('days').oninput = updateTotals;
$('cancel').onclick = reset;
$('form').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.isComposing && e.target.id === 'start' && !$('end').value) { e.preventDefault(); $('end').focus(); }
});
$('form').onsubmit = e => {
  e.preventDefault();
  const {row, error, field} = candidate(true);
  if (!row) { displayError(error, field); if (field) $(field).focus(); return; }
  const wasEdit = !!editing;
  row.id = editing || newId();
  if (editing) rows = rows.map(x => x.id === editing ? row : x); else rows.push(row);
  const persisted = save(); reset(); render();
  toast(persisted ? (wasEdit ? 'Periodo actualizado' : 'Experiencia guardada') : 'Registro añadido solo a esta sesión: no se pudo guardar.');
  $(type === 'dates' ? 'start' : 'days').focus();
};
function beginEdit(row) {
  reset(); editing = row.id;
  if (row.type === 'dates') { $('start').value = date(row.start); $('end').value = date(row.end); syncPicker('start'); syncPicker('end'); }
  else $('days').value = row.days;
  setType(row.type); $('cancel').hidden = false;
  $('submit').textContent = 'Guardar cambios ↵'; $('formtitle').textContent = 'Edita el periodo';
  $(row.type === 'dates' ? 'start' : 'days').focus();
  $('form').scrollIntoView({behavior:'smooth',block:'center'});
}
function render() {
  $('badge').textContent = rows.length; $('empty').hidden = !!rows.length; $('clear').disabled = !rows.length;
  $('records').replaceChildren();
  rows.forEach((row,i) => {
    const el = document.createElement('div'); el.className = 'record';
    const icon = document.createElement('span'); icon.className = 'recordicon'; icon.textContent = String(i+1).padStart(2,'0');
    const info = document.createElement('div'); info.className = 'recordinfo';
    const name = document.createElement('strong'); name.textContent = row.type === 'dates' ? `${date(row.start)} → ${date(row.end)}` : `Días trabajados · ${i+1}`;
    const sub = document.createElement('small');
    const part = row.type === 'dates' ? Calc.duration(row.start,row.end+($('inclusive').checked?1:0)) : null;
    sub.textContent = part ? `${part.years} años · ${part.months} meses · ${part.days} días` : 'Días sin fechas de referencia';
    if (row.type === 'dates' && Calc.conflicts(row,rows,true).length) { sub.textContent += ' · Cruce de fechas detectado'; sub.className = 'conflict'; }
    if (!Calc.isPast(row)) { sub.textContent += ' · Fecha no permitida: excluido del total'; sub.className = 'conflict'; }
    info.append(name,sub);
    const total = document.createElement('span'); total.className = 'recordtotal'; total.textContent = fmt(Calc.count(row,$('inclusive').checked)) + ' días';
    const actions = document.createElement('div'); actions.className = 'actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Editar'; edit.setAttribute('aria-label','Editar periodo '+(i+1)); edit.onclick = () => beginEdit(row);
    const del = document.createElement('button'); del.type = 'button'; del.textContent = 'Eliminar'; del.setAttribute('aria-label','Eliminar periodo '+(i+1));
    del.onclick = () => { rows = rows.filter(x=>x.id!==row.id); if(editing===row.id)reset(); save(); render(); toast('Registro eliminado'); };
    actions.append(edit,del); el.append(icon,info,total,actions); $('records').append(el);
  });
  updateTotals();
}
for (const id of ['inclusive','merge']) $(id).onchange = () => { save(); render(); };
let pendingAction = null, confirmationSource = null;
function askConfirmation(message, action, source) {
  pendingAction = action; confirmationSource = source;
  $('confirmmessage').textContent = message;
  $('confirmbox').hidden = false;
  $('confirmcancel').focus();
}
function closeConfirmation() {
  $('confirmbox').hidden = true;
  pendingAction = null;
  confirmationSource?.focus();
}
$('confirmcancel').onclick = closeConfirmation;
$('confirmaccept').onclick = () => {
  const action = pendingAction;
  closeConfirmation();
  if (action) action();
};
$('confirmbox').addEventListener('keydown', event => {
  if(event.key === 'Escape') {event.preventDefault();closeConfirmation();}
  if(event.key === 'Tab') {
    if(event.shiftKey && document.activeElement === $('confirmcancel')) {event.preventDefault();$('confirmaccept').focus();}
    else if(!event.shiftKey && document.activeElement === $('confirmaccept')) {event.preventDefault();$('confirmcancel').focus();}
  }
});
function resetAll() {
  rows = [];
  $('inclusive').checked = true;
  $('merge').checked = true;
  reference = Calc.referenceDay([]);
  $('reference').value = iso(reference);
  $('referenceerror').textContent = '';
  $('manualcopy').hidden = true;
  $('summarytext').value = '';
  type = 'dates';
  reset();
  const persisted = save();
  render();
  toast(persisted ? 'Calculadora restablecida' : 'Restablecida en esta sesión; no se pudo actualizar el guardado local.');
  $('start').focus();
}
$('resetall').onclick = () => {
  if (rows.length || $('start').value || $('end').value || $('days').value)
    askConfirmation('Se borrarán todos los registros y se limpiará el formulario. ¿Restablecer la calculadora?',resetAll,$('resetall'));
  else resetAll();
};
$('clear').onclick = () => askConfirmation('¿Borrar todas las experiencias guardadas?', () => {
  rows=[]; save(); reset(); render(); toast('Historial borrado');
},$('clear'));
function summary() {
  const valid = eligible(rows), inc = $('inclusive').checked, merge = $('merge').checked;
  const n = Calc.calculate(valid,inc,merge).total, cal = Calc.calendarTotal(valid,inc,merge,reference);
  return `CalcuChamba — Experiencia guardada\n${cal.years} años, ${cal.months} meses y ${cal.days} días.\nTotal: ${n} días.\n${valid.length} registros válidos.\nEquivalencia de calendario desde ${date(Calc.referenceDay(valid,reference))}. Los periodos separados se expresan como una duración equivalente.\nIncluye ambos extremos: ${inc?'sí':'no'}. Sin duplicar fechas: ${merge?'sí':'no'}.\n` + valid.map((r,i)=>`Periodo ${i+1}: ${r.type==='dates'?date(r.start)+' a '+date(r.end):'Ingreso manual'}, ${Calc.count(r,inc)} días.`).join('\n');
}
$('copy').onclick = async () => {
  const text = summary();
  try { await navigator.clipboard.writeText(text); toast('Resumen de registros guardados copiado'); }
  catch {
    const area = document.createElement('textarea'); area.value = text; area.setAttribute('aria-label','Resumen para copiar');
    area.style.position='fixed'; area.style.left='-9999px'; document.body.append(area); area.select();
    let copied = false; try { copied = document.execCommand('copy'); } catch {} area.remove();
    if(copied) toast('Resumen de registros guardados copiado');
    else { $('manualcopy').hidden = false; $('summarytext').value = text; $('summarytext').focus(); $('summarytext').select(); }
  }
};
$('closecopy').onclick = () => { $('manualcopy').hidden=true; };
function checkDay() { refreshDateLimits(); if(lastDay!==Calc.today()){lastDay=Calc.today();render();} }
window.addEventListener('focus',checkDay);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkDay();});
setInterval(checkDay,60000);
$('reference').value = iso(reference);
$('reference').onchange = () => {
  const day = Calc.parse($('reference').value.split('-').reverse().join('/'));
  if(day === null || day >= Calc.today()) { $('referenceerror').textContent = 'Elige una referencia válida anterior a hoy.'; $('reference').value = iso(reference); return; }
  reference = day; $('referenceerror').textContent = ''; save(); updateTotals();
};
setType('dates'); render();

})();
