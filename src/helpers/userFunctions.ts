import { User } from "@prisma/client";
import prisma from "./prisma";

export async function getUserFinded(user) {

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
                            createdBy: true,
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
export async function getUserStats(user) {

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

export async function getUserEnterprise(id: string, userEnterprise) {
    const enterprise = await prisma.enterprise.findUnique({
        where: {
            id: id,
        },
        include: {
            configEnterprise: {
                include: {
                    SpecialDays: {
                        include: {
                            configEnterprise: true,
                            specialTime : {
                                include: {
                                    stats: true,
                                },
                            },
                            defaultSpecialDay: {
                                include: {
                                    SpecialDay: true,
                                    configEnterprise: true
                                }
                            },
                        }
                    },
                    enterprise: true,
                    DefaultSpecialDays: {
                        where: {
                            configEnterpriseId: (null || userEnterprise?.enterprise?.configEnterprise?.id),
                        },
                        include: {
                            SpecialDay: true,
                            configEnterprise: true
                        }
                    },
                }
            },
            RoleEnterprise: true,
            createdBy: true,
            
        },
    })

    return enterprise
    }