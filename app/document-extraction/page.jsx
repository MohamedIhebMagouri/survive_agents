import Link from 'next/link'
import BiaShell from '@/components/bia/BiaShell'
import DocumentExtractionForm from '@/components/DocumentExtractionForm'

export default function DocumentExtractionPage() {
  return (
    <BiaShell active="extraction" title="Extraction documentaire" subtitle="Transformez un document métier en champs structurés vérifiables." actions={<Link className="rounded-lg border border-[#c5c5d3] px-4 py-2.5 text-sm font-semibold text-[#444651]" href="/bia/processes">Retour aux processus</Link>}>
      <DocumentExtractionForm />
    </BiaShell>
  )
}
