async function testAllApis() {
    const endpoints = [
        '/api/master/car-brand?sortBy=updatedAt&sortOrder=desc',
        '/api/master/car-model?sortBy=updatedAt&sortOrder=desc',
        '/api/master/customer',
        '/api/master/employee',
        '/api/master/spare',
        '/api/master/spares-category',
        '/api/master/vendor',
        '/api/master/service',
        '/api/master/department',
        '/api/master/position',
        '/api/master/payment-type',
        '/api/ops/search?q=1',
        '/api/system/audit-logs',
        '/api/system/api-usage'
    ]

    console.log('\n🔍 TESTING MASTER DATA & OPS APIS (Ralph Loop Verification)')
    console.log('===========================================================')

    let allPassed = true
    for (const ep of endpoints) {
        try {
            const res = await fetch(`http://localhost:3000${ep}`)
            if (res.status === 200) {
                const json = await res.json() as any
                const count = json.data?.length ?? (json.total ?? 'OK')
                console.log(`✅ [200 OK] ${ep} (Found: ${count})`)
            } else {
                console.error(`❌ [${res.status}] ${ep}`)
                allPassed = false
            }
        } catch (e: any) {
            console.error(`❌ [ERROR] ${ep}: ${e.message}`)
            allPassed = false
        }
    }

    console.log('===========================================================')
    if (allPassed) {
        console.log('🎉 ALL APIS PASSED VERIFICATION!')
    } else {
        console.log('⚠️ SOME APIS FAILED!')
        process.exit(1)
    }
}

testAllApis()
