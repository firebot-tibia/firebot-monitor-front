import { FaMap } from "react-icons/fa";
import { IoSkullOutline } from "react-icons/io5";
import { IoMdStats } from "react-icons/io";
import { GiDeathZone } from "react-icons/gi";


export const config = {
  titleNotFound: 'Página não encontrada',
  nameNavigation: [
    {
      name: 'Monitorar Guild',
      href: '/home',
    },
    {
      name: 'Monitorar Mortes',
      href: '/deathlist',
      icon: GiDeathZone,
    },
    {
      name: 'Monitorar Orange',
      href: '/orange',
      icon: IoSkullOutline,
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
  ],
};
