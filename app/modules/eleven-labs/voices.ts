// TODO: move this to DB and associate voices to subscriptions/roles
export const AVAILABLE_VOICES = [
  // speach01@pontocomaudio.net
  'sA08OlI57z554552XXjX',
  's1jU0O6YsnX1rolenQ2A',
  'o3RJix088ugyZcwwYM3N',
  'dzwZCZVXlnr9CsVCIDsz',
  'XfKngIgwgvmeM3CPDKZm',
  'WxzWnZq1LFVJBtbkvxuS',
  'VYjSVzm8dqAhsudH9epS',
  'SlOJVCxFKpxIw2B2UyRv',
  'LsVvY9nciBQgPDgtIDCN',
  'KdaOahi28ASmMR2OV0np',
  'BXuxFdLk9EZEGNyspghL',
  'AUT94XCm70ITqw7T2XEB',
  '78kCnUrLe93dge5r4WLz',
  '70v6Tw9xxKlAxwX6exJX',
  '3M0mGfcPpXDcCvaGMB09',
  // speach02@pontocomaudio.net
  'GEAOOSvHHcqfphelQWrc',
  'HLqJ0A0lvE7wQKabLTqf',
  'MRN0BwIfP7DMNzXRUvtn',
  '99jlxGHWKu178be7axXQ',
  'L4eFA4NZRZXOOBXQfena',
  'WtKRL8Y8Bh4oqaRLowky',
  'GxGTGX8HJYUj0OxfOpiC',
  'ibL9zzF9gQFzuauNevpB',
  'Gw64dPxOgEIUn9ZPgPK9',
  'qPMn31xkY1PQayr5n5N1',
  '6yb1kH65UbAHssTo7e0z',
  'tnhVCnroNZuLZa8PMbdS',
  'vnbpfDufGMDPGeF7Xy88',
  'uqhlwkQJuX6NA1Vox5KN',
  'e3E7F7MSXzL91fyczk2S',
]

export const PERSONAL_VOICES = {
  'kseteimagerMKT@gmail.com': [
    // speach01@pontocomaudio.net
    '1nu83aLfBdCSeBijsrqx',
    // speach02@pontocomaudio.net
    'ch5ObWzLcwFNv7hTKjvb',
  ],
  'ronibage@gmail.com': [
    // speach01@pontocomaudio.net
    'TSXt20a5VzGITXSg9P9w',
    'Id8EJ0S5cTNlkQtT6PFH',
    // speach02@pontocomaudio.net
    'xtfncMXhicwOj7VeKHGD',
    'g454sDXrbK3uZd1Zf7xC',
    'nfxPSYrZs2ChEdKljcX8',
    'eOuRsVMWfGIZ8JqVgBrl',
  ],
  'tsantos@redegzeta.com.br': [
    // speach02@pontocomaudio.net
    'RW8bhMYNUNiU7FmQOGEu',
    'q53FNWaXSIyNftWD7AYg',
  ],
} as Record<string, string[]>

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
