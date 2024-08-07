import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from '#app/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#app/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '#app/components/ui/popover'

import type { SpeachVoice, SpeachVoices } from '#app/modules/eleven-labs/voices.server.js'
import { cn } from '#app/utils/misc.js'

interface Props {
  voices: SpeachVoices
  selectedVoice: SpeachVoice | null
  onSelectVoice: (voice: SpeachVoice | null) => void
}

export function VoicesCombobox({ voices, selectedVoice, onSelectVoice }: Props) {
  const [open, setOpen] = useState(false)

  const onSelect = (currentValue: string, { id, name, slug }: SpeachVoice) => {
    if (selectedVoice && currentValue === selectedVoice.name) {
      onSelectVoice(null)
    } else {
      onSelectVoice({ id, name, slug })
    }
    setOpen(false)
  }

  const isSelected = (voice: SpeachVoice) => voice.id === selectedVoice?.id

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-[300px] justify-between text-wrap text-left">
          {selectedVoice?.name ?? 'Escolha...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandList className="max-h-[300px]">
            <CommandInput placeholder="Pesquisar voz..." />
            <CommandEmpty>Voz não encontrada.</CommandEmpty>
            {Object.entries(voices).map(([group, voices], index) => {
              if (!voices.length) return null
              return (
                <CommandGroup heading={getHeadingLabel(group)} key={index}>
                  {voices.map((voice: SpeachVoice) => (
                    <CommandItem
                      key={voice.id}
                      value={voice.name}
                      onSelect={(...args) => onSelect(...args, voice)}>
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected(voice) ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {voice.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const getHeadingLabel = (voiceGroup: keyof SpeachVoices | string) => {
  if (voiceGroup === 'personalVoices') return 'Vozes customizadas'
  if (voiceGroup === 'sharedVoices') return 'Vozes profissionais'
  return ''
}
