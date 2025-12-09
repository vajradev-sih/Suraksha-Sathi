// Quick test for motherfucker detection
const text = 'testing cuss words motherfucker';
const keywords = ['fuck', 'fucking', 'motherfucker', 'shit', 'bitch'];

console.log('Testing text:', text);
console.log('\nKeyword Detection:');

keywords.forEach(keyword => {
  const regex = new RegExp(`\\b${keyword}\\b`, 'i');
  const found = regex.test(text.toLowerCase());
  console.log(`  ${keyword}: ${found ? '✓ DETECTED' : '✗ not found'}`);
});

// Test with word boundary
console.log('\n--- Word Boundary Test ---');
const testCases = [
  'testing motherfucker content',
  'this is fucking bad',
  'what the fuck',
  'assessment report',  // Should NOT match 'ass'
  'classic technique'   // Should NOT match 'ass'
];

testCases.forEach(test => {
  const found = keywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(test.toLowerCase()));
  console.log(`"${test}"`);
  console.log(`  → ${found.length > 0 ? 'BLOCKED: ' + found.join(', ') : 'ALLOWED'}`);
});
