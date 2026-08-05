import { Suspense } from 'react'
import DuasClient from '../../components/DuasClient'

export default function DuasPage() {
  return (
    <Suspense fallback={<main className="section"><div className="container"><div className="card">جارٍ تحميل الأدعية والزيارات…</div></div></main>}>
      <DuasClient />
    </Suspense>
  )
}
