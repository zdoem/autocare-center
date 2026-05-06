
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Clean up existing data
    // Clean up existing data - Order matters due to foreign keys!
    console.log('🧹 Cleaning up database...')
    // Service Job workflow tables
    await prisma.maintenanceReminder.deleteMany()
    await prisma.serviceJobRecommendation.deleteMany()
    await prisma.maintenanceTemplateItem.deleteMany()
    await prisma.maintenanceTemplate.deleteMany()
    await prisma.serviceJobMedia.deleteMany()
    await prisma.serviceJobQC.deleteMany()
    await prisma.serviceJobLabor.deleteMany()

    // Stock and Purchase
    await prisma.stockMovement.deleteMany()
    await prisma.purchaseItem.deleteMany()
    await prisma.purchase.deleteMany()

    // Cash receipts and payments
    await prisma.cashReceipt.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.paymentType.deleteMany()

    // Service jobs and items
    await prisma.serviceJobItem.deleteMany()
    await prisma.serviceJob.deleteMany()

    // Spares, Services, Vendors
    await prisma.spare.deleteMany()
    await prisma.service.deleteMany()
    await prisma.vendor.deleteMany()
    await prisma.sparesCategory.deleteMany()
    await prisma.serviceCategory.deleteMany()

    // Cars and images
    await prisma.carImage.deleteMany()
    await prisma.car.deleteMany()

    // Customers
    await prisma.customer.deleteMany()
    await prisma.customerType.deleteMany()

    await prisma.user.deleteMany()
    await prisma.employee.deleteMany()
    await prisma.position.deleteMany()
    await prisma.department.deleteMany()
    await prisma.employeeType.deleteMany()

    await prisma.carModel.deleteMany()
    await prisma.carBrand.deleteMany()

    // 1. Seed Car Brands
    console.log('📝 Seeding Car Brands...')
    const toyota = await prisma.carBrand.create({
        data: {
            code: 'BR001',
            nameThai: 'โตโยต้า',
            nameEnglish: 'Toyota',
            name: 'Toyota',
            logoUrl: 'https://www.carlogos.org/car-logos/toyota-logo.png',
            isActive: true,
        }
    })
    const honda = await prisma.carBrand.create({
        data: {
            code: 'BR002',
            nameThai: 'ฮอนด้า',
            nameEnglish: 'Honda',
            name: 'Honda',
            logoUrl: 'https://www.carlogos.org/car-logos/honda-logo.png',
            isActive: true,
        }
    })
    const mazda = await prisma.carBrand.create({
        data: {
            code: 'BR003',
            nameThai: 'มาสด้า',
            nameEnglish: 'Mazda',
            name: 'Mazda',
            logoUrl: 'https://www.carlogos.org/car-logos/mazda-logo.png',
            isActive: true,
        }
    })
    const nissan = await prisma.carBrand.create({
        data: {
            code: 'BR004',
            nameThai: 'นิสสัน',
            nameEnglish: 'Nissan',
            name: 'Nissan',
            logoUrl: 'https://www.carlogos.org/car-logos/nissan-logo.png',
            isActive: true,
        }
    })
    const isuzu = await prisma.carBrand.create({
        data: {
            code: 'BR005',
            nameThai: 'อีซูซุ',
            nameEnglish: 'Isuzu',
            name: 'Isuzu',
            logoUrl: 'https://www.carlogos.org/car-logos/isuzu-logo.png',
            isActive: true,
        }
    })
    const ford = await prisma.carBrand.create({
        data: {
            code: 'BR006',
            nameThai: 'ฟอร์ด',
            nameEnglish: 'Ford',
            name: 'Ford',
            logoUrl: 'https://www.carlogos.org/car-logos/ford-logo.png',
            isActive: false,
        }
    })

    // 2. Seed Car Models
    console.log('📝 Seeding Car Models...')
    await prisma.carModel.create({
        data: {
            code: 'MD001',
            name: 'Camry',
            carBrandId: toyota.id,
            yearStart: 2019,
            yearEnd: 2024,
            vehicleType: 'รถเก๋ง',
            fuelType: 'Hybrid',
            isActive: true,
        }
    })
    await prisma.carModel.create({
        data: {
            code: 'MD002',
            name: 'Corolla Altis',
            carBrandId: toyota.id,
            yearStart: 2019,
            yearEnd: 2024,
            vehicleType: 'รถเก๋ง',
            fuelType: 'Gasoline',
            isActive: true,
        }
    })
    await prisma.carModel.create({
        data: {
            code: 'MD003',
            name: 'Yaris',
            carBrandId: toyota.id,
            yearStart: 2017,
            yearEnd: 2023,
            vehicleType: 'รถเก๋ง',
            fuelType: 'Gasoline',
            isActive: true,
        }
    })
    await prisma.carModel.create({
        data: {
            code: 'MD004',
            name: 'Hilux Revo',
            carBrandId: toyota.id,
            yearStart: 2015,
            yearEnd: 2024,
            vehicleType: 'กระบะ',
            fuelType: 'Diesel',
            isActive: true,
        }
    })
    await prisma.carModel.create({
        data: {
            code: 'MD005',
            name: 'Civic',
            carBrandId: honda.id,
            yearStart: 2016,
            yearEnd: 2024,
            vehicleType: 'รถเก๋ง',
            fuelType: 'Gasoline',
            isActive: true,
        }
    })
    await prisma.carModel.create({
        data: {
            code: 'MD006',
            name: 'Accord',
            carBrandId: honda.id,
            yearStart: 2018,
            yearEnd: 2024,
            vehicleType: 'รถเก๋ง',
            fuelType: 'Hybrid',
            isActive: true,
        }
    })
    await prisma.carModel.create({
        data: {
            code: 'MD007',
            name: 'Mazda 3',
            carBrandId: mazda.id,
            yearStart: 2019,
            yearEnd: 2024,
            vehicleType: 'รถเก๋ง',
            fuelType: 'Gasoline',
            isActive: true,
        }
    })

    // 1. Create Departments
    console.log('📝 Seeding Departments...')
    const deptManagement = await prisma.department.create({
        data: { name: 'ฝ่ายบริหาร', code: '01', description: 'Management Department', employeeCount: 0 }
    })
    const deptHR = await prisma.department.create({
        data: { name: 'ฝ่ายบุคคล', code: '02', description: 'Human Resources', employeeCount: 0 }
    })
    const deptIT = await prisma.department.create({
        data: { name: 'ฝ่ายไอที', code: '03', description: 'Information Technology', employeeCount: 0 }
    })
    const deptService = await prisma.department.create({
        data: { name: 'ฝ่ายบริการ', code: '04', description: 'Service Department', employeeCount: 0 }
    })
    const deptSales = await prisma.department.create({
        data: { name: 'ฝ่ายขาย', code: '05', description: 'Sales Department', employeeCount: 0 }
    })

    // 2. Create Employee Types
    console.log('📝 Seeding Employee Types...')
    const typeFullTime = await prisma.employeeType.create({
        data: { name: 'Full-time', code: '01', description: 'พนักงานประจำ' }
    })
    const typePartTime = await prisma.employeeType.create({
        data: { name: 'Part-time', code: '02', description: 'พนักงานพาร์ทไทม์' }
    })

    // 3. Create Positions
    console.log('📝 Seeding Positions...')
    const posManager = await prisma.position.create({
        data: {
            name: 'Manager',
            code: '01',
            departmentId: deptManagement.id,
            baseSalary: 50000
        }
    })
    const posHR = await prisma.position.create({
        data: {
            name: 'HR Officer',
            code: '02',
            departmentId: deptHR.id,
            baseSalary: 25000
        }
    })
    const posIT = await prisma.position.create({
        data: {
            name: 'IT Support',
            code: '03',
            departmentId: deptIT.id,
            baseSalary: 30000
        }
    })
    const posTechnician = await prisma.position.create({
        data: {
            name: 'Senior Technician',
            code: '04',
            departmentId: deptService.id,
            baseSalary: 20000
        }
    })

    // 4. Create Employees
    console.log('📝 Seeding Employees...')
    const hashedPassword = await bcrypt.hash('admin123', 12)

    await prisma.employee.create({
        data: {
            code: 'E001',
            name: 'Admin User',
            nickname: 'Admin',
            username: 'admin',
            password: hashedPassword,
            departmentId: deptManagement.id,
            positionId: posManager.id,
            employeeTypeId: typeFullTime.id,
            role: 'ADMIN',
            phone: '081-234-5678',
            email: 'admin@autocare.com',
            startDate: new Date(),
            salary: 60000
        }
    })

    // 5. Create Customer Types
    console.log('📝 Seeding Customer Types...')
    const ctVIP = await prisma.customerType.create({
        data: {
            code: 'CT01',
            name: 'VIP',
            description: 'ลูกค้าประจำ / ใช้บริการ > 10 ครั้ง',
            discount: 10,
            isActive: true,
        }
    })
    const ctNormal = await prisma.customerType.create({
        data: {
            code: 'CT02',
            name: 'ทั่วไป',
            description: 'ลูกค้าทั่วไป',
            discount: 0,
            isActive: true,
        }
    })
    const ctCorporate = await prisma.customerType.create({
        data: {
            code: 'CT03',
            name: 'นิติบุคคล',
            description: 'บริษัท / องค์กร',
            discount: 15,
            isActive: true,
        }
    })
    const ctFleet = await prisma.customerType.create({
        data: {
            code: 'CT04',
            name: 'Fleet',
            description: 'ลูกค้าที่มีรถหลายคัน',
            discount: 20,
            isActive: true,
        }
    })
    const ctEmployee = await prisma.customerType.create({
        data: {
            code: 'CT05',
            name: 'พนักงาน',
            description: 'พนักงานและครอบครัว',
            discount: 25,
            isActive: true,
        }
    })


    // 6. Create Sample Customers
    console.log('📝 Seeding Sample Customers...')
    await prisma.customer.create({
        data: {
            code: 'C-0001',
            firstName: 'สมศักดิ์',
            lastName: 'พานทอง',
            fullName: 'สมศักดิ์ พานทอง',
            phone: '081-234-5678',
            email: 'somsak@email.com',
            lineId: 'somsak_line',
            address: '123 ถ.สุขุมวิท กทม.',
            taxId: null,
            customerTypeId: ctVIP.id,
            isActive: true,
        }
    })
    await prisma.customer.create({
        data: {
            code: 'C-0002',
            firstName: 'วิภา',
            lastName: 'สุขใจ',
            fullName: 'วิภา สุขใจ',
            phone: '089-999-8888',
            email: 'vipa@email.com',
            lineId: 'vipa_happy',
            address: '456 ถ.พระราม 9 กทม.',
            taxId: null,
            customerTypeId: ctVIP.id,
            isActive: true,
        }
    })
    await prisma.customer.create({
        data: {
            code: 'C-0003',
            firstName: 'ประยุทธ์',
            lastName: 'มั่นคง',
            fullName: 'ประยุทธ์ มั่นคง',
            phone: '086-555-4444',
            email: 'prayut@email.com',
            lineId: null,
            address: '789 ถ.ลาดพร้าว กทม.',
            taxId: null,
            customerTypeId: ctNormal.id,
            isActive: true,
        }
    })
    await prisma.customer.create({
        data: {
            code: 'C-0004',
            firstName: 'บริษัท สุขใจ',
            lastName: 'จำกัด',
            fullName: 'บริษัท สุขใจ จำกัด',
            phone: '02-123-4567',
            email: 'sukjai@company.com',
            lineId: 'sukjai_co',
            address: '200 ถ.สีลม กทม.',
            taxId: '1234567890123',
            customerTypeId: ctCorporate.id,
            isActive: true,
        }
    })

    // 7. Create Additional Employees for Users
    console.log('📝 Seeding Additional Employees for Users...')

    // Create Cashier Position if not needed, but we can use Sales Dept
    const posCashier = await prisma.position.create({
        data: {
            name: 'Cashier',
            code: '05',
            departmentId: deptSales.id,
            baseSalary: 18000
        }
    })

    // Create Employees
    const empAdmin = await prisma.employee.findFirst({ where: { code: 'E001' } }) // Provided by earlier seed

    // Create Cashier Employee
    const empCashier = await prisma.employee.create({
        data: {
            code: 'E002',
            name: 'Cashier Staff',
            nickname: 'Cat',
            username: 'cashier',
            password: hashedPassword, // Reuse same hash for simplicity or hash new one
            departmentId: deptSales.id,
            positionId: posCashier.id,
            employeeTypeId: typeFullTime.id,
            role: 'CASHIER',
            phone: '089-111-2222',
            email: 'cashier@autocare.com',
            startDate: new Date(),
            salary: 20000
        }
    })

    // Create Technician Employee
    const empTech = await prisma.employee.create({
        data: {
            code: 'E003',
            name: 'Technician Somchai',
            nickname: 'Chai',
            username: 'tech',
            password: hashedPassword,
            departmentId: deptService.id,
            positionId: posTechnician.id, // Senior Technician (04)
            employeeTypeId: typeFullTime.id,
            role: 'TECHNICIAN',
            phone: '089-333-4444',
            email: 'tech@autocare.com',
            startDate: new Date(),
            salary: 25000
        }
    })

    // 8. Create Users (Table public.users)
    console.log('📝 Seeding Users (public.users)...')

    // 8.1 Admin User
    if (empAdmin) {
        await prisma.user.create({
            data: {
                username: 'admin',
                password: hashedPassword,
                email: 'admin@autocare.com',
                name: empAdmin.name,
                role: 'ADMIN',
                employeeId: empAdmin.id,
                isActive: true
            }
        })
    }

    // 8.2 Cashier User
    await prisma.user.create({
        data: {
            username: 'cashier',
            password: hashedPassword,
            email: 'cashier@autocare.com',
            name: empCashier.name,
            role: 'CASHIER',
            employeeId: empCashier.id,
            isActive: true
        }
    })

    // 8.3 Technician User
    await prisma.user.create({
        data: {
            username: 'tech',
            password: hashedPassword,
            email: 'tech@autocare.com',
            name: empTech.name,
            role: 'TECHNICIAN',
            employeeId: empTech.id,
            isActive: true
        }
    })

    console.log('✅ Seeding completed! Users created: admin, cashier, tech')

    // 9. Create Vendors
    console.log('📝 Seeding Vendors...')
    await prisma.vendor.create({
        data: {
            code: 'V001',
            name: 'Piston Parts Co., Ltd.',
            contactName: 'John Doe',
            phone: '02-111-2222',
            email: 'sales@pistonparts.com',
            address: '123 Industrial Estate, Rayong',
            taxId: '1234567890123',
            isActive: true
        }
    })

    await prisma.vendor.create({
        data: {
            code: 'V002',
            name: 'Oil & Lube Supplies',
            contactName: 'Jane Smith',
            phone: '02-333-4444',
            email: 'contact@oillube.com',
            address: '456 Warehouse District, Samut Prakan',
            taxId: '9876543210987',
            isActive: true
        }
    })

    await prisma.vendor.create({
        data: {
            code: 'V003',
            name: 'General Auto Parts',
            contactName: 'Somchai Jaidee',
            phone: '081-555-6666',
            email: 'somchai@gap.com',
            address: '789 City Center, Bangkok',
            taxId: '5678901234567',
            isActive: true
        }
    })

    // ============================================
    // 🆕 SEED NEW SERVICE JOB WORKFLOW TABLES
    // ============================================

    // 10. Create Maintenance Templates
    console.log('📝 Seeding Maintenance Templates...')
    const template10k = await prisma.maintenanceTemplate.create({
        data: {
            name: 'บำรุงรักษา 10,000 km',
            description: 'การบำรุงรักษาประจำที่ 10,000 กิโลเมตร',
            mileageInterval: 10000,
            monthInterval: 6,
            isActive: true,
        }
    })

    const template20k = await prisma.maintenanceTemplate.create({
        data: {
            name: 'บำรุงรักษา 20,000 km',
            description: 'การบำรุงรักษาประจำที่ 20,000 กิโลเมตร',
            mileageInterval: 20000,
            monthInterval: 12,
            isActive: true,
        }
    })

    const template40k = await prisma.maintenanceTemplate.create({
        data: {
            name: 'บำรุงรักษา 40,000 km',
            description: 'การบำรุงรักษาหลัก 40,000 กิโลเมตร',
            mileageInterval: 40000,
            monthInterval: 24,
            isActive: true,
        }
    })

    // 11. Create Template Items
    console.log('📝 Seeding Maintenance Template Items...')
    await prisma.maintenanceTemplateItem.create({
        data: {
            maintenanceTemplateId: template10k.id,
            description: 'เปลี่ยนน้ำมันเครื่อง',
            isRequired: true,
            estimatedCost: 1500
        }
    })

    await prisma.maintenanceTemplateItem.create({
        data: {
            maintenanceTemplateId: template10k.id,
            description: 'เปลี่ยนไส้กรองน้ำมันเครื่อง',
            isRequired: true,
            estimatedCost: 300
        }
    })

    await prisma.maintenanceTemplateItem.create({
        data: {
            maintenanceTemplateId: template10k.id,
            description: 'ตรวจเช็คระบบเบรก',
            isRequired: true,
            estimatedCost: 0
        }
    })

    await prisma.maintenanceTemplateItem.create({
        data: {
            maintenanceTemplateId: template20k.id,
            description: 'เปลี่ยนน้ำมันเครื่อง + ไส้กรอง',
            isRequired: true,
            estimatedCost: 1800
        }
    })

    await prisma.maintenanceTemplateItem.create({
        data: {
            maintenanceTemplateId: template20k.id,
            description: 'เปลี่ยนไส้กรองอากาศ',
            isRequired: true,
            estimatedCost: 500
        }
    })

    await prisma.maintenanceTemplateItem.create({
        data: {
            maintenanceTemplateId: template20k.id,
            description: 'ตรวจสอบระบบส่งกำลัง',
            isRequired: false,
            estimatedCost: 0
        }
    })

    await prisma.maintenanceTemplateItem.create({
        data: {
            maintenanceTemplateId: template40k.id,
            description: 'บำรุงรักษาหลัก - เปลี่ยนน้ำมันเกียร์',
            isRequired: true,
            estimatedCost: 3500
        }
    })

    // 12. Create Sample Cars (from existing customers)
    console.log('📝 Seeding Sample Cars...')
    const customer1 = await prisma.customer.findFirst({ where: { code: 'C-0001' } })
    const customer2 = await prisma.customer.findFirst({ where: { code: 'C-0002' } })
    const camryModel = await prisma.carModel.findFirst({ where: { code: 'MD001' } })
    const civicModel = await prisma.carModel.findFirst({ where: { code: 'MD005' } })

    const car1 = await prisma.car.create({
        data: {
            code: '20260215-001',
            licensePlate: 'กก 1234',
            province: 'กรุงเทพมหานคร',
            carBrandId: toyota.id,
            carModelId: camryModel!.id,
            year: 2022,
            color: 'ขาว',
            vin: 'JTD12345678901234',
            customerId: customer1!.id,
            mileage: 45000,
            isActive: true
        }
    })

    const car2 = await prisma.car.create({
        data: {
            code: '20260215-002',
            licensePlate: 'ขข 5678',
            province: 'นนทบุรี',
            carBrandId: honda.id,
            carModelId: civicModel!.id,
            year: 2020,
            color: 'ดำ',
            vin: 'JHM98765432109876',
            customerId: customer2!.id,
            mileage: 68000,
            isActive: true
        }
    })

    // 13. Create Sample Service Job
    console.log('📝 Seeding Sample Service Job...')
    const serviceJob1 = await prisma.serviceJob.create({
        data: {
            jobNo: 'SJ-2026-0001',
            jobDate: new Date(),
            carId: car1.id,
            customerId: customer1!.id,
            mileage: 45000,
            technicianId: empTech.id,
            status: 'APPROVED',
            priority: 'NORMAL',
            description: 'บำรุงรักษาประจำ 40,000 km',
            customerRequest: 'ต้องการเปลี่ยนน้ำมันเครื่องและตรวจสอบระบบต่างๆ',

            // NEW FIELDS
            estimatedCompletionDays: 2,
            workshopBay: '1',
            appointmentDate: new Date(),
            inspectionChecklist: {
                fluids: {
                    oilEngine: true,
                    oilTransmission: true,
                    oilBrake: true,
                    coolant: false,
                    washerFluid: false
                },
                brakes: {
                    brakePadsFront: true,
                    brakePadsRear: true,
                    brakeSystemCheck: true
                },
                tires: {
                    tireRotation: false,
                    tireReplace: false,
                    wheelAlignment: true
                },
                drivetrain: {
                    engineCheck: true,
                    transmissionCheck: false,
                    suspension: false
                },
                electrical: {
                    lightsCheck: true,
                    battery: true,
                    acSystem: true,
                    wiper: false
                }
            },

            // Quotation
            quotationNo: 'QT-2026-0001',
            quotationDate: new Date(),
            approvalStatus: 'APPROVED',
            approvedBy: customer1!.fullName,
            approvedDate: new Date(),

            receivedDate: new Date(),
            estimatedCost: 7500,
            laborCost: 1500,
            partsCost: 6000,
            totalCost: 7500,
            vat: 7,
            vatAmount: 525,
            grandTotal: 8025,
            isPaid: false
        }
    })

    // 14. Create Service Job Labor Records
    console.log('📝 Seeding Service Job Labor Records...')
    await prisma.serviceJobLabor.create({
        data: {
            serviceJobId: serviceJob1.id,
            technicianId: empTech.id,
            description: 'เปลี่ยนถ่ายน้ำมันเครื่อง',
            hoursWorked: 1.5,
            laborRate: 500,
            laborCost: 750,
            notes: 'ใช้น้ำมันสังเคราะห์แท้ 100%'
        }
    })

    await prisma.serviceJobLabor.create({
        data: {
            serviceJobId: serviceJob1.id,
            technicianId: empTech.id,
            description: 'ตรวจเช็คและบำรุงรักษาระบบเบรก',
            hoursWorked: 1.0,
            laborRate: 500,
            laborCost: 500,
            notes: 'ผ้าเบรกหน้ายังใช้ได้ 60%'
        }
    })

    // 15. Create QC Record
    console.log('📝 Seeding Service Job QC...')
    await prisma.serviceJobQC.create({
        data: {
            serviceJobId: serviceJob1.id,
            qcChecklist: {
                exterior: {
                    bodyCondition: true,
                    paintCondition: true,
                    lightsWorking: true,
                    tiresCondition: true
                },
                interior: {
                    cleanedInside: true,
                    dashboardFunctional: true,
                    acWorking: true
                },
                mechanical: {
                    engineSound: true,
                    brakeTest: true,
                    transmissionTest: true
                },
                testDrive: {
                    completed: true,
                    distanceKm: 5,
                    issues: null
                }
            },
            qcPassedAll: true,
            qcBy: empTech.name,
            qcDate: new Date(),
            qcNotes: 'ทุกอย่างปกติดี พร้อมส่งมอบ'
        }
    })

    // 16. Create Media Attachments
    console.log('📝 Seeding Service Job Media...')
    await prisma.serviceJobMedia.create({
        data: {
            serviceJobId: serviceJob1.id,
            mediaType: 'IMAGE',
            mediaUrl: '/media/jobs/SJ-2026-0001/before-001.jpg',
            category: 'before',
            description: 'สภาพรถก่อนเข้าซ่อม - ด้านหน้า',
            uploadedBy: empTech.name
        }
    })

    await prisma.serviceJobMedia.create({
        data: {
            serviceJobId: serviceJob1.id,
            mediaType: 'IMAGE',
            mediaUrl: '/media/jobs/SJ-2026-0001/before-002.jpg',
            category: 'before',
            description: 'สภาพรถก่อนเข้าซ่อม - ด้านข้าง',
            uploadedBy: empTech.name
        }
    })

    await prisma.serviceJobMedia.create({
        data: {
            serviceJobId: serviceJob1.id,
            mediaType: 'IMAGE',
            mediaUrl: '/media/jobs/SJ-2026-0001/during-oil.jpg',
            category: 'during',
            description: 'ขณะเปลี่ยนน้ำมันเครื่อง',
            uploadedBy: empTech.name
        }
    })

    await prisma.serviceJobMedia.create({
        data: {
            serviceJobId: serviceJob1.id,
            mediaType: 'IMAGE',
            mediaUrl: '/media/jobs/SJ-2026-0001/after-clean.jpg',
            category: 'after',
            description: 'หลังล้างรถเรียบร้อย',
            uploadedBy: empTech.name
        }
    })

    // 17. Create Recommendations
    console.log('📝 Seeding Service Job Recommendations...')
    await prisma.serviceJobRecommendation.create({
        data: {
            serviceJobId: serviceJob1.id,
            description: 'แนะนำเปลี่ยนผ้าเบรกหน้า',
            reason: 'ผ้าเบรกหน้าเหลืออายุการใช้งาน 40% ควรเปลี่ยนภายใน 5,000 km',
            priority: 'RECOMMENDED',
            estimatedCost: 2500,
            dueAtMileage: 50000,
            isAccepted: false
        }
    })

    await prisma.serviceJobRecommendation.create({
        data: {
            serviceJobId: serviceJob1.id,
            description: 'เปลี่ยนน้ำยาหล่อเย็น',
            reason: 'น้ำยาหล่อเย็นเริ่มเสื่อมสภาพ',
            priority: 'OPTIONAL',
            estimatedCost: 1200,
            isAccepted: false
        }
    })

    // 18. Create Maintenance Reminders
    console.log('📝 Seeding Maintenance Reminders...')
    await prisma.maintenanceReminder.create({
        data: {
            carId: car1.id,
            customerId: customer1!.id,
            reminderType: 'MILEAGE_BASED',
            title: 'บำรุงรักษา 50,000 km',
            description: 'ถึงเวลาบำรุงรักษาประจำที่ 50,000 กิโลเมตร',
            dueAtMileage: 50000,
            notifyBeforeKm: 500,
            notifyVia: 'LINE',
            status: 'ACTIVE'
        }
    })

    await prisma.maintenanceReminder.create({
        data: {
            carId: car1.id,
            customerId: customer1!.id,
            reminderType: 'TIME_BASED',
            title: 'ตรวจสอบแบตเตอรี่',
            description: 'ตรวจสอบแบตเตอรี่และระบบไฟฟ้า',
            dueAtDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            notifyBeforeDays: 7,
            notifyVia: 'SMS',
            status: 'ACTIVE'
        }
    })

    await prisma.maintenanceReminder.create({
        data: {
            carId: car2.id,
            customerId: customer2!.id,
            reminderType: 'BOTH',
            title: 'บำรุงรักษา 70,000 km',
            description: 'บำรุงรักษาหลัก 70,000 km หรือ 6 เดือน',
            dueAtMileage: 70000,
            dueAtDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
            notifyBeforeKm: 1000,
            notifyBeforeDays: 14,
            notifyVia: 'Email,LINE',
            status: 'ACTIVE'
        }
    })

    console.log('✅ ✨ All seed data created successfully!')
    console.log('📊 Summary:')
    console.log('   - Maintenance Templates: 3')
    console.log('   - Template Items: 7')
    console.log('   - Sample Cars: 2')
    console.log('   - Service Jobs: 1 (with complete workflow)')
    console.log('   - Labor Records: 2')
    console.log('   - QC Records: 1')
    console.log('   - Media Attachments: 4')
    console.log('   - Recommendations: 2')
    console.log('   - Maintenance Reminders: 3')

}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
