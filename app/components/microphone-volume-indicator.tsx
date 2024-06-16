import { recordingInfo } from '#app/modules/audio/audio-recorder.js'
import { cn } from '#app/utils/misc.js'

const NUM_BARS = 10

interface Props {
  className?: string | undefined
}

export const MicrophoneVolumeIndicator = ({ className }: Props) => {
  if (
    recordingInfo.value.isRecording &&
    recordingInfo.value.normalizedLoudness !== null
  ) {
    const normalizedLoudness = recordingInfo.value.normalizedLoudness
    var highestVolumeIndex = Math.round(normalizedLoudness * NUM_BARS)
  } else {
    var highestVolumeIndex = 0
  }
  return (
    <div className={className}>
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {Array.from(Array(NUM_BARS).keys()).map((index) => (
            <div
              key={index}
              className={cn(
                index < highestVolumeIndex ? 'bg-gray-900' : 'bg-gray-200',
                'rounded-sm',
              )}
              style={{ height: 20, width: 5 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
