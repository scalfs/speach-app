import { signal } from '@preact/signals-core'
import { audioInfo } from './audioPlayer'
import { unixToPrettyDate } from './time'

type MediaInfo = {
  mediaSource: MediaSource
  sourceBuffer: SourceBuffer
} | null

export const mediaInfo = signal<MediaInfo>(null)

export const browserCanStream = (contentType: 'audio/mpeg'): boolean => {
  try {
    return MediaSource.isTypeSupported(contentType)
  } catch (error) {
    return false
  }
}

export const streamResponse = async ({
  response,
  audioEl = null,
  onContentEnd = null,
  onChunkReceive = null,
  onContentStart = null,
  continueStream = false,
}: {
  response: Response
  audioEl?: HTMLAudioElement | null
  onContentStart?: (() => any) | null
  onChunkReceive?: ((chunk: ArrayBuffer) => any) | null
  onContentEnd?: (() => any) | null
  continueStream?: boolean
}) => {
  if (response.body === null) {
    throw Error('Response body can not be null ...')
  }

  const readChunks = (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    return {
      async *[Symbol.asyncIterator]() {
        let readResult = await reader.read()
        while (!readResult.done) {
          yield readResult.value
          readResult = await reader.read()
        }
      },
    }
  }

  const typedArrayToBuffer = (array: Uint8Array) => {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
  }

  let mediaSource: MediaSource | null = null
  if (continueStream && mediaInfo.value !== null) {
    mediaSource = mediaInfo.value.mediaSource
    var sourceBuffer = mediaInfo.value.sourceBuffer
  } else {
    mediaSource = new MediaSource()
    if (audioEl !== null) {
      audioEl.src = URL.createObjectURL(mediaSource)
    }
    await new Promise((resolve) => {
      // @ts-expect-error
      mediaSource.onsourceopen = resolve
    })
    var sourceBuffer = mediaSource.addSourceBuffer(
      // @ts-expect-error
      response.headers.get('content-type'),
    )
    mediaInfo.value = { mediaSource, sourceBuffer }
  }

  const reader = response.body.getReader()
  let first = true
  for await (const chunk of readChunks(reader)) {
    if (first && onContentStart !== null) {
      onContentStart()
      first = false
    }
    await new Promise((resolve) => {
      sourceBuffer.onupdateend = resolve
      const buffer = typedArrayToBuffer(chunk)
      if (onChunkReceive !== null) {
        onChunkReceive(buffer)
      }
      sourceBuffer.appendBuffer(buffer)
    })
  }
  if (onContentEnd !== null) {
    onContentEnd()
  }
  if (!continueStream) {
    endStream()
  }
}

export const endStream = () => {
  if (mediaInfo.value !== null) {
    mediaInfo.value.mediaSource.endOfStream()
    mediaInfo.value = null
  }
  if (audioInfo.value !== null) {
    audioInfo.value.loaded = true
  }
}

export type AudioNamingType = {
  id?: string
  name: string
  voice_settings?: { [key: string]: any } | null
  category?: 'premade' | 'cloned' | 'generated' | 'professional' | null
  model_id?: string | null
}

export const getAudioTitle = (item: AudioNamingType): string => {
  return `${item.name}, ${unixToPrettyDate(Date.now())}`
}

export const getAudioFileName = (item: AudioNamingType): string => {
  const d = new Date().toISOString().slice(0, -5)
  // TODO: Add task(TTS/STS) once ready
  // const c = getVoiceCategoryString(item.category);
  // const m = getModelString(item.model_id);
  // const vs = getVoiceSettingsString(item.voice_settings, item.model_id);
  const name = item.name.includes('/') ? item.name.split('/')[1] : item.name
  return `Speach_${name}_${d}.mp3`
}

export const getBlobDuration = async (blob: Blob | string) => {
  const tempVideoEl = document.createElement('audio')

  const durationP = new Promise<number>((resolve, reject) => {
    tempVideoEl.addEventListener('loadedmetadata', () => {
      // Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
      if (tempVideoEl.duration === Infinity) {
        tempVideoEl.currentTime = Number.MAX_SAFE_INTEGER
        tempVideoEl.ontimeupdate = () => {
          tempVideoEl.ontimeupdate = null
          resolve(tempVideoEl.duration)
          tempVideoEl.currentTime = 0
        }
      }
      // Normal behavior
      else resolve(tempVideoEl.duration)
    })

    // @ts-expect-error
    tempVideoEl.onerror = (event) => reject(event.target.error)
  })

  // @ts-expect-error
  tempVideoEl.src =
    typeof blob === 'string' || blob instanceof String
      ? blob
      : window.URL.createObjectURL(blob)

  return durationP
}
