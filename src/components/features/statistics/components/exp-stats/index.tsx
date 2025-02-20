import React from 'react'

import { Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react'

import { formatExp } from '../../../../../common/utils/format-exp'

interface ExpStatsProps {
  totalExp: number
  avgExp: number
  filter: string
}

const ExpStats: React.FC<ExpStatsProps> = ({ totalExp, avgExp, filter }) => {
  return (
    <>
      <Stat>
        <StatLabel>Experiência Total</StatLabel>
        <StatNumber>{formatExp(totalExp)}</StatNumber>
        <StatHelpText>{filter}</StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>Experiência Média</StatLabel>
        <StatNumber>{formatExp(avgExp)}</StatNumber>
        <StatHelpText>{filter}</StatHelpText>
      </Stat>
    </>
  )
}

export default ExpStats
