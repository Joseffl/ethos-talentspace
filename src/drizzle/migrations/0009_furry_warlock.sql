CREATE TYPE "public"."gig_status" AS ENUM('open', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "gigs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"budget_min" integer NOT NULL,
	"budget_max" integer,
	"deadline" timestamp with time zone,
	"external_links" jsonb DEFAULT '[]'::jsonb,
	"skill_tags" jsonb DEFAULT '[]'::jsonb,
	"status" "gig_status" DEFAULT 'open' NOT NULL,
	"client_id" uuid NOT NULL,
	"reputation_criteria" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;