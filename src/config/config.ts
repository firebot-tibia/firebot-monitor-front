import { FaMap } from "react-icons/fa";
import { IoSkullOutline } from "react-icons/io5";
import { GiCharacter, GiStarfighter } from "react-icons/gi";

export const config = {
  titleNotFound: '',
  nameNavigation: [
    {
      name: 'Início',
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
      icon: IoSkullOutline,
    },
    {
      name: 'Checar Soulwar',
      href: '/soulwar',
      icon: GiStarfighter,
    },
  ],
};
