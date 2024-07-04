import { NextApiRequest, NextApiResponse } from 'next';

let linkedCharacters: { [key: string]: string[] } = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, value } = req.body;
    if (name && value) {
      linkedCharacters[name] = value;
      res.status(200).json({ message: 'Personagens vinculados atualizados com sucesso.' });
    } else {
      res.status(400).json({ message: 'Nome e valor são obrigatórios.' });
    }
  } else if (req.method === 'GET') {
    res.status(200).json(linkedCharacters);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
