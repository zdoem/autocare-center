import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

// Mapping table names in Postgres to Prisma model names
const TABLE_MAPPINGS: { table: string; model: string }[] = [
    // 1. Organization & Masters
    { table: 'departments', model: 'department' },
    { table: 'positions', model: 'position' },
    { table: 'employee_types', model: 'employeeType' },
    { table: 'employees', model: 'employee' },
    { table: 'users', model: 'user' },

    // 2. Customers & Cars
    { table: 'customer_types', model: 'customerType' },
    { table: 'customers', model: 'customer' },
    { table: 'car_brands', model: 'carBrand' },
    { table: 'car_models', model: 'carModel' },
    { table: 'cars', model: 'car' },
    { table: 'car_images', model: 'carImage' },

    // 3. Spares & Services & Vendors
    { table: 'vendors', model: 'vendor' },
    { table: 'spares_categories', model: 'sparesCategory' },
    { table: 'spares', model: 'spare' },
    { table: 'service_categories', model: 'serviceCategory' },
    { table: 'services', model: 'service' },
    { table: 'payment_types', model: 'paymentType' },

    // 4. Purchases & Maintenance Templates
    { table: 'purchases', model: 'purchase' },
    { table: 'purchase_items', model: 'purchaseItem' },
    { table: 'maintenance_templates', model: 'maintenanceTemplate' },
    { table: 'maintenance_template_items', model: 'maintenanceTemplateItem' },
    { table: 'maintenance_reminders', model: 'maintenanceReminder' },

    // 5. Service Jobs & Operations
    { table: 'service_jobs', model: 'serviceJob' },
    { table: 'service_job_items', model: 'serviceJobItem' },
    { table: 'service_job_labor', model: 'serviceJobLabor' },
    { table: 'service_job_qc', model: 'serviceJobQC' },
    { table: 'service_job_recommendations', model: 'serviceJobRecommendation' },
    { table: 'service_job_media', model: 'serviceJobMedia' },

    // 6. Finances & Stocks & Logs
    { table: 'cash_receipts', model: 'cashReceipt' },
    { table: 'payments', model: 'payment' },
    { table: 'stock_movements', model: 'stockMovement' },
    { table: 'system_settings', model: 'systemSetting' },
    { table: 'audit_logs', model: 'auditLog' },
    { table: 'api_usage_logs', model: 'apiUsageLog' },
]

async function dumpAndMigrate() {
    console.log('=====================================================')
    console.log('🚀 Starting Full PostgreSQL ➔ MariaDB 11.8 Migration')
    console.log('=====================================================')

    for (const { table, model: modelName } of TABLE_MAPPINGS) {
        try {
            const rawJson = execSync(
                `docker exec my_postgres psql -U pgadmin -d db_autocar -t -A -c "SELECT COALESCE(json_agg(t), '[]'::json) FROM (SELECT * FROM \\"${table}\\") t;"`,
                { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
            ).trim()

            const records: any[] = JSON.parse(rawJson)

            if (!records || records.length === 0) {
                console.log(` - ${table} (${modelName}): 0 records`)
                continue
            }

            console.log(` - Migrating ${records.length} records into ${modelName} (${table})...`)
            const prismaModel = (prisma as any)[modelName]

            for (const record of records) {
                const cleaned: any = { ...record }

                // Parse Date fields
                for (const [k, v] of Object.entries(cleaned)) {
                    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
                        cleaned[k] = new Date(v)
                    }
                }

                await prismaModel.upsert({
                    where: { id: cleaned.id },
                    create: cleaned,
                    update: cleaned,
                })
            }
            console.log(`   ✓ ${modelName} completed (${records.length} records)`)

        } catch (err: any) {
            console.error(` ❌ Error migrating ${table} (${modelName}):`, err.message)
        }
    }

    console.log('=====================================================')
    console.log('🎉 ALL DATA MIGRATED TO MARIADB 11.8 SUCCESSFULLY!')
    console.log('=====================================================')
}

dumpAndMigrate()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
