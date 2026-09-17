import fs from 'fs';
import path from 'path';

const seedPath = path.resolve('src/data/curriculum-seed.json');
const raw = fs.readFileSync(seedPath, 'utf-8');
const data = JSON.parse(raw);

console.log('==============================================');
console.log('  2022 KOREAN ELEMENTARY MATH CURRICULUM AUDIT');
console.log('==============================================\n');
console.log(`Total Decks: ${data.decks.length} (Expected: 12 semesters)`);

let totalCards = 0;
const distinctUnits = new Set<string>();
const domainCounts: Record<string, number> = {};

for (const deck of data.decks) {
  console.log(`[Grade ${deck.grade} Sem ${deck.semester}] ${deck.name.ko} (${deck.cards.length} cards)`);
  for (const card of deck.cards) {
    totalCards++;
    distinctUnits.add(`${card.grade}-${card.semester}:${card.unit}`);
    domainCounts[card.domain] = (domainCounts[card.domain] || 0) + 1;
  }
}

console.log(`\nTotal Flashcards: ${totalCards}`);
console.log(`Total Distinct Units: ${distinctUnits.size} / 70 units`);
console.log('\nDomain Balance:');
for (const [dom, count] of Object.entries(domainCounts)) {
  console.log(`  - ${dom}: ${count} cards`);
}

if (distinctUnits.size === 70 && data.decks.length === 12) {
  console.log('\n>>> All 70 units verified successfully! Full curriculum coverage verified. <<<');
} else {
  console.error('\n>>> Warning: Curriculum count mismatch! <<<');
  process.exit(1);
}
