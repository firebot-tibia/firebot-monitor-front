'use client';

import React, { useEffect, useState } from 'react';
import { Select, Box } from '@chakra-ui/react';

const guilds = [
  { id: 1, name: 'Guild 1' },
  { id: 2, name: 'Guild 2' },
  { id: 3, name: 'Guild 3' },
  { id: 4, name: 'Guild 4' },
];

const GuildSelector = () => {
  const [selectedGuild, setSelectedGuild] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedGuild= localStorage.getItem('selectedGuild');
      if (storedGuild) {
        setSelectedGuild(storedGuild);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedGuild) {
      localStorage.setItem('selectedGuild', selectedGuild);
    }
  }, [selectedGuild]);

  const handleChange = (event : any) => {
    setSelectedGuild(event.target.value);
  };

  return (
    <Box p={4}>
      <Select placeholder="Selecione a Guild" value={selectedGuild} onChange={handleChange}>
        {guilds.map((guilds) => (
          <option key={guilds.id} value={guilds.name}>
            {guilds.name}
          </option>
        ))}
      </Select>
    </Box>
  );
};

export default GuildSelector;
