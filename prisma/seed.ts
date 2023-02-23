

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
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
        ],
            skipDuplicates: true,
    })

    await prisma.defaultSpecialDay.createMany({
        data: [
            {
                id: "1",
                name: "Congé",
                work: false,
                paid: true,
            },
            {
                id: "2",
                name: "Récup",
                work: false,
                paid: true,
            },
            {
                id: "3",
                name: "Maladie",
                work: false,
                paid: true,
            },
            {
                id: "4",
                name: "Sans solde",
                work: false,
                paid: false,
            },
            {
                id: "5",
                name: "École",
                work: false,
                paid: true,
            },
            {
                id: "6",
                name: "Évènement",
                work: true,
                paid: true,
            },
        ],
            skipDuplicates: true,
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