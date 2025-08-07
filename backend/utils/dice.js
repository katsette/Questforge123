// Dice rolling utilities for QuestForge

/**
 * Parse a dice notation string (e.g., "2d6+3", "1d20", "4d4-1")
 * @param {string} notation - Dice notation string
 * @returns {object} Parsed dice object or null if invalid
 */
function parseDiceNotation(notation) {
  if (!notation || typeof notation !== 'string') return null;
  
  // Remove spaces and convert to lowercase
  const clean = notation.replace(/\s+/g, '').toLowerCase();
  
  // Regular expression to match dice notation
  // Supports: XdY, XdY+Z, XdY-Z, dY (assumes 1d), +Z, -Z
  const diceRegex = /^(?:(\d+)?d(\d+))?(?:([+-])(\d+))?$/;
  const match = clean.match(diceRegex);
  
  if (!match) return null;
  
  const [, numDice, dieSize, modifierSign, modifierValue] = match;
  
  // Parse components
  const dice = {
    count: numDice ? parseInt(numDice) : (dieSize ? 1 : 0),
    sides: dieSize ? parseInt(dieSize) : 0,
    modifier: 0
  };
  
  // Handle modifier
  if (modifierSign && modifierValue) {
    const modValue = parseInt(modifierValue);
    dice.modifier = modifierSign === '+' ? modValue : -modValue;
  }
  
  // Validate
  if (dice.count < 0 || dice.count > 100) return null;
  if (dice.sides < 1 || dice.sides > 1000) return null;
  if (dice.count === 0 && dice.modifier === 0) return null;
  
  return dice;
}

/**
 * Roll a single die with given number of sides
 * @param {number} sides - Number of sides on the die
 * @returns {number} Random number between 1 and sides
 */
function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice
 * @param {number} count - Number of dice to roll
 * @param {number} sides - Number of sides per die
 * @returns {array} Array of individual die results
 */
function rollDice(count, sides) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides));
  }
  return results;
}

/**
 * Roll dice based on parsed notation
 * @param {object} diceObj - Parsed dice object from parseDiceNotation
 * @returns {object} Roll result with individual rolls, total, etc.
 */
function performRoll(diceObj) {
  if (!diceObj) return null;
  
  let individual = [];
  let subtotal = 0;
  
  if (diceObj.count > 0 && diceObj.sides > 0) {
    individual = rollDice(diceObj.count, diceObj.sides);
    subtotal = individual.reduce((sum, roll) => sum + roll, 0);
  }
  
  const total = subtotal + diceObj.modifier;
  
  return {
    individual,
    subtotal,
    modifier: diceObj.modifier,
    total,
    formula: formatDiceFormula(diceObj)
  };
}

/**
 * Format dice object back to notation string
 * @param {object} diceObj - Parsed dice object
 * @returns {string} Formatted dice notation
 */
function formatDiceFormula(diceObj) {
  let formula = '';
  
  if (diceObj.count > 0 && diceObj.sides > 0) {
    formula += `${diceObj.count}d${diceObj.sides}`;
  }
  
  if (diceObj.modifier !== 0) {
    const sign = diceObj.modifier > 0 ? '+' : '';
    formula += `${sign}${diceObj.modifier}`;
  }
  
  return formula || '0';
}

/**
 * Roll with advantage (roll twice, take higher)
 * @param {number} sides - Number of sides on the die
 * @returns {object} Roll result with both rolls and the higher value
 */
function rollWithAdvantage(sides) {
  const roll1 = rollDie(sides);
  const roll2 = rollDie(sides);
  
  return {
    rolls: [roll1, roll2],
    result: Math.max(roll1, roll2),
    advantage: true
  };
}

/**
 * Roll with disadvantage (roll twice, take lower)
 * @param {number} sides - Number of sides on the die
 * @returns {object} Roll result with both rolls and the lower value
 */
function rollWithDisadvantage(sides) {
  const roll1 = rollDie(sides);
  const roll2 = rollDie(sides);
  
  return {
    rolls: [roll1, roll2],
    result: Math.min(roll1, roll2),
    disadvantage: true
  };
}

/**
 * Complete dice rolling function with notation parsing
 * @param {string} notation - Dice notation (e.g., "2d6+3")
 * @param {object} options - Additional options (advantage, disadvantage)
 * @returns {object} Complete roll result or error
 */
function rollDiceWithNotation(notation, options = {}) {
  try {
    const parsed = parseDiceNotation(notation);
    if (!parsed) {
      return {
        error: 'Invalid dice notation',
        notation
      };
    }
    
    // Handle advantage/disadvantage for single d20 rolls
    if (parsed.count === 1 && parsed.sides === 20 && (options.advantage || options.disadvantage)) {
      let specialRoll;
      
      if (options.advantage) {
        specialRoll = rollWithAdvantage(20);
      } else {
        specialRoll = rollWithDisadvantage(20);
      }
      
      const total = specialRoll.result + parsed.modifier;
      
      return {
        individual: specialRoll.rolls,
        mainRoll: specialRoll.result,
        subtotal: specialRoll.result,
        modifier: parsed.modifier,
        total,
        formula: notation,
        advantage: options.advantage || false,
        disadvantage: options.disadvantage || false,
        success: true
      };
    }
    
    // Normal roll
    const result = performRoll(parsed);
    if (!result) {
      return {
        error: 'Failed to perform roll',
        notation
      };
    }
    
    return {
      ...result,
      success: true,
      advantage: false,
      disadvantage: false
    };
    
  } catch (error) {
    return {
      error: 'Dice roll error: ' + error.message,
      notation
    };
  }
}

/**
 * Validate dice notation string
 * @param {string} notation - Dice notation to validate
 * @returns {boolean} True if valid notation
 */
function isValidDiceNotation(notation) {
  const parsed = parseDiceNotation(notation);
  return parsed !== null;
}

/**
 * Get common D&D dice presets
 * @returns {array} Array of common dice notations
 */
function getCommonDicePresets() {
  return [
    { name: 'D4', notation: '1d4' },
    { name: 'D6', notation: '1d6' },
    { name: 'D8', notation: '1d8' },
    { name: 'D10', notation: '1d10' },
    { name: 'D12', notation: '1d12' },
    { name: 'D20', notation: '1d20' },
    { name: 'D100', notation: '1d100' },
    { name: 'Attack Roll', notation: '1d20' },
    { name: 'Damage (Longsword)', notation: '1d8' },
    { name: 'Damage (Greatsword)', notation: '2d6' },
    { name: 'Fireball', notation: '8d6' },
    { name: 'Healing Potion', notation: '2d4+2' }
  ];
}

module.exports = {
  parseDiceNotation,
  rollDie,
  rollDice,
  performRoll,
  formatDiceFormula,
  rollWithAdvantage,
  rollWithDisadvantage,
  rollDiceWithNotation,
  isValidDiceNotation,
  getCommonDicePresets
};
