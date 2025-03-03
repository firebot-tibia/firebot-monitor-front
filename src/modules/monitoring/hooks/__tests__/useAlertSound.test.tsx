import { renderHook } from '@testing-library/react'

import { useAlertSound } from '../useAlertSound/useAlertSound'

describe('useAlertSound', () => {
  const mockSpeechSynthesis = {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn().mockReturnValue([]),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onvoiceschanged: null,
    paused: false,
    pending: false,
    speaking: false,
  }

  const mockAudioPlay = jest.fn()
  const mockAudioPause = jest.fn()
  const mockAudioLoad = jest.fn()

  beforeAll(() => {
    // Mock SpeechSynthesis
    global.SpeechSynthesisUtterance = jest.fn().mockImplementation(text => ({
      text,
      lang: '',
      volume: 1,
      rate: 1,
      pitch: 1,
    }))
    global.speechSynthesis = mockSpeechSynthesis

    // Mock Audio constructor
    global.Audio = jest.fn().mockImplementation(() => ({
      play: mockAudioPlay,
      pause: mockAudioPause,
      load: mockAudioLoad,
      src: '',
      currentTime: 0,
    }))
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should play notification sound', async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useAlertSound())

    // Call playSound directly to test the audio functionality
    await result.current.playSound('notification_sound.mp3')

    // Verify that Audio was constructed and play was called
    expect(global.Audio).toHaveBeenCalledWith('/assets/notification_sound.mp3')
    expect(mockAudioPlay).toHaveBeenCalled()

    jest.useRealTimers()
  })

  it('should play google voice alert', () => {
    const { result } = renderHook(() => useAlertSound())

    result.current.playSound('google_voice_alert')

    expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
    const utterance = mockSpeechSynthesis.speak.mock.calls[0][0]
    expect(utterance.text).toBe('Atenção! Possível ameaça detectada!')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('should play google voice warning', () => {
    const { result } = renderHook(() => useAlertSound())

    result.current.playSound('google_voice_warning')

    expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
    const utterance = mockSpeechSynthesis.speak.mock.calls[0][0]
    expect(utterance.text).toBe('Aviso! Atividade suspeita detectada na área!')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('should play google voice enemy alert', () => {
    const { result } = renderHook(() => useAlertSound())

    result.current.playSound('google_voice_enemy')

    expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
    const utterance = mockSpeechSynthesis.speak.mock.calls[0][0]
    expect(utterance.text).toBe('Alerta vermelho! Inimigo detectado nas proximidades!')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('should handle multiple sound requests with debounce', async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useAlertSound())

    // Trigger multiple sounds in quick succession
    result.current.debouncedPlaySound('notification_sound.mp3')
    jest.advanceTimersByTime(100) // Wait a bit between calls
    result.current.debouncedPlaySound('google_voice_alert')
    jest.advanceTimersByTime(100)
    result.current.debouncedPlaySound('google_voice_warning')

    // Fast-forward remaining debounce timeout
    jest.runAllTimers()

    // Should only play the last one due to debounce
    expect(mockAudioPlay).not.toHaveBeenCalled()
    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1)

    const utterance = mockSpeechSynthesis.speak.mock.calls[0][0]
    expect(utterance.text).toBe('Aviso! Atividade suspeita detectada na área!')

    jest.useRealTimers()
  })
})
