CREATE TYPE "public"."comparable_type" AS ENUM('SALE', 'RENT');--> statement-breakpoint
CREATE TYPE "public"."document_category" AS ENUM('CONTRACT', 'DISCLOSURE', 'MARKETING', 'FINANCIAL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ROLE_USER', 'ROLE_ADMIN');--> statement-breakpoint
CREATE TABLE "comparable_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"comparable_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comparables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"address" text NOT NULL,
	"subdivision" text NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" numeric(3, 1) NOT NULL,
	"garage_spaces" integer NOT NULL,
	"year_built" integer NOT NULL,
	"square_footage" integer NOT NULL,
	"lot_size" numeric(12, 2),
	"list_price" numeric(12, 2) NOT NULL,
	"sale_price" numeric(12, 2) NOT NULL,
	"close_date" timestamp NOT NULL,
	"type" "comparable_type" NOT NULL,
	"days_on_market" integer NOT NULL,
	"included" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"url" text NOT NULL,
	"category" "document_category" DEFAULT 'OTHER' NOT NULL,
	"order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"estimated_sale_price" numeric(12, 2) DEFAULT '0',
	"purchase_price" numeric(12, 2) DEFAULT '0',
	"seller_contribution" numeric(12, 2) DEFAULT '0',
	"repairs" numeric(12, 2) DEFAULT '0',
	"insurance" numeric(12, 2) DEFAULT '0',
	"survey" numeric(12, 2) DEFAULT '400',
	"inspection" numeric(12, 2) DEFAULT '400',
	"appraisal" numeric(12, 2) DEFAULT '400',
	"miscellaneous" numeric(12, 2) DEFAULT '0',
	"rent" numeric(12, 2) DEFAULT '0',
	"hoa" numeric(12, 2) DEFAULT '0',
	"property_tax" numeric(12, 2) DEFAULT '0',
	"hard_loan_to_value" numeric(5, 2) DEFAULT '70',
	"hard_lender_fees" numeric(12, 2) DEFAULT '10000',
	"hard_interest_rate" numeric(5, 3) DEFAULT '14.000',
	"hard_first_phase_costs" numeric(12, 2) DEFAULT '0',
	"refi_loan_to_value" numeric(5, 2) DEFAULT '75',
	"refi_loan_term" integer DEFAULT 30,
	"refi_interest_rate" numeric(5, 3) DEFAULT '5.000',
	"refi_lender_fees" numeric(12, 2) DEFAULT '5000',
	"refi_mortgage_insurance" numeric(12, 2) DEFAULT '0',
	"annual_cash_flow" numeric(12, 2),
	"equity_capture" numeric(12, 2),
	"return_on_equity_capture" numeric(12, 2),
	"cash_on_cash_return" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text DEFAULT 'United States',
	"original_list_price" numeric(12, 2),
	"current_price" numeric(12, 2),
	"close_price" numeric(12, 2),
	"price_per_sq_ft" numeric(12, 2),
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"living_area" integer,
	"year_built" integer,
	"lot_size" numeric(10, 2),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"status" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"order" integer DEFAULT 0,
	"property_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used" boolean DEFAULT false,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_invitations_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"has_set_password" boolean DEFAULT false,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" "user_role" DEFAULT 'ROLE_USER' NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "comparable_images" ADD CONSTRAINT "comparable_images_comparable_id_comparables_id_fk" FOREIGN KEY ("comparable_id") REFERENCES "public"."comparables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparables" ADD CONSTRAINT "comparables_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;