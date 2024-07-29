interface Options {
  voiceId: string
  text: string
  modelId: string
  apiKey: string
}

export async function executeTts({ voiceId, text, modelId, apiKey }: Options) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({ text, model_id: modelId }),
  }).then((res) => res.arrayBuffer())

  const filename = new Date().toISOString()
  const file = new File([response], `${filename}.mp3`)
  return URL.createObjectURL(file)
}
