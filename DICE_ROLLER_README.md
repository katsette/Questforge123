# 🎲 QuestForge Dice Roller

The QuestForge Dice Roller is a comprehensive dice rolling system designed for tabletop RPGs and gaming. It supports standard dice notation, advantage/disadvantage mechanics, and real-time multiplayer functionality.

## Features

### 🎯 Core Functionality
- **Standard Dice Notation**: Supports formats like `1d20`, `2d6+3`, `4d4-1`
- **Advantage/Disadvantage**: D&D 5e style advantage and disadvantage for d20 rolls
- **Dice Presets**: Quick access to common dice (D4, D6, D8, D10, D12, D20, D100)
- **Custom Presets**: Pre-configured rolls for common scenarios (Attack rolls, damage, spells)
- **Real-time Updates**: Live dice rolls shared across campaign participants
- **Private Rolls**: GM-only rolls for secret checks
- **Roll History**: Track and review recent dice rolls with detailed breakdowns

### 🔧 Technical Features
- **Robust Parsing**: Validates and parses complex dice notation
- **Performance Optimized**: Can handle 1000+ rolls per second
- **Error Handling**: Comprehensive validation and user-friendly error messages
- **Socket Integration**: Real-time updates using Socket.IO
- **Campaign Integration**: Rolls can be associated with specific campaigns
- **Mobile Responsive**: Works seamlessly on all device sizes

## API Endpoints

### `POST /api/dice/roll`
Roll dice with specified parameters.

**Request Body:**
```json
{
  "formula": "2d6+3",
  "reason": "Damage roll",
  "isPrivate": false,
  "advantage": false,
  "disadvantage": false,
  "campaignId": "optional-campaign-id"
}
```

**Response:**
```json
{
  "id": "1641234567890.123",
  "userId": "user-id",
  "username": "PlayerName",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "formula": "2d6+3",
  "result": 11,
  "individual": [4, 4],
  "subtotal": 8,
  "modifier": 3,
  "reason": "Damage roll",
  "isPrivate": false,
  "advantage": false,
  "disadvantage": false,
  "success": true
}
```

### `GET /api/dice/presets`
Get available dice presets.

**Response:**
```json
{
  "presets": [
    {"name": "D20", "notation": "1d20"},
    {"name": "Fireball", "notation": "8d6"},
    ...
  ],
  "success": true
}
```

### `POST /api/dice/validate`
Validate dice notation.

**Request Body:**
```json
{
  "formula": "2d6+3"
}
```

**Response:**
```json
{
  "formula": "2d6+3",
  "valid": true,
  "success": true
}
```

## Supported Dice Notation

### Basic Format
```
[count]d[sides][+/-modifier]
```

### Examples
- `1d20` - Single twenty-sided die
- `2d6` - Two six-sided dice
- `3d8+2` - Three eight-sided dice plus 2
- `1d12-1` - One twelve-sided die minus 1
- `d6` - Single six-sided die (count defaults to 1)
- `10d6+5` - Ten six-sided dice plus 5

### Limits
- **Die Count**: 1-100 dice per roll
- **Die Sides**: 1-1000 sides per die
- **Modifiers**: No specific limit (within integer range)

## Frontend Components

### `DiceRoller`
Main dice rolling interface component.

**Props:**
- `campaignId` (optional): Associates rolls with a campaign
- `socket` (optional): Socket instance for real-time updates

### `DicePresets`
Quick-access dice buttons component.

**Props:**
- `onPresetSelect`: Callback when preset is selected
- `onQuickRoll`: Callback for instant rolling
- `disabled`: Disable all interactions

### `RollHistory`
Display recent dice rolls with filtering and details.

**Props:**
- `rolls`: Array of roll objects
- `currentUserId`: Current user's ID for highlighting own rolls
- `showPrivateRolls`: Whether to show private rolls

## Socket Events

### Client → Server
- `join-campaign-dice`: Join campaign dice rolling room
- `leave-campaign-dice`: Leave campaign dice rolling room

### Server → Client
- `diceRoll`: New dice roll broadcast
  ```json
  {
    "id": "roll-id",
    "userId": "user-id",
    "username": "PlayerName",
    "result": 15,
    "formula": "1d20",
    "campaignId": "campaign-id"
  }
  ```

## Usage Examples

### Basic Usage
```jsx
import { DiceRoller } from '../components/dice';

function MyComponent() {
  return <DiceRoller />;
}
```

### Campaign Integration
```jsx
import { DiceRoller } from '../components/dice';
import { useSocket } from '../hooks/useSocket';

function CampaignPage({ campaignId }) {
  const socket = useSocket();
  
  return (
    <DiceRoller 
      campaignId={campaignId}
      socket={socket}
    />
  );
}
```

### Programmatic Rolling
```javascript
// Backend usage
const { rollDiceWithNotation } = require('./utils/dice');

const result = rollDiceWithNotation('2d6+3', { advantage: false });
console.log(`Rolled ${result.total}!`);
```

## Customization

### Adding New Presets
Edit `backend/utils/dice.js` and modify the `getCommonDicePresets()` function:

```javascript
function getCommonDicePresets() {
  return [
    // ... existing presets
    { name: 'Custom Roll', notation: '3d6+1' }
  ];
}
```

### Styling
The dice roller uses CSS classes that can be customized in `DiceRoller.css`:

- `.dice-roller` - Main container
- `.roll-button` - Primary roll button
- `.preset-button` - Preset dice buttons
- `.roll-history` - History container
- `.roll-entry` - Individual roll entries

## Error Handling

The dice roller includes comprehensive error handling:

- **Invalid Notation**: Clear messages for malformed dice strings
- **Out of Range**: Warnings for dice counts/sides outside limits  
- **Network Errors**: Graceful fallbacks for connection issues
- **Permissions**: Proper handling of private rolls and campaign access

## Performance

- **Parsing**: ~0.1ms per dice string
- **Rolling**: ~0.003ms per roll
- **Bulk Operations**: 1000+ rolls per second
- **Memory**: Minimal footprint with efficient data structures

## Testing

Run the dice roller tests:

```bash
cd /home/jackie/questforge
node test-dice.js
```

The test suite covers:
- Dice notation parsing
- Roll calculations
- Advantage/disadvantage mechanics
- Preset functionality
- Performance benchmarks

## Troubleshooting

### Common Issues

**"Invalid dice notation"**
- Check formula format: `[count]d[sides][+/-modifier]`
- Ensure dice count is 1-100
- Ensure dice sides is 1-1000

**Rolls not appearing in real-time**
- Verify socket connection is active
- Check campaign permissions
- Ensure user is in the correct room

**Performance issues**
- Avoid rolling excessive numbers of dice (>20d6 at once)
- Clear roll history periodically
- Check network connection for socket updates

### Debug Mode
Enable debug logging by setting `DEBUG=true` in the environment.

## Future Enhancements

- **Dice Pools**: Support for systems like Shadowrun
- **Success Counting**: Count successes above a target number
- **Exploding Dice**: Dice that roll again on maximum values
- **Dice Macros**: Save complex roll formulas
- **Statistics**: Track roll statistics and probabilities
- **3D Dice**: Animated 3D dice rolling visualization
