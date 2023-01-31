import prisma from "./prisma";

export async function getUserFinded(user){

    const userFinded = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        include: {
            userEnterprise: {
                include: {
                    enterprise:
                    {
                        include: {
                            configEnterprise: {
                                include: {
                                    SpecialDays: {
                                        include: {
                                            configEnterprise: true
                                        }
                                    },
                                }
                            },
                        },
                    },
                    role: true,
                    Stats: {
                        include: {
                            CustomTime: true,
                            specialTime: true,
                        },
                    },
                },
            },
        },
    })

    return userFinded;
}

// getUserStats
export async function getUserStats(user){

    const stats = await prisma.stats.findMany({
        where: {
            userEnterpriseId: user.userEnterprise.id,
        },
        include: {
            CustomTime: true,
            specialTime: {
                include: {
                    specialDay: {
                        include: {
                            configEnterprise: true
                        },
                    },
                }
            },
        },
    })

    return stats
}
