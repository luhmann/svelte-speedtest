-- CreateTable
CREATE TABLE "Test" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL,
    "jitter" REAL NOT NULL,
    "latency" REAL NOT NULL,
    "downloadBandwidth" INTEGER NOT NULL,
    "downloadBytes" INTEGER NOT NULL,
    "downloadElapsed" INTEGER NOT NULL,
    "uploadBandwidth" INTEGER NOT NULL,
    "uploadBytes" INTEGER NOT NULL,
    "uploadElapsed" INTEGER NOT NULL,
    "packetLoss" REAL NOT NULL,
    "isp" TEXT NOT NULL,
    "interfaceName" TEXT NOT NULL,
    "externalIp" TEXT NOT NULL,
    "serverName" TEXT NOT NULL,
    "serverId" INTEGER NOT NULL,
    "serverIp" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "resultUrl" TEXT NOT NULL
);
