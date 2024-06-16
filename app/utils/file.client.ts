export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result
      if (!(typeof result === 'string')) {
        reject(`Invalid type received, expected string received '${typeof result}'`)
        return
      }
      // @ts-expect-error
      resolve(reader.result)
    }
    reader.onerror = (error) => reject(error)
  })

export const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onload = () => {
      const result = reader.result
      if (!(typeof result === 'string')) {
        reject(`Invalid type received, expected string received '${typeof result}'`)
        return
      }
      // @ts-expect-error
      resolve(reader.result)
    }
    reader.onerror = (error) => reject(error)
  })
