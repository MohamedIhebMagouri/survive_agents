import PDFDocument from 'pdfkit'

const TOTAL_PAGES = 30
const BLUE = '#082b70'
const TEXT = '#222222'
const MUTED = '#666c76'
const LIGHT = '#eef3fa'
const BORDER = '#aab6c8'

const DEFAULT_BRAND = { companyName: 'Survive', primaryColor: BLUE, accentColor: '#006b5f', logoUrl: null }
const KNOWN_BRANDS = { delice: { companyName: 'Délice Holding', primaryColor: '#172a88', accentColor: '#78b82a' } }
const IMPACT_LABELS = {
  financier: 'Financier', operationnel: 'Opérationnel', reglementaire: 'Réglementaire',
  reputationnel: 'Réputationnel', client: 'Client', securite: 'Santé / Sécurité', environnemental: 'Environnemental',
}
const RESOURCE_LABELS = {
  humaines: 'Ressources humaines', applications: 'Applications', serveurs: 'Serveurs', bases_donnees: 'Bases de données',
  batiments: 'Bâtiments / locaux', fournisseurs: 'Fournisseurs', equipements: 'Équipements', documents: 'Documents critiques',
}
const TOC_PAGES = [4, 4, 6, 6, 6, 7, 8, 9, 16, 17, 18, 19, 21, 22, 23, 24, 25, 30]

function normalizeKey(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function configuredBrands() {
  try { return JSON.parse(process.env.BIA_BRANDS_JSON || '{}') } catch { return {} }
}

export function resolveReportBrand(factory) {
  const keys = [factory?.code, factory?.name].map(normalizeKey).filter(Boolean)
  const configured = configuredBrands()
  const configuredEntry = Object.entries(configured).find(([key]) => keys.some((candidate) => candidate.includes(normalizeKey(key))))?.[1]
  const knownEntry = Object.entries(KNOWN_BRANDS).find(([key]) => keys.some((candidate) => candidate.includes(key)))?.[1]
  return { ...DEFAULT_BRAND, ...knownEntry, ...configuredEntry }
}

async function loadLogo(url) {
  if (!url || !/^https:\/\//i.test(url)) return null
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
    const type = response.headers.get('content-type') || ''
    const length = Number(response.headers.get('content-length') || 0)
    if (!response.ok || !type.startsWith('image/') || length > 2_000_000) return null
    const buffer = Buffer.from(await response.arrayBuffer())
    return buffer.length <= 2_000_000 ? buffer : null
  } catch { return null }
}

function present(value, fallback = 'Information non renseignée') {
  if (value === true) return 'Oui'
  if (value === false) return 'Non'
  if (Array.isArray(value)) return value.length ? value.map((item) => present(item, '')).filter(Boolean).join(', ') : fallback
  if (value && typeof value === 'object') return Object.values(value).filter((item) => typeof item !== 'object').map((item) => present(item, '')).filter(Boolean).join(' - ') || fallback
  const text = String(value ?? '').trim()
  return text || fallback
}

function clip(value, length = 520) {
  const text = present(value)
  return text.length > length ? `${text.slice(0, length - 1).trim()}…` : text
}

function list(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => present(item))
  if (value && typeof value === 'object') return Object.values(value).flatMap((item) => list(item)).filter(Boolean)
  const text = String(value ?? '').trim()
  return text ? text.split(/\r?\n|\s*;\s*/).map((item) => item.trim()).filter(Boolean) : []
}

function sectionText(report, index, fallback) {
  const section = report.sections?.[index]
  const paragraphs = [section?.introduction, ...(section?.paragraphs || [])].filter(Boolean)
  return clip(paragraphs.join('\n\n') || fallback, 1150)
}

function drawHeader(doc, brand, context, logo, pageNumber) {
  const x = 54; const y = 32; const width = doc.page.width - 108; const height = 62
  doc.save().lineWidth(0.7).strokeColor('#707070').rect(x, y, width, height).stroke()
  doc.moveTo(x + 124, y).lineTo(x + 124, y + height).stroke()
  doc.moveTo(x + width - 104, y).lineTo(x + width - 104, y + height).stroke()
  doc.moveTo(x + width - 104, y + 21).lineTo(x + width, y + 21).stroke()
  doc.moveTo(x + width - 104, y + 42).lineTo(x + width, y + 42).stroke()
  if (logo) {
    try { doc.image(logo, x + 8, y + 8, { fit: [108, 46], align: 'center', valign: 'center' }) } catch { /* text fallback below */ }
  }
  if (!logo) doc.fillColor(brand.primaryColor).font('Helvetica-Bold').fontSize(13).text(brand.companyName, x + 7, y + 23, { width: 110, align: 'center', height: 18, ellipsis: true })
  doc.fillColor(brand.primaryColor).font('Helvetica-Oblique').fontSize(9.2)
    .text(`Rapport d'analyse d'impact - SBC - Processus ${context.process.name}`, x + 131, y + 23, { width: width - 242, align: 'center', height: 24, ellipsis: true })
  doc.font('Helvetica-Bold').fontSize(8.5)
    .text(`Réf : ${context.reference}`, x + width - 99, y + 6, { width: 94, height: 13, ellipsis: true })
    .text(`D.M.J. : ${context.bia.date}`, x + width - 99, y + 27, { width: 94, height: 13, ellipsis: true })
    .text(`Page  ${pageNumber}  sur ${TOTAL_PAGES}`, x + width - 99, y + 48, { width: 94, height: 13 })
  doc.restore()
}

