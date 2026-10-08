import { Inter } from 'next/font/google'
import './globals.css'
import { SearchProvider } from '@/lib/SearchContext'
import { PlayerProvider } from '@/lib/PlayerContext'
import RadioPlayer from '@/components/RadioPlayer'
import Script from 'next/script'
import SplashPage from '@/components/SplashPage'
import { GoogleTagManager } from '@next/third-parties/google'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://columbia.co.cr';

// Propiedad de GA4 de Radio Columbia. Se mide directo con gtag y NO desde el
// contenedor de GTM: entre el 5 de agosto y el 7 de octubre de 2026 el sitio
// quedó sin medición porque se quitó este bloque y el contenedor de GTM nunca
// llegó a tener una etiqueta publicada.
//
// IMPORTANTE: si algún día se configura GA4 dentro de GTM, hay que borrar este
// bloque en el mismo cambio. Las dos cosas a la vez cuentan cada visita doble.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-2T6Z9LG0JD';

export const metadata = {
  title: 'Radio Columbia - Tu Estación de Radio Costarricense',
  description: 'Radio Columbia - Un medio de comunicación líder en Costa Rica con amplia trayectoria en radio y plataformas digitales, especializado en noticias, deportes, entretenimiento y actualidad.',
  keywords: 'radio columbia, radio costa rica, noticias costa rica, deportes costa rica, radio en vivo, streaming, entretenimiento, noticias costarricenses',
  authors: [{ name: 'Radio Columbia' }],
  creator: 'Radio Columbia',
  publisher: 'Radio Columbia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Radio Columbia - Tu Estación de Radio Costarricense',
    description: 'Radio Columbia - Un medio de comunicación líder en Costa Rica con amplia trayectoria en radio y plataformas digitales, especializado en noticias, deportes, entretenimiento y actualidad.',
    url: SITE_URL,
    siteName: 'Radio Columbia',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Radio Columbia - Tu Estación de Radio Costarricense',
      },
    ],
    locale: 'es_CR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radio Columbia - Tu Estación de Radio Costarricense',
    description: 'Radio Columbia - Un medio de comunicación líder en Costa Rica con amplia trayectoria en radio y plataformas digitales, especializado en noticias, deportes, entretenimiento y actualidad.',
    creator: '@webcolumbia',
    images: ['/opengraph-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1E305F',
}


export default function RootLayout({ children }) {
  return (
    <html lang="es-CR">
      <GoogleTagManager gtmId="GTM-TVF2TBQX" />
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RadioStation",
            "name": "Radio Columbia",
            "description": "Un medio de comunicación líder en Costa Rica con amplia trayectoria en radio y plataformas digitales, especializado en noticias, deportes, entretenimiento y actualidad.",
            "url": SITE_URL,
            "logo": `${SITE_URL}/assets/LogoColumbia.svg`,
            "sameAs": [
              "https://www.facebook.com/NoticiasColumbia/",
              "https://www.instagram.com/noticiascolumbia/",
              "https://www.youtube.com/channel/UCo2Fr8GUPmevyi7uih-0oTg",
              "https://x.com/webcolumbia"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": "Spanish"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CR"
            },
            "areaServed": {
              "@type": "Country",
              "name": "Costa Rica"
            }
          })}
        </Script>
      </head>
      <body className={inter.className}>
        <SearchProvider>
          <PlayerProvider>
          <SplashPage />
             {children}
            <RadioPlayer />
          </PlayerProvider>
        </SearchProvider>
      </body>
    </html>
  )
}
