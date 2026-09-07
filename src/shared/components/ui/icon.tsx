import { IconContext } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

export function IconProvider({ children }: { children: ReactNode }) {
  return <IconContext.Provider value={{ weight: 'regular' }}>{children}</IconContext.Provider>
}
