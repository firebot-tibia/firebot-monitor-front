import { FaMap } from "react-icons/fa";
import { IoSkullOutline } from "react-icons/io5";

export const config = {
  titleNotFound: '',
  nameNavigation: [
    {
      name: 'Início',
      href: '/',
    },
    {
      name: 'Mapa Exiva',
      href: '/enemy',
      icon: FaMap,
    },
    {
      name: 'Oranges Online',
      href: '/orange',
      icon: IoSkullOutline,
    },
    {
      name: 'Death List',
      href: '/deathlist',
      icon: IoSkullOutline,
    },
  ],
};
