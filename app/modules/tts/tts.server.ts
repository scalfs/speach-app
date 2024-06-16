// import { getEnv } from '~/env.server'

interface Options {
  voiceId: string
  text: string
  modelId: string
}

export async function executeTts({ voiceId, text, modelId }: Options) {
  const { EL_API_KEY: apiKey } = process.env
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({ text, model_id: modelId }),
  }).then((res) => res.arrayBuffer())

  // const audioBuffer = await new AudioContext().
  // const location = s3UploadHandler({ data: audioBuffer })

  // // Upload the Blob object to AWS S3.
  // const s3 = new AWS.S3({});
  // const uploadParams = {
  //   Bucket: 'my-bucket',
  //   Key: 'file.txt',
  //   Body: blob,
  // };

  // Get the URL from the uploadResult.
  // const presignedUrl = await simpleUpload(new Uint8Array(response))
  // return presignedUrl

  return response
}
