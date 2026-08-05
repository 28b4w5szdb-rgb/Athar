'use client'
import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {dailyItems} from '../../data/daily'


function DailyIcon({type}:{type:'quran'|'dua'|'dhikr'|'wisdom'}){
  const common={width:24,height:24,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true}
  if(type==='quran') return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/><path d="M11 19h2"/></svg>
  if(type==='dua') return <span className="duaHandsIcon" role="img" aria-label="يدان مرفوعتان للدعاء">🤲</span>
  if(type==='dhikr') return <svg {...common}><circle cx="12" cy="4" r="1.5"/><circle cx="17" cy="6" r="1.5"/><circle cx="20" cy="11" r="1.5"/><circle cx="18" cy="16" r="1.5"/><circle cx="13" cy="19" r="1.5"/><circle cx="8" cy="17" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="7" cy="7" r="1.5"/><path d="M12 20.5v2"/><path d="M10.5 22.5h3"/></svg>
  return <svg {...common}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.9.7-1.5 1.6-1.5 2.5h-4c0-.9-.6-1.8-1.5-2.5z"/><path d="M12 2V1"/><path d="M4.9 4.9 4.2 4.2"/><path d="M19.1 4.9l.7-.7"/></svg>
}

function dayIndex(){
  const now=new Date()
  const start=new Date(now.getFullYear(),0,0)
  const diff=now.getTime()-start.getTime()
  return Math.floor(diff/86400000)%dailyItems.length
}

export default function DailyPage(){
  const [ready,setReady]=useState(false)
  const [saved,setSaved]=useState(false)
  const item=useMemo(()=>dailyItems[dayIndex()],[])
  const key=useMemo(()=>`athar-daily-${new Date().toISOString().slice(0,10)}`,[])
  useEffect(()=>{setSaved(localStorage.getItem(key)==='1');setReady(true)},[key])
  const toggle=()=>{const next=!saved;setSaved(next);if(next)localStorage.setItem(key,'1');else localStorage.removeItem(key)}
  return <main className="section"><div className="container dailyPage">
    <section className="dailyHero card"><span className="badge">ورد اليوم</span><h1>رحلة يومية هادئة</h1><p>آية ودعاء وذكر وحكمة تتجدد تلقائيًا كل يوم وتعمل دون إنترنت.</p><button className={saved?'btn dailySaved':'btn secondary'} onClick={toggle}>{saved?'✓ تم حفظ ورد اليوم':'☆ حفظ ورد اليوم'}</button></section>
    <div className="dailyGrid">
      <article className="card dailyCard"><span className="dailyIcon"><DailyIcon type="quran" /></span><h2>آية اليوم</h2><p className="dailyVerse">{item.verse.text}</p><small>{item.verse.source}</small><Link className="dailyLink" href={item.verse.href}>الانتقال إلى القرآن ←</Link></article>
      <article className="card dailyCard"><span className="dailyIcon"><DailyIcon type="dua" /></span><h2>{item.dua.title}</h2><p>{item.dua.text}</p><small>{item.dua.source}</small><Link className="dailyLink" href={item.dua.href}>قراءة الأدعية ←</Link></article>
      <article className="card dailyCard"><span className="dailyIcon"><DailyIcon type="dhikr" /></span><h2>ذكر اليوم</h2><p className="dailyDhikr">{item.dhikr.text}</p><small>العدد المقترح: {item.dhikr.target}</small><Link className="dailyLink" href="/tasbeeh">فتح المسبحة ←</Link></article>
      <article className="card dailyCard"><span className="dailyIcon"><DailyIcon type="wisdom" /></span><h2>{item.wisdom.title}</h2><p>{item.wisdom.text}</p><small>{item.wisdom.source}</small><Link className="dailyLink" href={item.wisdom.href}>فتح المكتبة ←</Link></article>
    </div>
    {ready&&<div className="notice dailyNote">يتجدد الورد يوميًا بحسب تاريخ الجهاز.</div>}
  </div></main>
}
