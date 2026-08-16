export const uniqueId = () => Date.now().toString().slice(-5)

export const TEST_DATA = {
    department: {
        code: `DEP${uniqueId()}`,
        name: `แผนกทดสอบ ${uniqueId()}`,
        description: 'แผนกสำหรับทดสอบ E2E',
    },
    position: {
        code: `POS${uniqueId()}`,
        name: `ตำแหน่งทดสอบ ${uniqueId()}`,
        description: 'ตำแหน่งสำหรับทดสอบ E2E',
        baseSalary: '35000',
    },
    employeeType: {
        code: `ET${uniqueId()}`,
        name: `ประเภทพนักงาน ${uniqueId()}`,
        description: 'ประเภทพนักงานทดสอบ',
    },
    employee: {
        code: `EMP${uniqueId()}`,
        name: `พนักงานทดสอบ ${uniqueId()}`,
        nickname: 'เทส',
        username: `testemp${uniqueId()}`,
        password: 'password123',
        phone: '0812345678',
        email: `testemp${uniqueId()}@example.com`,
    },
    customerType: {
        code: `CT${uniqueId()}`,
        name: `ประเภทลูกค้า ${uniqueId()}`,
        description: 'ประเภทลูกค้าทดสอบ',
        discount: '5',
    },
    customer: {
        code: `CUST${uniqueId()}`,
        firstName: 'สมชาย',
        lastName: `ทดสอบ${uniqueId()}`,
        phone: `089${uniqueId()}123`,
        email: `customer${uniqueId()}@example.com`,
        address: '999/99 ถนนทดสอบ กทม.',
    },
    carBrand: {
        code: `B${uniqueId()}`,
        name: `ยี่ห้อทดสอบ ${uniqueId()}`,
        nameThai: `ยี่ห้อไทย ${uniqueId()}`,
        nameEnglish: `Brand ${uniqueId()}`,
    },
    carModel: {
        code: `M${uniqueId()}`,
        name: `รุ่นทดสอบ ${uniqueId()}`,
    },
    car: {
        licensePlate: `1กข${uniqueId()}`,
        province: 'กรุงเทพมหานคร',
        color: 'สีขาว',
        year: '2023',
    },
    serviceCategory: {
        code: `SC${uniqueId()}`,
        name: `หมวดบริการ ${uniqueId()}`,
        description: 'หมวดบริการทดสอบ',
    },
    service: {
        code: `SVC${uniqueId()}`,
        name: `บริการทดสอบ ${uniqueId()}`,
        price: '1500',
        standardTime: '60',
    },
    sparesCategory: {
        code: `SPC${uniqueId()}`,
        name: `หมวดอะไหล่ ${uniqueId()}`,
        description: 'หมวดอะไหล่ทดสอบ',
    },
    spare: {
        code: `SP${uniqueId()}`,
        name: `อะไหล่ทดสอบ ${uniqueId()}`,
        unit: 'ชิ้น',
        sellingPrice: '850',
        costPrice: '500',
        minStock: '5',
        maxStock: '50',
        currentStock: '20',
    },
    vendor: {
        code: `V${uniqueId()}`,
        name: `ผู้จัดจำหน่าย ${uniqueId()}`,
        contactName: 'คุณผู้จัดจำหน่าย',
        phone: '029998877',
        email: `vendor${uniqueId()}@example.com`,
    },
    paymentType: {
        code: `PT${uniqueId()}`,
        name: `วิธีชำระ ${uniqueId()}`,
        description: 'ช่องทางชำระเงินทดสอบ',
    },
}
