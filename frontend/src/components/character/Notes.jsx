import React from 'react';

const Notes = ({ character, isOwner, onStatsChange }) => {
  const stats = character.stats || {};

  const updateNote = (field, value) => {
    onStatsChange({ [field]: value });
  };

  const noteFields = [
    {
      key: 'campaignNotes',
      title: '📖 Campaign Notes',
      placeholder: 'Important campaign events, NPCs met, locations visited, ongoing quests...',
      rows: 6,
      description: 'Track important events, NPCs, and plot developments from your campaign.'
    },
    {
      key: 'characterGoals',
      title: '🎯 Character Goals & Motivations',
      placeholder: 'Short-term and long-term goals, character motivations, personal quests...',
      rows: 4,
      description: 'What drives your character? What do they hope to achieve?'
    },
    {
      key: 'alliesEnemies',
      title: '👥 Allies & Enemies',
      placeholder: 'Important relationships, allies, enemies, contacts, organizations...',
      rows: 4,
      description: 'Track relationships with NPCs and organizations.'
    },
    {
      key: 'treasureFindings',
      title: '💎 Treasures & Discoveries',
      placeholder: 'Special items found, magical discoveries, important lore learned...',
      rows: 4,
      description: 'Notable treasures, magical items, and important discoveries.'
    },
    {
      key: 'characterDevelopment',
      title: '📈 Character Development',
      placeholder: 'How your character has grown, changed perspectives, learned lessons...',
      rows: 4,
      description: 'Track how your character evolves throughout the campaign.'
    },
    {
      key: 'combatTactics',
      title: '⚔️ Combat Tactics & Strategy',
      placeholder: 'Preferred combat strategies, spell combinations, team tactics...',
      rows: 3,
      description: 'Notes on effective strategies and tactics for combat encounters.'
    },
    {
      key: 'downtime',
      title: '🏠 Downtime Activities',
      placeholder: 'What your character does between adventures, hobbies, work, training...',
      rows: 3,
      description: 'Activities your character pursues during downtime periods.'
    },
    {
      key: 'secretsRumors',
      title: '🤐 Secrets & Rumors',
      placeholder: 'Secret information, rumors heard, mysteries to investigate...',
      rows: 4,
      description: 'Information your character has learned that others might not know.'
    },
    {
      key: 'generalNotes',
      title: '📝 General Notes',
      placeholder: 'Any other notes, reminders, or important information...',
      rows: 5,
      description: 'Catch-all for any other important notes or reminders.'
    }
  ];

  // Calculate total word count for all notes
  const getTotalWordCount = () => {
    return noteFields.reduce((total, field) => {
      const content = stats[field.key] || '';
      const words = content.trim().split(/\s+/).filter(word => word.length > 0);
      return total + words.length;
    }, 0);
  };

  // Get word count for a specific field
  const getWordCount = (content) => {
    if (!content || content.trim() === '') return 0;
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Check if character has any notes
  const hasAnyNotes = () => {
    return noteFields.some(field => {
      const content = stats[field.key];
      return content && content.trim().length > 0;
    });
  };

  return (
    <div className="notes">
      <div className="notes-header">
        <h3>Character Notes & Journal</h3>
        <div className="notes-summary">
          <span className="total-words">Total Words: {getTotalWordCount()}</span>
          {!isOwner && !hasAnyNotes() && (
            <span className="no-notes-indicator">No notes available</span>
          )}
        </div>
      </div>

      {!isOwner && !hasAnyNotes() ? (
        <div className="no-notes-message">
          <p>This character doesn't have any notes yet.</p>
          <p>Notes can include campaign events, character development, relationships, and more.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {noteFields.map((field) => {
            const content = stats[field.key] || '';
            const wordCount = getWordCount(content);
            const hasContent = content.trim().length > 0;

            // Skip empty fields for non-owners unless they have content
            if (!isOwner && !hasContent) {
              return null;
            }

            return (
              <div key={field.key} className="note-section">
                <div className="note-header">
                  <h4>{field.title}</h4>
                  <div className="note-meta">
                    {wordCount > 0 && (
                      <span className="word-count">{wordCount} words</span>
                    )}
                    {isOwner && (
                      <button 
                        className="clear-note-btn"
                        onClick={() => updateNote(field.key, '')}
                        disabled={!hasContent}
                        title="Clear this note"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="note-description">{field.description}</p>
                
                <textarea
                  value={content}
                  onChange={(e) => updateNote(field.key, e.target.value)}
                  disabled={!isOwner}
                  placeholder={isOwner ? field.placeholder : ''}
                  rows={field.rows}
                  className={`note-textarea ${!hasContent ? 'empty' : ''}`}
                />
                
                {hasContent && wordCount > 100 && (
                  <div className="note-stats">
                    <span className="long-note-indicator">📚 Detailed notes</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Notes Guidelines for Owners */}
      {isOwner && (
        <div className="notes-guidelines">
          <h4>📋 Notes Guidelines</h4>
          <div className="guidelines-grid">
            <div className="guideline">
              <strong>Campaign Events:</strong> Record important plot points, decisions made, and consequences.
            </div>
            <div className="guideline">
              <strong>Character Growth:</strong> Note how experiences change your character's worldview.
            </div>
            <div className="guideline">
              <strong>Relationships:</strong> Keep track of NPCs, their motivations, and your standing with them.
            </div>
            <div className="guideline">
              <strong>Mysteries:</strong> Document clues, theories, and unresolved questions.
            </div>
            <div className="guideline">
              <strong>Tactics:</strong> Record what works in combat and social situations.
            </div>
            <div className="guideline">
              <strong>Personal:</strong> Your character's thoughts, fears, hopes, and private moments.
            </div>
          </div>

          <div className="notes-tips">
            <h5>💡 Tips for Better Notes</h5>
            <ul>
              <li>Write in character voice for more immersive notes</li>
              <li>Include dates or session references for timeline tracking</li>
              <li>Use bullet points for easy scanning during sessions</li>
              <li>Note your character's emotional reactions to events</li>
              <li>Record lessons learned and how they changed your character</li>
              <li>Keep a running list of goals and mark them when achieved</li>
            </ul>
          </div>

          {getTotalWordCount() > 500 && (
            <div className="notes-achievement">
              <h5>🏆 Chronicle Achievement</h5>
              <p>
                You've written {getTotalWordCount()} words about your character! 
                Your detailed notes will help create a rich backstory and provide 
                great material for your DM to incorporate into the campaign.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Session Template (for owners) */}
      {isOwner && (
        <div className="session-template">
          <h4>🎲 Session Template</h4>
          <div className="template-content">
            <p>Copy this template to help organize your session notes:</p>
            <div className="template-box">
              <code>
                <strong>Session [Number] - [Date]</strong><br />
                <strong>What happened:</strong> [Key events]<br />
                <strong>Decisions made:</strong> [Important choices]<br />
                <strong>NPCs encountered:</strong> [New faces, relationship changes]<br />
                <strong>Clues discovered:</strong> [Information learned]<br />
                <strong>Character thoughts:</strong> [Internal reactions]<br />
                <strong>Next steps:</strong> [Plans for next session]
              </code>
            </div>
            <button 
              onClick={() => {
                const template = `Session [Number] - [Date]
What happened: [Key events]
Decisions made: [Important choices]  
NPCs encountered: [New faces, relationship changes]
Clues discovered: [Information learned]
Character thoughts: [Internal reactions]
Next steps: [Plans for next session]

---

`;
                const currentNotes = stats.campaignNotes || '';
                updateNote('campaignNotes', template + currentNotes);
              }}
              className="add-template-btn"
            >
              Add Template to Campaign Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
