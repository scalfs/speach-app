const TTS_MODEL_KEY = 'eleven_multilingual_v2'
const STS_MODEL_KEY = 'eleven_multilingual_sts_v2'

export async function getModelId({ sts }: { sts?: boolean }) {
  const apiKey = process.env.EL_API_KEY
  const response = await fetch('https://api.elevenlabs.io/v1/models', {
    headers: { Accept: 'application/json', 'xi-api-key': apiKey },
  })
  const models: Model[] = await response.json()

  if (sts) {
    const hasStsDefaultModel = models.some(({ model_id }) => model_id === STS_MODEL_KEY)
    return hasStsDefaultModel
      ? STS_MODEL_KEY
      : models.find(({ can_do_voice_conversion }) => can_do_voice_conversion)?.model_id ??
          models[0].model_id
  }

  const hasDefaultModel = models.some(({ model_id }) => model_id === TTS_MODEL_KEY)
  return hasDefaultModel ? TTS_MODEL_KEY : models[0].model_id
}

interface Model {
  can_be_finetuned: boolean
  can_do_text_to_speech: boolean
  can_do_voice_conversion: boolean
  can_use_speaker_boost: boolean
  can_use_style: boolean
  description: string
  languages: Language[]
  max_characters_request_free_user: number
  max_characters_request_subscribed_user: number
  model_id: string
  name: string
  requires_alpha_access: boolean
  serves_pro_voices: boolean
  token_cost_factor: number
}

interface Language {
  language_id: string
  name: string
}
