import FileSaver from 'file-saver'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cloneElement, useEffect, useState, type MouseEvent } from 'react'
import { Slider } from '#app/components/slider'
import Spinner from '#app/components/spinner'
import {
  audioInfo,
  audioRef,
  audioType,
  canPlay,
  isOpen,
  isPlaying,
  pauseAudio,
  playAudio,
  streamArrayBuffers,
} from '#app/modules/audio/audioPlayer.js'
import { formatTime, parseTime } from '#app/modules/audio/time.js'
import { cn } from '#app/utils/misc.js'
import { Button } from './ui/button'

export function AudioPlayer() {
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)

  useEffect(() => {
    if (isPlaying.value) {
      const id = setInterval(() => {
        if (!isPlaying.value || audioRef.value === null) {
          clearInterval(id)
        } else {
          setCurrentTime(audioRef.value.currentTime)
        }
      }, 25)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying.value])

  useEffect(() => {
    if (audioInfo.value !== null && audioInfo.value.onTimeUpdateCallback !== undefined) {
      audioInfo.value.onTimeUpdateCallback(currentTime, duration)
    }
  }, [currentTime, duration])

  return (
    <div
      data-testid={'audio-player'}
      hidden={!audioInfo.value}
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-screen-xl">
      <div className="absolute pb-4 pr-8" style={{ bottom: 0, right: 0 }}>
        <MaximizeIcon />
      </div>
      <div
        hidden={!isOpen.value}
        className="flex items-center gap-6 bg-white/90 px-4 py-4 shadow shadow-slate-200/80 ring-1 ring-slate-900/5 backdrop-blur-sm md:px-6"
        aria-label="audio player"
        role="region">
        <audio
          hidden
          autoPlay={audioInfo.value ? audioInfo.value.autoStart : undefined}
          ref={(ref) => {
            audioRef.value = ref
          }}
          onPlay={() => {
            isPlaying.value = true
          }}
          onPause={() => {
            isPlaying.value = false
          }}
          onCanPlay={() => {
            canPlay.value = true
          }}
          onEnded={async () => {
            isPlaying.value = false
            setCurrentTime(0)
            // setShowFeedback(true);
          }}
          onProgress={(ev: any) => {
            if (ev.target.seekable.length > 0) {
              setDuration(ev.target.seekable.end(ev.target.seekable.length - 1))
            }
          }}
          onDurationChange={(ev: any) => {
            const d = ev.target.duration
            if (isFinite(d)) {
              setDuration(d)
            }
          }}
          onTimeUpdate={async (ev: any) => {
            setCurrentTime(ev.target.currentTime)
            // if (ev.target.currentTime > 3) {
            //   setShowFeedback(true);
            // }
          }}
        />
        <div className="hidden md:block">
          <PlayButton size="medium" disabled={!canPlay.value} />
        </div>
        <div className="mb-[env(safe-area-inset-bottom)] flex flex-1 flex-col gap-3 overflow-hidden p-1">
          <div className="truncate text-center text-sm font-bold leading-6 md:text-left">
            {audioInfo.value && audioInfo.value.name}
          </div>
          <div className="flex justify-between gap-6">
            {/** <div className="flex items-center md:hidden">
            <MuteButton player={player} />
          </div> */}
            <div className="flex flex-none items-center gap-4">
              <RewindButton disabled={!canPlay.value} />
              <div className="md:hidden">
                <PlayButton size="small" />
              </div>
              <ForwardButton disabled={!canPlay.value} />
            </div>

            <div className="relative inset-x-0 bottom-full top-0 box-border flex flex-auto touch-none items-center gap-6">
              <div className="flex w-full items-center gap-2">
                <Slider
                  size="lg"
                  max={duration}
                  step={0.01}
                  value={currentTime}
                  onChange={(value: number) => {
                    if (audioRef.value === null || !canPlay.value) return
                    audioRef.value.currentTime = value
                  }}
                  disabled={!canPlay.value}
                  // rounded={isMinWidthOfMd}
                />
                <ShowTime current={currentTime} total={duration} />
              </div>
            </div>
            <div className="flex items-center gap-4" style={{ marginTop: -4 }}>
              {/* {showFeedback &&
                  lastHistoryItem &&
                  featureConfig.feedback_enabled && (
                    <Feedback historyItem={lastHistoryItem} />
                  )} */}
              {audioInfo.value?.loaded && audioInfo.value.fileName !== null && (
                <DownloadButton disabled={!canPlay.value} />
              )}
              <MinimizeIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MaximizeButton() {
  return (
    <Button
      type="button"
      size="icon"
      // variant='secondary'
      onClick={() => {
        isOpen.value = true
      }}
      aria-label="Maximize Audio Player"
      className="group relative rounded-full focus:outline-none">
      <ChevronUp className="h-10 w-10 p-2" />
    </Button>
  )
}

function MaximizeIcon() {
  return (
    <button
      type="button"
      className="group relative rounded-full bg-black focus:outline-none"
      aria-label="Minimize Audio Player"
      onClick={() => {
        isOpen.value = true
      }}>
      <div className="absolute -inset-4 -right-2 md:hidden" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="white"
        className="h-10 w-10 p-2">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 15.75l7.5-7.5 7.5 7.5"
        />
      </svg>
    </button>
  )
}

export function MinimizeButton() {
  return (
    <Button
      type="button"
      size="icon"
      // variant='secondary'
      onClick={() => {
        isOpen.value = false
      }}
      aria-label="Minimize Audio Player"
      className="group relative rounded-full focus:outline-none">
      <ChevronDown className="h-10 w-10 p-2" />
    </Button>
  )
}

export function MinimizeIcon() {
  return (
    <button
      data-testid={'audio-player-minimize-button'}
      type="button"
      className="group relative rounded-full focus:outline-none"
      aria-label="Minimize Audio Player"
      onClick={() => {
        isOpen.value = false
      }}>
      <div className="absolute -inset-4 -right-2 md:hidden" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
    </button>
  )
}

export function PlayIcon(props: any) {
  return (
    <svg aria-hidden="true" viewBox="0 0 36 36" {...props}>
      <path d="M33.75 16.701C34.75 17.2783 34.75 18.7217 33.75 19.299L11.25 32.2894C10.25 32.8668 9 32.1451 9 30.9904L9 5.00962C9 3.85491 10.25 3.13323 11.25 3.71058L33.75 16.701Z" />
    </svg>
  )
}

function PauseIcon(props: any) {
  return (
    <svg aria-hidden="true" viewBox="0 0 22 28" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.5 0C0.671573 0 0 0.671572 0 1.5V26.5C0 27.3284 0.671573 28 1.5 28H4.5C5.32843 28 6 27.3284 6 26.5V1.5C6 0.671573 5.32843 0 4.5 0H1.5ZM17.5 0C16.6716 0 16 0.671572 16 1.5V26.5C16 27.3284 16.6716 28 17.5 28H20.5C21.3284 28 22 27.3284 22 26.5V1.5C22 0.671573 21.3284 0 20.5 0H17.5Z"
      />
    </svg>
  )
}

function PlayButton({
  disabled = false,
  size = 'large',
}: {
  disabled?: boolean
  size: 'small' | 'medium' | 'large'
}) {
  const renderButton = () => {
    if (!canPlay.value) {
      return (
        <Spinner
          iconClassName={cn(
            'fill-white group-active:fill-white/80',
            { large: 'h-10 w-10', medium: 'h-8 w-8', small: 'h-5 w-5' }[size],
          )}
        />
      )
    }
    if (isPlaying.value) {
      return (
        <PauseIcon
          className={cn(
            'fill-white group-active:fill-white/80',
            { large: 'h-7 w-7', medium: 'h-5 w-5', small: 'h-4 w-4' }[size],
          )}
        />
      )
    }
    return (
      <PlayIcon
        className={cn(
          'fill-white group-active:fill-white/80',
          { large: 'h-9 w-9', medium: 'h-7 w-7', small: 'h-5 w-5' }[size],
        )}
      />
    )
  }
  return (
    <button
      type="button"
      aria-label="Play/Pause"
      disabled={disabled}
      className={cn(
        'group relative flex flex-shrink-0 items-center justify-center rounded-full bg-slate-700',
        {
          large: 'h-18 w-18 focus:ring focus:ring-offset-4',
          medium: 'h-14 w-14 focus:ring-2 focus:ring-offset-2',
          small: 'h-10 w-10 focus:ring-2 focus:ring-offset-2',
        }[size],
        disabled
          ? 'opacity-75'
          : 'hover:bg-slate-900 focus:outline-none focus:ring-slate-700',
      )}
      onClick={isPlaying.value ? pauseAudio : playAudio}>
      <div className="absolute -inset-3 md:hidden" />
      {renderButton()}
    </button>
  )
}

export const ClickableIcon = ({
  Icon,
  onClick,
  size,
  disabled = false,
  className = undefined,
  ...props
}: {
  Icon: JSX.Element
  onClick: (event: MouseEvent<HTMLButtonElement>) => any
  size: 'md'
  className?: undefined | string
  disabled?: boolean
}) => {
  const ClonedIcon = cloneElement(Icon, {
    className: cn(
      'stroke-slate-500',
      !disabled && 'group-hover:stroke-slate-700',
      { md: 'h-6 w-6 ' }[size],
    ),
  })
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'group relative rounded-full',
        disabled ? 'opacity-75' : 'focus:outline-none',
        className,
      )}
      onClick={onClick}
      {...props}>
      <div className="absolute -inset-4 -right-2 md:hidden" />
      {ClonedIcon}
    </button>
  )
}