function drawFooter(doc, pageNumber) {
  doc.save().fillColor('#111111').font('Helvetica-Bold').fontSize(9).text(String(pageNumber), 54, 802, { width: doc.page.width - 108, align: 'center', lineBreak: false }).restore()
}

function pageTitle(doc, title, number) {
  const label = number ? `${number}. ${title}` : title
  const fontSize = label.length > 70 ? 11.8 : label.length > 54 ? 13.2 : 15.5
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(fontSize).text(label, 54, 112, { width: doc.page.width - 108, height: 28, ellipsis: true })
  doc.moveTo(54, 140).lineTo(doc.page.width - 54, 140).lineWidth(1.3).strokeColor(BLUE).stroke()
}

function subTitle(doc, title, x = 54, y = doc.y, width = doc.page.width - 108) {
  doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(11).text(title, x, y, { width, height: 22, ellipsis: true })
}

function paragraph(doc, text, x, y, width, height, options = {}) {
  doc.fillColor(options.color || TEXT).font(options.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(options.size || 9.3)
    .text(clip(text, options.maxLength || 1200), x, y, { width, height, align: options.align || 'justify', lineGap: options.lineGap || 1.6, ellipsis: true })
}

function bulletList(doc, items, x, y, width, height, color = TEXT) {
  const values = items?.length ? items : ['Information non renseignée']
  let currentY = y
  for (const item of values.slice(0, 8)) {
    const rowHeight = Math.min(44, Math.max(19, doc.heightOfString(clip(item, 240), { width: width - 20, lineGap: 1 })))
    if (currentY + rowHeight > y + height) break
    doc.fillColor(color).font('Helvetica-Bold').fontSize(10).text('-', x, currentY, { width: 12 })
    doc.fillColor(TEXT).font('Helvetica').fontSize(9).text(clip(item, 240), x + 16, currentY, { width: width - 16, height: rowHeight, ellipsis: true, lineGap: 1 })
    currentY += rowHeight + 4
  }
}

function drawTable(doc, { x = 54, y, widths, headers, rows, rowHeight = 34, fontSize = 8.2, headerColor = BLUE }) {
  const totalWidth = widths.reduce((sum, width) => sum + width, 0)
  doc.save().rect(x, y, totalWidth, 24).fill(headerColor)
  let cursorX = x
  headers.forEach((header, index) => {
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(fontSize).text(header, cursorX + 5, y + 6, { width: widths[index] - 10, height: 15, align: 'center', ellipsis: true })
    cursorX += widths[index]
  })
  let cursorY = y + 24
  rows.forEach((row, rowIndex) => {
    if (rowIndex % 2) doc.rect(x, cursorY, totalWidth, rowHeight).fill('#f6f8fb')
    cursorX = x
    row.forEach((cell, index) => {
      doc.rect(cursorX, cursorY, widths[index], rowHeight).lineWidth(0.45).strokeColor(BORDER).stroke()
      doc.fillColor(TEXT).font(index === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize)
        .text(clip(cell, 230), cursorX + 5, cursorY + 5, { width: widths[index] - 10, height: rowHeight - 8, ellipsis: true, lineGap: 0.5 })
      cursorX += widths[index]
    })
    cursorY += rowHeight
  })
  doc.restore()
  return cursorY
}

function metricCard(doc, label, value, x, y, width, brand) {
  doc.save().roundedRect(x, y, width, 62, 4).fillAndStroke('#f2f5fa', brand.primaryColor)
  doc.fillColor(brand.primaryColor).font('Helvetica-Bold').fontSize(16).text(present(value), x + 8, y + 11, { width: width - 16, height: 22, align: 'center', ellipsis: true })
  doc.fillColor(MUTED).fontSize(8).text(label, x + 6, y + 39, { width: width - 12, height: 15, align: 'center', ellipsis: true }).restore()
}

function drawImpactBars(doc, scores, y, brand) {
  const entries = Object.entries(IMPACT_LABELS)
  entries.forEach(([key, label], index) => {
    const score = Math.max(0, Math.min(100, Number(scores?.[key] || 0)))
    const rowY = y + index * 52
    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(9).text(label, 70, rowY, { width: 135, height: 14 })
    doc.roundedRect(210, rowY, 300, 15, 4).fill('#e3e8ef')
    if (score) doc.roundedRect(210, rowY, score * 3, 15, 4).fill(score >= 80 ? '#c62828' : score >= 60 ? '#ef6c00' : brand.primaryColor)
    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(8.5).text(`${score}/100`, 515, rowY + 2, { width: 40, align: 'right' })
  })
}

function drawContinuityCycle(doc, brand) {
  const colors = ['#ababab', '#f57c22', '#e60000', '#ffc20a']
  const labels = ['Identifier les produits critiques', 'Déterminer la tolérance aux perturbations', 'Identifier les ressources clés', 'Développer la résilience des ressources']
  labels.forEach((label, index) => {
    const x = 67 + (index % 2) * 255
    const y = 190 + Math.floor(index / 2) * 150
    doc.roundedRect(x, y, 205, 49, 3).fill(colors[index])
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text(label, x + 10, y + 12, { width: 185, height: 30, align: 'center', ellipsis: true })
    const cx = x + 102; const arrowY = y + 72
    doc.circle(cx, arrowY, 22).fill(colors[index])
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12).text(String(index + 1), cx - 10, arrowY - 6, { width: 20, align: 'center' })
    if (index < 3) doc.moveTo(cx + 25, arrowY).lineTo(cx + 126, arrowY).lineWidth(10).strokeColor(colors[index]).stroke()
  })
  doc.circle(297, 562, 95).lineWidth(34).strokeColor(brand.primaryColor).stroke()
  const pillars = ['Système IT', 'Locaux', 'Personnel', 'Documentation', 'Équipement', 'Compétences']
  pillars.forEach((label, index) => {
    const angle = (-90 + index * 60) * Math.PI / 180
    const x = 297 + Math.cos(angle) * 130
    const y = 562 + Math.sin(angle) * 130
    doc.circle(x, y, 25).fill(index % 2 ? brand.accentColor : brand.primaryColor)
    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(8).text(label, x - 48, y + (Math.sin(angle) > 0 ? 31 : -43), { width: 96, align: 'center', height: 25, ellipsis: true })
  })
  doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(13).text('Les six piliers\nde résilience', 230, 542, { width: 134, align: 'center', lineGap: 5 })
}

