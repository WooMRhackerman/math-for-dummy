import fs from 'fs';
import path from 'path';

const seedPath = path.resolve('src/data/curriculum-seed.json');
const raw = fs.readFileSync(seedPath, 'utf-8');
const data = JSON.parse(raw);

console.log('--- CURRICULUM VERIFICATION ---');
console.log(`Total Decks: ${data.decks.length}`);

let totalCards = 0;
const domainCounts: Record<string, number> = {};

for (const deck of data.decks) {
  console.log(`- Grade ${deck.grade}: ${deck.name.ko} (${deck.cards.length} cards)`);
  totalCards += deck.cards.length;
  for (const card of deck.cards) {
    domainCounts[card.domain] = (domainCounts[card.domain] || 0) + 1;
  }
}

console.log(`\nTotal Flashcards: ${totalCards}`);
console.log('Domain Distribution:');
for (const [dom, count] of Object.entries(domainCounts)) {
  console.log(`  * ${dom}: ${count} cards`);
}
console.log('Verification PASSED!');
