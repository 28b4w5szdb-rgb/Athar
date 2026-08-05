'use client'

import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {dailyItems} from '../data/daily'
import {duas} from '../data/duas'
import {surahs} from '../data/surahs'

type PrayerTimes={fajr:string;sunrise:string;dhuhr:string;maghrib:string}
type PrayerData={times:PrayerTimes;date:string}

const PRAYER_KEY='athar-prayer-times-v39-6'
const prayerLabels:{key:keyof PrayerTimes;label:string}[]=[
  {key:'fajr',label:'صلاة الصبح'},
  {key:'sunrise',label:'الشروق'},
  {key:'dhuhr',label:'صلاة الظهر'},
  {key:'maghrib',label:'صلاة المغرب'},
]

function dayIndex(){
  const now=new Date()
  const start=new Date(now.getFullYear(),0,0)
  return Math.floor((now.getTime()-start.getTime())/86400000)%dailyItems.length
}

function timeToMinutes(value:string){
  const match=value.match(/(\d+):(\d+)\s*([صم])/)
  if(!match)return -1
  let hour=Number(match[1])%12
  if(match[3]==='م')hour+=12
  return hour*60+Number(match[2])
}

function getNextPrayer(data:PrayerData|null){
  if(!data)return null
  const now=new Date()
  const current=now.getHours()*60+now.getMinutes()
  const found=prayerLabels.find(item=>timeToMinutes(data.times[item.key])>current)
  const selected=found||prayerLabels[0]
  return {label:selected.label,time:data.times[selected.key],tomorrow:!found}
}

