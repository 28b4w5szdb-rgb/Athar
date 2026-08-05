import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import ShareInstallButton from './ShareInstallButton'

export default function Header(){
  return <header className="header">
    <div className="container nav">
      <Link className="brand" href="/">أثر</Link>
      <nav className="menu" aria-label="التنقل الرئيسي">
        <Link href="/quran">القرآن</Link>
        <Link href="/duas">الأدعية والزيارات</Link>
        <Link href="/library">المكتبة</Link>
        <Link href="/tasbeeh">التسبيح</Link>
        <Link href="/prayer-times">المواقيت</Link>
        <Link href="/qibla">القبلة</Link>
        <Link href="/daily">ورد اليوم</Link>
      </nav>
      <div className="navActions"><ShareInstallButton/><ThemeToggle/></div>
    </div>
  </header>
}
