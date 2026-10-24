const {test} = require('node:test');
const assert = require('node:assert/strict');
const c = require('../calc.js');
const period = (start,end,id='a') => ({id,type:'dates',start:c.parse(start),end:c.parse(end)});
const total = rows => c.calendarTotal(rows,true,true);

test('fechas reales de cada mes, incluidos años seculares',()=>{
  for(const invalid of ['31/04/2024','31/06/2024','29/02/2023','29/02/1900','32/01/2024','00/01/2024','01/13/2024'])assert.equal(c.parse(invalid),null);
  for(const valid of ['29/02/2000','29/02/2024','31/01/2024'])assert.notEqual(c.parse(valid),null);
});
test('año completo común y bisiesto',()=>{
  for(const year of [2023,2024]){
    const row=period('01/01/'+year,'31/12/'+year);
    assert.deepEqual(total([row]),{years:1,months:0,days:0});
    assert.equal(c.count(row,true),year===2024?366:365);
  }
});
test('meses reales y aniversario que atraviesa febrero bisiesto',()=>{
  assert.deepEqual(total([period('01/02/2024','29/02/2024')]),{years:0,months:1,days:0});
  assert.deepEqual(total([period('15/03/2023','14/03/2024')]),{years:1,months:0,days:0});
});
test('rechaza periodos invertidos en la función de duración',()=>assert.throws(()=>c.duration(10,9),RangeError));
test('valida ambos extremos en hora peruana',()=>{
  const now=new Date('2026-10-19T04:59:59Z');
  assert.equal(c.today(now),c.parse('18/10/2026'));
  assert.equal(c.isPast(period('17/10/2026','17/10/2026'),now),true);
  assert.equal(c.isPast(period('17/10/2026','18/10/2026'),now),false);
  assert.equal(c.today(new Date('2026-10-19T05:00:00Z')),c.parse('19/10/2026'));
});
test('cruces parciales, contenidos, duplicados y edición propia',()=>{
  const row=period('01/01/2024','31/01/2024');
  for(const other of [period('31/01/2024','01/02/2024','b'),period('02/01/2024','03/01/2024','b'),{...row,id:'b'}])assert.equal(c.conflicts(other,[row],true).length,1);
  assert.equal(c.conflicts(row,[row],true).length,0);
  assert.equal(c.conflicts(period('01/02/2024','02/02/2024','b'),[row],true).length,0);
});
test('deduplicación y periodos contiguos conservan el año',()=>{
  const rows=[period('01/01/2024','30/06/2024'),period('01/07/2024','31/12/2024','b')];
  assert.deepEqual(total(rows),{years:1,months:0,days:0});
  assert.equal(c.calculate([...rows,rows[0]],true,true).total,366);
});
test('conteo de un día y exclusión de extremo',()=>{
  const row=period('15/01/2024','15/01/2024');
  assert.equal(c.count(row,true),1);assert.equal(c.count(row,false),0);
});
test('días manuales se convierten desde una referencia explícita',()=>{
  assert.deepEqual(c.calendarTotal([{type:'days',days:365}],true,true,c.parse('01/01/2023')),{years:1,months:0,days:0});
  assert.deepEqual(c.calendarTotal([{type:'days',days:366}],true,true,c.parse('01/01/2024')),{years:1,months:0,days:0});
});
test('registros almacenados corruptos no son admitidos',()=>{
  for(const r of [null,{}, {type:'dates',start:1e20,end:1e20},{type:'dates',start:10,end:9},{type:'days',days:-1},{type:'days',days:1.5}])assert.equal(c.validRecord(r),false);
  assert.equal(c.validRecord(period('01/01/2024','31/12/2024')),true);
});
test('normaliza pegado numérico, ISO y fechas con separadores',()=>{
  for(const s of ['01022024','2024-02-01','1/2/2024','1.2.2024'])assert.equal(c.normalizeDateInput(s),'01/02/2024');
  assert.equal(c.normalizeDateInput('texto'),null);
});
test('unión de periodos coincide con conteo diario independiente',()=>{
  const rows=Array.from({length:30},(_,i)=>({type:'dates',start:20000+i*3,end:20000+i*3+(i%7)}));
  const days=new Set();for(const r of rows)for(let d=r.start;d<=r.end;d++)days.add(d);
  assert.equal(c.calculate(rows,true,true).total,days.size);
});

test('regresión: 2898 días no dejan 98 días sin normalizar',()=>{
 const rows=[period('01/01/2018','31/08/2025'),{type:'days',days:98}];
 assert.equal(c.calculate(rows,true,true).total,2898);
 assert.deepEqual(total(rows),{years:7,months:11,days:7});
});
test('normalización no depende del orden de los registros',()=>{
 const rows=[period('15/02/2020','25/03/2020'),period('20/11/2021','25/12/2021','b'),{type:'days',days:98}];
 assert.deepEqual(total(rows),total([...rows].reverse()));
});
test('normalización mensual de cantidades grandes y referencias de fin de mes',()=>{
 for(const reference of ['01/01/2023','01/01/2024','29/02/2024','31/01/2024'])for(const days of [0,28,29,30,31,59,98,365,366,2898,1000000]){
 const result=c.calendarTotal(days?[{type:'days',days}]:[],true,true,c.parse(reference));
 assert(result.months>=0&&result.months<12);assert(result.days>=0&&result.days<=30);
 }
});