export default function HomeDashboard(){
  const [ready,setReady]=useState(false)
  const [lastSurah,setLastSurah]=useState(0)
  const [lastJuz,setLastJuz]=useState(1)
  const [quranView,setQuranView]=useState<'surahs'|'juzs'>('surahs')
  const [lastDua,setLastDua]=useState<string>('')
  const [prayerData,setPrayerData]=useState<PrayerData|null>(null)
  const item=useMemo(()=>dailyItems[dayIndex()],[])

  useEffect(()=>{
    const savedSurah=Number(localStorage.getItem('athar-last-surah')||0)
    const savedJuz=Number(localStorage.getItem('athar-last-juz')||1)
    const savedView=localStorage.getItem('athar-quran-view')
    setLastSurah(savedSurah>=0&&savedSurah<surahs.length?savedSurah:0)
    setLastJuz(savedJuz>=1&&savedJuz<=30?savedJuz:1)
    setQuranView(savedView==='juzs'?'juzs':'surahs')
    setLastDua(localStorage.getItem('athar-last-dua')||'')
    try{
      const cached=JSON.parse(localStorage.getItem(PRAYER_KEY)||'null')
      if(cached?.times)setPrayerData(cached)
    }catch{}
    setReady(true)
  },[])

  const nextPrayer=getNextPrayer(prayerData)
  const dua=duas.find(entry=>entry.id===lastDua)
  const quranLabel=quranView==='juzs'?`متابعة الجزء ${lastJuz.toLocaleString('ar-IQ')}`:`متابعة سورة ${surahs[lastSurah]?.name||'الفاتحة'}`

  return <main>
    <section className="hero homeHero"><div className="container">
      <span className="badge">منصة دينية مجانية</span>
      <h1>أثر</h1>
      <p>قرآن، دعاء، ذكر، مواقيت، ومحتوى يومي في منصة هادئة وسهلة تعمل دون اشتراكات.</p>
      <div className="controls"><Link className="btn" href="/daily">افتح ورد اليوم</Link><Link className="btn secondary" href="/quran">اقرأ القرآن الكريم</Link></div>
    </div></section>

    <section className="section homeSection"><div className="container">
      <div className="homeSectionHead"><div><span className="badge">اليوم</span><h2>وردك اليومي</h2></div><Link className="homeTextLink" href="/daily">عرض الورد كاملًا ←</Link></div>
      <div className="homeDailyGrid">
        <Link className="card homeDailyCard" href={item.verse.href}><span>آية اليوم</span><strong>{item.verse.text}</strong><small>{item.verse.source}</small></Link>
        <Link className="card homeDailyCard" href="/tasbeeh"><span>ذكر اليوم</span><strong>{item.dhikr.text}</strong><small>العدد المقترح: {item.dhikr.target}</small></Link>
        <Link className="card homeDailyCard" href={item.wisdom.href}><span>{item.wisdom.title}</span><strong>{item.wisdom.text}</strong><small>{item.wisdom.source}</small></Link>
      </div>
    </div></section>

    <section className="section homeSection"><div className="container homeQuickGrid">
      <article className="card homeQuickCard prayerQuick"><span className="homeQuickIcon" aria-hidden="true">◷</span><div><small>أقرب موعد</small><h2>{nextPrayer?`${nextPrayer.label} — ${nextPrayer.time}`:'مواقيت الصلاة'}</h2><p>{nextPrayer?.tomorrow?'موعد صباح الغد حسب حساب الكاظمية المحلي.':'محسوب محليًا لمدينة الكاظمية.'}</p></div><Link className="btn secondary" href="/prayer-times">فتح المواقيت</Link></article>
      <article className="card homeQuickCard"><span className="homeQuickIcon" aria-hidden="true">◫</span><div><small>آخر قراءة</small><h2>{ready?quranLabel:'متابعة القرآن'}</h2><p>العودة بسرعة إلى آخر سورة أو جزء فتحته.</p></div><Link className="btn secondary" href="/quran">متابعة القراءة</Link></article>
      <article className="card homeQuickCard"><span className="homeQuickIcon" aria-hidden="true">✦</span><div><small>آخر دعاء أو زيارة</small><h2>{dua?dua.title:'الأدعية والزيارات'}</h2><p>{dua?'العودة إلى آخر نص قرأته.':'اختر نصًا لتظهر هنا إمكانية المتابعة.'}</p></div><Link className="btn secondary" href={dua?`/duas/${dua.id}`:'/duas'}>{dua?'متابعة الدعاء':'تصفح الأدعية'}</Link></article>
    </div></section>

    <section className="section homeSection"><div className="container"><div className="homeSectionHead"><div><span className="badge">الأقسام</span><h2>كل ما تحتاجه في مكان واحد</h2></div></div><div className="homeModulesGrid">
      <Link className="card homeModule" href="/quran"><span>◫</span><h3>القرآن الكريم</h3><p>السور كاملة والأجزاء الثلاثون مع حفظ آخر قراءة.</p></Link>
      <Link className="card homeModule" href="/duas"><span>✦</span><h3>الأدعية والزيارات</h3><p>نصوص مرتبة للقراءة والتصفح والمفضلة.</p></Link>
      <Link className="card homeModule" href="/tasbeeh"><span>●</span><h3>المسبحة الإلكترونية</h3><p>أذكار عامة وذكر مخصص بعدد تختاره.</p></Link>
      <Link className="card homeModule" href="/library"><span>▤</span><h3>المكتبة</h3><p>حقوق وحكم وقصص وموضوعات أخلاقية مختارة.</p></Link>
      <Link className="card homeModule" href="/prayer-times"><span>◷</span><h3>مواقيت الصلاة</h3><p>حساب جعفري محلي متغير تلقائيًا للكاظمية.</p></Link>
      <Link className="card homeModule" href="/qibla"><span>⌖</span><h3>بوصلة القبلة</h3><p>اتجاه القبلة من موقعك بطريقة بسيطة وواضحة.</p></Link>
      <Link className="card homeModule" href="/daily"><span>☀</span><h3>ورد اليوم</h3><p>آية ودعاء وذكر وحكمة تتجدد يوميًا.</p></Link>
    </div></div></section>

    <section className="section"><div className="container card quote">﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾</div></section>
  </main>
}
