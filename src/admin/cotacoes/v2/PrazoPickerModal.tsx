import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Icon } from './ui-v2'
import {
  componentesSaoPaulo,
  calcularPrazoIso,
  dataAmanha,
  estaNoPassado,
  HORAS,
  MINUTOS,
} from '../prazo-sao-paulo'

export interface PrazoPickerModalProps {
  open: boolean
  onClose: () => void
  onConfirmar: (prazoIso: string) => void
  submitting?: boolean
  titulo?: string
  descricao?: string
  submitLabel?: string
  prazoInicialIso?: string | null
  totalItens?: number
  totalFornecedores?: number
}

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const DIAS_SEMANA_NOMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const HORARIOS_RAPIDOS = [
  { label: '12:00', hora: '12', minuto: '00' },
  { label: '14:00', hora: '14', minuto: '00' },
  { label: '17:00', hora: '17', minuto: '00' },
  { label: '18:00', hora: '18', minuto: '00' },
  { label: '19:00', hora: '19', minuto: '00' },
]

export function PrazoPickerModal({
  open,
  onClose,
  onConfirmar,
  submitting = false,
  titulo = 'Abrir Cotação',
  descricao = 'Selecione a data e a hora limite para os representantes enviarem seus lances.',
  submitLabel = 'Abrir Cotação',
  prazoInicialIso,
  totalItens,
  totalFornecedores,
}: PrazoPickerModalProps) {
  // Inicialização de Data, Hora e Minuto
  const [dataSelecionada, setDataSelecionada] = useState<Date>(() => {
    if (prazoInicialIso) {
      try {
        const d = new Date(prazoInicialIso)
        if (!isNaN(d.getTime())) return d
      } catch {
        /* fallback */
      }
    }
    return dataAmanha()
  })

  const [mesVisivel, setMesVisivel] = useState<Date>(() => dataSelecionada)
  const [hora, setHora] = useState<string>('18')
  const [minuto, setMinuto] = useState<string>('00')
  const [erro, setErro] = useState<string | null>(null)

  // Quando o modal abre ou o prazo inicial muda, atualiza o estado
  useEffect(() => {
    if (!open) return
    if (prazoInicialIso) {
      try {
        const d = new Date(prazoInicialIso)
        if (!isNaN(d.getTime())) {
          setDataSelecionada(d)
          setMesVisivel(d)
          const sp = componentesSaoPaulo(d)
          setHora(String(sp.hora).padStart(2, '0'))
          setMinuto(String(sp.minuto).padStart(2, '0'))
          setErro(null)
          return
        }
      } catch {
        /* fallback */
      }
    }
    const amanha = dataAmanha()
    setDataSelecionada(amanha)
    setMesVisivel(amanha)
    setHora('18')
    setMinuto('00')
    setErro(null)
  }, [open, prazoInicialIso])

  // Fecha com ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Cálculo do ISO-8601 final
  const prazoIso = useMemo(() => {
    return calcularPrazoIso(dataSelecionada, hora, minuto)
  }, [dataSelecionada, hora, minuto])

  // Verificação de passado
  const ehNoPassado = useMemo(() => {
    if (!prazoIso) return false
    return estaNoPassado(prazoIso)
  }, [prazoIso])

  // Formatação descritiva em pt-BR e cálculo de tempo restante
  const descricaoPrazo = useMemo(() => {
    if (!prazoIso) return null
    try {
      const d = new Date(prazoIso)
      const dataStr = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d)
      const dataCapitalizada = dataStr.charAt(0).toUpperCase() + dataStr.slice(1)

      const diffMs = d.getTime() - Date.now()
      if (diffMs <= 0) {
        return { texto: `${dataCapitalizada} às ${hora}:${minuto}`, tempo: 'Prazo já expirado', valido: false }
      }

      const diffMin = Math.floor(diffMs / (1000 * 60))
      const diffHoras = Math.floor(diffMin / 60)
      const diffDias = Math.floor(diffHoras / 24)
      const horasRestantes = diffHoras % 24
      const minRestantes = diffMin % 60

      let tempoStr = ''
      if (diffDias > 0) {
        tempoStr = `${diffDias} ${diffDias === 1 ? 'dia' : 'dias'}`
        if (horasRestantes > 0) {
          tempoStr += ` e ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}`
        }
      } else if (diffHoras > 0) {
        tempoStr = `${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`
        if (minRestantes > 0) {
          tempoStr += ` e ${minRestantes} min`
        }
      } else {
        tempoStr = `${diffMin} minutos`
      }

      return {
        texto: `${dataCapitalizada} às ${hora}:${minuto}`,
        tempo: `Faltam aproximadamente ${tempoStr}`,
        valido: true,
      }
    } catch {
      return null
    }
  }, [prazoIso, hora, minuto])

  // Presets rápidos (Hoje 18h se der tempo, Amanhã 12h, Amanhã 18h, +2 dias 18h, +3 dias 18h)
  const presets = useMemo(() => {
    const spHoje = componentesSaoPaulo(new Date())
    const lista: Array<{ label: string; data: Date; hora: string; minuto: string }> = []

    // Se hoje for antes das 17h, oferece "Hoje às 18:00"
    if (spHoje.hora < 17) {
      lista.push({
        label: 'Hoje 18h',
        data: new Date(spHoje.ano, spHoje.mes - 1, spHoje.dia),
        hora: '18',
        minuto: '00',
      })
    }

    // Amanhã 12h
    lista.push({
      label: 'Amanhã 12h',
      data: new Date(spHoje.ano, spHoje.mes - 1, spHoje.dia + 1),
      hora: '12',
      minuto: '00',
    })

    // Amanhã 18h (mais recomendado)
    lista.push({
      label: 'Amanhã 18h',
      data: new Date(spHoje.ano, spHoje.mes - 1, spHoje.dia + 1),
      hora: '18',
      minuto: '00',
    })

    // +2 dias 18h
    lista.push({
      label: 'Em 2 dias',
      data: new Date(spHoje.ano, spHoje.mes - 1, spHoje.dia + 2),
      hora: '18',
      minuto: '00',
    })

    // +3 dias 18h
    lista.push({
      label: 'Em 3 dias',
      data: new Date(spHoje.ano, spHoje.mes - 1, spHoje.dia + 3),
      hora: '18',
      minuto: '00',
    })

    return lista
  }, [])

  function aplicarPreset(p: { data: Date; hora: string; minuto: string }) {
    setDataSelecionada(p.data)
    setMesVisivel(p.data)
    setHora(p.hora)
    setMinuto(p.minuto)
    setErro(null)
  }

  // Navegação de mês no calendário
  function mudarMes(delta: number) {
    setMesVisivel((prev) => {
      const n = new Date(prev)
      n.setMonth(n.getMonth() + delta)
      return n
    })
  }

  // Gera a matriz de dias do mês visível
  const matrizCalendario = useMemo(() => {
    const ano = mesVisivel.getFullYear()
    const mes = mesVisivel.getMonth()

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay() // 0 = Domingo
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate()
    const totalDiasMesAnterior = new Date(ano, mes, 0).getDate()

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const celulas: Array<{
      data: Date
      dia: number
      mesAtual: boolean
      ehHoje: boolean
      selecionado: boolean
      passado: boolean
    }> = []

    // Preenche dias do mês anterior
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const d = totalDiasMesAnterior - i
      const dataCell = new Date(ano, mes - 1, d)
      dataCell.setHours(0, 0, 0, 0)
      celulas.push({
        data: dataCell,
        dia: d,
        mesAtual: false,
        ehHoje: dataCell.getTime() === hoje.getTime(),
        selecionado:
          dataCell.getFullYear() === dataSelecionada.getFullYear() &&
          dataCell.getMonth() === dataSelecionada.getMonth() &&
          dataCell.getDate() === dataSelecionada.getDate(),
        passado: dataCell.getTime() < hoje.getTime(),
      })
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDiasMes; d++) {
      const dataCell = new Date(ano, mes, d)
      dataCell.setHours(0, 0, 0, 0)
      celulas.push({
        data: dataCell,
        dia: d,
        mesAtual: true,
        ehHoje: dataCell.getTime() === hoje.getTime(),
        selecionado:
          dataCell.getFullYear() === dataSelecionada.getFullYear() &&
          dataCell.getMonth() === dataSelecionada.getMonth() &&
          dataCell.getDate() === dataSelecionada.getDate(),
        passado: dataCell.getTime() < hoje.getTime(),
      })
    }

    // Completa os dias do próximo mês para fechar a última linha
    const restante = 42 - celulas.length // 6 semanas completas
    for (let d = 1; d <= (restante > 7 ? restante - 7 : restante); d++) {
      const dataCell = new Date(ano, mes + 1, d)
      dataCell.setHours(0, 0, 0, 0)
      celulas.push({
        data: dataCell,
        dia: d,
        mesAtual: false,
        ehHoje: dataCell.getTime() === hoje.getTime(),
        selecionado:
          dataCell.getFullYear() === dataSelecionada.getFullYear() &&
          dataCell.getMonth() === dataSelecionada.getMonth() &&
          dataCell.getDate() === dataSelecionada.getDate(),
        passado: dataCell.getTime() < hoje.getTime(),
      })
    }

    return celulas
  }, [mesVisivel, dataSelecionada])

  function handleConfirmar() {
    if (!prazoIso) {
      setErro('Selecione uma data e hora válidas.')
      return
    }
    if (estaNoPassado(prazoIso)) {
      setErro('O prazo precisa ser uma data e horário no futuro.')
      return
    }
    setErro(null)
    onConfirmar(prazoIso)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-[#0f1813] border border-white/15 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col text-on-surface"
        style={{
          background: 'linear-gradient(170deg, #111e17 0%, #0d1611 100%)',
        }}
      >
        {/* Cabeçalho do Modal estilo Planilha / Dark Navy */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                <Icon name="schedule" className="text-[20px]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
                {titulo}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant/80 pl-10 max-w-lg">
              {descricao}
            </p>
            {(totalItens != null || totalFornecedores != null) && (
              <div className="flex items-center gap-2 pl-10 pt-1 text-[11px] font-medium text-on-surface-variant">
                {totalItens != null && (
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-on-surface">
                    {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                  </span>
                )}
                {totalFornecedores != null && (
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-on-surface">
                    {totalFornecedores} {totalFornecedores === 1 ? 'fornecedor convidado' : 'fornecedores convidados'}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface rounded-lg p-1.5 hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {/* Barra de Presets Rápidos (Atalhos estilo planilha contábil) */}
        <div className="px-5 py-2.5 bg-black/25 border-b border-white/5 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[11px] uppercase tracking-wider font-bold text-primary/80 shrink-0 flex items-center gap-1">
            <Icon name="bolt" className="text-[14px]" />
            Atalhos:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => aplicarPreset(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-primary/20 hover:text-primary hover:border-primary/40 border border-white/10 transition-all text-on-surface-variant shrink-0 cursor-pointer select-none"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Corpo: Grade Lado a Lado (Calendário à esquerda, Horário à direita) */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 min-h-0">
          {/* Lado Esquerdo: Calendário Mensal Estilizado (7 cols em md) */}
          <div className="md:col-span-7 bg-black/20 rounded-xl border border-white/10 p-3.5 flex flex-col justify-between shadow-inner">
            {/* Cabeçalho do mês com navegação */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Icon name="calendar_month" className="text-[16px] text-primary" />
                {MESES[mesVisivel.getMonth()]} {mesVisivel.getFullYear()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => mudarMes(-1)}
                  className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors cursor-pointer"
                  title="Mês anterior"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => mudarMes(1)}
                  className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors cursor-pointer"
                  title="Próximo mês"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DIAS_SEMANA_NOMES.map((d, i) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 py-0.5">
                  {d}
                </span>
              ))}
            </div>

            {/* Grade dos dias do mês */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {matrizCalendario.map((c, idx) => {
                const desabilitado = c.passado
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={desabilitado}
                    onClick={() => {
                      if (!desabilitado) {
                        setDataSelecionada(c.data)
                        setErro(null)
                      }
                    }}
                    className={`h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative select-none ${
                      c.selecionado
                        ? 'bg-primary text-black font-bold shadow-[0_0_12px_rgba(78,222,163,0.5)] z-10 scale-105'
                        : desabilitado
                        ? 'text-white/20 cursor-not-allowed opacity-40 line-through'
                        : c.ehHoje
                        ? 'border border-primary/50 text-primary font-semibold hover:bg-primary/20'
                        : c.mesAtual
                        ? 'text-on-surface hover:bg-white/10 hover:text-primary'
                        : 'text-white/30 hover:bg-white/5'
                    }`}
                  >
                    {c.dia}
                    {c.ehHoje && !c.selecionado && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lado Direito: Seletor de Horário Limite (5 cols em md) */}
          <div className="md:col-span-5 bg-black/20 rounded-xl border border-white/10 p-3.5 flex flex-col justify-between shadow-inner">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <Icon name="timer" className="text-[16px] text-primary" />
                  Horário de Encerramento
                </span>
                <span className="text-[10px] text-on-surface-variant/70 font-mono">
                  Brasília (UTC-3)
                </span>
              </div>

              {/* Seletor Grande de Hora : Minuto */}
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Hora
                  </span>
                  <select
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-18 h-12 text-center text-xl font-bold bg-[#14231a] border border-primary/40 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-[0_0_10px_rgba(78,222,163,0.15)] cursor-pointer appearance-none px-2"
                  >
                    {HORAS.map((h) => (
                      <option key={h} value={h} className="bg-[#111e17] text-on-surface text-base">
                        {h}h
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-2xl font-bold text-primary/70 mt-4 select-none">:</span>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Minuto
                  </span>
                  <select
                    value={minuto}
                    onChange={(e) => setMinuto(e.target.value)}
                    className="w-18 h-12 text-center text-xl font-bold bg-[#14231a] border border-primary/40 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-[0_0_10px_rgba(78,222,163,0.15)] cursor-pointer appearance-none px-2"
                  >
                    {MINUTOS.map((m) => (
                      <option key={m} value={m} className="bg-[#111e17] text-on-surface text-base">
                        {m}m
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Atalhos Rápidos de Horário */}
              <div>
                <span className="block text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider mb-1.5">
                  Horários Frequentes:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {HORARIOS_RAPIDOS.map((hr, idx) => {
                    const ativo = hora === hr.hora && minuto === hr.minuto
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setHora(hr.hora)
                          setMinuto(hr.minuto)
                          setErro(null)
                        }}
                        className={`py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
                          ativo
                            ? 'bg-primary text-black border-primary font-bold shadow-[0_0_8px_rgba(78,222,163,0.4)]'
                            : 'bg-white/[0.04] text-on-surface-variant hover:text-on-surface hover:bg-white/[0.08] border-white/5'
                        }`}
                      >
                        {hr.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant/60 text-center pt-2">
              Os lances dos fornecedores serão aceitos até o segundo final deste horário.
            </p>
          </div>
        </div>

        {/* Card de Resumo e Prévia Dinâmica */}
        <div className="mx-5 mb-3 p-3 rounded-xl border bg-white/[0.02] flex items-center justify-between gap-3 border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                ehNoPassado
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-primary/15 border-primary/30 text-primary'
              }`}
            >
              <Icon name={ehNoPassado ? 'error' : 'event_available'} className="text-[20px]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant block">
                Prazo Final Definido:
              </span>
              <p className="text-xs sm:text-sm font-bold text-on-surface truncate">
                {descricaoPrazo?.texto || 'Selecione data e hora'}
              </p>
              {descricaoPrazo?.tempo && (
                <span
                  className={`text-[11px] font-medium block ${
                    ehNoPassado ? 'text-red-400 font-semibold' : 'text-primary'
                  }`}
                >
                  {descricaoPrazo.tempo}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Ao Vivo
            </span>
          </div>
        </div>

        {/* Mensagem de Erro (se houver) */}
        {erro && (
          <div className="mx-5 mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2">
            <Icon name="error" className="text-[16px] shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={submitting || ehNoPassado}
            className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-primary hover:bg-primary/90 transition-all shadow-[0_0_18px_rgba(78,222,163,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Salvando…
              </>
            ) : (
              <>
                <Icon name="play_arrow" className="text-[16px]" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
