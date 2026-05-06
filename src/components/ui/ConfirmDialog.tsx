/**
 * ไฟล์: components/ui/ConfirmDialog.tsx
 * จุดประสงค์: SweetAlert2 wrapper functions
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import Swal from 'sweetalert2'

// =========================================
// Success Alerts
// =========================================

export const showSuccess = (message: string = 'บันทึกสำเร็จ') => {
    return Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: message,
        timer: 1500,
        showConfirmButton: false,
    })
}

export const showCreateSuccess = (itemName?: string) => {
    return Swal.fire({
        icon: 'success',
        title: 'เพิ่มข้อมูลสำเร็จ',
        text: itemName ? `เพิ่ม "${itemName}" เรียบร้อยแล้ว` : 'เพิ่มข้อมูลเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
    })
}

export const showUpdateSuccess = (itemName?: string) => {
    return Swal.fire({
        icon: 'success',
        title: 'แก้ไขข้อมูลสำเร็จ',
        text: itemName ? `อัพเดท "${itemName}" เรียบร้อยแล้ว` : 'อัพเดทข้อมูลเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
    })
}

export const showDeleteSuccess = (itemName?: string) => {
    return Swal.fire({
        icon: 'success',
        title: 'ลบข้อมูลสำเร็จ',
        text: itemName ? `ลบ "${itemName}" เรียบร้อยแล้ว` : 'ลบข้อมูลเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
    })
}

// =========================================
// Confirm Dialogs
// =========================================

export const confirmDelete = async (itemName: string) => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'ยืนยันการลบ?',
        text: `คุณต้องการลบ "${itemName}" ใช่หรือไม่?`,
        showCancelButton: true,
        confirmButtonColor: '#d63939',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
    })
    return result.isConfirmed
}

export const confirmAction = async (title: string, text: string) => {
    const result = await Swal.fire({
        icon: 'question',
        title,
        text,
        showCancelButton: true,
        confirmButtonColor: '#206bc4',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
    })
    return result.isConfirmed
}

// =========================================
// Error Alerts
// =========================================

export const showError = (message: string = 'เกิดข้อผิดพลาด กรุณาลองใหม่') => {
    return Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: message,
    })
}

export const showValidationError = (errors: string[]) => {
    return Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ถูกต้อง',
        html: errors.map(e => `• ${e}`).join('<br>'),
    })
}

// =========================================
// Loading
// =========================================

export const showLoading = (title: string = 'กำลังโหลด...') => {
    Swal.fire({
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })
}

export const hideLoading = () => {
    Swal.close()
}
