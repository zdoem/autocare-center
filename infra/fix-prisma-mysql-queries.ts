import * as fs from 'fs'
import * as path from 'path'

function walkDir(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
            walkDir(filePath, fileList)
        } else if (/\.(ts|tsx)$/.test(file)) {
            fileList.push(filePath)
        }
    }
    return fileList
}

function removeInsensitive() {
    const srcDir = path.join(process.cwd(), 'src')
    const files = walkDir(srcDir)
    let modifiedCount = 0

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8')
        if (content.includes("mode: 'insensitive'") || content.includes('mode: "insensitive"')) {
            const newContent = content
                .replace(/,\s*mode:\s*['"]insensitive['"]/g, '')
                .replace(/mode:\s*['"]insensitive['"],\s*/g, '')
                .replace(/mode:\s*['"]insensitive['"]/g, '')

            fs.writeFileSync(file, newContent, 'utf-8')
            console.log(`Updated: ${path.relative(srcDir, file)}`)
            modifiedCount++
        }
    }

    console.log(`Successfully updated ${modifiedCount} files for MariaDB/MySQL compatibility.`)
}

removeInsensitive()
