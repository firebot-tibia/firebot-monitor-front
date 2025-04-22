const normalizeVocationName = (name: string): string => {
  if (!name || typeof name !== 'string') return ''

  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/^(master|royal|elite|elder)/, '')
}

export interface VocationIcon {
  type: 'image' | 'text'
  value: string
}

const baseVocationIcons: { [key: string]: VocationIcon } = {
  'Master Sorcerer': { type: 'image', value: '/assets/images/vocations/ms.gif' },
  Sorcerer: { type: 'image', value: '/assets/images/vocations/ms.gif' },
  'Royal Paladin': { type: 'image', value: '/assets/images/vocations/rp.gif' },
  Paladin: { type: 'image', value: '/assets/images/vocations/rp.gif' },
  'Elite Knight': { type: 'image', value: '/assets/images/vocations/ek.gif' },
  Knight: { type: 'image', value: '/assets/images/vocations/ek.gif' },
  'Elder Druid': { type: 'image', value: '/assets/images/vocations/ed.gif' },
  Druid: { type: 'image', value: '/assets/images/vocations/ed.gif' },
  'Exalted Monk': { type: 'text', value: '👊' },
  Monk: { type: 'text', value: '👊' },
}

export const tableVocationIcons = new Proxy(baseVocationIcons, {
  get(target, prop) {
    if (typeof prop !== 'string') return { type: 'text', value: '❓' }

    if (prop in target) {
      return target[prop]
    }

    const lowerProp = prop.toLowerCase()
    const caseInsensitiveMatch = Object.keys(target).find(key => key.toLowerCase() === lowerProp)
    if (caseInsensitiveMatch) {
      return target[caseInsensitiveMatch]
    }
  },
})

/**
 * Helper function to render vocation icon in HTML
 * Usage example: renderVocationIcon(tableVocationIcons['Master Sorcerer'])
 */
export const renderVocationIcon = (icon: VocationIcon | undefined): string => {
  if (!icon) return ''

  if (icon.type === 'image') {
    return `<img src="${icon.value}" alt="Vocation Icon" class="vocation-icon" />`
  } else {
    return `<span class="vocation-text-icon">${icon.value}</span>`
  }
}

/**
 * Helper function to check if a vocation uses a text icon
 */
export const isTextIcon = (vocation: string): boolean => {
  const icon = tableVocationIcons[vocation]
  return icon ? icon.type === 'text' : false
}
