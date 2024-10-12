export const rawVocationIcons: { [key: string]: string } = {
    'master sorcerer': '/assets/ms.gif',
    'sorcerer': '/assets/ms.gif',
    'royal paladin': '/assets/rp.gif',
    'paladin': '/assets/rp.gif',
    'elite knight': '/assets/ek.gif',
    'knight': '/assets/ek.gif',
    'elder druid': '/assets/ed.gif',
    'druid': '/assets/ed.gif',
};

export const vocationIcons: { [key: string]: string } = Object.keys(rawVocationIcons).reduce(
    (acc, key) => {
        acc[key.toLowerCase()] = rawVocationIcons[key];
        return acc;
    },
    {} as { [key: string]: string }
);

export const Vocations: { [key: string]: string } = {
    'sorcerer': '/assets/ms.gif',
    'paladin': '/assets/rp.gif',
    'knight': '/assets/ek.gif',
    'druid': '/assets/ed.gif',
};

export const characterTypeIcons: { [key: string]: string } = {
    ['main']: '/assets/main.png',
    ['maker']: '/assets/maker.png',
    ['bomba']: '/assets/bomb.png',
    ['fracoks']: '/assets/fraco.png',
    ['exitados']: '/assets/exit.jpeg',
    ['mwall']: '/assets/mwall.gif',
};


export const TableVocationIcons: { [key: string]: string } = {
    'Master Sorcerer': '/assets/ms.gif',
    'Sorcerer': '/assets/ms.gif',
    'Royal Paladin': '/assets/rp.gif',
    'Paladin': '/assets/rp.gif',
    'Elite Knight': '/assets/ek.gif',
    'Knight': '/assets/ek.gif',
    'Elder Druid': '/assets/ed.gif',
    'Druid': '/assets/ed.gif',
};

