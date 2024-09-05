import { FaMap } from "react-icons/fa";
import { IoSkullOutline } from "react-icons/io5";
import { GiStarfighter } from "react-icons/gi";
import { IoMdStats } from "react-icons/io";
import { GiDeathZone } from "react-icons/gi";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { GiWarAxe } from "react-icons/gi";

export const config = {
  titleNotFound: 'Página não encontrada',
  nameNavigation: [
    {
      name: 'Monitorar Guild',
      href: '/home',
    },
    {
      name: 'Mapa Exiva',
      href: '/enemy',
      icon: FaMap,
    },
    {
      name: 'Monitorar Oranges',
      href: '/orange',
      icon: IoSkullOutline,
    },
    {
      name: 'Monitorar Mortes',
      href: '/deathlist',
      icon: GiDeathZone,
    },
    {
      name: 'Soulwar',
      href: '/soulwar',
      icon: GiStarfighter,
    },
    {
      name: 'Estatísticas da Guild',
      href: '/guild-stats',
      icon: IoMdStats,
    },
    {
      name: 'Global Wars',
      href: '/war',
      icon: GiWarAxe,
    },
    {
      name: 'Adicionar Alertas',
      href: '/alert',
      icon: HiOutlineBellAlert,
    },
  ],
};
