/**
 * Script to update department codes from DEPT-XXX to 01, 02, 03 format
 * Run with: npx tsx update-department-codes.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('🔄 Updating department codes...')

        // Get all departments ordered by creation date
        const departments = await prisma.department.findMany({
            orderBy: { createdAt: 'asc' }
        })

        console.log(`📋 Found ${departments.length} departments to update`)

        // Update each department with sequential 2-digit code
        for (let i = 0; i < departments.length; i++) {
            const dept = departments[i]
            const newCode = String(i + 1).padStart(2, '0')

            await prisma.department.update({
                where: { id: dept.id },
                data: { code: newCode }
            })

            console.log(`✅ Updated "${dept.name}": ${dept.code} → ${newCode}`)
        }

        console.log('\n✨ All department codes updated successfully!')

        // Display final result
        const updated = await prisma.department.findMany({
            orderBy: { code: 'asc' },
            select: { code: true, name: true }
        })

        console.log('\n📊 Final department codes:')
        updated.forEach(dept => {
            console.log(`   ${dept.code} - ${dept.name}`)
        })

    } catch (error) {
        console.error('❌ Error updating codes:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
