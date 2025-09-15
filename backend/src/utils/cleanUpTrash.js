const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanUpTrash() {
    const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await prisma.event.deleteMany({
        where: {
            deletedAt: { lte : THIRTY_DAYS_AGO }
        }
    });
}

module.exports = cleanUpTrash;