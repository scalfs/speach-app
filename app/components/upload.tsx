import { cn } from '#app/utils/misc.js'
import { signal } from '@preact/signals-core'
import { type PropsWithChildren, useMemo, useRef } from 'react'

function useSignal<T>(value: T) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => signal(value), [])
}

interface Props extends PropsWithChildren {
  accept: string
  onChange: (files: FileList) => any
  errorText?: string | null
  multiple?: boolean
  className?: string | undefined
  disabled?: boolean
}

export default function Upload({
  accept,
  onChange,
  children,
  errorText = null,
  multiple = false,
  className = undefined,
  disabled = false,
}: Props) {
  const dragover = useSignal(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <>
      <label
        htmlFor="file-upload"
        className={cn(
          'flex justify-center rounded-md border-2 border-gray-300 px-6 pb-6 pt-5',
          !disabled && 'cursor-pointer border-dashed hover:border-gray-500',
          dragover.value && 'border-gray-500 bg-gray-50',
          className,
        )}
        onDragEnter={disabled ? undefined : (e) => (dragover.value = true)}
        onDragLeave={disabled ? undefined : (e) => (dragover.value = false)}
        onDragOver={disabled ? undefined : (e) => e.preventDefault()}
        onDrop={
          disabled
            ? undefined
            : (e) => {
                e.preventDefault()
                dragover.value = false
                if (e.dataTransfer !== null) {
                  onChange(e.dataTransfer.files)
                }
              }
        }
        onClick={
          disabled
            ? undefined
            : () => {
                if (fileInputRef.current !== null) {
                  fileInputRef.current.click()
                }
              }
        }>
        {children}
      </label>
      <input
        ref={fileInputRef}
        name="file-upload"
        type="file"
        className="sr-only"
        accept={disabled ? undefined : accept}
        multiple={multiple}
        onChange={
          disabled
            ? undefined
            : (e: any) => {
                onChange(e.target.files)
              }
        }
      />
      {errorText && <div className="mt-1 text-sm text-red-600">{errorText}</div>}
    </>
  )
}
