CREATE TABLE "app_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"current_season" integer DEFAULT 2025 NOT NULL,
	"current_season_type" text DEFAULT 'regular' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
