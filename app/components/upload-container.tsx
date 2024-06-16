import { prettyPrintFileSize } from '#app/utils/print.client'
import { MicrophoneIcon } from '@heroicons/react/20/solid'
import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import { useEffect, useRef, useState } from 'react'

import { AudioRecorder, recordingInfo } from '#app/modules/audio/audio-recorder.js'
import { getBlobDuration } from '#app/modules/audio/audio.js'
import {
  isPlaying,
  loadFromSource,
  pauseAudio,
  playAudio,
} from '#app/modules/audio/audioPlayer.js'
import { formatTime, parseTime } from '#app/modules/audio/time.js'
import { blobToBase64, fileToBase64 } from '#app/utils/file.client.js'
import { toast } from 'sonner'
import { MicrophoneRecordTimeIndicator } from './microphone-record-time-indicator'
import { MicrophoneVolumeIndicator } from './microphone-volume-indicator'
import { Button } from './ui/button'
import Upload from './upload'

const RecordAudio = ({
  setFile,
  setStage,
}: {
  setFile: (file: any) => any
  setStage: (stage: 'select' | 'selected' | 'record') => any
}) => {
  const audioRecorder = useRef<AudioRecorder | null>(null)
  const [recordedFile, setRecordedFile] = useState<File | null>(null)

  const acceptRecordedFile = () => {
    if (recordedFile === null) {
      return
    }
    setFile(recordedFile)
    setStage('selected')
  }

  const onClose = () => {
    setStage('select')
  }

  useEffect(() => {
    audioRecorder.current = new AudioRecorder({
      maxDurationSecs: 59,
      onMaxDurationCb: () => {
        toast(
          'Atualmente nós permitimos uma duração máxima de 60 segundos para Speach Play Áudio. Vamos remover esse limite em um futuro próximo.',
        )
      },
    })
    audioRecorder.current.onStop = async () => {
      if (audioRecorder.current === null) {
        return
      }
      setRecordedFile(null)
      const blob = audioRecorder.current.getBlob()
      const base64 = await blobToBase64(blob)
      const extension = await audioRecorder.current.getExtension()
      if (extension === null) {
        throw new Error(
          "Mime type 'indefinido' recebido para o áudio gravado, isso não deveria acontecer ...",
        )
      }
      const name = `recording.${extension}`
      setRecordedFile(
        new File([blob], name, { type: audioRecorder.current.getMimeType() }),
      )
      loadFromSource(base64, {
        id: name,
        autoStart: true,
        fileName: name,
        name,
        type: 'other',
        isFirstRequest: true,
      })
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-3">
        <Button
          variant="outline"
          size="icon"
          disabled={recordedFile === null}
          onClick={acceptRecordedFile}>
          <CheckIcon />
        </Button>
        <Button
          // variant="primary"
          size="icon"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (audioRecorder.current === null) {
              return
            }
            if (recordingInfo.value.isRecording) {
              audioRecorder.current.stopRecording()
            } else {
              audioRecorder.current.startRecording()
            }
          }}>
          {recordingInfo.value.isRecording ? <StopIcon /> : <MicrophoneIcon />}
        </Button>
        <Button variant="outline" size="icon" onClick={onClose}>
          <XMarkIcon />
        </Button>
      </div>
      <MicrophoneVolumeIndicator className="mb-3" />
      <MicrophoneRecordTimeIndicator />
    </div>
  )
}

