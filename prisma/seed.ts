

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    // create 3 roleEnterprises
    await prisma.roleEnterprise.createMany({
        data: [
            {
                id: "09cf4331-087a-436a-a1bd-daee673ecd11",
                label: 'Collaborateur',
                isAdmin: 0,
            },
            {
                id: "5562bac0-a0e4-4546-8a0a-49e03bafe976",
                label: 'Administrateur',
                isAdmin: 1,
            },
            {
                id: "08c61d13-40a2-4ace-9661-5be5c677c9a8",
                label: 'Super Admin',
                isAdmin: 2,
            },
        ]
    })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })