import { useContext } from 'react'
import { TenantContext, type TenantContextValue } from './tenant-context'

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext)
  if (!ctx) {
    throw new Error('useTenant deve ser usado dentro de <TenantProvider>')
  }
  return ctx
}
