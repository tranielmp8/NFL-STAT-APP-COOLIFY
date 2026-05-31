import {
	integer,
	numeric,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	index
} from 'drizzle-orm/pg-core';

export const teams = pgTable(
	'teams',
	{
		id: serial('id').primaryKey(),
		espnId: text('espn_id').notNull().unique(),
		abbreviation: text('abbreviation').notNull(),
		name: text('name').notNull(),
		city: text('city').notNull(),
		conference: text('conference').notNull(),
		division: text('division').notNull(),
		colorPrimary: text('color_primary'),
		colorSecondary: text('color_secondary'),
		logoUrl: text('logo_url'),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		abbrIdx: uniqueIndex('teams_abbreviation_idx').on(table.abbreviation),
		divisionIdx: index('teams_division_idx').on(table.division)
	})
);

export const players = pgTable(
	'players',
	{
		id: serial('id').primaryKey(),
		espnId: text('espn_id').notNull().unique(),
		teamId: integer('team_id').references(() => teams.id),
		name: text('name').notNull(),
		position: text('position').notNull(),
		jersey: text('jersey'),
		headshotUrl: text('headshot_url'),
		status: text('status').default('active').notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		teamIdx: index('players_team_id_idx').on(table.teamId),
		positionIdx: index('players_position_idx').on(table.position)
	})
);

export const playerStats = pgTable(
	'player_stats',
	{
		id: serial('id').primaryKey(),
		playerId: integer('player_id')
			.references(() => players.id, { onDelete: 'cascade' })
			.notNull(),
		season: integer('season').notNull(),
		seasonType: text('season_type').default('regular').notNull(),
		passYards: integer('pass_yards').default(0).notNull(),
		passTds: integer('pass_tds').default(0).notNull(),
		interceptionsThrown: integer('interceptions_thrown').default(0).notNull(),
		rushYards: integer('rush_yards').default(0).notNull(),
		rushTds: integer('rush_tds').default(0).notNull(),
		receptions: integer('receptions').default(0).notNull(),
		recYards: integer('rec_yards').default(0).notNull(),
		recTds: integer('rec_tds').default(0).notNull(),
		tackles: integer('tackles').default(0).notNull(),
		sacks: numeric('sacks', { precision: 4, scale: 1 }).default('0').notNull(),
		interceptions: integer('interceptions').default(0).notNull(),
		forcedFumbles: integer('forced_fumbles').default(0).notNull(),
		passDeflections: integer('pass_deflections').default(0).notNull(),
		fgMade: integer('fg_made').default(0).notNull(),
		fgAttempted: integer('fg_attempted').default(0).notNull(),
		puntAvg: numeric('punt_avg', { precision: 4, scale: 1 }).default('0').notNull(),
		returnTds: integer('return_tds').default(0).notNull(),
		gamesPlayed: integer('games_played').default(0).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		playerSeasonIdx: uniqueIndex('player_stats_player_season_idx').on(
			table.playerId,
			table.season,
			table.seasonType
		)
	})
);

export const games = pgTable(
	'games',
	{
		id: text('id').primaryKey(),
		homeTeam: text('home_team').notNull(),
		awayTeam: text('away_team').notNull(),
		homeScore: integer('home_score'),
		awayScore: integer('away_score'),
		status: text('status').notNull(),
		gameTime: timestamp('game_time', { withTimezone: true }),
		week: integer('week'),
		season: integer('season'),
		broadcast: text('broadcast'),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		teamIdx: index('games_team_idx').on(table.homeTeam, table.awayTeam),
		seasonWeekIdx: index('games_season_week_idx').on(table.season, table.week)
	})
);

export const appSettings = pgTable('app_settings', {
	id: serial('id').primaryKey(),
	currentSeason: integer('current_season').default(2025).notNull(),
	currentSeasonType: text('current_season_type').default('regular').notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const syncJobs = pgTable(
	'sync_jobs',
	{
		id: serial('id').primaryKey(),
		type: text('type').notNull(),
		status: text('status').default('queued').notNull(),
		season: integer('season').notNull(),
		seasonType: text('season_type').default('regular').notNull(),
		requestedBy: text('requested_by'),
		message: text('message'),
		error: text('error'),
		startedAt: timestamp('started_at', { withTimezone: true }),
		finishedAt: timestamp('finished_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		statusIdx: index('sync_jobs_status_idx').on(table.status),
		createdAtIdx: index('sync_jobs_created_at_idx').on(table.createdAt)
	})
);

export * from './auth.schema.ts';
