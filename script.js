const mergeBtn = document.getElementById('mergeBtn')
const pdfInput = document.getElementById('pdfInput')
const fileList = document.getElementById('fileList')
const statusText = document.getElementById('status')

pdfInput.addEventListener('change', () => {
  fileList.innerHTML = ''

  for (const file of pdfInput.files) {
    if (file.type !== 'application/pdf') {
      statusText.textContent = 'Somente arquivos PDF são permitidos.'
      pdfInput.value = ''
      fileList.innerHTML = ''
      return
    }

    const li = document.createElement('li')
    li.textContent = file.name

    fileList.appendChild(li)
  }

  statusText.textContent = ''
})

mergeBtn.addEventListener('click', async () => {
  const files = pdfInput.files

  if (!files.length) {
    statusText.textContent = 'Selecione pelo menos um PDF.'
    return
  }

  try {
    mergeBtn.disabled = true
    statusText.textContent = 'Juntando PDFs...'

    const mergedPdf = await PDFLib.PDFDocument.create()

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()

      const pdf = await PDFLib.PDFDocument.load(arrayBuffer)

      const pages = await mergedPdf.copyPages(
        pdf,
        pdf.getPageIndices()
      )

      pages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }

    const mergedPdfBytes = await mergedPdf.save()

    const blob = new Blob([mergedPdfBytes], {
      type: 'application/pdf'
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'pdf-unido.pdf'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)

    statusText.textContent = 'PDF criado com sucesso!'

  } catch (error) {
    console.error(error)
    statusText.textContent = 'Erro ao juntar PDFs.'
  } finally {
    mergeBtn.disabled = false
  }
})