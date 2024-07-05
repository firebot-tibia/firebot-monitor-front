import { CharacterType } from "../shared/enum/character-type.enum";

export const vocationIcons: { [key: string]: string } = {
    'Master Sorcerer': '/assets/ms.gif',
    'Sorcerer': '/assets/ms.gif',
    'Royal Paladin': '/assets/rp.gif',
    'Paladin': '/assets/rp.gif',
    'Elite Knight': '/assets/ek.gif',
    'Knight': '/assets/ek.gif',
    'Elder Druid': '/assets/ed.gif',
    'Druid': '/assets/ed.gif',
};

export const characterTypeIcons: { [key in CharacterType]: string } = {
    [CharacterType.MAIN]: '/assets/main.png',
    [CharacterType.MAKER]: '/assets/maker.png',
    [CharacterType.BOMBA]: '/assets/bomb.png',
};
