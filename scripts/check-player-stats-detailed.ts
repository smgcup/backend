import { DataSource } from 'typeorm';

interface MatchEvent {
  id: string;
  player_id: string | null;
  assist_player_id: string | null;
  type: string;
}

interface PlayerStatsRow {
  player_id: string;
  goals: number;
  penalties_scored: number;
  penalties_missed: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  goalkeeper_saves: number;
  own_goals: number;
}

interface StatWithEvents {
  count: number;
  eventIds: string[];
}

interface ExpectedStatsWithEvents {
  goals: StatWithEvents;
  penaltiesScored: StatWithEvents;
  penaltiesMissed: StatWithEvents;
  assists: StatWithEvents;
  yellowCards: StatWithEvents;
  redCards: StatWithEvents;
  goalkeeperSaves: StatWithEvents;
  ownGoals: StatWithEvents;
}

interface Discrepancy {
  playerId: string;
  field: string;
  expected: number;
  actual: number;
  eventIds: string[];
}

function createEmptyStats(): ExpectedStatsWithEvents {
  return {
    goals: { count: 0, eventIds: [] },
    penaltiesScored: { count: 0, eventIds: [] },
    penaltiesMissed: { count: 0, eventIds: [] },
    assists: { count: 0, eventIds: [] },
    yellowCards: { count: 0, eventIds: [] },
    redCards: { count: 0, eventIds: [] },
    goalkeeperSaves: { count: 0, eventIds: [] },
    ownGoals: { count: 0, eventIds: [] },
  };
}

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'aws-1-eu-central-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres.qlhpnyxosnoaqqjabuar',
    password: process.env.DB_PASSWORD || 'SmgCup!123',
    database: process.env.DB_DATABASE || 'postgres',
  });

  await dataSource.initialize();

  console.log('Fetching match events...');
  const matchEvents: MatchEvent[] = await dataSource.query('SELECT * FROM match_event');

  console.log('Fetching player stats...');
  const playerStats: PlayerStatsRow[] = await dataSource.query('SELECT * FROM player_stats');

  // Build expected stats from match events, tracking event IDs
  const expectedStatsMap = new Map<string, ExpectedStatsWithEvents>();

  for (const event of matchEvents) {
    const playerId = event.player_id;
    const assistPlayerId = event.assist_player_id;

    if (playerId) {
      if (!expectedStatsMap.has(playerId)) {
        expectedStatsMap.set(playerId, createEmptyStats());
      }
      const stats = expectedStatsMap.get(playerId)!;

      switch (event.type) {
        case 'GOAL':
          stats.goals.count++;
          stats.goals.eventIds.push(event.id);
          break;
        case 'OWN_GOAL':
          stats.ownGoals.count++;
          stats.ownGoals.eventIds.push(event.id);
          break;
        case 'YELLOW_CARD':
          stats.yellowCards.count++;
          stats.yellowCards.eventIds.push(event.id);
          break;
        case 'RED_CARD':
          stats.redCards.count++;
          stats.redCards.eventIds.push(event.id);
          break;
        case 'GOALKEEPER_SAVE':
          stats.goalkeeperSaves.count++;
          stats.goalkeeperSaves.eventIds.push(event.id);
          break;
        case 'PENALTY_SCORED':
          stats.penaltiesScored.count++;
          stats.penaltiesScored.eventIds.push(event.id);
          break;
        case 'PENALTY_MISSED':
          stats.penaltiesMissed.count++;
          stats.penaltiesMissed.eventIds.push(event.id);
          break;
      }
    }

    // Handle assists (for GOAL and PENALTY_SCORED events)
    if (assistPlayerId && (event.type === 'GOAL' || event.type === 'PENALTY_SCORED')) {
      if (!expectedStatsMap.has(assistPlayerId)) {
        expectedStatsMap.set(assistPlayerId, createEmptyStats());
      }
      const assistStats = expectedStatsMap.get(assistPlayerId)!;
      assistStats.assists.count++;
      assistStats.assists.eventIds.push(event.id);
    }
  }

  // Compare with actual stats
  const discrepancies: Discrepancy[] = [];

  // Check all players in player_stats
  for (const row of playerStats) {
    const expected = expectedStatsMap.get(row.player_id) || createEmptyStats();

    const fieldsToCheck: {
      dbField: keyof PlayerStatsRow;
      expectedField: keyof ExpectedStatsWithEvents;
      label: string;
    }[] = [
      { dbField: 'goals', expectedField: 'goals', label: 'goals' },
      { dbField: 'penalties_scored', expectedField: 'penaltiesScored', label: 'penaltiesScored' },
      { dbField: 'penalties_missed', expectedField: 'penaltiesMissed', label: 'penaltiesMissed' },
      { dbField: 'assists', expectedField: 'assists', label: 'assists' },
      { dbField: 'yellow_cards', expectedField: 'yellowCards', label: 'yellowCards' },
      { dbField: 'red_cards', expectedField: 'redCards', label: 'redCards' },
      { dbField: 'goalkeeper_saves', expectedField: 'goalkeeperSaves', label: 'goalkeeperSaves' },
      { dbField: 'own_goals', expectedField: 'ownGoals', label: 'ownGoals' },
    ];

    for (const field of fieldsToCheck) {
      const actualValue = row[field.dbField] as number;
      const expectedStat = expected[field.expectedField];

      if (actualValue !== expectedStat.count) {
        discrepancies.push({
          playerId: row.player_id,
          field: field.label,
          expected: expectedStat.count,
          actual: actualValue,
          eventIds: expectedStat.eventIds,
        });
      }
    }

    // Remove from map so we can check for missing player_stats entries
    expectedStatsMap.delete(row.player_id);
  }

  // Check for players with events but no player_stats row
  for (const [playerId, expected] of expectedStatsMap.entries()) {
    const hasNonZeroStats = Object.values(expected).some((v) => v.count > 0);
    if (hasNonZeroStats) {
      console.log(`\nMissing player_stats row for player ${playerId}:`);
      for (const [field, stat] of Object.entries(expected)) {
        if (stat.count > 0) {
          console.log(`  ${field}: expected=${stat.count}`);
          console.log(`    Event IDs: ${stat.eventIds.join(', ')}`);
        }
      }
    }
  }

  await dataSource.destroy();

  // Output results
  console.log(`\n=== Player Stats Check Results (Detailed) ===`);
  console.log(`Total match events: ${matchEvents.length}`);
  console.log(`Total player_stats rows: ${playerStats.length}`);

  if (discrepancies.length === 0) {
    console.log('\nNo discrepancies found. All player stats match the match events.');
  } else {
    console.log(`\nFound ${discrepancies.length} discrepancies:\n`);

    // Group by player
    const byPlayer = new Map<string, Discrepancy[]>();
    for (const d of discrepancies) {
      if (!byPlayer.has(d.playerId)) {
        byPlayer.set(d.playerId, []);
      }
      byPlayer.get(d.playerId)!.push(d);
    }

    for (const [playerId, playerDiscrepancies] of byPlayer.entries()) {
      console.log(`Player ID: ${playerId}`);
      for (const d of playerDiscrepancies) {
        console.log(`  ${d.field}: expected=${d.expected}, actual=${d.actual}`);
        if (d.eventIds.length > 0) {
          console.log(`    Event IDs: ${d.eventIds.join(', ')}`);
        } else {
          console.log(`    Event IDs: (none)`);
        }
      }
      console.log('');
    }
  }
}

main().catch((err) => {
  console.error('Check failed:', err);
  process.exit(1);
});
