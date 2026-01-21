ALTER TABLE "purchases" DROP CONSTRAINT "purchases_flutterwaveTransactionId_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_clerkUserId_unique";--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "transactionHash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "privyUserId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "walletAddress" text;--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN "flutterwaveTransactionId";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "clerkUserId";--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_transactionHash_unique" UNIQUE("transactionHash");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_privyUserId_unique" UNIQUE("privyUserId");