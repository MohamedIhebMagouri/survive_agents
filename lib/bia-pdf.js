import PDFDocument from 'pdfkit'
import { sectionTitles } from './bia/analysis-schema'

const defaults = { companyName: 'SURVIVE', logoText: 'SURVIVE', primaryColor: '#052b73', classification: 'Confidentiel', footer: 'Document confidentiel' }
const text = (value, fallback = '[à compléter]') => value === undefined || value === null || value === '' ? fallback : String(value)
const frenchDate = value => text(value, new Date().toLocaleDateString('fr-FR'))
const introductions = {
  introduction: "Cette section présente le contexte, les objectifs et les résultats attendus de la démarche d'analyse d'impact.",
  implementation: 'Cette section décrit le cycle de vie de la continuité des activités selon les bonnes pratiques BCI et ISO.',
  recoveryGaps: 'Cette section compare les capacités actuelles avec les délais de récupération requis afin de faire ressortir les écarts.',
}

export function createBiaPdf({ bia, process, factory, analysis, config = {} }) {
  const theme = { ...defaults, ...config }
  const data = analysis || bia?.analysis || { metadata: {}, process: {}, sections: {} }
  const processName = text(data.process?.name || process?.name, 'Processus')
  const entity = text(data.process?.entity || factory?.name, 'Entité')
  const date = frenchDate(data.metadata?.creationDate || bia?.date)
  const reference = text(data.metadata?.reference || bia?.reference, `BCMS-BIA-${text(bia?.id, 'DOCUMENT').slice(0, 8).toUpperCase()}`)
  const doc = new PDFDocument({ size: 'A4', margins: { top: 105, bottom: 55, left: 50, right: 50 }, bufferPages: true })
  const chunks = []; const pages = []; const sectionPage = []
  doc.on('data', chunk => chunks.push(chunk))
  const addPage = () => { doc.addPage(); pages.push(doc.page) }
  pages.push(doc.page)
  const para = value => { doc.font('Helvetica').fontSize(9.5).fillColor('#171717').text(text(value, 'Aucune information fournie.'), { align: 'justify', lineGap: 3, paragraphGap: 6 }) }
  const drawTable = rows => {
    if (!rows?.length) { doc.font('Helvetica-Oblique').fontSize(9).fillColor('#666').text('[Aucune donnée renseignée]'); return }
    const columns = [...new Set(rows.flatMap(item => Object.keys(item)))]
    const width = 495 / Math.max(1, columns.length)
    const drawRow = (values, header = false) => {
      const heights = values.map(value => doc.heightOfString(text(value, ''), { width: width - 8, font: header ? 'Helvetica-Bold' : 'Helvetica', fontSize: header ? 6.5 : 6.8 }))
      const height = Math.max(20, ...heights.map(value => value + 8))
      if (doc.y + height > 785) { addPage(); doc.y = 112; drawRow(columns, true) }
      let x = 50
      values.forEach((value, index) => { doc.rect(x, doc.y, width, height).fillAndStroke(header ? theme.primaryColor : '#ffffff', '#7c8490'); doc.font(header ? 'Helvetica-Bold' : 'Helvetica').fontSize(header ? 6.5 : 6.8).fillColor(header ? '#ffffff' : '#171717').text(text(value, ''), x + 4, doc.y + 4, { width: width - 8, height: height - 6 }); x += width })
      doc.y += height
    }
    drawRow(columns, true); rows.forEach(item => drawRow(columns.map(column => item[column])))
  }
  const drawSection = (number, key, title) => {
    if (pages.length > 1) addPage()
    sectionPage.push({ number, title, page: pages.length })
    doc.y = 112; doc.font('Helvetica-Bold').fontSize(15).fillColor(theme.primaryColor).text(`${number}. ${title}`); doc.moveDown(.6)
    const section = data.sections?.[key] || {}
    para(section.introduction || introductions[key] || `Cette section documente le processus ${processName} et ses exigences de continuité.`)
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#171717').text('Actions requises / attendues')
    ;(section.actions?.length ? section.actions : ['Compléter et valider les informations de cette section.']).forEach(action => doc.font('Helvetica').fontSize(8.5).text(`• ${text(action)}`))
    doc.moveDown(.7); drawTable(section.rows || [])
  }

  doc.y = 180; doc.font('Helvetica-Bold').fontSize(23).fillColor(theme.primaryColor).text(processName, { align: 'center' }); doc.moveDown(.8); doc.font('Helvetica-Bold').fontSize(18).fillColor('#171717').text("Rapport d'analyse d'impact (BIA)", { align: 'center' }); doc.moveDown(1.5); doc.font('Helvetica').fontSize(10).fillColor('#666').text(entity, { align: 'center' }); doc.moveDown(2)
  drawTable([{ 'Ref Document': reference }, { 'N° Version': text(data.metadata?.version || bia?.version, '1.0') }, { 'Date de création': date }, { Classification: text(data.metadata?.classification, theme.classification) }, { Propriétaire: text(data.metadata?.owner || data.process?.owner || bia?.analyst) }, { 'Validé par': text(data.metadata?.validatedBy) }])
  addPage(); doc.y = 112; doc.font('Helvetica-Bold').fontSize(15).fillColor(theme.primaryColor).text('Fiche de contrôle du document'); doc.moveDown(); drawTable([{ Titre: `Rapport d'analyse d'impact - ${processName}` }, { 'Ref Document': reference }, { Date: date }, { Etat: text(bia?.status, 'Brouillon') }, { 'Préparé par': text(data.metadata?.preparedBy || bia?.analyst) }, { 'Revu par': text(data.metadata?.reviewedBy) }]); doc.moveDown(); doc.font('Helvetica-Bold').fontSize(10).text('Liste de distribution'); drawTable((data.metadata?.distribution || []).map(value => ({ Destinataire: value }))); doc.moveDown(); doc.font('Helvetica-Bold').fontSize(10).text('Historique des modifications'); drawTable(data.metadata?.history || [])
  addPage(); doc.y = 112; doc.font('Helvetica-Bold').fontSize(17).fillColor(theme.primaryColor).text('Table des matières', { align: 'center' }); doc.moveDown(1.5); const tocPage = pages.length - 1; sectionTitles.forEach(([, title], index) => doc.font('Helvetica').fontSize(9.5).fillColor('#171717').text(`${index + 1}. ${title} ........................................`))
  sectionTitles.forEach(([key, title], index) => drawSection(index + 1, key, title))
  const total = doc.bufferedPageRange().count
  doc.switchToPage(tocPage); doc.y = 160; sectionPage.forEach(item => doc.font('Helvetica').fontSize(9.5).fillColor('#171717').text(`${item.number}. ${item.title} ........................................ ${item.page + 1}`))
  for (let index = 0; index < total; index++) { doc.switchToPage(index); drawHeader(doc, theme, processName, entity, reference, date); doc.font('Helvetica').fontSize(8).fillColor('#666').text(`${theme.footer} - ${theme.companyName}`, 50, 770); doc.text(`Page ${index + 1} sur ${total}`, 400, 770, { width: 95, align: 'right' }) }
  doc.flushPages(); doc.end(); return new Promise(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))))
}

function drawHeader(doc, theme, processName, entity, reference, date) {
  doc.save(); doc.rect(50, 30, 495, 62).strokeColor('#555').lineWidth(.7).stroke(); doc.moveTo(155, 30).lineTo(155, 92).stroke(); doc.moveTo(435, 30).lineTo(435, 92).stroke(); doc.font('Helvetica-Bold').fontSize(10).fillColor(theme.primaryColor).text(theme.logoText, 65, 48); doc.font('Helvetica').fontSize(7.5).fillColor('#171717').text(entity, 65, 64, { width: 80 }); doc.font('Helvetica-Bold').fontSize(8).text(`Rapport d'analyse d'impact - ${processName}`, 165, 50, { width: 265, align: 'center' }); doc.font('Helvetica-Bold').fontSize(7.5).text('Réf :', 444, 39); doc.font('Helvetica').text(reference, 444, 51); doc.font('Helvetica-Bold').text('D.M.J. :', 444, 66); doc.font('Helvetica').text(date, 444, 78); doc.restore()
}
