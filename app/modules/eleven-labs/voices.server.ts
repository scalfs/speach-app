import { AVAILABLE_VOICES, PERSONAL_VOICES } from './voices'

export async function getVoices(userEmail: string) {
  const apiKey = process.env.EL_API_KEY
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { Accept: 'application/json', 'xi-api-key': apiKey },
  })
  const { voices }: Response = await response.json()
  const personalVoices = getPersonalVoices(voices, userEmail)

  const globalVoices = getPreSelectedVoices(voices)

  return [...personalVoices, ...globalVoices.reverse()]
}

const getPreSelectedVoices = (voices: Voice[]) =>
  voices.filter(({ voice_id }) => AVAILABLE_VOICES.includes(voice_id))

const getPersonalVoices = (voices: Voice[], userEmail: string) => {
  if (userEmail in PERSONAL_VOICES)
    return voices.filter(({ voice_id }) => PERSONAL_VOICES[userEmail].includes(voice_id))
  return []
}

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
