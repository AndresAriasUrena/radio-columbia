import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Radio Columbia - Tu Estación de Radio Costarricense'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  // Use the Cover.png image
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://columbia.co.cr';
  const coverUrl = `${baseUrl}/assets/Cover.png`;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FBFF',
        }}
      >
        <img
          src={coverUrl}
          alt="Radio Columbia"
          width={1200}
          height={630}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
} 