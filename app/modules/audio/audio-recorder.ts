import { signal } from '@preact/signals-core'

export type RecordingInfoType = {
  isRecording: boolean
  normalizedLoudness: number | null // Loudness between 0 and 1
  recordedAudioDurationSecs: number | null
}

export const recordingInfo = signal<RecordingInfoType>({
  isRecording: false,
  normalizedLoudness: null,
  recordedAudioDurationSecs: null,
})

export class AudioRecorder {
  _mediaRecorder: MediaRecorder | null
  _stream: MediaStream | null
  _recordedChunks: Blob[]
  onDataAvailable: ((blob: Blob) => any) | null
  onStop: (() => any) | null
  onStart: (() => any) | null
  options: { mimeType?: string }
  _analyserBuffer: Float32Array | null
  _analyser: AnalyserNode | null
  _startedRecordingAtUnixMs: number | null
  _loudnessEma: number
  maxDurationSecs: number | null
  onMaxDurationCb: (() => any) | null

  constructor({
    maxDurationSecs = null,
    onMaxDurationCb = null,
  }: {
    maxDurationSecs?: number | null
    onMaxDurationCb?: (() => any) | null
  }) {
    this._mediaRecorder = null
    this._stream = null
    this._recordedChunks = []
    this.onDataAvailable = null
    this.onStop = null
    this.onStart = null
    this.options = {}
    this._analyserBuffer = null
    this._analyser = null
    this._startedRecordingAtUnixMs = null
    for (const mimeType of ['audio/webm', 'audio/mp4']) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        this.options = { mimeType }
      }
    }
    this._loudnessEma = 0.5
    this.maxDurationSecs = maxDurationSecs
    this.onMaxDurationCb = onMaxDurationCb
  }

  startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(async (stream: MediaStream) => {
        this._recordedChunks = []
        this._stream = stream
        this._mediaRecorder = new MediaRecorder(this._stream, this.options)

        const context = new AudioContext()
        const source = context.createMediaStreamSource(stream)

        this._analyser = context.createAnalyser()
        this._analyser.fftSize = 512
        source.connect(this._analyser)

        this._analyserBuffer = new Float32Array(this._analyser.fftSize)

        this._mediaRecorder.ondataavailable = (e) => {
          this._recordedChunks.push(e.data)
          if (this.onDataAvailable) {
            this.onDataAvailable(e.data)
          }
        }
        this._mediaRecorder.onstart = () => {
          this._startedRecordingAtUnixMs = Date.now()
          if (this.onStart !== null) {
            this.onStart()
          }
        }
        this._mediaRecorder.onstop = this.onStop
        this._mediaRecorder.start(100)
        recordingInfo.value = {
          isRecording: true,
          normalizedLoudness: 0,
          recordedAudioDurationSecs: 0,
        }
        this._pollAudioProgress()
      })
  }

  _getPeakLoudness = (): number => {
    if (this._analyser === null || this._analyserBuffer === null) {
      return 0
    }
    this._analyser.getFloatTimeDomainData(this._analyserBuffer)
    var squaredSum = 0.0
    for (const value of this._analyserBuffer) {
      squaredSum += Math.pow(value, 2)
    }
    return Math.sqrt(squaredSum / this._analyserBuffer.length)
  }

  _pollAudioProgress = async () => {
    while (
      recordingInfo.value.isRecording &&
      recordingInfo.value.normalizedLoudness !== null
    ) {
      const loudness = Math.min(this._getPeakLoudness() * 10.0, 1.0)
      const duration = this._getDuration()
      recordingInfo.value = {
        ...recordingInfo.value,
        normalizedLoudness:
          this._loudnessEma * recordingInfo.value.normalizedLoudness +
          (1 - this._loudnessEma) * loudness,
        recordedAudioDurationSecs: duration,
      }
      if (this.maxDurationSecs !== null && duration >= this.maxDurationSecs) {
        this.stopRecording()
        if (this.onMaxDurationCb !== null) {
          this.onMaxDurationCb()
        }
        break
      } else {
        await new Promise((r) => setTimeout(r, 100))
      }
    }
  }

  _getDuration = (): number => {
    if (this._startedRecordingAtUnixMs === null) {
      return 0
    }
    return (Date.now() - this._startedRecordingAtUnixMs) / 1000
  }

  getBlob = () => {
    const blob = new Blob(this._recordedChunks, {
      type: 'audio/ogg; codecs=opus',
    })
    return blob
  }

  stopRecording = (onError: ((error: any) => any) | undefined = undefined) => {
    try {
      if (
        this._mediaRecorder &&
        this._mediaRecorder.state === 'recording' &&
        this._stream
      ) {
        this._mediaRecorder.stop()
        this._stream.getTracks().forEach((track) => {
          track.stop()
        })
      }
    } catch (error: any) {
      if (onError) {
        onError(error)
      }
    }
    recordingInfo.value = {
      ...recordingInfo.value,
      isRecording: false,
    }
    this._startedRecordingAtUnixMs = null
  }

  getMimeType = () => {
    return this._mediaRecorder?.mimeType
  }

  getExtension = () => {
    const mimeType = this.getMimeType()
    if (mimeType === undefined) {
      return null
    }
    const extension = mimeType.split(';')[0].split('/')[1]
    return extension
  }

  reset = () => {
    this._mediaRecorder = null
    this._recordedChunks = []
    this._stream = null
    this._analyser = null
    this._analyserBuffer = null
    recordingInfo.value = {
      isRecording: false,
      normalizedLoudness: null,
      recordedAudioDurationSecs: null,
    }
    this._startedRecordingAtUnixMs = null
  }
}
