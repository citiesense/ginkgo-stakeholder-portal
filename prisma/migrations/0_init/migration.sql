-- CreateTable Tenant
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "apiBaseUrl" TEXT NOT NULL DEFAULT 'https://api.ginkgo.city',
    "apiKeyCiphertext" TEXT NOT NULL,
    "brandLogoUrl" TEXT,
    "brandColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable VerificationCampaign
CREATE TABLE "VerificationCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audienceType" TEXT NOT NULL,
    "filtersJson" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationCampaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable VerificationRecipient
CREATE TABLE "VerificationRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "contactId" INTEGER NOT NULL,
    "primaryType" TEXT NOT NULL,
    "primaryRecordId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "espMessageId" TEXT,
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "VerificationCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable VerificationEvent
CREATE TABLE "VerificationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationEvent_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "VerificationRecipient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable ContactChangeSet
CREATE TABLE "ContactChangeSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "beforeJson" JSONB NOT NULL,
    "afterJson" JSONB NOT NULL,
    "reviewerId" TEXT,
    "approvedAt" TIMESTAMP(3),
    CONSTRAINT "ContactChangeSet_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "VerificationRecipient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable EspConnection
CREATE TABLE "EspConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessKey" TEXT NOT NULL,
    "accessSecret" TEXT,
    "listId" TEXT,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EspConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VerificationCampaign_tenantId_idx" ON "VerificationCampaign"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRecipient_token_key" ON "VerificationRecipient"("token");

-- CreateIndex
CREATE INDEX "VerificationRecipient_campaignId_idx" ON "VerificationRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "VerificationRecipient_token_idx" ON "VerificationRecipient"("token");

-- CreateIndex
CREATE INDEX "VerificationRecipient_status_idx" ON "VerificationRecipient"("status");

-- CreateIndex
CREATE INDEX "VerificationEvent_recipientId_idx" ON "VerificationEvent"("recipientId");

-- CreateIndex
CREATE INDEX "VerificationEvent_type_idx" ON "VerificationEvent"("type");

-- CreateIndex
CREATE INDEX "ContactChangeSet_recipientId_idx" ON "ContactChangeSet"("recipientId");

-- CreateIndex
CREATE INDEX "EspConnection_tenantId_idx" ON "EspConnection"("tenantId");
