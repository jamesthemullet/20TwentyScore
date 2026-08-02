import defaultPlayers from './players';

describe('defaultPlayers', () => {
  it('creates exactly 11 players', () => {
    expect(defaultPlayers()).toHaveLength(11);
  });

  it('uses fallback names "Player N" when no names are provided', () => {
    const players = defaultPlayers();
    expect(players[0].name).toBe('Player 1');
    expect(players[5].name).toBe('Player 6');
    expect(players[10].name).toBe('Player 11');
  });

  it('uses provided names and falls back to defaults for missing slots', () => {
    const players = defaultPlayers(['Alice', 'Bob', 'Carol']);
    expect(players[0].name).toBe('Alice');
    expect(players[1].name).toBe('Bob');
    expect(players[2].name).toBe('Carol');
    expect(players[3].name).toBe('Player 4');
    expect(players[10].name).toBe('Player 11');
  });

  it('trims whitespace from provided names', () => {
    const players = defaultPlayers(['  Alice  ', '  Bob  ']);
    expect(players[0].name).toBe('Alice');
    expect(players[1].name).toBe('Bob');
  });

  it('sets player 0 as currentStriker and player 1 as currentNonStriker', () => {
    const players = defaultPlayers();
    expect(players[0].currentStriker).toBe(true);
    expect(players[0].currentNonStriker).toBe(false);
    expect(players[1].currentStriker).toBe(false);
    expect(players[1].currentNonStriker).toBe(true);
    players.slice(2).forEach((p) => {
      expect(p.currentStriker).toBe(false);
      expect(p.currentNonStriker).toBe(false);
    });
  });

  it('marks only players 0 and 1 as onTheCrease', () => {
    const players = defaultPlayers();
    expect(players[0].onTheCrease).toBe(true);
    expect(players[1].onTheCrease).toBe(true);
    players.slice(2).forEach((p) => { expect(p.onTheCrease).toBe(false); });
  });

  it('initialises every player with zero runs, wickets, overs bowled, and empty actions', () => {
    const players = defaultPlayers();
    players.forEach((p, i) => {
      expect(p.runs).toBe(0);
      expect(p.wicketsTaken).toBe(0);
      expect(p.oversBowled).toBe(0);
      expect(p.runsConceded).toBe(0);
      expect(p.allActions).toEqual([]);
      expect(p.bowlingActions).toEqual([]);
      expect(p.status).toBe('Not out');
      expect(p.methodOfWicket).toBeNull();
      expect(p.index).toBe(i);
    });
  });
});
