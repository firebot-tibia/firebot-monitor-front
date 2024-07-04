import { NextApiRequest, NextApiResponse } from "next";

let respawnData: { [key: string]: string } = {};
let iconState: { [key: string]: string } = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { type, name, value } = req.body;
    if (type === 'respawn') {
      respawnData[name] = value;
    } else if (type === 'icon') {
      iconState[name] = value;
    }
    res.status(200).json({ message: 'Dados atualizados com sucesso.' });
  } else if (req.method === 'GET') {
    res.status(200).json({ respawnData, iconState });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