function impactRows(context) {
  return Object.entries(IMPACT_LABELS).map(([key, label]) => [label, `${Number(context.bia.impactScores?.[key] || 0)}/100`, key === 'financier' ? context.process.financialImpact || context.bia.consequences : key === 'operationnel' ? context.process.operationalImpact || context.process.impact : key === 'reputationnel' ? context.process.reputationImpact : 'Voir analyse et justificatifs BIA'])
}

function activityRows(context) {
  const source = context.process.activitesCritiques
  const activities = Array.isArray(source) ? source : Array.isArray(source?.activities) ? source.activities : []
  if (!activities.length) return [[context.bia.minimalActivities || context.process.mainFunctionality, context.bia.rto, context.bia.mtpd, context.bia.mbco]]
  return activities.slice(0, 8).map((item) => [item.name || item.activity || present(item), item.rto || context.bia.rto, item.mtpd || context.bia.mtpd, item.mbco || context.bia.mbco])
}

function pageContent(doc, page, report, context, brand) {
  const process = context.process; const bia = context.bia; const factory = context.factory || {}
  const dependencies = bia.dependencies || {}
  if (page === 2) {
    pageTitle(doc, 'Historique des modifications')
    paragraph(doc, "Ce tableau retrace les versions du rapport et les validations associées. Toute évolution du périmètre, des objectifs de reprise ou des ressources critiques doit donner lieu à une nouvelle version.", 54, 154, 487, 62)
    drawTable(doc, { y: 230, widths: [70, 90, 120, 207], headers: ['Version', 'Date', 'Auteur', 'Nature de la modification'], rows: [[bia.version || '1.0', bia.date, bia.analyst, 'Émission du rapport BIA'], ['-', '-', '-', 'Révision ultérieure']], rowHeight: 48 })
    subTitle(doc, 'Diffusion et confidentialité', 54, 375)
    paragraph(doc, "Document interne destiné au responsable du processus, au coordinateur de continuité d'activité et aux parties chargées de valider les mesures de reprise.", 54, 402, 487, 90)
    return
  }
  if (page === 3) {
    pageTitle(doc, 'Table des matières')
    let y = 154
    report.sections.forEach((section, index) => {
      doc.fillColor(TEXT).font('Helvetica').fontSize(9).text(`${index + 1}. ${section.title}`, 62, y, { width: 420, height: 17, ellipsis: true })
      doc.fillColor(BLUE).font('Helvetica-Bold').text(String(TOC_PAGES[index]), 500, y, { width: 30, align: 'right' })
      doc.moveTo(62, y + 15).lineTo(530, y + 15).lineWidth(0.3).dash(1, { space: 2 }).strokeColor('#b8bdc7').stroke().undash()
      y += 31
    })
    return
  }
  if (page === 4) {
    pageTitle(doc, 'Introduction', 1)
    const introduction = `La présente analyse d'impact concerne le processus ${present(process.name)} de ${present(factory.name || brand.companyName)}. Elle s'inscrit dans la démarche de continuité d'activité et consolide les informations validées dans la fiche processus et le questionnaire BIA.\n\n${sectionText(report, 0, "L'analyse identifie les activités critiques, les conséquences d'une interruption, les dépendances et les ressources indispensables à la reprise.")}`
    paragraph(doc, introduction, 54, 153, 487, 165)
    bulletList(doc, [
      'Identifier les activités critiques associées au processus.',
      'Évaluer les impacts opérationnels, financiers, réglementaires et réputationnels.',
      'Déterminer les seuils de tolérance RTO, RPO, MTPD et MBCO.',
      'Recenser les ressources, dépendances internes et prestations externes nécessaires.',
      'Mettre en évidence les écarts entre les besoins de reprise et les capacités déclarées.',
    ], 70, 325, 455, 190)
    subTitle(doc, '2. Mise en oeuvre de la continuité des activités', 54, 540)
    const implementation = `Le cycle de continuité relie les produits et services prioritaires aux activités qui les soutiennent, puis aux ressources requises au bon moment. ${sectionText(report, 1, "Les résultats de cette analyse servent à choisir les stratégies, mettre à jour les plans de réponse et préparer les exercices de continuité.")}`
    paragraph(doc, implementation, 54, 570, 487, 165)
    return
  }
  if (page === 5) {
    pageTitle(doc, 'Mise en oeuvre de la continuité des activités', 2)
    drawContinuityCycle(doc, brand)
    return
  }
  if (page === 6) {
    pageTitle(doc, 'Détermination des exigences et des lacunes en matière de récupération', 3)
    paragraph(doc, sectionText(report, 2, "Les écarts sont appréciés entre les objectifs requis et les capacités de reprise actuellement déclarées."), 54, 150, 487, 74)
    subTitle(doc, '4. Terminologie utilisée', 54, 230)
    drawTable(doc, { y: 254, widths: [74, 292, 121], headers: ['Terme', 'Définition', 'Valeur'], rows: [['RTO', "Délai maximal de rétablissement", bia.rto], ['MTPD', 'Durée maximale de perturbation tolérable', bia.mtpd], ['MBCO', 'Niveau minimal de service pendant la perturbation', bia.mbco], ['RPO', 'Perte de données maximale acceptable', bia.rpo]], rowHeight: 38 })
    subTitle(doc, '5. Informations générales sur le processus', 54, 445)
    drawTable(doc, { y: 469, widths: [230, 257], headers: ['Élément', 'Information à renseigner'], rows: [['Nom du processus', process.name], ['Département / Unité opérationnelle', process.department], ['Responsable du processus', process.owner], ['Fonction / rôle', process.ownerRole], ['Téléphone professionnel', process.ownerPhone], ['Email professionnel', process.ownerEmail], ['Localisation du processus', process.location]], rowHeight: 34 })
    return
  }
  if (page === 7) {
    pageTitle(doc, 'Priorités de rétablissement organisationnel', 6)
    paragraph(doc, sectionText(report, 5, "Les priorités ci-dessous traduisent les seuils de continuité validés dans le BIA."), 54, 153, 487, 80)
    ;[['RTO', bia.rto], ['RPO', bia.rpo], ['MTPD', bia.mtpd], ['MBCO', bia.mbco]].forEach(([label, value], index) => metricCard(doc, label, value, 54 + index * 124, 250, 112, brand))
    subTitle(doc, 'Lecture chronologique', 54, 345)
    const timeline = [['Incident', 'Déclenchement'], [`RPO ${present(bia.rpo)}`, 'Point de données'], [`RTO ${present(bia.rto)}`, 'Reprise visée'], [`MTPD ${present(bia.mtpd)}`, 'Limite tolérable']]
    timeline.forEach(([top, bottom], index) => {
      const x = 75 + index * 140
      if (index < 3) doc.moveTo(x + 20, 435).lineTo(x + 140, 435).lineWidth(4).strokeColor(brand.primaryColor).stroke()
      doc.circle(x, 435, 18).fill(brand.primaryColor)
      doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(9).text(top, x - 48, 385, { width: 96, align: 'center', height: 30, ellipsis: true })
      doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(bottom, x - 48, 463, { width: 96, align: 'center' })
    })
    subTitle(doc, 'Activité minimale à maintenir', 54, 535)
    paragraph(doc, bia.minimalActivities, 54, 563, 487, 92, { bold: true, size: 10 })
    paragraph(doc, `Niveau minimal déclaré : ${present(bia.minimalLevel || bia.mbco)}. Score global de continuité : ${present(bia.globalScore)}/100.`, 54, 670, 487, 50)
    return
  }
  if (page === 8) {
    pageTitle(doc, 'Analyse du processus', 7)
    paragraph(doc, sectionText(report, 6, process.description), 54, 153, 487, 125)
    drawTable(doc, { y: 295, widths: [184, 303], headers: ['Axe', 'Information validée'], rows: [['Finalité principale', process.mainFunctionality || process.description], ['Produit / service soutenu', process.productDependencies], ['Périodes critiques', process.criticalTimes], ['Impact déclaré', process.impact], ['Capacité opérationnelle', process.operationalCapacityImpact], ['Criticité', process.criticality]], rowHeight: 52 })
    subTitle(doc, 'Constats de l’analyse', 54, 650)
    bulletList(doc, report.sections[6]?.findings, 54, 677, 487, 75)
    return
  }
  if (page === 9) {
    pageTitle(doc, 'Analyse des activités - synthèse des impacts', 8)
    paragraph(doc, sectionText(report, 7, "Les scores d'impact permettent de comparer les conséquences d'une interruption selon sept dimensions."), 54, 153, 487, 80)
    drawImpactBars(doc, bia.impactScores, 260, brand)
    return
  }
  if (page === 10) {
    pageTitle(doc, 'Analyse des activités - impacts financiers et opérationnels', 8)
    drawTable(doc, { y: 160, widths: [116, 74, 297], headers: ['Dimension', 'Score', 'Justification'], rows: impactRows(context).slice(0, 2), rowHeight: 92 })
    subTitle(doc, 'Conséquences déclarées', 54, 385)
    paragraph(doc, bia.consequences, 54, 414, 487, 130)
    subTitle(doc, 'Mesures existantes', 54, 570)
    paragraph(doc, bia.existingMeasures, 54, 599, 487, 130)
    return
  }
  if (page === 11) {
    pageTitle(doc, 'Analyse des activités - conformité et réputation', 8)
    drawTable(doc, { y: 160, widths: [116, 74, 297], headers: ['Dimension', 'Score', 'Justification'], rows: impactRows(context).slice(2, 4), rowHeight: 92 })
    subTitle(doc, 'Cadre de preuve', 54, 385)
    paragraph(doc, "Les scores doivent être confirmés par des éléments observables : obligations applicables, engagements contractuels, historique d'incidents, plaintes ou pertes mesurées. Une absence de justificatif est signalée comme information non renseignée et non comme une absence d'impact.", 54, 414, 487, 125)
    subTitle(doc, 'Incidents antérieurs', 54, 570)
    paragraph(doc, process.previousIncidents, 54, 599, 487, 120)
    return
  }
  if (page === 12) {
    pageTitle(doc, 'Analyse des activités - clients, sécurité et environnement', 8)
    drawTable(doc, { y: 160, widths: [116, 74, 297], headers: ['Dimension', 'Score', 'Justification'], rows: impactRows(context).slice(4), rowHeight: 82 })
    subTitle(doc, 'Appréciation', 54, 455)
    paragraph(doc, "Les niveaux présentés proviennent exclusivement du questionnaire BIA. Ils doivent être relus avec les responsables concernés lorsque l'interruption peut affecter les clients, les personnes ou l'environnement.", 54, 484, 487, 105)
    bulletList(doc, report.sections[7]?.findings, 54, 610, 487, 120, brand.primaryColor)
    return
  }
  if (page === 13) {
    pageTitle(doc, 'Analyse des activités - inventaire', 8)
    drawTable(doc, { y: 160, widths: [245, 70, 82, 90], headers: ['Activité critique', 'RTO', 'MTPD', 'MBCO'], rows: activityRows(context), rowHeight: 52 })
    subTitle(doc, 'Règle de priorisation', 54, 625)
    paragraph(doc, "Une activité est prioritaire lorsqu'elle contribue au service minimal, atteint rapidement un seuil d'impact inacceptable ou conditionne la reprise d'autres activités. Les valeurs non renseignées restent à valider avec le propriétaire du processus.", 54, 654, 487, 100)
    return
  }
  if (page === 14) {
    pageTitle(doc, 'Analyse des activités - séquence de reprise', 8)
    const activities = activityRows(context)
    activities.slice(0, 6).forEach((row, index) => {
      const y = 170 + index * 84
      doc.circle(82, y + 22, 20).fill(brand.primaryColor)
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(String(index + 1), 72, y + 16, { width: 20, align: 'center' })
      doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(10).text(row[0], 120, y, { width: 375, height: 30, ellipsis: true })
      doc.fillColor(MUTED).font('Helvetica').fontSize(8.5).text(`RTO : ${present(row[1])}  |  MTPD : ${present(row[2])}  |  MBCO : ${present(row[3])}`, 120, y + 34, { width: 375 })
      if (index < Math.min(activities.length, 6) - 1) doc.moveTo(82, y + 43).lineTo(82, y + 82).lineWidth(3).strokeColor(brand.accentColor).stroke()
    })
    return
  }
  if (page === 15) {
    pageTitle(doc, 'Analyse des activités - fonctionnement en mode dégradé', 8)
    subTitle(doc, 'Service minimal attendu', 54, 165)
    paragraph(doc, bia.minimalActivities, 54, 195, 487, 125, { bold: true, size: 10.5 })
    metricCard(doc, 'Niveau minimal', bia.minimalLevel ? `${bia.minimalLevel}%` : bia.mbco, 54, 345, 145, brand)
    metricCard(doc, 'Objectif MBCO', bia.mbco, 225, 345, 145, brand)
    metricCard(doc, 'RTO du processus', bia.rto, 396, 345, 145, brand)
    subTitle(doc, 'Solutions de contournement', 54, 445)
    paragraph(doc, process.workarounds, 54, 475, 487, 115)
    subTitle(doc, 'Recommandations associées', 54, 620)
    bulletList(doc, report.sections[7]?.recommendations, 54, 648, 487, 105, brand.accentColor)
    return
  }
  if (page === 16) {
    pageTitle(doc, 'Périmètre et dépendances', 9)
    paragraph(doc, sectionText(report, 8, "Le périmètre couvre les dépendances nécessaires au maintien et à la reprise du processus."), 54, 153, 487, 80)
    drawTable(doc, { y: 250, widths: [150, 337], headers: ['Type de dépendance', 'Éléments identifiés'], rows: [['Produits / services', process.productDependencies], ['Interservices', list(dependencies.internes).concat(list(process.interServiceDependencies))], ['Externes', dependencies.externes], ['Fournisseurs', dependencies.fournisseurs], ['Partenaires', dependencies.partenaires]], rowHeight: 64 })
    return
  }
  if (page === 17) {
    pageTitle(doc, 'Activités externalisées', 10)
    paragraph(doc, sectionText(report, 9, "Cette section recense les prestations externes dont dépend la continuité du processus."), 54, 153, 487, 80)
    drawTable(doc, { y: 250, widths: [190, 297], headers: ['Élément', 'Information'], rows: [['Fournisseurs externes', process.externalSuppliers || dependencies.fournisseurs], ['Tâches confiées', process.supplierTasks], ['Contact fournisseur', process.supplierContact], ['Plan de continuité fournisseur', process.supplierContinuityPlan], ['Clause SLA', process.hasSLAClause], ['RTO fournisseur', process.supplierRTO], ['MTPD fournisseur', process.supplierMTPD]], rowHeight: 54 })
    return
  }
  if (page === 18) {
    pageTitle(doc, 'Cadre légal et réglementaire', 11)
    paragraph(doc, sectionText(report, 10, "Les obligations déclarées sont reproduites sans présumer d'une conformité automatique."), 54, 153, 487, 80)
    drawTable(doc, { y: 250, widths: [176, 311], headers: ['Élément', 'Information vérifiable'], rows: [['Obligations légales', process.legalObligations], ['Références', process.legalReferences], ['Autorité compétente', process.legalAuthority], ['Détails / exigences', process.legalDetails], ['Conséquences de non-conformité', process.nonComplianceConsequences]], rowHeight: 72 })
    return
  }
  if (page === 19) {
    pageTitle(doc, 'MES et applications IT', 12)
    paragraph(doc, sectionText(report, 11, "Les systèmes sont analysés selon leur contribution aux activités critiques et leurs objectifs techniques de reprise."), 54, 153, 487, 80)
    drawTable(doc, { y: 250, widths: [176, 311], headers: ['Élément', 'Information'], rows: [['Systèmes / applications', process.itSystems || list(bia.resources).filter((key) => ['applications', 'serveurs', 'bases_donnees'].includes(key)).map((key) => RESOURCE_LABELS[key])], ['Criticité système', process.systemCriticality], ['Impact d’indisponibilité', process.systemImpact], ['Activités supportées', process.supportedActivities], ['Systèmes de secours', process.hasBackupSystems], ['Solutions de contournement', process.workarounds]], rowHeight: 61 })
    return
  }
  if (page === 20) {
    pageTitle(doc, 'MES et applications IT - objectifs de reprise', 12)
    ;[['RTO système', process.systemRTO == null ? bia.rto : `${process.systemRTO}h`], ['RPO système', process.systemRPO == null ? bia.rpo : `${process.systemRPO}h`], ['MTPD système', process.systemMTPD == null ? bia.mtpd : `${process.systemMTPD}h`]].forEach(([label, value], index) => metricCard(doc, label, value, 75 + index * 165, 185, 140, brand))
    subTitle(doc, 'Cohérence avec les objectifs métier', 54, 290)
    paragraph(doc, "Les objectifs techniques doivent permettre d'atteindre le RTO et le RPO du processus. Toute valeur technique supérieure à la tolérance métier constitue un écart de reprise à traiter.", 54, 320, 487, 105)
    subTitle(doc, 'Dispositifs et constats', 54, 455)
    bulletList(doc, [...list(bia.existingMeasures), ...(report.sections[11]?.findings || [])], 54, 485, 487, 210, brand.primaryColor)
    return
  }
  if (page === 21) {
    pageTitle(doc, 'Infrastructure', 13)
    paragraph(doc, sectionText(report, 12, "Les infrastructures sont recensées en fonction des ressources sélectionnées et du lieu d'exécution du processus."), 54, 153, 487, 80)
    const resources = list(bia.resources).map((key) => RESOURCE_LABELS[key] || key)
    drawTable(doc, { y: 250, widths: [176, 311], headers: ['Catégorie', 'Information'], rows: [['Site principal', factory.name || process.location], ['Localisation', process.location || factory.location], ['Bâtiments / locaux', resources.filter((item) => /Bâtiment|locaux/i.test(item))], ['Équipements industriels', resources.filter((item) => /Équipement/i.test(item))], ['Énergie / utilités', 'Information non renseignée'], ['Site de repli', list(bia.existingMeasures).find((item) => /site|repli|secours/i.test(item))]], rowHeight: 62 })
    return
  }
  if (page === 22) {
    pageTitle(doc, 'Analyse des compétences et des rôles', 14)
    paragraph(doc, sectionText(report, 13, "L'analyse identifie les responsables, les suppléances et les compétences indispensables à la reprise."), 54, 153, 487, 80)
    const interim = list(process.interimManagers)
    drawTable(doc, { y: 250, widths: [176, 311], headers: ['Rôle / compétence', 'Personne ou information'], rows: [['Responsable du processus', process.owner], ['Fonction', process.ownerRole], ['Contact', [process.ownerPhone, process.ownerEmail].filter(Boolean)], ['Suppléant(s)', interim], ['Effectif minimal', bia.minimalLevel ? `${bia.minimalLevel}% de la capacité nominale` : bia.mbco], ['Compétences critiques', list(bia.resources).includes('humaines') ? 'Ressources humaines déclarées critiques' : 'Information non renseignée']], rowHeight: 62 })
    return
  }
  if (page === 23) {
    pageTitle(doc, 'Analyse des équipements bureautiques', 15)
    paragraph(doc, sectionText(report, 14, "Les équipements nécessaires doivent être disponibles au moment de la reprise, y compris en mode dégradé."), 54, 153, 487, 80)
    const selected = list(bia.resources).map((key) => RESOURCE_LABELS[key] || key)
    drawTable(doc, { y: 250, widths: [190, 91, 206], headers: ['Équipement / ressource', 'Criticité', 'Observation'], rows: [['Postes de travail', selected.includes('Équipements') ? 'Critique' : 'À évaluer', 'Quantité et configuration à confirmer'], ['Téléphonie', 'À évaluer', process.ownerPhone ? 'Contact professionnel déclaré' : 'Information non renseignée'], ['Impression / numérisation', 'À évaluer', 'Information non renseignée'], ['Accès réseau', selected.some((item) => /Application|Serveur|données/i.test(item)) ? 'Critique' : 'À évaluer', process.itSystems], ['Équipements spécifiques', selected.filter((item) => /Équipement/i.test(item)), process.mainFunctionality]], rowHeight: 70 })
    return
  }
  if (page === 24) {
    pageTitle(doc, 'Analyse de la documentation', 16)
    paragraph(doc, sectionText(report, 15, "La documentation de continuité doit rester accessible, à jour et exploitable même lorsque le système principal est indisponible."), 54, 153, 487, 80)
    const docCritical = list(bia.resources).includes('documents')
    drawTable(doc, { y: 250, widths: [190, 91, 206], headers: ['Document', 'Disponibilité', 'Observation'], rows: [['Procédure du processus', 'À confirmer', process.description], ['Plan de continuité', docCritical ? 'Critique' : 'À évaluer', bia.existingMeasures], ['Annuaire de crise', 'À confirmer', process.supplierContact], ['Contrats / SLA', process.hasSLAClause ? 'Déclaré' : 'À confirmer', process.legalReferences], ['Consignes de contournement', process.workarounds ? 'Déclaré' : 'À compléter', process.workarounds]], rowHeight: 70 })
    return
  }
  if (page === 25) {
    pageTitle(doc, 'Prochaines étapes - mesures existantes', 17)
    paragraph(doc, sectionText(report, 16, "Les étapes suivantes transforment les résultats du BIA en actions suivies et validées."), 54, 153, 487, 80)
    subTitle(doc, 'Dispositifs déjà déclarés', 54, 260)
    bulletList(doc, list(bia.existingMeasures), 54, 292, 487, 170, brand.primaryColor)
    subTitle(doc, 'Points à confirmer', 54, 500)
    bulletList(doc, report.warnings, 54, 530, 487, 190, '#a86100')
    return
  }
  if (page === 26) {
    pageTitle(doc, 'Prochaines étapes - analyse des écarts', 17)
    const warnings = report.warnings?.length ? report.warnings : ['Les informations non renseignées dans les tableaux doivent être complétées et validées.']
    drawTable(doc, { y: 160, widths: [235, 86, 166], headers: ['Écart / information manquante', 'Priorité', 'Action attendue'], rows: warnings.slice(0, 7).map((warning, index) => [warning, index < 3 ? 'Haute' : 'Moyenne', 'Compléter, justifier et faire valider']), rowHeight: 72 })
    return
  }
  if (page === 27) {
    pageTitle(doc, 'Prochaines étapes - stratégie de continuité', 17)
    paragraph(doc, "La stratégie doit couvrir les personnes, les locaux, les technologies, les fournisseurs, la documentation et les modalités de décision. Elle est retenue après comparaison avec les objectifs RTO, RPO, MTPD et MBCO.", 54, 153, 487, 100)
    const strategies = ['Maintien sur site avec mesures renforcées', 'Fonctionnement en mode dégradé', 'Bascule vers une ressource ou un site de secours', 'Recours à un fournisseur alternatif', 'Restauration des données et applications', 'Retour contrôlé à la normale']
    strategies.forEach((strategy, index) => {
      const y = 285 + index * 67
      doc.roundedRect(65, y, 466, 48, 5).fill(index % 2 ? '#f3f6fa' : LIGHT)
      doc.circle(91, y + 24, 15).fill(brand.primaryColor)
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text(String(index + 1), 82, y + 19, { width: 18, align: 'center' })
      doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(9.5).text(strategy, 120, y + 16, { width: 390, height: 24, ellipsis: true })
    })
    return
  }
  if (page === 28) {
    pageTitle(doc, 'Prochaines étapes - plan de recommandations', 17)
    const recommendations = bia.recommendations?.length ? bia.recommendations : report.sections[16]?.recommendations?.map((text) => ({ text, priority: 'À évaluer', owner: 'À désigner' })) || []
    drawTable(doc, { y: 160, widths: [245, 78, 100, 64], headers: ['Recommandation', 'Priorité', 'Responsable', 'Statut'], rows: recommendations.slice(0, 8).map((item) => [item.text || item.title || present(item), item.priority, item.owner || item.suggestedOwner, item.status || 'À lancer']), rowHeight: 68 })
    return
  }
  if (page === 29) {
    pageTitle(doc, 'Prochaines étapes - feuille de route et suivi', 17)
    const steps = [['Validation du BIA', 'Responsable du processus', 'Immédiat'], ['Complément des données manquantes', 'Contributeurs métier', 'À planifier'], ['Choix des stratégies', 'Comité de continuité', 'Après validation'], ['Mise à jour des plans', 'Pilotes PCA / PRA', 'Selon priorité'], ['Exercice et test', 'Équipes concernées', 'Périodique'], ['Revue du BIA', 'Propriétaire du document', 'Au changement ou périodiquement']]
    drawTable(doc, { y: 160, widths: [233, 154, 100], headers: ['Étape', 'Responsable pressenti', 'Échéance'], rows: steps, rowHeight: 72 })
    return
  }
  if (page === 30) {
    pageTitle(doc, 'Acceptation du document', 18)
    paragraph(doc, sectionText(report, 17, "La signature confirme que les informations ont été relues par les responsables compétents. Elle ne constitue pas à elle seule une certification de conformité."), 54, 153, 487, 90)
    drawTable(doc, { y: 270, widths: [162, 162, 163], headers: ['Rôle', 'Nom', 'Visa / date'], rows: [['Responsable du processus', process.owner, ''], ['Analyste BIA', bia.analyst, ''], ['Coordinateur continuité', 'Information non renseignée', ''], ['Direction / approbateur', 'Information non renseignée', '']], rowHeight: 82 })
    paragraph(doc, `Référence : ${context.reference}  |  Version : ${present(bia.version)}  |  Statut : ${present(bia.status)}`, 54, 670, 487, 35, { bold: true, align: 'center' })
  }
}

