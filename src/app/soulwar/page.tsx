'use client';

import { useState, useEffect, useCallback, SetStateAction } from 'react';
import { Box, Input, Select, Heading, Text, VStack, Center } from '@chakra-ui/react';
import DashboardLayout from '../../components/dashboard';

const fetchBonecosMock = async () => {
  const data = {
    "mundo1": {
      soulwar: [
        { id: 1, nome: "Boneco1" },
        { id: 2, nome: "Boneco2" }
      ],
      naoSoulwar: [
        { id: 3, nome: "Boneco3" },
        { id: 4, nome: "Boneco4" }
      ]
    },
    "mundo2": {
      soulwar: [
        { id: 5, nome: "Boneco5" },
        { id: 6, nome: "Boneco6" }
      ],
      naoSoulwar: [
        { id: 7, nome: "Boneco7" },
        { id: 8, nome: "Boneco8" }
      ]
    }
    }
  ;
  
  return data || { soulwar: [], naoSoulwar: [] };
};

const Soulwar = () => {
  const [mundo, setMundo] = useState('');
  const [bonecosSoulwar, setBonecosSoulwar] = useState([]);
  const [bonecosNaoSoulwar, setBonecosNaoSoulwar] = useState([]);
  const [selectedMundo, setSelectedMundo] = useState('');


  const handleSelectChange = useCallback((event: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedMundo(event.target.value);
  }, []);

  return (
    <DashboardLayout>
      <Center p={4}>
        <Box w="full" maxW="600px">
          <Heading as="h1" mb={6} textAlign="center">Lista da Soulwar</Heading>
          <VStack spacing={4} align="stretch">
            <Select placeholder="Selecione o mundo" onChange={handleSelectChange}>
              <option value="mundo1">Mundo 1</option>
              <option value="mundo2">Mundo 2</option>
            </Select>
            <Box borderWidth={1} borderRadius="lg" p={4} h="400px" overflowY="auto">
              <Heading as="h2" size="lg" mb={4}>Characters que fizeram Soulwar</Heading>
              {bonecosSoulwar.length > 0 ? (
                bonecosSoulwar.map((boneco: any) => (
                  <Box key={boneco.id} p={2} borderBottom="1px" borderColor="gray.200">
                    {boneco.nome}
                  </Box>
                ))
              ) : (
                <Text color="gray.500">Nenhum personagem fez Soulwar.</Text>
              )}
            </Box>
            <Box borderWidth={1} borderRadius="lg" p={4} h="400px" overflowY="auto">
              <Heading as="h2" size="lg" mb={4}>Characters que não fizeram Soulwar</Heading>
              {bonecosNaoSoulwar.length > 0 ? (
                bonecosNaoSoulwar.map((boneco: any) => (
                  <Box key={boneco.id} p={2} borderBottom="1px" borderColor="gray.200">
                    {boneco.nome}
                  </Box>
                ))
              ) : (
                <Text color="gray.500">Nenhum personagem não fez Soulwar.</Text>
              )}
            </Box>
          </VStack>
        </Box>
      </Center>
    </DashboardLayout>
  );
};

export default Soulwar;
