import { ImageResponse } from 'next/og';
import { SEO_CONFIG } from '@/lib/seo';

export const runtime = 'edge';
export const alt = SEO_CONFIG.siteName;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'linear-gradient(45deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <img
            src="https://radiodev.aurigital.com/assets/LogoColumbia.svg"
            alt="Amplify Radio Logo"
            style={{
              width: '200px',
              height: 'auto',
              filter: 'brightness(0) invert(1)', 
            }}
          />
        </div>

        <div  
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '20px',
            fontFamily: 'system-ui',
          }}
        >
          Amplify Radio
        </div>

        <div
          style={{
            fontSize: '32px',
            color: '#c7c7c7',
            textAlign: 'center',
            marginBottom: '40px',
            fontFamily: 'system-ui',
            maxWidth: '800px',
            lineHeight: '1.2',
          }}
        >
          Tu estación de radio online con música y noticias 24/7
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '8px',
            backgroundColor: SEO_CONFIG.themeColor,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
} 