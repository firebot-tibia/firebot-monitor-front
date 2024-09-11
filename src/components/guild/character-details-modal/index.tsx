import React, { FC } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  IconButton,
  useToast,
  Tooltip,
  Select,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { vocationIcons } from '../../../constant/character';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { copyExivas, handleCopy } from '../../../shared/utils/options-utils';
import { OrangeList } from '../orange-list';
import { LocalInput } from '../local-input';

interface CharacterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: GuildMemberResponse | null;
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void;
  onClassify: (type: string) => void;
}

export const CharacterDetailsModal: FC<CharacterDetailsModalProps> = ({
  isOpen,
  onClose,
  character,
  onLocalChange,
  onClassify,
}) => {
  const toast = useToast();
  const classificationTypes = ['main', 'maker', 'bomba', 'fracoks', 'exitados', 'mwall', 'unclassified'];

  if (!character) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Detalhes do Personagem</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Image src={vocationIcons[character.Vocation]} alt={character.Vocation} boxSize="32px" />
              <Text fontSize="2xl" fontWeight="bold">{character.Name}</Text>
              <Tooltip label="Copiar nome">
                <IconButton
                  aria-label="Copiar nome"
                  icon={<CopyIcon />}
                  size="sm"
                  onClick={() => handleCopy(character.Name, toast)}
                />
              </Tooltip>
            </HStack>
            <StatGroup>
              <Stat>
                <StatLabel>Nível</StatLabel>
                <StatNumber>{character.Level}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Vocação</StatLabel>
                <StatNumber>{character.Vocation}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Tempo Online</StatLabel>
                <StatNumber>{character.TimeOnline}</StatNumber>
              </Stat>
            </StatGroup>
            <HStack align="center">
              <Text fontWeight="bold">Classificação</Text>
              <Select
                value={character.Kind || 'unclassified'}
                onChange={(e) => onClassify(e.target.value)}
                bg="gray.700"
              >
                {classificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'unclassified' ? 'Sem Classificação' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </HStack>
            <HStack align="center">
              <Text fontWeight="bold">Exiva</Text>
              <Tooltip label="Copiar exiva">
                <IconButton
                  aria-label="Copiar exiva"
                  icon={<CopyIcon />}
                  size="sm"
                  onClick={() => copyExivas(character, toast)}
                />
              </Tooltip>
            </HStack>
            <LocalInput
              member={character} 
              onLocalChange={(character, newLocal) => onLocalChange(character, newLocal)}
              fontSize="md"
            />
            <OrangeList characterName={character.Name} />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
