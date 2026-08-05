'use client'

import {useEffect,useMemo,useRef,useState} from 'react'
import {QURAN_TOTAL_AYAHS,surahs} from '../../data/surahs'

const BASMALA='بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'

const JUZ_STARTS=[
 [1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],
 [9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],
 [29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1]
] as const

const globalAyah=(surahNumber:number,ayahNumber:number)=>{
 let total=ayahNumber
 for(let i=0;i<surahNumber-1;i++)total+=surahs[i].ayahs
 return total
}

const juzStartsGlobal=JUZ_STARTS.map(([s,a])=>globalAyah(s,a))
const juzOf=(surahNumber:number,ayahNumber:number)=>{
 const position=globalAyah(surahNumber,ayahNumber)
 let juz=1
 for(let i=0;i<juzStartsGlobal.length;i++){
  if(position>=juzStartsGlobal[i])juz=i+1
  else break
 }
 return juz
}

type QuranView='surahs'|'juzs'
type ReaderMode='full'|'juz'

type JuzSection={
 number:number
 name:string
 type:string
 basmala:boolean
 fromAyah:number
 toAyah:number
 ayahs:{text:string;ayah:number}[]
}

export default function Quran(){
 const [view,setView]=useState<QuranView>('surahs')
 const [selected,setSelected]=useState(0)
 const [query,setQuery]=useState('')
 const [fontSize,setFontSize]=useState(27)
 const [readerMode,setReaderMode]=useState<ReaderMode>('full')
 const [selectedJuz,setSelectedJuz]=useState<number>(1)
 const [ayahJump,setAyahJump]=useState('')
 const readerRef=useRef<HTMLElement|null>(null)

 const scrollToReader=()=>{
  window.setTimeout(()=>readerRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),60)
 }

 useEffect(()=>{
  const saved=Number(localStorage.getItem('athar-last-surah')||0)
  const savedSize=Number(localStorage.getItem('athar-quran-font-size')||27)
  const savedMode=localStorage.getItem('athar-quran-reader-mode')
  const savedJuz=Number(localStorage.getItem('athar-last-juz')||1)
  const savedView=localStorage.getItem('athar-quran-view')
  if(saved>=0&&saved<surahs.length)setSelected(saved)
  if(savedSize>=21&&savedSize<=38)setFontSize(savedSize)
  if(savedMode==='juz')setReaderMode('juz')
  if(savedJuz>=1&&savedJuz<=30)setSelectedJuz(savedJuz)
  if(savedView==='juzs')setView('juzs')
 },[])

 const filtered=useMemo(()=>{
  const q=query.trim()
  if(!q)return surahs
  return surahs.filter(s=>s.name.includes(q)||String(s.number)===q)
 },[query])

 const openIndex=(index:number)=>{
  if(index<0||index>=surahs.length)return
  setSelected(index)
  setReaderMode('full')
  localStorage.setItem('athar-last-surah',String(index))
  localStorage.setItem('athar-quran-reader-mode','full')
  setAyahJump('')
  scrollToReader()
 }
 const openNumber=(num:number)=>openIndex(surahs.findIndex(s=>s.number===num))
 const changeSize=(next:number)=>{
  const safe=Math.max(21,Math.min(38,next))
  setFontSize(safe)
  localStorage.setItem('athar-quran-font-size',String(safe))
 }
 const changeView=(next:QuranView)=>{
  setView(next)
  localStorage.setItem('athar-quran-view',next)
  window.scrollTo({top:0,behavior:'smooth'})
 }
 const chooseGlobalJuz=(juz:number)=>{
  setSelectedJuz(juz)
  setView('juzs')
  localStorage.setItem('athar-last-juz',String(juz))
  localStorage.setItem('athar-quran-view','juzs')
  scrollToReader()
 }

 const surah=surahs[selected]
 const surahJuzs=useMemo(()=>Array.from(new Set(surah.text.map((_,i)=>juzOf(surah.number,i+1)))), [surah])
 const activeSurahJuz=surahJuzs.includes(selectedJuz)?selectedJuz:surahJuzs[0]
 const visibleAyahs=useMemo(()=>surah.text.map((text,i)=>({text,ayah:i+1,juz:juzOf(surah.number,i+1)})).filter(item=>readerMode==='full'||item.juz===activeSurahJuz),[surah,readerMode,activeSurahJuz])
 const firstAyah=visibleAyahs[0]?.ayah||1
 const lastAyah=visibleAyahs[visibleAyahs.length-1]?.ayah||surah.ayahs

 const chooseFull=()=>{
  setReaderMode('full')
  localStorage.setItem('athar-quran-reader-mode','full')
  scrollToReader()
 }
 const chooseSurahJuz=(juz:number)=>{
  setReaderMode('juz')
  setSelectedJuz(juz)
  localStorage.setItem('athar-quran-reader-mode','juz')
  localStorage.setItem('athar-last-juz',String(juz))
  scrollToReader()
 }


 const jumpToAyah=()=>{
  const value=Number(ayahJump)
  if(!Number.isInteger(value)||value<1||value>surah.ayahs)return
  setReaderMode('full')
  localStorage.setItem('athar-quran-reader-mode','full')
  window.setTimeout(()=>document.getElementById(`ayah-${surah.number}-${value}`)?.scrollIntoView({behavior:'smooth',block:'center'}),80)
 }

 const juzSections=useMemo<JuzSection[]>(()=>surahs.map(s=>{
  const ayahs=s.text.map((text,i)=>({text,ayah:i+1,juz:juzOf(s.number,i+1)})).filter(a=>a.juz===selectedJuz)
  if(!ayahs.length)return null
  return {
   number:s.number,
   name:s.name,
   type:s.type,
   basmala:s.basmala,
   fromAyah:ayahs[0].ayah,
   toAyah:ayahs[ayahs.length-1].ayah,
   ayahs:ayahs.map(({text,ayah})=>({text,ayah}))
  }
 }).filter(Boolean) as JuzSection[],[selectedJuz])

 return <main className="section"><div className="container">
  <div className="quranHeading">
   <div><h2>القرآن الكريم</h2><p className="small">المصحف كامل: 114 سورة و{QURAN_TOTAL_AYAHS.toLocaleString('ar-IQ')} آية، محفوظ داخل المنصة للعمل دون إنترنت.</p></div>
   <span className="badge">النص العثماني</span>
  </div>

  <div className="quranMainTabs" role="tablist" aria-label="طريقة تصفح القرآن">
   <button className={view==='surahs'?'active':''} onClick={()=>changeView('surahs')}>السور</button>
   <button className={view==='juzs'?'active':''} onClick={()=>changeView('juzs')}>الأجزاء الثلاثون</button>
  </div>

  {view==='surahs'?<div className="twoCol quranLayout" style={{marginTop:18}}>
   <aside className="card quranIndex">
    <h3>فهرس السور</h3>
    <input className="search" placeholder="ابحث باسم السورة أو رقمها" value={query} onChange={e=>setQuery(e.target.value)}/>
    <div className="list quranSurahList">{filtered.map(s=><button key={s.number} className={'listItem '+(s.number===surah.number?'active':'')} onClick={()=>openNumber(s.number)}><strong>{s.number}. {s.name}</strong><span>{s.ayahs} آية</span></button>)}</div>
   </aside>

   <section className="card quranCard" ref={readerRef}>
    <div className="quranTopBar">
     <div><span className="badge">{surah.type} — {surah.ayahs} آية</span><h1>سورة {surah.name}</h1></div>
     <div className="quranFontTools" aria-label="تغيير حجم خط القرآن">
      <button onClick={()=>changeSize(fontSize-2)} title="تصغير الخط">أ−</button>
      <button onClick={()=>changeSize(27)} title="الحجم الافتراضي">عادي</button>
      <button onClick={()=>changeSize(fontSize+2)} title="تكبير الخط">أ+</button>
     </div>
    </div>

    <div className="quranAyahJump" aria-label="الانتقال إلى آية محددة">
     <label htmlFor="ayah-jump">انتقل مباشرة إلى الآية</label>
     <div><input id="ayah-jump" type="number" min={1} max={surah.ayahs} inputMode="numeric" value={ayahJump} onChange={e=>setAyahJump(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')jumpToAyah()}} placeholder={`1–${surah.ayahs}`}/><button onClick={jumpToAyah}>عرض الآية</button></div>
    </div>

    <div className="quranPartChooser" aria-label="اختيار طريقة قراءة السورة">
     <button className={'quranPartButton '+(readerMode==='full'?'active':'')} onClick={chooseFull}>قراءة السورة كاملة</button>
     {surahJuzs.map(juz=><button key={juz} className={'quranPartButton '+(readerMode==='juz'&&activeSurahJuz===juz?'active':'')} onClick={()=>chooseSurahJuz(juz)}>الجزء {juz.toLocaleString('ar-IQ')}</button>)}
    </div>

    {readerMode==='juz'&&<div className="quranPartInfo"><strong>الجزء {activeSurahJuz.toLocaleString('ar-IQ')}</strong><span>من الآية {firstAyah.toLocaleString('ar-IQ')} إلى الآية {lastAyah.toLocaleString('ar-IQ')} من سورة {surah.name}</span></div>}

    <div className="quranReader" style={{fontSize}}>
     {surah.basmala&&firstAyah===1&&<div className="basmala">{BASMALA}</div>}
     <div>{visibleAyahs.map(item=><span className="ayah" id={`ayah-${surah.number}-${item.ayah}`} key={item.ayah}>{item.text} <span className="ayahNumber">﴿{item.ayah.toLocaleString('ar-IQ')}﴾</span> </span>)}</div>
    </div>

    {readerMode==='juz'&&surahJuzs.length>1&&<div className="quranNav quranJuzNav">
     <button className="btn secondary" disabled={surahJuzs.indexOf(activeSurahJuz)===0} onClick={()=>chooseSurahJuz(surahJuzs[surahJuzs.indexOf(activeSurahJuz)-1])}>الجزء السابق من السورة</button>
     <span>الجزء {activeSurahJuz.toLocaleString('ar-IQ')}</span>
     <button className="btn secondary" disabled={surahJuzs.indexOf(activeSurahJuz)===surahJuzs.length-1} onClick={()=>chooseSurahJuz(surahJuzs[surahJuzs.indexOf(activeSurahJuz)+1])}>الجزء التالي من السورة</button>
    </div>}

    <div className="quranNav">
     <button className="btn secondary" disabled={selected===0} onClick={()=>openIndex(selected-1)}>السورة السابقة</button>
     <span>{surah.number} من 114</span>
     <button className="btn secondary" disabled={selected===surahs.length-1} onClick={()=>openIndex(selected+1)}>السورة التالية</button>
    </div>

    <div className="sourceBox"><strong>المصدر:</strong> Tanzil Quran Text، الإصدار 1.1. النص القرآني موزع حرفيًا دون تغيير، وفق شروط المصدر. <a className="sourceLink" href="https://tanzil.net" target="_blank" rel="noreferrer">موقع Tanzil</a></div>
   </section>
  </div>:<div className="quranJuzLayout" style={{marginTop:18}}>
   <aside className="card quranJuzIndex">
    <h3>فهرس الأجزاء</h3>
    <p className="small">اختر جزءًا من الأجزاء الثلاثين لقراءته بالسور والآيات مرتبة كما في المصحف.</p>
    <div className="quranJuzScroll" aria-label="قائمة الأجزاء القابلة للتمرير">
     <div className="quranJuzGrid">{Array.from({length:30},(_,i)=>i+1).map(juz=><button key={juz} className={'quranJuzButton '+(selectedJuz===juz?'active':'')} onClick={()=>chooseGlobalJuz(juz)}>الجزء {juz.toLocaleString('ar-IQ')}</button>)}</div>
    </div>
   </aside>

   <section className="card quranCard quranJuzReaderCard" ref={readerRef}>
    <div className="quranTopBar">
     <div><span className="badge">الجزء {selectedJuz.toLocaleString('ar-IQ')} من 30</span><h1>الجزء {selectedJuz.toLocaleString('ar-IQ')}</h1></div>
     <div className="quranFontTools" aria-label="تغيير حجم خط القرآن">
      <button onClick={()=>changeSize(fontSize-2)} title="تصغير الخط">أ−</button>
      <button onClick={()=>changeSize(27)} title="الحجم الافتراضي">عادي</button>
      <button onClick={()=>changeSize(fontSize+2)} title="تكبير الخط">أ+</button>
     </div>
    </div>

    <div className="quranJuzSummary">يضم هذا الجزء {juzSections.length.toLocaleString('ar-IQ')} {juzSections.length===1?'سورة أو مقطعًا من سورة':'سور أو مقاطع من السور'}، مرتبة حسب تسلسل المصحف.</div>

    <div className="quranJuzSections">{juzSections.map(section=><section key={section.number} className="quranJuzSection">
     <div className="quranJuzSectionHeader"><div><span className="badge">{section.type}</span><h2>سورة {section.name}</h2></div><span>الآيات {section.fromAyah.toLocaleString('ar-IQ')}–{section.toAyah.toLocaleString('ar-IQ')}</span></div>
     <div className="quranReader" style={{fontSize}}>
      {section.basmala&&section.fromAyah===1&&<div className="basmala">{BASMALA}</div>}
      <div>{section.ayahs.map(item=><span className="ayah" key={item.ayah}>{item.text} <span className="ayahNumber">﴿{item.ayah.toLocaleString('ar-IQ')}﴾</span> </span>)}</div>
     </div>
    </section>)}</div>

    <div className="quranNav">
     <button className="btn secondary" disabled={selectedJuz===1} onClick={()=>chooseGlobalJuz(selectedJuz-1)}>الجزء السابق</button>
     <span>{selectedJuz.toLocaleString('ar-IQ')} من 30</span>
     <button className="btn secondary" disabled={selectedJuz===30} onClick={()=>chooseGlobalJuz(selectedJuz+1)}>الجزء التالي</button>
    </div>

    <div className="sourceBox"><strong>المصدر:</strong> Tanzil Quran Text، الإصدار 1.1. النص القرآني موزع حرفيًا دون تغيير، وفق شروط المصدر. <a className="sourceLink" href="https://tanzil.net" target="_blank" rel="noreferrer">موقع Tanzil</a></div>
   </section>
  </div>}
 </div></main>
}
