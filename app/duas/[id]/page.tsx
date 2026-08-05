import { notFound } from 'next/navigation'
import DuaReader from '../../../components/DuaReader'
import { duas } from '../../../data/duas'

export function generateStaticParams() {
  return duas.map(dua => ({ id: dua.id }))
}

export default function DuaDetails({ params }: { params: { id: string } }) {
  const dua = duas.find(item => item.id === params.id)
  if (!dua) notFound()
  return <main className="section"><div className="container narrow"><DuaReader dua={dua} /></div></main>
}
