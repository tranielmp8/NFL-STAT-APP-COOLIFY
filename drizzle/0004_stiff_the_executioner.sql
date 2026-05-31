CREATE TABLE "sync_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"season" integer NOT NULL,
	"season_type" text DEFAULT 'regular' NOT NULL,
	"requested_by" text,
	"message" text,
	"error" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sync_jobs_status_idx" ON "sync_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_jobs_created_at_idx" ON "sync_jobs" USING btree ("created_at");