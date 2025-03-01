const normalizeVocationName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/^(master|royal|elite|elder)/, '')
}

const baseVocationIcons: { [key: string]: string } = {
  'Master Sorcerer': '/assets/images/vocations/ms.gif',
  Sorcerer: '/assets/images/vocations/ms.gif',
  'Royal Paladin': '/assets/images/vocations/rp.gif',
  Paladin: '/assets/images/vocations/rp.gif',
  'Elite Knight': '/assets/images/vocations/ek.gif',
  Knight: '/assets/images/vocations/ek.gif',
  'Elder Druid': '/assets/images/vocations/ed.gif',
  Druid: '/assets/images/vocations/ed.gif',
}

export const tableVocationIcons = new Proxy(baseVocationIcons, {
  get(target, prop) {
    if (typeof prop !== 'string') return undefined

    if (prop in target) {
      return target[prop]
    }

    const normalizedKey = normalizeVocationName(prop)

    const matchingKey = Object.keys(target).find(
      key => normalizeVocationName(key) === normalizedKey,
    )

    return matchingKey ? target[matchingKey] : undefined
  },
})