const UploadContainer = ({
  file,
  setFile,
  withRecorder,
  setDurationSecs = null,
  uploadMaxMBSize = null,
}: {
  file: any
  setFile: (file: any) => any
  withRecorder: boolean
  setDurationSecs?: ((durationSecs: number) => any) | null
  uploadMaxMBSize?: number | null
}) => {
  const [stage, setStage] = useState<'select' | 'selected' | 'record'>('select')
  const [uploadError, setUploadError] = useState<null | string>(null)
  const [hasPlayedAudio, setHasPlayedAudio] = useState<boolean>(false)
  const [duration, setDuration] = useState<string | null>(null)

  const playSample = async () => {
    if (file === null) {
      return
    }
    const base64 = await fileToBase64(file)
    loadFromSource(base64, {
      id: file.name,
      autoStart: true,
      fileName: file.name,
      name: file.name,
      type: 'other',
      isFirstRequest: true,
    })
  }

  const renderContent = () => {
    switch (stage) {
      case 'record': {
        return <RecordAudio setFile={setFile} setStage={setStage} />
      }
      case 'select': {
        return (
          <div>
            <div className="pointer-events-none select-none space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor">
                <path
                  d="M21 5H5C3.93913 5 2.92172 5.42143 2.17157 6.17157C1.42143 6.92172 1 7.93913 1 9V29V33C1 34.0609 1.42143 35.0783 2.17157 35.8284C2.92172 36.5786 3.93913 37 5 37H29C30.0609 37 31.0783 36.5786 31.8284 35.8284C32.5786 35.0783 33 34.0609 33 33V25V17M29 5H37M33 1V9M12.5015 15.886C12.5015 15.1972 13.2393 14.7611 13.8427 15.0926L23.1277 20.2002C23.2696 20.2783 23.388 20.3931 23.4704 20.5326C23.5528 20.672 23.5963 20.8311 23.5963 20.9931C23.5963 21.1551 23.5528 21.3141 23.4704 21.4536C23.388 21.5931 23.2696 21.7079 23.1277 21.786L13.8427 26.8927C13.705 26.9685 13.5498 27.007 13.3926 27.0046C13.2354 27.0022 13.0816 26.9588 12.9462 26.8788C12.8108 26.7988 12.6986 26.685 12.6207 26.5484C12.5427 26.4119 12.5016 26.2574 12.5015 26.1002V15.886Z"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div className="mt-2 flex text-sm text-foreground/90">
                <div className="relative cursor-pointer rounded-md font-medium text-foreground focus-within:outline-none">
                  Clique aqui para subir um arquivo, ou arraste e solte
                </div>
              </div>
              {uploadMaxMBSize && (
                <p className="text-xs text-foreground/60">
                  Arquivo de áudio, até {uploadMaxMBSize.toPrecision(2)}MB
                </p>
              )}
            </div>
            {withRecorder && (
              <>
                <div className="relative my-6 flex items-center">
                  <div className="w-full border-t border-gray-500" />
                  <div className="relative flex justify-center text-sm">
                    <span className="whitespace-nowrap px-4 text-xs uppercase text-foreground/90">
                      or
                    </span>
                  </div>
                  <div className="w-full border-t border-gray-500" />
                </div>
                <Button
                  // variant="white"
                  size="sm"
                  className="w-full"
                  onClick={(event) => {
                    event.stopPropagation()
                    setStage('record')
                  }}>
                  Gravar áudio
                </Button>
              </>
            )}
          </div>
        )
      }
      case 'selected': {
        return (
          file && (
            <div
              className="flex cursor-default items-center space-x-4 rounded-md border border-border px-3 py-2"
              onClick={(event) => {
                event.stopPropagation()
              }}>
              <div className="align-center flex flex-1">
                <span className="max-w-[6rem] truncate font-serif text-sm font-medium">
                  {file.name}
                </span>
                {duration && (
                  <span className="ml-2 inline-block flex-shrink-0 rounded-full bg-accent px-2 py-0.5 font-serif text-sm">
                    {duration}
                  </span>
                )}
                <span className="ml-2 inline-block flex-shrink-0 rounded-full bg-accent px-2 py-0.5 font-serif text-sm">
                  {prettyPrintFileSize(file.size)}
                </span>
              </div>
              <div className="relative inline-flex cursor-pointer items-center justify-end gap-4 rounded-br-lg border border-transparent">
                {isPlaying.value && hasPlayedAudio ? (
                  <PauseIcon
                    onClick={(event: any) => {
                      pauseAudio()
                      event.stopPropagation()
                    }}
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                ) : (
                  <PlayIcon
                    onClick={(event: any) => {
                      if (hasPlayedAudio) {
                        playAudio()
                      } else {
                        playSample()
                        setHasPlayedAudio(true)
                      }
                      event.stopPropagation()
                    }}
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                )}
                <TrashIcon
                  onClick={(event: any) => {
                    setFile(null)
                    setStage('select')
                    event.stopPropagation()
                  }}
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>
            </div>
          )
        )
      }
    }
  }

  const getDuration = async () => {
    if (file === null) {
      return
    }
    const durationFloat = await getBlobDuration(file)
    const [currentHours, currentMinutes, currentSeconds] = parseTime(durationFloat)
    if (setDurationSecs !== null) {
      setDurationSecs(durationFloat)
    }
    setDuration(formatTime(currentHours, currentMinutes, currentSeconds))
  }

  useEffect(() => {
    setHasPlayedAudio(false)
    if (file) {
      getDuration()
    } else {
      setDuration(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  return (
    <Upload
      onChange={(files) => {
        if (files.length !== 1) {
          throw new Error(
            `Quantidade inválida de arquivos. Esperado 1, recebidos ${files.length}`,
          )
        }
        const fileToUpload = files[0]

        if (
          uploadMaxMBSize !== null &&
          fileToUpload.size > uploadMaxMBSize * 1000 * 1000
        ) {
          setUploadError(
            `O arquivo '${
              fileToUpload.name
            }' é maior que ${uploadMaxMBSize.toPrecision(2)}MB.`,
          )
          return
        }
        setUploadError(null)
        setFile(fileToUpload)
        setStage('selected')
      }}
      accept="audio/aac, audio/x-aac, audio/x-aiff, audio/ogg, audio/mpeg, audio/mp3, audio/mpeg3, audio/x-mpeg-3, audio/opus, audio/wav, audio/x-wav, audio/webm, audio/flac, audio/x-flac, audio/mp4"
      errorText={uploadError}
      className="flex min-h-[20rem] items-center"
      disabled={stage !== 'select'}>
      {renderContent()}
    </Upload>
  )
}

export default UploadContainer
