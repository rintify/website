export const formatJapaneseDate = (d: Date) => {
  const youbi = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1)
  const day = String(d.getDate())
  const h = String(d.getHours())
  const min = String(d.getMinutes())

  const era = d >= new Date('2019-05-01') ? { name: '令和', year: y - 2018 } : { name: '平成', year: y - 1988 }

  return `${era.name}${era.year}年 ${m}月 ${day}日 (${youbi}) ${h}時 ${min}分`
}

export const createRange = (start: number, end: number, step: number = 1): number[] => {
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step) || step === 0) {
    return []
  }

  const range: number[] = []
  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      range.push(i)
    }
  } else {
    for (let i = start; i >= end; i += step) {
      range.push(i)
    }
  }
  return range
}
