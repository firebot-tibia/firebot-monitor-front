'use client';

import React, { useEffect, useState } from 'react';
import { Select, Box } from '@chakra-ui/react';

const worlds = [
  { id: 1, name: 'World 1' },
  { id: 2, name: 'World 2' },
  { id: 3, name: 'World 3' },
  { id: 4, name: 'World 4' },
];

const WorldSelector = () => {
  const [selectedWorld, setSelectedWorld] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWorld = localStorage.getItem('selectedWorld');
      if (storedWorld) {
        setSelectedWorld(storedWorld);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedWorld) {
      localStorage.setItem('selectedWorld', selectedWorld);
    }
  }, [selectedWorld]);

  const handleChange = (event : any) => {
    setSelectedWorld(event.target.value);
  };

  return (
    <Box p={4}>
      <Select placeholder="Selecione um mundo" value={selectedWorld} onChange={handleChange}>
        {worlds.map((world) => (
          <option key={world.id} value={world.name}>
            {world.name}
          </option>
        ))}
      </Select>
    </Box>
  );
};

export default WorldSelector;
