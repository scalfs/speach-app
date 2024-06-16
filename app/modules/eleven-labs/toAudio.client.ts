import { browserCanStream, streamResponse } from '#app/modules/audio/audio'
import {
  loadFromSource,
  loadFromStream,
  type AudioInfoType,
} from '#app/modules/audio/audioPlayer.js'
import { toast } from 'sonner'

type TextToSpeechConfigType = {
  text: string
  type: 'text-to-speech'
}

type SpeechToSpeechConfigType = {
  referenceAudio: File
  type: 'speech-to-speech'
}

export type ToAudioType = SpeechToSpeechConfigType | TextToSpeechConfigType

export const toAudio = async ({
  audioEl,
  config,
  voiceId,
  modelId,
  apiKey,
  onContentStart = null,
  audioInfo = null,
  onChunkReceive = null,
}: {
  audioEl: HTMLAudioElement
  config: ToAudioType
  voiceId: string
  modelId: string
  apiKey: string
  onContentStart?: (() => any) | null
  audioInfo?: AudioInfoType | null
  onChunkReceive?: ((chunk: ArrayBuffer) => any) | null
}) => {
  const canStream = browserCanStream('audio/mpeg')

  const headers: { [key: string]: string } = { 'xi-api-key': apiKey }

  let url
  if (config.type === 'text-to-speech') {
    url = canStream
      ? `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`
      : `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
  } else {
    url = canStream
      ? `https://api.elevenlabs.io/v1/speech-to-speech/${voiceId}/stream`
      : `https://api.elevenlabs.io/v1/speech-to-speech/${voiceId}`
  }

  try {
    let resp
    if (config.type === 'text-to-speech') {
      headers['Content-Type'] = 'application/json'
      resp = await fetch(url, {
        headers,
        method: 'POST',
        body: JSON.stringify({ text: config.text, model_id: modelId }),
      })
    } else {
      const formData = new FormData()
      formData.append('audio', config.referenceAudio)
      formData.append('model_id', modelId)
      resp = await fetch(url, { method: 'POST', headers, body: formData })
    }

    if (resp.ok && resp.body !== null) {
      const historyItemId = resp.headers.get('history-item-id')
      if (audioInfo && historyItemId) {
        audioInfo.id = historyItemId
      }

      if (canStream) {
        if (audioInfo !== null) {
          loadFromStream(audioInfo)
        }
        await streamResponse({
          response: resp,
          audioEl,
          onContentStart,
          onChunkReceive,
        })
      } else {
        const blob = await resp.blob()
        const reader = new FileReader()
        reader.onload = () => {
          if (audioInfo !== null) {
            loadFromSource(reader.result as string, audioInfo)
          } else {
            audioEl.src = reader.result as string
          }
        }
        reader.readAsDataURL(blob)
      }
    } else {
      const { detail } = await resp.json()

      if (detail.length)
        detail.map(({ loc, msg, type }: { loc: string[]; msg: string; type: string }) =>
          toast(`${msg[0].toUpperCase() + msg.slice(1)}: ${loc.join('.')}`),
        )
      throw detail
    }
  } catch (e: any) {
    if (e.status === 'quota_exceeded' || e.status === 'too_many_concurrent_requests')
      toast(`Quota excedida, deseja um upgrade no seu plano? ${e.message ?? ''}`)
    else if (e.status === 'system_busy')
      toast(
        `Pedimos desculpas, o sistema está ocupado, tente novamente mais tarde... ${e.message ?? ''}`,
      )
    else {
      console.log(e, e.status)
      toast(
        `Desculpa, algo deu errado. Mas calma, você não será cobrado por essa requisição (a não ser que o resultado tenha aparecido no histórico). ${e.message ?? ''}`,
      )
    }
    throw e
  }
}
