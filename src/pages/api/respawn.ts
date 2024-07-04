import { NextApiRequest, NextApiResponse } from 'next';

let respawnData: { [key: string]: string } = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, value } = req.body;
    respawnData[name] = value;
    res.status(200).json({ message: 'Data saved successfully.' });
  } else if (req.method === 'GET') {
    res.status(200).json(respawnData);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
