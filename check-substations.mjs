import { colombiaSubstations, transmissionLines } from './server/data/colombiaSubstations.js';

console.log(`Total de subestaciones definidas: ${colombiaSubstations.length}`);
console.log(`Total de líneas de transmisión definidas: ${transmissionLines.length}`);

// Verificar duplicados
const ids = colombiaSubstations.map(s => s.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length > 0) {
  console.log(`\n⚠️  IDs duplicados encontrados: ${duplicates.join(', ')}`);
}

// Verificar coordenadas válidas
const invalidCoords = colombiaSubstations.filter(s => 
  !s.lat || !s.lng || s.lat < -5 || s.lat > 15 || s.lng < -82 || s.lng > -66
);
if (invalidCoords.length > 0) {
  console.log(`\n⚠️  ${invalidCoords.length} subestaciones con coordenadas inválidas:`);
  invalidCoords.forEach(s => console.log(`  - ${s.name}: (${s.lat}, ${s.lng})`));
}

console.log(`\n✅ Subestaciones válidas: ${colombiaSubstations.length - invalidCoords.length}`);
