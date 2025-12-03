-- DropForeignKey
ALTER TABLE "TimeSession" DROP CONSTRAINT "TimeSession_projectId_fkey";

-- CreateTable
CREATE TABLE "ActiveSession" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "mode" "SessionMode" NOT NULL,
    "description" TEXT,
    "targetSeconds" INTEGER,
    "pomodoroPhase" TEXT,
    "pomodoroCycle" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ActiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveSession_userId_key" ON "ActiveSession"("userId");

-- CreateIndex
CREATE INDEX "ActiveSession_userId_idx" ON "ActiveSession"("userId");

-- AddForeignKey
ALTER TABLE "TimeSession" ADD CONSTRAINT "TimeSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveSession" ADD CONSTRAINT "ActiveSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveSession" ADD CONSTRAINT "ActiveSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
