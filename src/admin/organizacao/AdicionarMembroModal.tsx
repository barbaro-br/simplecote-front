import { useState } from 'react'
import { UserPlus, Envelope, Key, X } from '@phosphor-icons/react'
import { ConvidarMembroDialog } from './ConvidarMembroDialog'
import { UsuarioForm } from './UsuarioForm'
import { cn } from '@/shared/lib/utils'
import type { Membro } from './organizacao.schema'

type Props = {
  aoFechar: () => void
  membroParaEditar?: Membro
}

export function AdicionarMembroModal({ aoFechar, membroParaEditar }: Props) {
  const isEdit = !!membroParaEditar
  const [aba, setAba] = useState<'convidar' | 'criar'>(isEdit ? 'criar' : 'convidar')

  return (
    <div className="w-full max-w-lg mx-auto rounded-none border border-white/15 bg-[#0d1410] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-on-surface flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#131b15]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            {isEdit ? <UserPlus className="text-xl" weight="bold" /> : <UserPlus className="text-xl" weight="bold" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                {isEdit ? 'ACESSO AO SISTEMA' : 'EQUIPE & CONVITES'}
              </span>
            </div>
            <h2 className="text-base font-bold text-on-surface tracking-tight">
              {isEdit ? 'Editar usuário' : 'Adicionar membro'}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </div>
      
      {!isEdit && (
        <div className="flex items-center border-b border-white/10 px-6 pt-3 gap-6 bg-[#131b15]/50">
          <button
            type="button"
            onClick={() => setAba('convidar')}
            className={cn(
              'flex items-center gap-2 pb-3 px-1 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2',
              aba === 'convidar' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
            )}
          >
            <Envelope className="size-4" />
            Convidar por e-mail
          </button>
          <button
            type="button"
            onClick={() => setAba('criar')}
            className={cn(
              'flex items-center gap-2 pb-3 px-1 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2',
              aba === 'criar' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
            )}
          >
            <Key className="size-4" />
            Criar com senha
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {aba === 'convidar' ? (
          <ConvidarMembroDialog aoFechar={aoFechar} />
        ) : (
          <UsuarioForm aoSalvar={aoFechar} usuarioParaEditar={membroParaEditar} />
        )}
      </div>
    </div>
  )
}
