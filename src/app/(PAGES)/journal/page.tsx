import type { Metadata } from 'next'

import PasswordWrapper from '~/components/common/Password/PasswordWrapper'
import DNDComponent from '~/components/layout/dnd'

export const metadata: Metadata = {
  title: 'JOURNAL'
}

const DNDPAGE = () => {
  return (
    <>
      {/* @ts-expect-error Server Component */}
      <PasswordWrapper>
        <DNDComponent />
      </PasswordWrapper>
    </>
  )
}

export default DNDPAGE
