// TODO: move this to DB and associate voices to subscriptions/roles
export const AVAILABLE_VOICES = [
  // speach01@pontocomaudio.net
  { id: 'sA08OlI57z554552XXjX', slug: 'erika-senior-emocional' },
  { id: 's1jU0O6YsnX1rolenQ2A', slug: 'michael-grave-imponente' },
  { id: 'o3RJix088ugyZcwwYM3N', slug: 'rodrigo-reporter-noticias' },
  { id: 'dzwZCZVXlnr9CsVCIDsz', slug: 'guilherme-mensagem-padrao-storytelling' },
  { id: 'XfKngIgwgvmeM3CPDKZm', slug: 'bruno-jovem-natural-padrao-suave' },
  { id: 'WxzWnZq1LFVJBtbkvxuS', slug: 'bruce-padrao-institucional' },
  { id: 'VYjSVzm8dqAhsudH9epS', slug: 'erico-senior-vsl-padrao' },
  { id: 'SlOJVCxFKpxIw2B2UyRv', slug: 'emily-natural-coloquial-conversada' },
  { id: 'LsVvY9nciBQgPDgtIDCN', slug: 'kaue-jovem-narrador-de-canal' },
  { id: 'KdaOahi28ASmMR2OV0np', slug: 'thais-jovem-descolada-sotaque-carioca' },
  { id: 'BXuxFdLk9EZEGNyspghL', slug: 'carol-jovem-media-locutora-de-radio' },
  { id: 'AUT94XCm70ITqw7T2XEB', slug: 'bruno-jovem-storytelling' },
  { id: '78kCnUrLe93dge5r4WLz', slug: 'erico-senior-institucional-storytelling' },
  { id: '70v6Tw9xxKlAxwX6exJX', slug: 'giovanna-jovem' },
  { id: '3M0mGfcPpXDcCvaGMB09', slug: 'krys-jovem-voz-grave-padrao' },
  // speach02@pontocomaudio.net
  { id: 'GEAOOSvHHcqfphelQWrc', slug: 'bruce-padrao-institucional' },
  { id: 'HLqJ0A0lvE7wQKabLTqf', slug: 'bruno-jovem-storytelling' },
  { id: 'MRN0BwIfP7DMNzXRUvtn', slug: 'bruno-jovem-natural-padrao-suave' },
  { id: '99jlxGHWKu178be7axXQ', slug: 'carol-jovem-media-locutora-de-radio' },
  { id: 'L4eFA4NZRZXOOBXQfena', slug: 'emily-natural-coloquial-conversada' },
  { id: 'WtKRL8Y8Bh4oqaRLowky', slug: 'erico-senior-institucional-storytelling' },
  { id: 'GxGTGX8HJYUj0OxfOpiC', slug: 'erico-senior-vsl-padrao' },
  { id: 'ibL9zzF9gQFzuauNevpB', slug: 'erika-senior-emocional' },
  { id: 'Gw64dPxOgEIUn9ZPgPK9', slug: 'giovanna-jovem' },
  { id: 'qPMn31xkY1PQayr5n5N1', slug: 'guilherme-mensagem-padrao-storytelling' },
  { id: '6yb1kH65UbAHssTo7e0z', slug: 'kaue-jovem-narrador-de-canal' },
  { id: 'tnhVCnroNZuLZa8PMbdS', slug: 'krys-jovem-voz-grave-padrao' },
  { id: 'vnbpfDufGMDPGeF7Xy88', slug: 'michael-grave-imponente' },
  { id: 'uqhlwkQJuX6NA1Vox5KN', slug: 'rodrigo-reporter-noticias' },
  { id: 'e3E7F7MSXzL91fyczk2S', slug: 'thais-jovem-descolada-sotaque-carioca' },
]

export const PERSONAL_VOICES = {
  'kseteimagerMKT@gmail.com': [
    // speach01@pontocomaudio.net
    { id: '1nu83aLfBdCSeBijsrqx', slug: '' },
    // speach02@pontocomaudio.net
    { id: 'ch5ObWzLcwFNv7hTKjvb', slug: '' },
  ],
  'ronibage@gmail.com': [
    // speach01@pontocomaudio.net
    { id: 'TSXt20a5VzGITXSg9P9w', slug: '' },
    { id: 'Id8EJ0S5cTNlkQtT6PFH', slug: '' },
    // speach02@pontocomaudio.net
    { id: 'xtfncMXhicwOj7VeKHGD', slug: '' },
    { id: 'g454sDXrbK3uZd1Zf7xC', slug: '' },
    { id: 'nfxPSYrZs2ChEdKljcX8', slug: '' },
    { id: 'eOuRsVMWfGIZ8JqVgBrl', slug: '' },
  ],
  'tsantos@redegzeta.com.br': [
    // speach02@pontocomaudio.net
    { id: 'RW8bhMYNUNiU7FmQOGEu', slug: '' },
    { id: 'q53FNWaXSIyNftWD7AYg', slug: '' },
  ],
} as Record<string, { id: string; slug: string }[]>

export type ListVoices = { id: string; slug: string }[]

// US voices to be used in the future
// const PRE_SELECTED_VOICES = [
//   { name: 'Ethan', newName: 'Enzo' },
//   { name: 'Anthoni', newName: 'Antônio' },
//   { name: 'Arnold', newName: 'Artur' },
//   { name: 'Bella', newName: 'Beatriz' },
//   { name: 'Callum', newName: 'Caio' },
//   { name: 'Charlie', newName: 'Carlos' },
//   { name: 'Charlotte', newName: 'Clara' },
//   { name: 'Clyde', newName: 'Cláudio' },
//   { name: 'Daniel', newName: 'Davi' },
// ]
