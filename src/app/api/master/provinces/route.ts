import { NextResponse } from 'next/server'

/**
 * GET /api/master/provinces
 * Returns list of Thai provinces
 */

export const provinces = [
    { id: '10', nameThai: 'กรุงเทพมหานคร', nameEnglish: 'Bangkok' },
    { id: '11', nameThai: 'สมุทรปราการ', nameEnglish: 'Samut Prakan' },
    { id: '12', nameThai: 'นนทบุรี', nameEnglish: 'Nonthaburi' },
    { id: '13', nameThai: 'ปทุมธานี', nameEnglish: 'Pathum Thani' },
    { id: '14', nameThai: 'พระนครศรีอยุธยา', nameEnglish: 'Phra Nakhon Si Ayutthaya' },
    { id: '15', nameThai: 'อ่างทอง', nameEnglish: 'Ang Thong' },
    { id: '16', nameThai: 'ลพบุรี', nameEnglish: 'Loburi' },
    { id: '17', nameThai: 'สิงห์บุรี', nameEnglish: 'Sing Buri' },
    { id: '18', nameThai: 'ชัยนาท', nameEnglish: 'Chai Nat' },
    { id: '19', nameThai: 'สระบุรี', nameEnglish: 'Saraburi' },
    { id: '20', nameThai: 'ชลบุรี', nameEnglish: 'Chon Buri' },
    { id: '21', nameThai: 'ระยอง', nameEnglish: 'Rayong' },
    { id: '22', nameThai: 'จันทบุรี', nameEnglish: 'Chanthaburi' },
    { id: '23', nameThai: 'ตราด', nameEnglish: 'Trat' },
    { id: '24', nameThai: 'ฉะเชิงเทรา', nameEnglish: 'Chachoengsao' },
    { id: '25', nameThai: 'ปราจีนบุรี', nameEnglish: 'Prachin Buri' },
    { id: '26', nameThai: 'นครนายก', nameEnglish: 'Nakhon Nayok' },
    { id: '27', nameThai: 'สระแก้ว', nameEnglish: 'Sa Kaeo' },
    { id: '30', nameThai: 'นครราชสีมา', nameEnglish: 'Nakhon Ratchasima' },
    { id: '31', nameThai: 'บุรีรัมย์', nameEnglish: 'Buri Ram' },
    { id: '32', nameThai: 'สุรินทร์', nameEnglish: 'Surin' },
    { id: '33', nameThai: 'ศรีสะเกษ', nameEnglish: 'Si Sa Ket' },
    { id: '34', nameThai: 'อุบลราชธานี', nameEnglish: 'Ubon Ratchathani' },
    { id: '35', nameThai: 'ยโสธร', nameEnglish: 'Yasothon' },
    { id: '36', nameThai: 'ชัยภูมิ', nameEnglish: 'Chaiyaphum' },
    { id: '37', nameThai: 'อำนาจเจริญ', nameEnglish: 'Amnat Charoen' },
    { id: '39', nameThai: 'หนองบัวลำภู', nameEnglish: 'Nong Bua Lam Phu' },
    { id: '40', nameThai: 'ขอนแก่น', nameEnglish: 'Khon Kaen' },
    { id: '41', nameThai: 'อุดรธานี', nameEnglish: 'Udon Thani' },
    { id: '42', nameThai: 'เลย', nameEnglish: 'Loei' },
    { id: '43', nameThai: 'หนองคาย', nameEnglish: 'Nong Khai' },
    { id: '44', nameThai: 'มหาสารคาม', nameEnglish: 'Maha Sarakham' },
    { id: '45', nameThai: 'ร้อยเอ็ด', nameEnglish: 'Roi Et' },
    { id: '46', nameThai: 'กาฬสินธุ์', nameEnglish: 'Kalasin' },
    { id: '47', nameThai: 'สกลนคร', nameEnglish: 'Sakon Nakhon' },
    { id: '48', nameThai: 'นครพนม', nameEnglish: 'Nakhon Phanom' },
    { id: '49', nameThai: 'มุกดาหาร', nameEnglish: 'Mukdahan' },
    { id: '50', nameThai: 'เชียงใหม่', nameEnglish: 'Chiang Mai' },
    { id: '51', nameThai: 'ลำพูน', nameEnglish: 'Lamphun' },
    { id: '52', nameThai: 'ลำปาง', nameEnglish: 'Lampang' },
    { id: '53', nameThai: 'อุตรดิตถ์', nameEnglish: 'Uttaradit' },
    { id: '54', nameThai: 'แพร่', nameEnglish: 'Phrae' },
    { id: '55', nameThai: 'น่าน', nameEnglish: 'Nan' },
    { id: '56', nameThai: 'พะเยา', nameEnglish: 'Phayao' },
    { id: '57', nameThai: 'เชียงราย', nameEnglish: 'Chiang Rai' },
    { id: '58', nameThai: 'แม่ฮ่องสอน', nameEnglish: 'Mae Hong Son' },
    { id: '60', nameThai: 'นครสวรรค์', nameEnglish: 'Nakhon Sawan' },
    { id: '61', nameThai: 'อุทัยธานี', nameEnglish: 'Uthai Thani' },
    { id: '62', nameThai: 'กำแพงเพชร', nameEnglish: 'Kamphaeng Phet' },
    { id: '63', nameThai: 'ตาก', nameEnglish: 'Tak' },
    { id: '64', nameThai: 'สุโขทัย', nameEnglish: 'Sukhothai' },
    { id: '65', nameThai: 'พิษณุโลก', nameEnglish: 'Phitsanulok' },
    { id: '66', nameThai: 'พิจิตร', nameEnglish: 'Phichit' },
    { id: '67', nameThai: 'เพชรบูรณ์', nameEnglish: 'Phetchabun' },
    { id: '70', nameThai: 'ราชบุรี', nameEnglish: 'Ratchaburi' },
    { id: '71', nameThai: 'กาญจนบุรี', nameEnglish: 'Kanchanaburi' },
    { id: '72', nameThai: 'สุพรรณบุรี', nameEnglish: 'Suphan Buri' },
    { id: '73', nameThai: 'นครปฐม', nameEnglish: 'Nakhon Pathom' },
    { id: '74', nameThai: 'สมุทรสาคร', nameEnglish: 'Samut Sakhon' },
    { id: '75', nameThai: 'สมุทรสงคราม', nameEnglish: 'Samut Songkhram' },
    { id: '76', nameThai: 'เพชรบุรี', nameEnglish: 'Phetchaburi' },
    { id: '77', nameThai: 'ประจวบคีรีขันธ์', nameEnglish: 'Prachuap Khiri Khan' },
    { id: '80', nameThai: 'นครศรีธรรมราช', nameEnglish: 'Nakhon Si Thammarat' },
    { id: '81', nameThai: 'กระบี่', nameEnglish: 'Krabi' },
    { id: '82', nameThai: 'พังงา', nameEnglish: 'Phangnga' },
    { id: '83', nameThai: 'ภูเก็ต', nameEnglish: 'Phuket' },
    { id: '84', nameThai: 'สุราษฎร์ธานี', nameEnglish: 'Surat Thani' },
    { id: '85', nameThai: 'ระนอง', nameEnglish: 'Ranong' },
    { id: '86', nameThai: 'ชุมพร', nameEnglish: 'Chumphon' },
    { id: '90', nameThai: 'สงขลา', nameEnglish: 'Songkhla' },
    { id: '91', nameThai: 'สตูล', nameEnglish: 'Satun' },
    { id: '92', nameThai: 'ตรัง', nameEnglish: 'Trang' },
    { id: '93', nameThai: 'พัทลุง', nameEnglish: 'Phatthalung' },
    { id: '94', nameThai: 'ปัตตานี', nameEnglish: 'Pattani' },
    { id: '95', nameThai: 'ยะลา', nameEnglish: 'Yala' },
    { id: '96', nameThai: 'นราธิวาส', nameEnglish: 'Narathiwat' },
    { id: '97', nameThai: 'บึงกาฬ', nameEnglish: 'Bueng Kan' }
]

export async function GET() {
    try {
        return NextResponse.json({
            data: provinces,
            total: provinces.length
        })
    } catch (error) {
        console.error('Error fetching provinces:', error)
        return NextResponse.json(
            { error: 'Failed to fetch provinces' },
            { status: 500 }
        )
    }
}
