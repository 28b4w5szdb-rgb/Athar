import Link from 'next/link'
import './globals.css'
import Header from '../components/Header'
import ServiceWorkerRegister from '../components/ServiceWorkerRegister'

export const metadata={title:'أثر | قرآن ودعاء وذكر ومواقيت الصلاة',description:'منصة ويب دينية مجانية تعمل للقراءة والتصفح والتسبيح دون إنترنت بعد التحميل الأول',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'default',title:'أثر'},icons:{icon:'/athar-icon-192.png',apple:'/athar-icon-192.png'}}
export const viewport = { themeColor: '#174d3c' }


export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ar" dir="rtl">
    <body>
      <Header/>
      <ServiceWorkerRegister/>
      {children}
      <footer className="footer">
        <div className="container footerInner">
          <div>أثر — صدقة جارية ومحتوى ديني مجاني</div>
          <Link className="aboutMiniButton" href="/about">عن المنصة</Link>
        </div>
      </footer>
    </body>
  </html>
}
