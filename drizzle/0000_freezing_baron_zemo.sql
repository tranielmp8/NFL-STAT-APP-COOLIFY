CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"status" text NOT NULL,
	"game_time" timestamp with time zone,
	"week" integer,
	"season" integer,
	"broadcast" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"season" integer NOT NULL,
	"season_type" text DEFAULT 'regular' NOT NULL,
	"pass_yards" integer DEFAULT 0 NOT NULL,
	"pass_tds" integer DEFAULT 0 NOT NULL,
	"interceptions_thrown" integer DEFAULT 0 NOT NULL,
	"rush_yards" integer DEFAULT 0 NOT NULL,
	"rush_tds" integer DEFAULT 0 NOT NULL,
	"receptions" integer DEFAULT 0 NOT NULL,
	"rec_yards" integer DEFAULT 0 NOT NULL,
	"rec_tds" integer DEFAULT 0 NOT NULL,
	"tackles" integer DEFAULT 0 NOT NULL,
	"sacks" numeric(4, 1) DEFAULT '0' NOT NULL,
	"interceptions" integer DEFAULT 0 NOT NULL,
	"forced_fumbles" integer DEFAULT 0 NOT NULL,
	"pass_deflections" integer DEFAULT 0 NOT NULL,
	"fg_made" integer DEFAULT 0 NOT NULL,
	"fg_attempted" integer DEFAULT 0 NOT NULL,
	"punt_avg" numeric(4, 1) DEFAULT '0' NOT NULL,
	"return_tds" integer DEFAULT 0 NOT NULL,
	"games_played" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"espn_id" text NOT NULL,
	"team_id" integer,
	"name" text NOT NULL,
	"position" text NOT NULL,
	"jersey" text,
	"headshot_url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_espn_id_unique" UNIQUE("espn_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"espn_id" text NOT NULL,
	"abbreviation" text NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"conference" text NOT NULL,
	"division" text NOT NULL,
	"color_primary" text,
	"color_secondary" text,
	"logo_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_espn_id_unique" UNIQUE("espn_id")
);
--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "games_team_idx" ON "games" USING btree ("home_team","away_team");--> statement-breakpoint
CREATE INDEX "games_season_week_idx" ON "games" USING btree ("season","week");--> statement-breakpoint
CREATE UNIQUE INDEX "player_stats_player_season_idx" ON "player_stats" USING btree ("player_id","season","season_type");--> statement-breakpoint
CREATE INDEX "players_team_id_idx" ON "players" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "players_position_idx" ON "players" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_abbreviation_idx" ON "teams" USING btree ("abbreviation");--> statement-breakpoint
CREATE INDEX "teams_division_idx" ON "teams" USING btree ("division");