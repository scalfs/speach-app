import { computed, signal } from '@preact/signals-core'

export type AudioInfoType = {
  id: string
  name: string
  autoStart: boolean
  fileName: string | null
  // This can be extended to other types like sample, recording, project audio etc. Not needed atm.
  type: 'tts' | 'historyItem' | 'other'
  // isFirstRequest can be to false in case multiple audio streams should be concatted to one in case loadFromStream / loadFromSource are called multiple times,
  // this is used for example in projects streaming
  isFirstRequest: boolean
  loaded?: boolean
  extra?: any
  onTimeUpdateCallback?: ((currentTime: number, duration: number) => any) | undefined
}

export const isReady = signal(false)
export const isPlaying = signal(false)
export const isOpen = signal(true)

export const audioType = signal<'src' | 'stream' | null>(null)
export const audioRef = signal<HTMLAudioElement | null>(null)
export const canPlay = signal<boolean>(false)

export let streamArrayBuffers: ArrayBuffer[] = []

export const audioInfo = signal<AudioInfoType | null>(null)
export const firstChunkIsLoading = computed<boolean>(() => {
  if (audioInfo.value === null) {
    return false
  }
  return !canPlay.value
})

export const loadFromSource = (src: string, info: AudioInfoType) => {
  if (audioRef.value === null) {
    return
  }
  info.loaded = true
  if (info.isFirstRequest) {
    canPlay.value = false
  }
  audioType.value = 'src'
  audioInfo.value = info
  streamArrayBuffers = []
  audioRef.value.src = src
}

export const addStreamArrayBuffer = (buffer: ArrayBuffer) => {
  streamArrayBuffers.push(buffer)
}

export const loadFromStream = (info: AudioInfoType) => {
  if (audioRef.value === null) {
    return
  }
  info.loaded = false
  if (info.isFirstRequest) {
    canPlay.value = false
  }
  audioType.value = 'stream'
  audioInfo.value = info
  streamArrayBuffers = []
}

export const destroy = () => {
  if (audioRef.value === null) {
    return
  }
  audioRef.value.src = ''
  canPlay.value = false
  audioType.value = null
  audioInfo.value = null
  streamArrayBuffers = []
}

export function playAudio() {
  if (audioRef.value === null) {
    return
  }
  audioRef.value.play()
}

export function pauseAudio() {
  if (audioRef.value === null) {
    return
  }
  audioRef.value.pause()
}
