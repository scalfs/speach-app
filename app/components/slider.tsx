import { useEffect, useState } from 'react'
import ReactSlider from 'react-slider'
import { cn } from '#app/utils/misc'

export function Slider({
  value,
  onChange,
  size,
  step = 0.005,
  min = 0.0,
  max = 1.0,
  disabled = false,
  rounded = true,
  className = undefined,
  lowerLeftLabel = null,
  lowerRightLabel = null,
  leftTooltip = null,
  rightTooltip = null,
  onAfterChange = undefined,
  label = null,
  enableThumbTooltip = false,
  disableLeftTrackBackground = false,
  warnUntil = null,
  warnFrom = null,
}: {
  value: number
  onChange: (value: number) => any
  size: 'md' | 'lg'
  step?: number
  min?: number
  max?: number
  disabled?: boolean
  rounded?: boolean
  className?: string | undefined
  lowerLeftLabel?: string | null
  lowerRightLabel?: string | null
  leftTooltip?: string | null
  rightTooltip?: string | null
  onAfterChange?: (() => any) | undefined
  label?: any
  enableThumbTooltip?: boolean
  disableLeftTrackBackground?: boolean
  warnUntil?: number | null
  warnFrom?: number | null
}) {
  const [active, setActive] = useState<boolean>(false)
  const [currValue, setCurrValue] = useState<number>(value)

  useEffect(() => {
    setCurrValue(value)
  }, [value])

  return (
    <>
      {/* {label && <InputLabel variant="body2">{label}</InputLabel>} */}
      <ReactSlider
        value={value}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        trackClassName={cn(
          !disabled && 'cursor-pointer',
          `slider-track-${size}`,
          disableLeftTrackBackground && 'no-left-track-bg',
          rounded && 'rounded',
          // slider-track class has to be last
          'slider-track',
        )}
        className={cn('flex w-full items-center', `slider-wrapper-${size}`, className)}
        renderTrack={(props, state) => {
          const className = cn(
            !disabled && 'cursor-pointer',
            `slider-track-${size}`,
            disableLeftTrackBackground && 'no-left-track-bg',
            rounded && 'rounded',
            'bg-red-100',
            // slider-track class has to be last
            'slider-track',
          )
          if (state.index === 0 && warnUntil !== null) {
            return (
              <>
                <div {...props} />
                <div
                  className={className}
                  style={{
                    width: `${warnUntil * 100}%`,
                    position: 'absolute',
                    left: 0,
                    zIndex: 1,
                  }}
                />
              </>
            )
          } else if (state.index === 1 && warnFrom !== null) {
            return (
              <>
                <div
                  className={className}
                  style={{
                    width: `${(1 - warnFrom) * 100}%`,
                    position: 'absolute',
                    right: 0,
                    zIndex: 1,
                  }}
                />
                <div {...props} />
              </>
            )
          }
          return <div {...props} />
        }}
        renderThumb={(props, state) => {
          const warn =
            (warnUntil && currValue < warnUntil) || (warnFrom && warnFrom < currValue)
          return (
            <div {...props}>
              <Thumb
                disabled={disabled}
                size={size}
                dragged={active}
                value={enableThumbTooltip ? `${Math.round(currValue * 100)}%` : null}
                warning={warn || undefined}
              />
            </div>
          )
        }}
        onBeforeChange={() => setActive(true)}
        onAfterChange={() => {
          setActive(false)
          if (onAfterChange) onAfterChange()
        }}
        onChange={(value, index) => {
          setCurrValue(value)
          onChange(value)
        }}
      />
      {/* {(lowerLeftLabel !== null || lowerRightLabel !== null) && (
        <div className="flex justify-between content-center mt-2">
          <LabelWithTooltip
            label={lowerLeftLabel}
            tooltip={leftTooltip}
            labelVariant={"body3"}
          />
          <LabelWithTooltip
            label={lowerRightLabel}
            tooltip={rightTooltip}
            labelVariant={"body3"}
          />
        </div>
      )} */}
    </>
  )
}

const Thumb = ({
  size,
  dragged,
  value = null,
  disabled = false,
  warning = false,
}: {
  size: 'md' | 'lg'
  dragged: boolean
  value: string | null
  disabled?: boolean
  warning?: boolean
}) => {
  const [hover, setHover] = useState<boolean>(false)
  const timeout = 100
  const len = value ? value.length : 0
  const px = len <= 2 ? 'px-2.5' : len >= 4 ? 'px-0.5' : 'px-1.5'
  return (
    <div
      className="relative flex cursor-pointer items-center text-gray-500"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setTimeout(() => setHover(false), timeout)}>
      <div className="relative pb-1">
        {value && (hover || dragged) && (
          <div
            className={cn(
              'inline-auto absolute bottom-0 mb-4 items-center rounded-md py-0 text-white',
              warning ? 'bg-red-500' : 'bg-black',
              warning ? 'w-28' : 'w-10',
              warning ? '-left-14' : '-left-5',
              px,
            )}>
            <span className="inline-block text-sm leading-tight">
              {value} {warning ? '- Unstable' : ''}
            </span>
            <span
              className={cn(
                'absolute bottom-0 right-0 -mb-1 -ml-1 h-2 w-2 rotate-45 transform',
                warning ? 'bg-red-500' : 'bg-black',
              )}
              style={{ left: '50%' }}
            />
          </div>
        )}
        <div className="relative">
          <div className={'absolute -translate-x-1/2 -translate-y-1/2'}>
            <div
              className={cn(
                'slider-thumb',
                !disabled && 'cursor-pointer',
                size === 'md' ? 'h-3' : 'h-4',
                'w-1 rounded-full bg-black',
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
