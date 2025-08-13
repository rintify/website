'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Large, PageBox } from '@/components/ui/Box'
import Button from '@/components/ui/Button'
import { Virtuoso } from 'react-virtuoso'

async function getMeta(): Promise<{ today: string; minDate: string }> {
  const res = await fetch('/api/events/meta', { cache: 'no-store' })
  if (!res.ok) throw new Error('failed to load meta')
  return res.json()
}

async function getDataByDate(dateISO: string) {
  const res = await fetch(`/api/events?date=${dateISO}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const toStartOfLocalDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const addDays = (d: Date, days: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return toStartOfLocalDay(x)
}
const diffInDays = (a: Date, b: Date) => {
  const ms = toStartOfLocalDay(a).getTime() - toStartOfLocalDay(b).getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}
const toISODate = (d: Date) => d.toISOString().slice(0, 10)

function ItemCell({ date }: { date: Date }) {
  const dateISO = useMemo(() => toISODate(date), [date])
  const [text, setText] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setText(null)
    setErr(null)
    ;(async () => {
      try {
        const json = await getDataByDate(dateISO)
        if (alive) setText(json?.label ?? dateISO)
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'error')
      }
    })()
    return () => {
      alive = false
    }
  }, [dateISO])

  return (
    <div style={{ padding: '12px 8px', borderBottom: '1px solid #eee' }}>
      {err ? (
        <span style={{ opacity: 0.6 }}>読み込み失敗: {err}</span>
      ) : (
        (text ?? <span style={{ opacity: 0.6 }}>読み込み中…</span>)
      )}
    </div>
  )
}

export default function Page() {
  const [today, setToday] = useState<Date | null>(null)
  const [minDate, setMinDate] = useState<Date | null>(null)

  const INIT_BACK = 30
  const INIT_FWD = 60
  const CHUNK = 180

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [totalDays, setTotalDays] = useState<number>(0)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const meta = await getMeta()
      if (!alive) return
      const t = toStartOfLocalDay(new Date(meta.today))
      const min = toStartOfLocalDay(new Date(meta.minDate ?? '1970-01-01'))
      const initialStart = new Date(Math.max(addDays(t, -INIT_BACK).getTime(), min.getTime()))
      const initialTotal = diffInDays(addDays(t, INIT_FWD), initialStart) + 1

      setToday(t)
      setMinDate(min)
      setStartDate(initialStart)
      setTotalDays(initialTotal)
    })()
    return () => {
      alive = false
    }
  }, [])

  const initialTopMostItemIndex = useMemo(() => {
    if (!today || !startDate) return 0
    return diffInDays(today, startDate)
  }, [today, startDate])

  const handleEndReached = useCallback(() => {
    setTotalDays(c => c + CHUNK)
  }, [])

  const handleStartReached = useCallback(() => {
    setStartDate(sd => {
      if (!sd || !minDate) return sd
      const target = addDays(sd, -CHUNK)
      const nextStart = new Date(Math.max(target.getTime(), minDate.getTime()))
      const added = diffInDays(sd, nextStart)
      if (added <= 0) return sd
      setTotalDays(c => c + added)
      return nextStart
    })
  }, [minDate])

  if (!today || !startDate || !minDate) {
    return (
      <PageBox>
        <Large>Events</Large>
        <Button>イベントを作成</Button>
        <div style={{ padding: 16, opacity: 0.6 }}>初期化中…</div>
      </PageBox>
    )
  }

  return (
    <PageBox>
      <Large>Events</Large>
      <Button>イベントを作成</Button>

      <Virtuoso
        style={{ width: '100%', height: '70vh' }}
        firstItemIndex={0}
        totalCount={totalDays}
        initialTopMostItemIndex={initialTopMostItemIndex}
        startReached={handleStartReached}
        endReached={handleEndReached}
        increaseViewportBy={{ top: 600, bottom: 600 }}
        itemContent={idx => {
          const date = addDays(startDate, idx)
          return <ItemCell date={date} />
        }}
      />
    </PageBox>
  )
}
