import { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import { join } from 'path';

const serveHtml = async (req: NextApiRequest, res: NextApiResponse) => {
  const filePath = join(process.cwd(), 'public', 'dist', 'index.html');
  try {
    const fileContents = await readFile(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).send(fileContents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read the file' });
  }
};

export default serveHtml;
