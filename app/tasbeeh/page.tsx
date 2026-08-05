'use client'

import {useEffect,useMemo,useState} from 'react'

type DhikrOption={id:string;name:string;target:number;source:string;custom?:boolean}
const baseOptions:DhikrOption[]=[
  {id:'salawat',name:'اللهم صل على محمد وآل محمد',target:100,source:'ذكر مشهور في كتب الأدعية والتعقيبات'},
  {id:'istighfar',name:'أستغفر الله ربي وأتوب إليه',target:100,source:'ضياء الصالحين — الأذكار العامة'},
  {id:'subhanallah',name:'سبحان الله',target:100,source:'الأذكار العامة'},
  {id:'alhamdulillah',name:'الحمد لله',target:100,source:'الأذكار العامة'},
  {id:'allahuakbar',name:'الله أكبر',target:100,source:'الأذكار العامة'},
  {id:'tahlil',name:'لا إله إلا الله',target:100,source:'الأذكار العامة'},
  {id:'hawqala',name:'لا حول ولا قوة إلا بالله العلي العظيم',target:100,source:'الأذكار العامة'},
  {id:'tasbihat-four',name:'سبحان الله والحمد لله ولا إله إلا الله والله أكبر',target:40,source:'التسبيحات الأربع — تعقيبات الصلاة'},
  {id:'ya-allah',name:'يا الله',target:100,source:'ذكر عام'},
  {id:'ya-muhammad',name:'يا محمد',target:100,source:'ذكر عام'},
  {id:'ya-ali',name:'يا علي',target:100,source:'ذكر عام'},
  {id:'ya-zahra',name:'يا فاطمة الزهراء',target:100,source:'ذكر عام'},
  {id:'ya-sahib',name:'يا صاحب الزمان أدركني',target:100,source:'أدعية التوسل بالإمام المهدي (عج)'},
  {id:'ajjel-faraj',name:'اللهم عجل لوليك الفرج',target:100,source:'دعاء مشهور للإمام المهدي (عج)'}
]
const zahraStages=[{label:'الله أكبر',target:34},{label:'الحمد لله',target:33},{label:'سبحان الله',target:33}]

