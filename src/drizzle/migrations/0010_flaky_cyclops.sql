CREATE TYPE "public"."application_status" AS ENUM('pending', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TABLE "gig_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gig_id" uuid NOT NULL,
	"applicant_id" uuid NOT NULL,
	"cover_letter" text NOT NULL,
	"proposed_budget" integer,
	"portfolio_links" text[] DEFAULT '{}',
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gig_applications" ADD CONSTRAINT "gig_applications_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_applications" ADD CONSTRAINT "gig_applications_applicant_id_users_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;