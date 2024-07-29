import { FaMap } from "react-icons/fa";
import { IoSkullOutline } from "react-icons/io5";
import { IoSettings } from "react-icons/io5";

export const config = {
  titleNotFound: '',
  nameNavigation: [
    {
      name: 'Início',
      href: '/',
    },
    {
      name: 'Configurações',
      href: '/settings',
      icon: IoSettings,
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
  ],
};