export default function Tasbeeh(){
  const [mode,setMode]=useState<'regular'|'zahra'>('regular')
  const [count,setCount]=useState(0)
  const [dhikrId,setDhikrId]=useState(baseOptions[0].id)
  const [stage,setStage]=useState(0)
  const [custom,setCustom]=useState<DhikrOption[]>([])
  const [showForm,setShowForm]=useState(false)
  const [editId,setEditId]=useState<string|null>(null)
  const [customText,setCustomText]=useState('')
  const [customTarget,setCustomTarget]=useState(100)
  const options=useMemo(()=>[...baseOptions,...custom],[custom])

  useEffect(()=>{
    const raw=localStorage.getItem('athar-custom-dhikr')
    let savedCustom:DhikrOption[]=[]
    try{savedCustom=raw?JSON.parse(raw):[]}catch{}
    setCustom(savedCustom)
    const savedMode=(localStorage.getItem('athar-tasbeeh-mode') as 'regular'|'zahra')||'regular'
    const savedDhikr=localStorage.getItem('athar-dhikr-id')||baseOptions[0].id
    setMode(savedMode);setDhikrId([...baseOptions,...savedCustom].some(o=>o.id===savedDhikr)?savedDhikr:baseOptions[0].id)
    setCount(Number(localStorage.getItem('athar-count')||0)||0)
    const savedStage=Number(localStorage.getItem('athar-zahra-stage')||0)
    setStage(savedStage>=0&&savedStage<zahraStages.length?savedStage:0)
  },[])

  const selected=useMemo(()=>options.find(o=>o.id===dhikrId)||baseOptions[0],[dhikrId,options])
  const currentZahra=zahraStages[stage]
  const zahraDone=stage===zahraStages.length-1&&count>=currentZahra.target
  const totalZahra=(stage===0?0:stage===1?34:67)+Math.min(count,currentZahra.target)
  const persist=(nextCount:number,nextStage=stage)=>{localStorage.setItem('athar-count',String(nextCount));localStorage.setItem('athar-zahra-stage',String(nextStage))}
  const add=()=>{if(navigator.vibrate)navigator.vibrate(20);if(mode==='zahra'){if(zahraDone)return;const next=count+1;if(next>=currentZahra.target&&stage<2){const ns=stage+1;setStage(ns);setCount(0);persist(0,ns)}else{setCount(next);persist(next)}return}const next=count+1;setCount(next);persist(next)}
  const reset=()=>{setCount(0);setStage(0);persist(0,0)}
  const changeDhikr=(id:string)=>{setDhikrId(id);setCount(0);setStage(0);localStorage.setItem('athar-dhikr-id',id);persist(0,0)}
  const changeMode=(next:'regular'|'zahra')=>{setMode(next);setCount(0);setStage(0);localStorage.setItem('athar-tasbeeh-mode',next);persist(0,0)}
  const openNew=()=>{setEditId(null);setCustomText('');setCustomTarget(100);setShowForm(true)}
  const openEdit=()=>{if(!selected.custom)return;setEditId(selected.id);setCustomText(selected.name);setCustomTarget(selected.target);setShowForm(true)}
  const saveCustom=()=>{
    const name=customText.trim();const target=Math.max(1,Math.min(100000,Number(customTarget)||1));if(!name)return
    let next:DhikrOption[];let id=editId
    if(editId){next=custom.map(o=>o.id===editId?{...o,name,target}:o)}else{id=`custom-${Date.now()}`;next=[...custom,{id,name,target,source:'ذكر مخصص أضافه المستخدم',custom:true}]}
    setCustom(next);localStorage.setItem('athar-custom-dhikr',JSON.stringify(next));changeDhikr(id!);setShowForm(false)
  }
  const removeCustom=()=>{if(!selected.custom)return;const next=custom.filter(o=>o.id!==selected.id);setCustom(next);localStorage.setItem('athar-custom-dhikr',JSON.stringify(next));changeDhikr(baseOptions[0].id)}
  const displayText=mode==='zahra'?currentZahra.label:selected.name
  const target=mode==='zahra'?currentZahra.target:selected.target

  return <main className="section"><div className="container card tasbeehCard">
    <h2>المسبحة الإلكترونية</h2>
    <div className="modeTabs"><button className={mode==='regular'?'modeTab active':'modeTab'} onClick={()=>changeMode('regular')}>الأذكار العامة</button><button className={mode==='zahra'?'modeTab active':'modeTab'} onClick={()=>changeMode('zahra')}>تسبيح الزهراء عليها السلام</button></div>
    {mode==='regular'&&<><div className="controls customDhikrControls"><select className="btn secondary tasbeehSelect" value={dhikrId} onChange={e=>changeDhikr(e.target.value)}>{options.map(o=><option value={o.id} key={o.id}>{o.custom?'★ ':''}{o.name}</option>)}</select><button className="btn secondary" onClick={openNew}>＋ ذكر مخصص</button></div>{selected.custom&&<div className="controls compactControls"><button className="textButton" onClick={openEdit}>تعديل الذكر</button><button className="textButton danger" onClick={removeCustom}>حذف</button></div>}</>}
    {showForm&&<div className="customDhikrForm"><h3>{editId?'تعديل الذكر المخصص':'إضافة ذكر مخصص'}</h3><label>نص الذكر<input value={customText} maxLength={180} onChange={e=>setCustomText(e.target.value)} placeholder="اكتب الذكر هنا" autoFocus/></label><label>العدد المستهدف<input type="number" min="1" max="100000" value={customTarget} onChange={e=>setCustomTarget(Number(e.target.value))}/></label><div className="controls"><button className="btn" disabled={!customText.trim()} onClick={saveCustom}>حفظ الذكر</button><button className="btn secondary" onClick={()=>setShowForm(false)}>إلغاء</button></div><p className="small">هذا النص يضيفه المستخدم ويحفظ داخل جهازه، ولا يُعد من المحتوى الموثق للمنصة.</p></div>}
    {mode==='zahra'&&<div className="zahraProgress">{zahraStages.map((item,index)=><div key={item.label} className={index===stage?'zahraStage active':index<stage?'zahraStage done':'zahraStage'}><strong>{item.label}</strong><span>{item.target}</span></div>)}</div>}
    <p className="quote tasbeehDhikr">{displayText}</p><div className="counter">{count}<div className="small">الهدف الحالي: {target}</div>{mode==='zahra'&&<div className="small">التقدم الكلي: {totalZahra} من 100</div>}</div>
    <button className="tasbeehButton" onClick={add} disabled={zahraDone}>{zahraDone?'اكتمل التسبيح':'اضغط للتسبيح'}</button><div className="controls"><button className="btn secondary" onClick={reset}>تصفير العداد</button></div>
    <div className="sourceBox">{mode==='zahra'?<><strong>تسبيح الزهراء عليها السلام:</strong> الله أكبر 34 مرة، الحمد لله 33 مرة، سبحان الله 33 مرة.</>:<><strong>المصدر أو التصنيف:</strong> {selected.source}. العدد المعروض مقترح ويمكن مواصلة الذكر بعد بلوغه.</>}</div>
  </div></main>
}
