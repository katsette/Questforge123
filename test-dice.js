#!/usr/bin/env node

// Test script for dice roller functionality
const { 
  parseDiceNotation,
  rollDiceWithNotation,
  getCommonDicePresets,
  isValidDiceNotation 
} = require('./backend/utils/dice');

console.log('🎲 Testing Dice Roller Functionality\n');

// Test dice notation parsing
console.log('1. Testing dice notation parsing:');
const testNotations = ['1d20', '2d6+3', '4d4-1', '1d100', 'd6', 'invalid', '10d6+5'];

testNotations.forEach(notation => {
  const parsed = parseDiceNotation(notation);
  const valid = isValidDiceNotation(notation);
  console.log(`   ${notation}: ${valid ? '✅' : '❌'} ${parsed ? JSON.stringify(parsed) : 'Invalid'}`);
});

console.log('\n2. Testing dice rolling:');
const rollTests = ['1d20', '2d6+3', '4d4-1', '1d6'];

rollTests.forEach(notation => {
  try {
    const result = rollDiceWithNotation(notation);
    if (result.success) {
      console.log(`   ${notation}: ${result.individual.join('+')} + ${result.modifier} = ${result.total}`);
    } else {
      console.log(`   ${notation}: ❌ ${result.error}`);
    }
  } catch (error) {
    console.log(`   ${notation}: ❌ Error - ${error.message}`);
  }
});

console.log('\n3. Testing advantage/disadvantage:');
const advantageTest = rollDiceWithNotation('1d20', { advantage: true });
const disadvantageTest = rollDiceWithNotation('1d20', { disadvantage: true });

console.log(`   1d20 (advantage): [${advantageTest.individual.join(', ')}] -> ${advantageTest.total} ${advantageTest.advantage ? '(advantage)' : ''}`);
console.log(`   1d20 (disadvantage): [${disadvantageTest.individual.join(', ')}] -> ${disadvantageTest.total} ${disadvantageTest.disadvantage ? '(disadvantage)' : ''}`);

console.log('\n4. Testing dice presets:');
const presets = getCommonDicePresets();
presets.forEach(preset => {
  console.log(`   ${preset.name}: ${preset.notation}`);
});

console.log('\n5. Performance test - Rolling 1000 dice:');
const startTime = Date.now();
for (let i = 0; i < 1000; i++) {
  rollDiceWithNotation('1d20');
}
const endTime = Date.now();
console.log(`   1000 rolls completed in ${endTime - startTime}ms`);

console.log('\n✅ All dice roller tests completed!');
