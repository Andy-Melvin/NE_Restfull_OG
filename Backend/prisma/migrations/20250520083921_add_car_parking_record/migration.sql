-- CreateTable
CREATE TABLE "CarParkingRecord" (
    "id" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "parkingCode" TEXT NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" TIMESTAMP(3),
    "chargedAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarParkingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarParkingRecord_parkingCode_idx" ON "CarParkingRecord"("parkingCode");

-- CreateIndex
CREATE INDEX "CarParkingRecord_plateNumber_idx" ON "CarParkingRecord"("plateNumber");

-- AddForeignKey
ALTER TABLE "CarParkingRecord" ADD CONSTRAINT "CarParkingRecord_parkingCode_fkey" FOREIGN KEY ("parkingCode") REFERENCES "Parking"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
