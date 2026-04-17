-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "team_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "invited_by_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "idx_invitations_email" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "idx_invitations_org" ON "invitations"("organization_id");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "hours_billed_override" DOUBLE PRECISION,
ADD COLUMN     "current_earnings_override" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "milestones" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "is_urgent";
