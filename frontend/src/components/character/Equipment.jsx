import React, { useState } from 'react';

const Equipment = ({ character, isOwner, onStatsChange }) => {
  const stats = character.stats || {};
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, weight: 0, description: '' });
  const [newWeapon, setNewWeapon] = useState({ 
    name: '', 
    attackBonus: 0, 
    damage: '', 
    damageType: '', 
    properties: '',
    range: '',
    proficient: false
  });

  // Calculate ability modifier
  const getModifier = (abilityScore) => {
    const score = parseInt(abilityScore) || 10;
    return Math.floor((score - 10) / 2);
  };

  // Format modifier with + or - sign
  const formatModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  // Calculate proficiency bonus
  const getProficiencyBonus = () => {
    return Math.ceil(character.level / 4) + 1;
  };

  // Calculate carrying capacity (Str score × 15 lbs)
  const getCarryingCapacity = () => {
    const strScore = stats.strength || 10;
    return strScore * 15;
  };

  // Calculate current weight carried
  const getCurrentWeight = () => {
    const equipment = stats.equipment || [];
    return equipment.reduce((total, item) => total + (item.weight * item.quantity), 0);
  };

  // Calculate attack bonus for a weapon
  const calculateAttackBonus = (weapon) => {
    if (weapon.attackBonus !== undefined && weapon.attackBonus !== null) {
      return weapon.attackBonus;
    }

    // Default calculation: ability modifier + proficiency (if proficient)
    const strMod = getModifier(stats.strength || 10);
    const dexMod = getModifier(stats.dexterity || 10);
    const profBonus = weapon.proficient ? getProficiencyBonus() : 0;
    
    // Use Dex for finesse weapons or ranged weapons, Str for others
    const isFinesse = weapon.properties?.toLowerCase().includes('finesse');
    const isRanged = weapon.range && weapon.range.toLowerCase().includes('range');
    const abilityMod = (isFinesse || isRanged) ? Math.max(strMod, dexMod) : strMod;
    
    return abilityMod + profBonus;
  };

  // Handle adding new equipment
  const addEquipment = () => {
    if (!newItem.name.trim()) return;
    
    const currentEquipment = stats.equipment || [];
    const updatedEquipment = [...currentEquipment, {
      id: Date.now(),
      ...newItem,
      quantity: parseInt(newItem.quantity) || 1,
      weight: parseFloat(newItem.weight) || 0
    }];
    
    onStatsChange({ equipment: updatedEquipment });
    setNewItem({ name: '', quantity: 1, weight: 0, description: '' });
  };

  // Handle adding new weapon
  const addWeapon = () => {
    if (!newWeapon.name.trim()) return;
    
    const currentWeapons = stats.weapons || [];
    const updatedWeapons = [...currentWeapons, {
      id: Date.now(),
      ...newWeapon,
      attackBonus: parseInt(newWeapon.attackBonus) || null
    }];
    
    onStatsChange({ weapons: updatedWeapons });
    setNewWeapon({ 
      name: '', 
      attackBonus: 0, 
      damage: '', 
      damageType: '', 
      properties: '',
      range: '',
      proficient: false
    });
  };

  // Handle removing equipment
  const removeEquipment = (itemId) => {
    const currentEquipment = stats.equipment || [];
    const updatedEquipment = currentEquipment.filter(item => item.id !== itemId);
    onStatsChange({ equipment: updatedEquipment });
  };

  // Handle removing weapon
  const removeWeapon = (weaponId) => {
    const currentWeapons = stats.weapons || [];
    const updatedWeapons = currentWeapons.filter(weapon => weapon.id !== weaponId);
    onStatsChange({ weapons: updatedWeapons });
  };

  // Handle updating equipment quantity
  const updateEquipmentQuantity = (itemId, quantity) => {
    const currentEquipment = stats.equipment || [];
    const updatedEquipment = currentEquipment.map(item => 
      item.id === itemId ? { ...item, quantity: Math.max(0, parseInt(quantity) || 0) } : item
    );
    onStatsChange({ equipment: updatedEquipment });
  };

  // Handle money updates
  const updateMoney = (coinType, value) => {
    const currentMoney = stats.money || {};
    onStatsChange({ 
      money: { 
        ...currentMoney, 
        [coinType]: Math.max(0, parseInt(value) || 0) 
      } 
    });
  };

  const money = stats.money || {};
  const equipment = stats.equipment || [];
  const weapons = stats.weapons || [];

  return (
    <div className="equipment">
      <div className="equipment-header">
        <h3>Equipment & Inventory</h3>
        <div className="carrying-info">
          <span className="weight-info">
            Weight: {getCurrentWeight().toFixed(1)} / {getCarryingCapacity()} lbs
          </span>
          <div className={`encumbrance-bar ${getCurrentWeight() > getCarryingCapacity() ? 'overloaded' : ''}`}>
            <div 
              className="encumbrance-fill" 
              style={{ width: `${Math.min(100, (getCurrentWeight() / getCarryingCapacity()) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Money */}
      <div className="money-section">
        <h4>💰 Currency</h4>
        <div className="money-grid">
          <div className="coin-type">
            <label htmlFor="copper">Copper (cp)</label>
            <input
              id="copper"
              type="number"
              min="0"
              value={money.copper || 0}
              onChange={(e) => updateMoney('copper', e.target.value)}
              disabled={!isOwner}
              className="money-input"
            />
          </div>
          <div className="coin-type">
            <label htmlFor="silver">Silver (sp)</label>
            <input
              id="silver"
              type="number"
              min="0"
              value={money.silver || 0}
              onChange={(e) => updateMoney('silver', e.target.value)}
              disabled={!isOwner}
              className="money-input"
            />
          </div>
          <div className="coin-type">
            <label htmlFor="electrum">Electrum (ep)</label>
            <input
              id="electrum"
              type="number"
              min="0"
              value={money.electrum || 0}
              onChange={(e) => updateMoney('electrum', e.target.value)}
              disabled={!isOwner}
              className="money-input"
            />
          </div>
          <div className="coin-type">
            <label htmlFor="gold">Gold (gp)</label>
            <input
              id="gold"
              type="number"
              min="0"
              value={money.gold || 0}
              onChange={(e) => updateMoney('gold', e.target.value)}
              disabled={!isOwner}
              className="money-input"
            />
          </div>
          <div className="coin-type">
            <label htmlFor="platinum">Platinum (pp)</label>
            <input
              id="platinum"
              type="number"
              min="0"
              value={money.platinum || 0}
              onChange={(e) => updateMoney('platinum', e.target.value)}
              disabled={!isOwner}
              className="money-input"
            />
          </div>
        </div>
      </div>

      {/* Weapons */}
      <div className="weapons-section">
        <h4>⚔️ Weapons</h4>
        
        {isOwner && (
          <div className="add-weapon-form">
            <div className="weapon-form-row">
              <input
                type="text"
                value={newWeapon.name}
                onChange={(e) => setNewWeapon({ ...newWeapon, name: e.target.value })}
                placeholder="Weapon name"
                className="weapon-name-input"
              />
              <input
                type="text"
                value={newWeapon.damage}
                onChange={(e) => setNewWeapon({ ...newWeapon, damage: e.target.value })}
                placeholder="1d8"
                className="weapon-damage-input"
                title="Damage dice"
              />
              <select
                value={newWeapon.damageType}
                onChange={(e) => setNewWeapon({ ...newWeapon, damageType: e.target.value })}
                className="weapon-damage-type"
              >
                <option value="">Damage Type</option>
                <option value="slashing">Slashing</option>
                <option value="piercing">Piercing</option>
                <option value="bludgeoning">Bludgeoning</option>
                <option value="fire">Fire</option>
                <option value="cold">Cold</option>
                <option value="lightning">Lightning</option>
                <option value="thunder">Thunder</option>
                <option value="acid">Acid</option>
                <option value="poison">Poison</option>
                <option value="psychic">Psychic</option>
                <option value="necrotic">Necrotic</option>
                <option value="radiant">Radiant</option>
                <option value="force">Force</option>
              </select>
              <label className="proficient-checkbox">
                <input
                  type="checkbox"
                  checked={newWeapon.proficient}
                  onChange={(e) => setNewWeapon({ ...newWeapon, proficient: e.target.checked })}
                />
                Proficient
              </label>
              <button onClick={addWeapon} className="add-weapon-btn">Add Weapon</button>
            </div>
            <div className="weapon-form-row">
              <input
                type="text"
                value={newWeapon.properties}
                onChange={(e) => setNewWeapon({ ...newWeapon, properties: e.target.value })}
                placeholder="Properties (finesse, light, heavy, etc.)"
                className="weapon-properties-input"
              />
              <input
                type="text"
                value={newWeapon.range}
                onChange={(e) => setNewWeapon({ ...newWeapon, range: e.target.value })}
                placeholder="Range (5 ft., 150/600 ft., etc.)"
                className="weapon-range-input"
              />
            </div>
          </div>
        )}

        <div className="weapons-list">
          {weapons.map((weapon) => (
            <div key={weapon.id} className="weapon-item">
              <div className="weapon-header">
                <span className="weapon-name">{weapon.name}</span>
                {isOwner && (
                  <button 
                    onClick={() => removeWeapon(weapon.id)} 
                    className="remove-item-btn"
                    title="Remove weapon"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="weapon-stats">
                <span className="attack-bonus">
                  Attack: {formatModifier(calculateAttackBonus(weapon))}
                </span>
                <span className="weapon-damage">
                  Damage: {weapon.damage} {weapon.damageType}
                </span>
                {weapon.proficient && <span className="proficient-indicator">●</span>}
              </div>
              {weapon.properties && (
                <div className="weapon-properties">Properties: {weapon.properties}</div>
              )}
              {weapon.range && (
                <div className="weapon-range">Range: {weapon.range}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* General Equipment */}
      <div className="general-equipment-section">
        <h4>🎒 Equipment & Items</h4>
        
        {isOwner && (
          <div className="add-item-form">
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Item name"
              className="item-name-input"
            />
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              placeholder="Qty"
              className="item-quantity-input"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              value={newItem.weight}
              onChange={(e) => setNewItem({ ...newItem, weight: e.target.value })}
              placeholder="Weight"
              className="item-weight-input"
            />
            <input
              type="text"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Description (optional)"
              className="item-description-input"
            />
            <button onClick={addEquipment} className="add-item-btn">Add Item</button>
          </div>
        )}

        <div className="equipment-list">
          {equipment.map((item) => (
            <div key={item.id} className="equipment-item">
              <div className="item-header">
                <span className="item-name">{item.name}</span>
                <div className="item-controls">
                  {isOwner && (
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateEquipmentQuantity(item.id, e.target.value)}
                      className="quantity-input"
                    />
                  )}
                  <span className="item-weight">
                    {(item.weight * item.quantity).toFixed(1)} lbs
                  </span>
                  {isOwner && (
                    <button 
                      onClick={() => removeEquipment(item.id)} 
                      className="remove-item-btn"
                      title="Remove item"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              {item.description && (
                <div className="item-description">{item.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Armor & Shield */}
      <div className="armor-section">
        <h4>🛡️ Armor & Shield</h4>
        
        <div className="armor-grid">
          <div className="armor-item">
            <label htmlFor="worn-armor">Worn Armor:</label>
            <input
              id="worn-armor"
              type="text"
              value={stats.wornArmor || ''}
              onChange={(e) => onStatsChange({ wornArmor: e.target.value })}
              disabled={!isOwner}
              placeholder="Leather armor, chain mail, etc."
              className="armor-input"
            />
          </div>
          
          <div className="armor-item">
            <label htmlFor="shield-info">Shield:</label>
            <input
              id="shield-info"
              type="text"
              value={stats.shield || ''}
              onChange={(e) => onStatsChange({ shield: e.target.value })}
              disabled={!isOwner}
              placeholder="Shield type, magical bonuses, etc."
              className="armor-input"
            />
          </div>
        </div>

        <div className="armor-notes">
          <label htmlFor="armor-notes">Armor Notes:</label>
          <textarea
            id="armor-notes"
            value={stats.armorNotes || ''}
            onChange={(e) => onStatsChange({ armorNotes: e.target.value })}
            disabled={!isOwner}
            placeholder="Special properties, stealth disadvantage, etc."
            className="armor-notes-textarea"
            rows="2"
          />
        </div>
      </div>

      {/* Encumbrance Rules */}
      {getCurrentWeight() > getCarryingCapacity() && (
        <div className="encumbrance-warning">
          <h4>⚠️ Encumbrance</h4>
          <p>
            You are carrying more than your capacity! Your speed is reduced by 10 feet.
            Consider dropping items or increasing your Strength score.
          </p>
          <div className="encumbrance-rules">
            <p><strong>Carrying Capacity:</strong> Strength × 15 lbs</p>
            <p><strong>Push/Drag/Lift:</strong> Strength × 30 lbs</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
