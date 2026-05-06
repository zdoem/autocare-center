
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const paymentTypes = [
        {
            code: 'PM01',
            name: 'เงินสด',
            description: 'รับชำระด้วยเงินสด',
            isActive: true,
        },
        {
            code: 'PM02',
            name: 'โอนเงิน',
            description: 'โอนผ่านบัญชีธนาคาร',
            isActive: true,
        },
        {
            code: 'PM03',
            name: 'QR PromptPay',
            description: 'สแกน QR Code PromptPay',
            isActive: true,
        },
        {
            code: 'PM04',
            name: 'บัตรเครดิต',
            description: 'Visa, Mastercard, JCB',
            isActive: true,
        },
        {
            code: 'PM05',
            name: 'บัตรเดบิต',
            description: 'บัตรเดบิตธนาคาร',
            isActive: true,
        },
        {
            code: 'PM06',
            name: 'เครดิต',
            description: 'ชำระภายหลัง (เฉพาะลูกค้า VIP)',
            isActive: true,
        },
    ]

    console.log('Seeding Payment Types...')

    for (const pt of paymentTypes) {
        const paymentType = await prisma.paymentType.upsert({
            where: { code: pt.code },
            update: pt,
            create: pt,
        })
        console.log(`Upserted Payment Type: ${paymentType.code} - ${paymentType.name}`)
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
