import { FaHome, FaOptinMonster, FaMap } from 'react-icons/fa'
import { IoMdStats } from 'react-icons/io'

export const routesArray = [
  { name: 'Monitorar Guild', href: '/guild', icon: FaHome },
  { name: 'Estatísticas', href: '/statistics', icon: IoMdStats },
  { name: 'Respawns', href: '/reservations', icon: FaOptinMonster },
  { name: 'Mapa Exiva', href: '/tibia-map', icon: FaMap },
]

export const routes = {
  guild: '/guild',
  statistics: '/statistics',
  reservations: '/reservations',
  tibiaMap: '/tibia-map',
}
