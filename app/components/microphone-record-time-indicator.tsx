import { recordingInfo } from '#app/modules/audio/audio-recorder.js'
import { formatTime, parseTime } from '#app/modules/audio/time.js'

export const MicrophoneRecordTimeIndicator = () => {
  const [hours, minutes, seconds] = parseTime(
    recordingInfo.value.recordedAudioDurationSecs === null
      ? 0
      : recordingInfo.value.recordedAudioDurationSecs,
  )
  return (
    <span className="font-serif text-sm ">{formatTime(hours, minutes, seconds)}</span>
  )
}
