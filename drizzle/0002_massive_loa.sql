CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"locked_until" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "original_price" integer;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "daily_equivalent_note" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX "conv_user_id_idx" ON "conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "msg_conv_id_idx" ON "messages" USING btree ("conversation_id");