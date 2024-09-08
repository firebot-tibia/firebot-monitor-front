import React, { FC } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  IconButton,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { vocationIcons } from '../../../constant/character';
import { GuildMemberResponse } from '../../../shared/interface/guild-member.interface';
import { copyExivas, handleCopy } from '../../../shared/utils/options-utils';
import { OrangeList } from '../orange-list';

interface CharacterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: GuildMemberResponse | null;
  onExivaChange: (newExiva: string) => void;
}

export const CharacterDetailsModal: FC<CharacterDetailsModalProps> = ({
  isOpen,
  onClose,
  character,
  onExivaChange,
}) => {
  const toast = useToast();

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
            <Input
              placeholder="Digite o exiva"
              defaultValue={character.Local || ''}
              onChange={(e) => onExivaChange(e.target.value)}
            />
            <OrangeList characterName={character.Name} />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};