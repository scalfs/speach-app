const PRE_SELECTED_VOICES = [
  { name: 'Ethan', newName: 'Enzo' },
  { name: 'Anthoni', newName: 'Antônio' },
  { name: 'Arnold', newName: 'Artur' },
  { name: 'Bella', newName: 'Beatriz' },
  { name: 'Callum', newName: 'Caio' },
  { name: 'Charlie', newName: 'Carlos' },
  { name: 'Charlotte', newName: 'Clara' },
  { name: 'Clyde', newName: 'Cláudio' },
  { name: 'Daniel', newName: 'Davi' },
]

export async function getVoices() {
  const apiKey = process.env.EL_API_KEY
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { Accept: 'application/json', 'xi-api-key': apiKey },
  })
  const { voices }: Response = await response.json()
  const voicesToDisplay = getPreSelectedVoices(voices)

  const voicesWithProperNames = replaceVoiceNames(voicesToDisplay)
  console.log({ voicesWithProperNames })
  return clearVoiceNames(voicesWithProperNames).reverse()
}

const getPreSelectedVoices = (voices: Voice[]) =>
  voices.filter(
    ({ name, category }) =>
      PRE_SELECTED_VOICES.map((v) => v.name).includes(name) || category === 'cloned',
  )
// const getPreSelectedVoices = (voices: Voice[]) =>
//   voices.filter(({ category }) => category === 'cloned')

const replaceVoiceNames = (voices: Voice[]) =>
  voices.map((voice) => {
    const newName = PRE_SELECTED_VOICES.find(({ name }) => name === voice.name)?.newName
    return newName ? { ...voice, name: newName } : voice
  })

const clearVoiceNames = (voices: Voice[]) =>
  voices.map((voice) => ({ ...voice, name: voice.name.split(/\s+/)[0] }))

// const capitalize = (str: string) =>
//   str.charAt(0).toUpperCase() + str.slice(1).toLocaleLowerCase();

export interface SpeachVoice {
  id: string
  name: string
}

interface Response {
  voices: Voice[]
}

export interface Voice {
  available_for_tiers: string[]
  category: 'cloned' | 'premade' | string
  description: string
  fine_tuning: FineTuning
  high_quality_base_model_ids: string[]
  labels: object
  name: string
  preview_url: string
  samples: Samples[]
  settings: Settings
  sharing: Sharing
  voice_id: string
}

interface ManualVerification {
  extra_text: string
  request_time_unix: number
  files: ManualVerificationFiles[]
}

interface ManualVerificationFiles {
  file_id: string
  file_name: string
  mime_type: string
  size_bytes: number
  upload_date_unix: number
}

interface VerificationAttempts {
  accepted: boolean
  date_unix: number
  levenshtein_distance: number
  recording: VerificationAttemptsRecording
  similarity: number
  text: string
}

interface VerificationAttemptsRecording {
  mime_type: string
  recording_id: string
  size_bytes: number
  transcription: string
  upload_date_unix: number
}

interface FineTuning {
  fine_tuning_requested: boolean
  finetuning_state: 'not_started'
  is_allowed_to_fine_tune: boolean
  language: string
  manual_verification: ManualVerification
  manual_verification_requested: boolean
  slice_ids: string[]
  verification_attempts: VerificationAttempts[]
  verification_attempts_count: number
  verification_failures: string[]
}

interface Samples {
  file_name: string
  hash: string
  mime_type: string
  sample_id: string
  size_bytes: number
}

interface Settings {
  similarity_boost: number
  stability: number
  style: 0
  use_speaker_boost: true
}

interface Sharing {
  cloned_by_count: number
  description: string
  enabled_in_library: boolean
  history_item_sample_id: string
  labels: object
  liked_by_count: number
  name: string
  original_voice_id: string
  public_owner_id: string
  review_message: string
  review_status: 'not_requested'
  status: 'enabled'
  whitelisted_emails: string[]
}
