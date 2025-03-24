import { useState, useEffect } from 'react'

import { useToast, useBreakpointValue, useColorModeValue } from '@chakra-ui/react'

interface FormState {
  mainChar: string
  makers: string[]
  registeredBy: string
}

export const useDescriptionEditor = () => {
  const [formState, setFormState] = useState<FormState>({
    mainChar: '',
    makers: [''],
    registeredBy: '',
  })
  const [generatedDescription, setGeneratedDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  const containerWidth = useBreakpointValue({
    base: '95%',
    sm: '85%',
    md: 'container.md',
  })
  const padding = useBreakpointValue({ base: 4, md: 8 })
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const descriptionBg = useColorModeValue('gray.50', 'gray.700')

  useEffect(() => {
    // Sempre inclui Main e Maker, mesmo quando vazios
    const mainPart = `Main: ${formState.mainChar}`

    // Sempre inclui o Maker, mesmo que vazio
    const makerPart = `Maker: ${formState.makers.filter(m => m.trim()).join(', ')}`

    const regPart = formState.registeredBy ? `Reg: ${formState.registeredBy}` : ''

    // Cria um array com as partes (Main e Maker sempre presentes)
    const parts = [mainPart, makerPart]

    // Adiciona Reg apenas se estiver preenchido
    if (regPart) parts.push(regPart)

    setGeneratedDescription(parts.join(' | '))
  }, [formState])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleInputChange =
    (field: keyof FormState, index?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === 'makers' && typeof index === 'number') {
        const makers = [...formState.makers]
        makers[index] = e.target.value
        setFormState(prev => ({ ...prev, makers }))
      } else {
        setFormState(prev => ({ ...prev, [field]: e.target.value }))
      }
    }

  const addMaker = () => {
    setFormState(prev => ({
      ...prev,
      makers: [...prev.makers, ''],
    }))
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDescription)
      toast({
        title: 'Copiado!',
        description: 'Descrição copiada com sucesso!',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
        variant: 'subtle',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar a descrição',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      })
    }
  }

  return {
    formState,
    generatedDescription,
    isLoading,
    containerWidth,
    padding,
    cardBg,
    borderColor,
    descriptionBg,
    handleInputChange,
    addMaker,
    copyToClipboard,
  }
}
