import { FaMap, FaDiscord } from "react-icons/fa";
import { IoMdStats } from "react-icons/io";

export const config = {
  titleNotFound: 'Página não encontrada',
  nameNavigation: [
    {
      name: 'Monitorar Guild',
      href: '/home',
    },
    {
      name: 'Estatísticas da Guild',
      href: '/guild-stats',
      icon: IoMdStats,
    },
    {
      name: 'Mapa Exiva',
      href: '/tibia-map',
      icon: FaMap,
    },
    {
      name: 'Suporte no Discord',
      href: 'https://discord.gg/5eUrDejn', 
      icon: FaDiscord,
      target: '_blank',
    },
  ],
};
