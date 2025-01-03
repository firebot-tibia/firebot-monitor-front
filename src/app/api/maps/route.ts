import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  const filePath = join(process.cwd(), 'public', 'dist', 'index.html')
  try {
    const fileContents = await readFile(filePath, 'utf8')

    const headers = new Headers()
    headers.set('Content-Type', 'text/html')
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')

    return new NextResponse(fileContents, { status: 200, headers })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read the file' }, { status: 500 })
  }
}
