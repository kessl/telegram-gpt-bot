import { OpenAI } from "langchain/llms/openai"
import { AnalyzeDocumentChain, loadSummarizationChain } from "langchain/chains"
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { Telegraf } from "telegraf"
import { downloadFile } from "./utils/downloadFile"
import axios from "axios"

const summarizeParams = {
  temperature: 0,
}

export const summarize = async (fileId: string, workDir: string, bot: Telegraf, baseParams: any) => {
  const fileUrl = await bot.telegram.getFileLink(fileId)
  const params = { ...baseParams, ...summarizeParams }

  if (fileUrl.href.endsWith('.pdf')) {
    const filePath = await downloadFile(workDir, fileId, 'pdf', bot)
    const loader = new PDFLoader(filePath, {
      pdfjs: () => import("pdfjs-dist/legacy/build/pdf.js")
    })
    const docs = await loader.load()
    if (docs.length > 10) {
      return 'I can summarize PDF files with up to 10 pages.'
    }
    const model = new OpenAI(params)
    const chain = loadSummarizationChain(model)
    const result = await chain.call({
      input_documents: docs,
    })
    return result.text
  } else if (fileUrl.href.endsWith('.txt')) {
    const res = await axios.get(fileUrl.href)
    const model = new OpenAI(params)
    const combineDocsChain = loadSummarizationChain(model)
    const chain = new AnalyzeDocumentChain({
      combineDocumentsChain: combineDocsChain,
    })
    const result = await chain.call({
      input_document: res.data,
    })
    return result.text
  } else {
    return 'Sorry, I can currently only summarize PDF and TXT files.'
  }
}
