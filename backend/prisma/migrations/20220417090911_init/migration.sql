CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "client" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);