function ForwardButton({
  disabled,
  amount = 10,
}: {
  disabled: boolean
  amount?: number
}) {
  return (
    <ClickableIcon
      Icon={
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 5L19 8M19 8L16 11M19 8H10.5C7.46243 8 5 10.4624 5 13.5C5 15.4826 5.85204 17.2202 7 18.188"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 15V19"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 18V16C16 15.4477 16.4477 15 17 15H18C18.5523 15 19 15.4477 19 16V18C19 18.5523 18.5523 19 18 19H17C16.4477 19 16 18.5523 16 18Z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      disabled={disabled}
      onClick={() => {
        if (audioRef.value === null) {
          return
        }
        audioRef.value.currentTime = Math.min(
          audioRef.value.duration,
          audioRef.value.currentTime + amount,
        )
        if (!isPlaying.value) {
          audioRef.value.pause()
        }
      }}
      aria-label={`Fast-forward ${amount} seconds`}
      size="md"
    />
  )
}

function RewindButton({ disabled, amount = 10 }: { disabled: boolean; amount?: number }) {
  return (
    <ClickableIcon
      Icon={
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M8 5L5 8M5 8L8 11M5 8H13.5C16.5376 8 19 10.4624 19 13.5C19 15.4826 18.148 17.2202 17 18.188" />
          <path d="M5 15V19" />
          <path d="M8 18V16C8 15.4477 8.44772 15 9 15H10C10.5523 15 11 15.4477 11 16V18C11 18.5523 10.5523 19 10 19H9C8.44772 19 8 18.5523 8 18Z" />
        </svg>
      }
      disabled={disabled}
      onClick={() => {
        if (audioRef.value === null) {
          return
        }
        audioRef.value.currentTime = Math.max(0.0, audioRef.value.currentTime - amount)
      }}
      aria-label={`Rewind ${amount} seconds`}
      size="md"
    />
  )
}

function DownloadButton({ disabled }: { disabled: boolean }) {
  if (audioInfo.value === null || audioInfo.value.fileName === null) {
    return <></>
  }
  return (
    <button
      disabled={disabled}
      type="button"
      className={cn('group relative', disabled ? 'opacity-75' : 'focus:outline-none')}
      onClick={async () => {
        if (
          audioRef.value === null ||
          audioInfo.value === null ||
          audioInfo.value.fileName === null
        ) {
          return
        }
        if (audioType.value === 'src') {
          FileSaver.saveAs(audioRef.value.src, audioInfo.value.fileName)
        } else {
          const blob = new Blob(streamArrayBuffers, {
            type: 'audio/mpeg',
          })
          FileSaver.saveAs(blob, audioInfo.value.fileName)
        }
      }}
      aria-label="Download Audio">
      <div className="absolute -inset-4 -right-2 md:hidden" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 stroke-slate-500 group-hover:stroke-slate-700">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    </button>
  )
}

function ShowTime({ current, total }: { current: number; total: number | undefined }) {
  const [currentHours, currentMinutes, currentSeconds] = parseTime(current)
  const [maxHours, maxMinutes, maxSeconds] =
    total === undefined ? [0, 0, 0] : parseTime(total)

  return (
    <>
      <span
        className={'rounded-md px-1 py-0.5 font-mono text-sm leading-6 text-slate-500'}>
        {formatTime(currentHours, currentMinutes, currentSeconds)}
      </span>
      <span className=" text-sm leading-6 text-slate-300" aria-hidden="true">
        /
      </span>
      <span className="rounded-md px-1 py-0.5 font-mono text-sm leading-6 text-slate-500">
        {formatTime(maxHours, maxMinutes, maxSeconds)}
      </span>
    </>
  )
}
