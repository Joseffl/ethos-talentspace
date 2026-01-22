ALTER TYPE "public"."gig_status" ADD VALUE 'submitted' BEFORE 'completed';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ethos_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "review_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "average_rating" real DEFAULT 0;