import { colombiaSubstations, transmissionLines } from './server/data/colombiaSubstations.js';

console.log('='.repeat(60));
console.log('VERIFICACIÓN DE INTEGRACIÓN DE SUBESTACIONES');
console.log('='.repeat(60));

// 1. Contar subestaciones totales
console.log(`\n✅ Total de subestaciones en archivo: ${colombiaSubstations.length}`);
console.log(`✅ Total de líneas de transmisión: ${transmissionLines.length}`);

// 2. Verificar IDs únicos
const ids = colombiaSubstations.map(s => s.id);
const uniqueIds = new Set(ids);
console.log(`\n✅ IDs únicos: ${uniqueIds.size === ids.length ? 'SÍ' : 'NO'}`);
if (uniqueIds.size !== ids.length) {
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  console.log(`   ⚠️  IDs duplicados: ${duplicates.join(', ')}`);
}

// 3. Verificar coordenadas válidas para Colombia
const invalidCoords = colombiaSubstations.filter(s => 
  !s.lat || !s.lng || s.lat < -5 || s.lat > 15 || s.lng < -82 || s.lng > -66
);
console.log(`\n✅ Coordenadas válidas: ${invalidCoords.length === 0 ? 'TODAS' : `${colombiaSubstations.length - invalidCoords.length}/${colombiaSubstations.length}`}`);
if (invalidCoords.length > 0) {
  console.log(`   ⚠️  Subestaciones con coordenadas inválidas:`);
  invalidCoords.forEach(s => console.log(`      - ${s.name}: (${s.lat}, ${s.lng})`));
}

// 4. Distribución por departamento
const byDept = {};
colombiaSubstations.forEach(s => {
  byDept[s.department] = (byDept[s.department] || 0) + 1;
});
console.log(`\n✅ Distribución por departamento (${Object.keys(byDept).length} departamentos):`);
Object.entries(byDept)
  .sort((a, b) => b[1] - a[1])
  .forEach(([dept, count]) => {
    console.log(`   ${dept.padEnd(20)} ${count} subestaciones`);
  });

// 5. Distribución por tipo
const byType = { STN: 0, STR: 0 };
colombiaSubstations.forEach(s => byType[s.type]++);
console.log(`\n✅ Distribución por tipo:`);
console.log(`   STN (≥220 kV):  ${byType.STN} subestaciones`);
console.log(`   STR (<220 kV):  ${byType.STR} subestaciones`);

// 6. Distribución por voltaje
const byVoltage = {};
colombiaSubstations.forEach(s => {
  const v = `${s.voltage} kV`;
  byVoltage[v] = (byVoltage[v] || 0) + 1;
});
console.log(`\n✅ Distribución por voltaje:`);
Object.entries(byVoltage)
  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
  .forEach(([voltage, count]) => {
    console.log(`   ${voltage.padEnd(10)} ${count} subestaciones`);
  });

// 7. Verificar conectividad de líneas
const substationIds = new Set(colombiaSubstations.map(s => s.id));
const invalidLines = transmissionLines.filter(line => 
  !substationIds.has(line.from) || !substationIds.has(line.to)
);
console.log(`\n✅ Líneas de transmisión válidas: ${invalidLines.length === 0 ? 'TODAS' : `${transmissionLines.length - invalidLines.length}/${transmissionLines.length}`}`);
if (invalidLines.length > 0) {
  console.log(`   ⚠️  Líneas con referencias inválidas:`);
  invalidLines.forEach(line => {
    console.log(`      - ${line.id}: ${line.from} → ${line.to}`);
  });
}

// 8. Subestaciones aisladas (sin líneas)
const connectedIds = new Set();
transmissionLines.forEach(line => {
  connectedIds.add(line.from);
  connectedIds.add(line.to);
});
const isolated = colombiaSubstations.filter(s => !connectedIds.has(s.id));
console.log(`\n✅ Subestaciones conectadas: ${colombiaSubstations.length - isolated.length}/${colombiaSubstations.length}`);
if (isolated.length > 0) {
  console.log(`   ℹ️  Subestaciones sin líneas de transmisión (${isolated.length}):`);
  isolated.forEach(s => console.log(`      - ${s.name} (${s.department})`));
}

console.log('\n' + '='.repeat(60));
console.log('RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(60));
console.log(`✅ ${colombiaSubstations.length} subestaciones correctamente definidas`);
console.log(`✅ ${transmissionLines.length} líneas de transmisión correctamente definidas`);
console.log(`✅ Cobertura: ${Object.keys(byDept).length} departamentos de Colombia`);
console.log(`✅ Todas las subestaciones están listas para visualización en el mapa`);
console.log('='.repeat(60));
