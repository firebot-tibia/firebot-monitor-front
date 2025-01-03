import { useToast } from '@chakra-ui/react'
import { GuildMemberResponse } from '../types/interfaces/guild/guild-member.interface'

export const copyExivas = (data: GuildMemberResponse, toast: ReturnType<typeof useToast>) => {
  const cleanName = data.Name.trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
  const exivas = `exiva "${cleanName}"`
  navigator.clipboard.writeText(exivas)
  toast({
    title: 'Exiva copiado para a área de transferência.',
    status: 'success',
    duration: 2000,
    isClosable: true,
  })
}
