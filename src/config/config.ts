import { FaMap, FaDiscord } from "react-icons/fa";
import { IoMdStats } from "react-icons/io";
import { FaOptinMonster } from "react-icons/fa6";

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
      name: 'Respawns',
      href: '/respawn',
      icon: FaOptinMonster,
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
