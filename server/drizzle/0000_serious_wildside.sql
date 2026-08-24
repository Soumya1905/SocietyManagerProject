CREATE TYPE "public"."complaint_category" AS ENUM('PLUMBING', 'ELECTRICAL', 'SECURITY', 'CLEANLINESS', 'LIFT', 'PARKING', 'WATER_SUPPLY', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."complaint_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('RESIDENT', 'ADMIN');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "complaint_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"previous_status" "complaint_status",
	"new_status" "complaint_status" NOT NULL,
	"actor_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resident_id" uuid NOT NULL,
	"category" "complaint_category" NOT NULL,
	"description" text NOT NULL,
	"photo_url" varchar(500),
	"status" "complaint_status" DEFAULT 'OPEN' NOT NULL,
	"priority" "complaint_priority" DEFAULT 'MEDIUM' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"is_important" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"apartment_number" varchar(50) NOT NULL,
	"role" "role" DEFAULT 'RESIDENT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complaint_history" ADD CONSTRAINT "complaint_history_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complaint_history" ADD CONSTRAINT "complaint_history_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complaints" ADD CONSTRAINT "complaints_resident_id_users_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notices" ADD CONSTRAINT "notices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "complaint_history_complaint_id_idx" ON "complaint_history" USING btree ("complaint_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "complaints_resident_id_idx" ON "complaints" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "complaints_status_idx" ON "complaints" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "complaints_priority_idx" ON "complaints" USING btree ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "complaints_category_idx" ON "complaints" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "complaints_created_at_idx" ON "complaints" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notices_is_important_idx" ON "notices" USING btree ("is_important");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" USING btree ("role");