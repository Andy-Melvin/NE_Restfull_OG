-- CreateTable
CREATE TABLE "Parking" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "numberOfSpaces" INTEGER NOT NULL,
    "availableSpaces" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "chargingFeePerHour" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parking_code_key" ON "Parking"("code");
