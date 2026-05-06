import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * POST /api/master/car/[id]/images
 * Upload car images
 * Max 10 images per car, max 5MB per file
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Check if car exists
        const car = await prisma.car.findUnique({
            where: { id },
            include: {
                images: true
            }
        })

        if (!car) {
            return NextResponse.json(
                { error: 'Car not found' },
                { status: 404 }
            )
        }

        // Check image count limit
        if (car.images.length >= 10) {
            return NextResponse.json(
                { error: 'สูงสุด 10 รูป/รถ' },
                { status: 400 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'ไม่พบไฟล์รูปภาพ' },
                { status: 400 }
            )
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'รองรับเฉพาะไฟล์ .jpg, .png, .webp' },
                { status: 400 }
            )
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'ไฟล์ใหญ่เกิน 5MB' },
                { status: 400 }
            )
        }

        // Generate file path
        const year = car.year || new Date().getFullYear()
        const licensePlate = car.licensePlate.replace(/[\/\\:*?"<>|]/g, '_') // Sanitize filename
        const timestamp = Date.now()
        const ext = file.name.split('.').pop()
        const fileName = `${timestamp}_${car.images.length + 1}.${ext}`

        // Directory structure: /public/images/car/{year}/{licensePlate}/
        const dirPath = join(process.cwd(), 'public', 'images', 'car', year.toString(), licensePlate)
        const filePath = join(dirPath, fileName)
        const relativePath = `/images/car/${year}/${licensePlate}/${fileName}`

        // Create directory if it doesn't exist
        if (!existsSync(dirPath)) {
            await mkdir(dirPath, { recursive: true })
        }

        // Convert file to buffer and write
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Save to database
        const carImage = await prisma.carImage.create({
            data: {
                carId: id,
                imageUrl: relativePath
            }
        })

        return NextResponse.json({
            ...carImage,
            message: 'อัพโหลดรูปภาพสำเร็จ'
        }, { status: 201 })

    } catch (error) {
        console.error('Error uploading car image:', error)
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/master/car/[id]/images/[imageId]
 * Delete car image
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const imageId = searchParams.get('imageId')

        if (!imageId) {
            return NextResponse.json(
                { error: 'ไม่พบ Image ID' },
                { status: 400 }
            )
        }

        // Check if image exists and belongs to this car
        const image = await prisma.carImage.findFirst({
            where: {
                id: imageId,
                carId: id
            }
        })

        if (!image) {
            return NextResponse.json(
                { error: 'ไม่พบรูปภาพ' },
                { status: 404 }
            )
        }

        // Delete from database
        await prisma.carImage.delete({
            where: { id: imageId }
        })

        // Try to delete file (optional - don't fail if file doesn't exist)
        try {
            const fs = require('fs').promises
            const filePath = join(process.cwd(), 'public', image.imageUrl)
            if (existsSync(filePath)) {
                await fs.unlink(filePath)
            }
        } catch (fileError) {
            console.warn('Failed to delete image file:', fileError)
            // Continue anyway - database record is deleted
        }

        return NextResponse.json({
            message: 'ลบรูปภาพสำเร็จ'
        })

    } catch (error) {
        console.error('Error deleting car image:', error)
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        )
    }
}
