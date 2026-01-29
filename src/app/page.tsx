import Link from 'next/link'
import { Container } from '~/components/container'

const HomePage = () => {
  return (
    <Container
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        flexDirection: 'column',
        inset: 0,
        top: '40px',
        textAlign: 'left'
      }}
    >
      <Link href={'/write'} style={{ width: '77.77px' }}>
        WRITE
      </Link>
      <Link href={'/studio'} style={{ width: '77.77px' }}>
        STUDIO
      </Link>
      <Link href={'/support'} style={{ width: '77.77px' }}>
        SUPPORT
      </Link>
      <Link href={'/write'} style={{ width: '77.77px' }}></Link>
    </Container>
  )
}

export default HomePage
