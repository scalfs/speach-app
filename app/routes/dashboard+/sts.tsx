import { Button } from '#app/components/ui/button.js'
import UploadContainer from '#app/components/upload-container.js'
import { VoicesCombobox } from '#app/components/voices-combobox.js'
import { getAudioFileName, getAudioTitle } from '#app/modules/audio/audio.js'
import {
  addStreamArrayBuffer,
  audioRef,
  destroy,
} from '#app/modules/audio/audioPlayer.js'
import { requireUser } from '#app/modules/auth/auth.server'
import { getModelId } from '#app/modules/eleven-labs/model.server.js'
import { toAudio, type ToAudioType } from '#app/modules/eleven-labs/toAudio.client.js'
import { getVoices, type SpeachVoice } from '#app/modules/eleven-labs/voices.server.js'
import { FREE_CHARS_QUOTA } from '#app/modules/stripe/plans.js'
import { siteConfig } from '#app/utils/constants/brand'
import { prisma } from '#app/utils/db.server'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { Loader2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import invariant from 'tiny-invariant'

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.siteTitle} - Dashboard` }]
}

export const ROUTE_PATH = '/dashboard/sts' as const

const SPEECH_TO_SPEECH_CHARACTERS_PER_SEC = 1000.0 / 60.0

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    include: { plan: { select: { charactersPerMonth: true } } },
  })
  const availableCredits = subscription?.availableCredits ?? FREE_CHARS_QUOTA
  const charactersPerMonth = subscription?.plan.charactersPerMonth ?? FREE_CHARS_QUOTA

  const voices = await getVoices()
  const modelId = await getModelId({ sts: true })

  const speachVoices = voices.map(({ name, voice_id }) => ({
    name,
    id: voice_id,
  }))

  // weird name to obfuscate the return
  const data = process.env.EL_API_KEY
  return json({
    data,
    modelId,
    availableCredits,
    charactersPerMonth,
    voices: speachVoices,
  } as const)
  // return json({ user, data, subscription } as const)
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const user = await requireUser(request)

  const charUsage = formData.get('charUsage')
  invariant(typeof charUsage === 'string', 'error ao descontar creditos')
  try {
    await prisma.subscription.update({
      where: { userId: user.id },
      data: { availableCredits: { decrement: parseInt(charUsage ?? 0, 10) } },
    })
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false }
  }
}

const errorObject = { file: null, voiceId: null } as {
  file: string | null
  voiceId: string | null
}

const MAX_CHAR_USAGE = 60.0 * SPEECH_TO_SPEECH_CHARACTERS_PER_SEC // 60 seconds

export default function SpeechToSpeech() {
  const fetcher = useFetcher()

  const [file, setFile] = useState<any | null>(null)
  const [durationSecs, setDurationSecs] = useState<number | null>(null)

  const [errors, setErrors] = useState(errorObject)
  const [isCreating, setIsCreating] = useState(false)
  const {
    voices = [],
    modelId = '',
    data: EL_API_KEY = '',
    availableCredits,
    charactersPerMonth,
  } = useLoaderData<typeof loader>()
  const [selectedVoice, setSelectedVoice] = useState<SpeachVoice | null>(null)
  const onSelectVoice = (voice: SpeachVoice | null) => {
    setSelectedVoice(voice)
    setErrors((errors) => ({ ...errors, voiceId: null }))
  }

  const maxCharUsage = Math.round(Math.min(availableCredits, MAX_CHAR_USAGE))
  const charUsage = useMemo(() => {
    // if (task === 'text-to-speech') return text.value.length
    if (durationSecs === null) return 0
    return Math.ceil(durationSecs * SPEECH_TO_SPEECH_CHARACTERS_PER_SEC)
  }, [durationSecs])

  const buttonDisabled = !file || isCreating || availableCredits < charUsage

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    setIsCreating(true)
    const { errors, hasErrors } = await handleSubmit(formData).finally(() =>
      setIsCreating(false),
    )

    // Deduct credits from subscription
    fetcher.submit(formData, { method: 'POST' })

    if (hasErrors) return setErrors(errors)
    setErrors(errorObject)

    // fetcher.submit({ url }, { method: 'POST' })
  }

  async function handleSubmit(formData: FormData) {
    const voiceId = formData.get('voiceId')
    const modelId = formData.get('modelId')

    const errors = {
      file: file ? null : 'Áudio é obrigatório',
      voiceId: voiceId ? null : 'Voz é obrigatória',
    }
    const hasErrors = Object.values(errors).some((errorMessage) => errorMessage)

    if (hasErrors) return { hasErrors: true, errors }

    invariant(typeof voiceId === 'string', 'voiceId deve ser uma string')
    invariant(typeof modelId === 'string', 'modelId deve ser uma string')

    await convert({ referenceAudio: file, type: 'speech-to-speech' })

    return { hasErrors: false, errors }

    // const url = await executeTts({ text, voiceId, modelId, apiKey: window.ENV.EL_API_KEY })

    // return { hasErrors: false, errors, url }
  }

  const [hasReceivedAudio, setHasReceivedAudio] = useState(false)
  const convert = async (config: ToAudioType) => {
    if (audioRef.value === null || !selectedVoice) return
    // loading.value = true;
    try {
      // if (config.type === "text-to-speech") {
      //   warnForSpecificChars(config.text);
      // }
      await toAudio({
        config,
        modelId,
        audioEl: audioRef.value,
        voiceId: selectedVoice.id,
        apiKey: EL_API_KEY,
        onContentStart: () => {
          if (!hasReceivedAudio) setHasReceivedAudio(true)
        },
        audioInfo: {
          // both id and fileName are updated once we get the response
          id: 'synthesized_audio.mp3',
          autoStart: true,
          name: getAudioTitle({ name: selectedVoice.name }),
          fileName: getAudioFileName({ name: selectedVoice.name }),
          type: 'tts',
          isFirstRequest: true,
        },
        onChunkReceive: addStreamArrayBuffer,
      })
    } catch (e: any) {
      console.error(e)
      destroy()
    }
    // loading.value = false;
  }

  return (
    <div className="mb-32 flex h-full w-full bg-secondary px-6 py-8 dark:bg-black">
      <div className="z-10 mx-auto flex h-full w-full max-w-screen-xl gap-12">
        <div className="flex w-full flex-col rounded-lg border border-border bg-card dark:bg-black">
          <form method="post" onSubmit={onSubmit}>
            <div className="flex w-full flex-col rounded-lg p-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-medium text-foreground">Comece aqui</h2>
                <p className="text-sm font-normal text-foreground/60">
                  Escolha uma das vozes, ajuste as configurações e produza seu áudio.
                </p>
                <VoicesCombobox {...{ voices, selectedVoice, onSelectVoice }} />
                {errors?.voiceId ? (
                  <em className="text-sm text-red-600">{errors.voiceId}</em>
                ) : null}
                <input type="hidden" name="voiceId" value={selectedVoice?.id} />
                <input type="hidden" name="modelId" value={modelId} />
                <input type="hidden" name="charUsage" value={charUsage} />
              </div>
            </div>

            <div className="flex w-full px-6">
              <div className="w-full border-b border-border" />
            </div>

            <div className="relative mx-auto flex w-full flex-col p-6">
              {errors?.file ? (
                <em className="text-sm text-red-600">{errors.file}</em>
              ) : null}
              <UploadContainer
                file={file}
                setFile={setFile}
                setDurationSecs={setDurationSecs}
                withRecorder
                uploadMaxMBSize={10}
              />
              <div className="mt-2 flex justify-between">
                <label className="font-mono text-xs font-medium text-gray-400">
                  {charUsage}/{maxCharUsage}
                </label>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs font-medium text-gray-400">
                    Créditos disponíveis: {availableCredits}/{charactersPerMonth}
                  </label>
                  <Button
                    type="submit"
                    disabled={buttonDisabled}
                    className="hidden sm:flex">
                    {isCreating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isCreating ? 'Convertendo...' : 'Converter agora'}
                  </Button>
                </div>
              </div>
              <Button type="submit" disabled={buttonDisabled} className="mt-2 sm:hidden">
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isCreating ? 'Convertendo...' : 'Converter agora'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
