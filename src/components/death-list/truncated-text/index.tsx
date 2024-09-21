import React from "react";
import { 
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface TruncatedTextProps {
  text: string;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({ text }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const truncatedText = text.length > 100 ? `${text.slice(0, 100)}...` : text;

  return (
    <>
      <Text isTruncated maxWidth="300px">
        {truncatedText}
        {text.length > 100 && (
          <Button size="xs" ml={2} onClick={onOpen}>
            <ChevronDownIcon />
          </Button>
        )}
      </Text>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalhes da Morte</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{text}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};