export async function renderBiaReportPdf(report, context, brand) {
  const logo = await loadLogo(brand.logoUrl)
  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true, bufferPages: true, info: { Title: report.documentTitle, Author: context.bia.analyst || 'BIA System', Subject: 'Business Impact Analysis' } })
  const chunks = []
  doc.on('data', (chunk) => chunks.push(chunk))
  const completion = new Promise((resolve, reject) => { doc.on('end', resolve); doc.on('error', reject) })

  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff')
  doc.rect(0, 0, 18, doc.page.height).fill(brand.primaryColor)
  doc.rect(18, 0, 6, doc.page.height).fill(brand.accentColor)
  if (logo) {
    try { doc.image(logo, 70, 65, { fit: [190, 85] }) } catch { /* wordmark below */ }
  }
  if (!logo) doc.fillColor(brand.primaryColor).font('Helvetica-Bold').fontSize(24).text(brand.companyName, 70, 88, { width: 430, height: 40, ellipsis: true })
  doc.fillColor(brand.primaryColor).font('Helvetica-Bold').fontSize(25).text(report.documentTitle, 70, 220, { width: 450, height: 100, ellipsis: true })
  doc.fillColor('#4b5563').font('Helvetica').fontSize(12).text(`Processus : ${context.process.name}`, 70, 345, { width: 440, height: 24, ellipsis: true })
  doc.text(`Entreprise / site : ${context.factory?.name || brand.companyName}`, 70, 375, { width: 440, height: 24, ellipsis: true })
  doc.text(`Version : ${present(context.bia.version)}  |  Date : ${context.bia.date}`, 70, 405)
  doc.text(`Analyste : ${context.bia.analyst || 'BIA System'}`, 70, 435)
  doc.fillColor(brand.primaryColor).font('Helvetica-Bold').fontSize(14).text('Synthèse exécutive', 70, 505)
  paragraph(doc, report.executiveSummary, 70, 540, 445, 170, { size: 9.5 })
  drawFooter(doc, 1)

  for (let page = 2; page <= TOTAL_PAGES; page += 1) {
    doc.addPage({ size: 'A4', margin: 0 })
    drawHeader(doc, brand, context, logo, page)
    drawFooter(doc, page)
    pageContent(doc, page, report, context, brand)
  }

  if (doc.bufferedPageRange().count !== TOTAL_PAGES) {
    const error = new Error(`Le rapport doit contenir exactement ${TOTAL_PAGES} pages.`)
    error.code = 'BIA_PDF_LAYOUT_ERROR'
    throw error
  }
  doc.end()
  await completion
  return Buffer.concat(chunks)
}
