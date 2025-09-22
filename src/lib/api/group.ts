import { Group, Person, TimeBand, Timetable, User } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useRef, useEffect } from 'react'
import useSWR, { KeyedMutator } from 'swr'
import { fetcher, loading } from './user'

export const useGroups = (): {
  groups?: Group[]
  groupsLoading?: 'error' | 'validating' | 'loading'
  mutateGroups: KeyedMutator<{ items: Group[] }>
} => {
  const key = '/api/groups'
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ items: Group[] }>(key, fetcher)
  const groups = data?.items?.map(g => ({ ...g, createdAt: new Date(g.createdAt) }))
  const groupsLoading = loading(key, isLoading, isValidating, error)
  return { groups, groupsLoading, mutateGroups: mutate }
}

export async function createGroup(name: string) {
  const res = await fetch('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const data = await res.json()
  if (res.ok) data.createdAt = new Date(data.createdAt)
  return { ok: res.ok, error: data?.error, group: res.ok ? (data as Group) : undefined }
}

export const useGroup = (
  groupId?: string
): {
  group?: Group
  groupLoading?: 'error' | 'validating' | 'loading'
  mutateGroup: KeyedMutator<Group>
} => {
  const key = groupId && `/api/groups/${groupId}`
  const { data, error, isLoading, isValidating, mutate } = useSWR<Group>(key, fetcher)
  const group = data && { ...data, createdAt: new Date(data.createdAt) }
  const groupLoading = loading(groupId, isLoading, isValidating, error)
  return { group, groupLoading, mutateGroup: mutate }
}

export async function updateGroup(groupId: string, params: { name?: string; comment?: string }) {
  const res = await fetch(`/api/groups/${groupId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  return { ok: res.ok, error: data?.error, group: res.ok ? (data as Group) : undefined }
}

export async function deleteGroup(groupId: string) {
  const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
  const data = await res.json()
  return { ok: res.ok, error: data?.error }
}

export const usePersons = (
  groupId?: string
): {
  persons?: Person[]
  personsLoading?: 'error' | 'validating' | 'loading'
  mutatePersons: KeyedMutator<{ items: Person[] }>
} => {
  const key = groupId && `/api/community/groups/${groupId}/persons`
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ items: Person[] }>(key, fetcher)
  const persons = data?.items?.map(p => ({ ...p, createdAt: new Date(p.createdAt) }))
  const personsLoading = loading(groupId, isLoading, isValidating, error)
  return { persons, personsLoading, mutatePersons: mutate }
}

export async function createPerson(groupId: string, name: string) {
  const res = await fetch(`/api/community/groups/${groupId}/persons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const data = await res.json()
  if (res.ok) data.createdAt = new Date(data.createdAt)
  return { ok: res.ok, error: data?.error, person: res.ok ? (data as Person) : undefined }
}

export async function updatePerson(personId: string, params: { name?: string; comment?: string }) {
  const res = await fetch(`/api/community/persons/${personId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  return { ok: res.ok, error: data?.error, person: res.ok ? (data as Person) : undefined }
}

export async function deletePerson(personId: string) {
  const res = await fetch(`/api/community/persons/${personId}`, { method: 'DELETE' })
  const data = await res.json()
  return { ok: res.ok, error: data?.error }
}

export const useTimetables = (
  groupId?: string
): {
  timetables?: Timetable[]
  timetablesLoading?: 'error' | 'validating' | 'loading'
  mutateTimetables: KeyedMutator<{ items: Timetable[] }>
} => {
  const key = groupId && `/api/community/groups/${groupId}/timetables`
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ items: Timetable[] }>(key, fetcher)
  const timetables = data?.items?.map(t => ({ ...t, createdAt: new Date(t.createdAt) }))
  const timetablesLoading = loading(groupId, isLoading, isValidating, error)
  return { timetables, timetablesLoading, mutateTimetables: mutate }
}

export async function createTimetable(groupId: string, name: string) {
  const res = await fetch(`/api/community/groups/${groupId}/timetables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const data = await res.json()
  if (res.ok) data.createdAt = new Date(data.createdAt)
  return { ok: res.ok, error: data?.error, timetable: res.ok ? (data as Timetable) : undefined }
}

export async function updateTimetable(timetableId: string, params: { name?: string; comment?: string }) {
  const res = await fetch(`/api/community/timetables/${timetableId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  return { ok: res.ok, error: data?.error, timetable: res.ok ? (data as Timetable) : undefined }
}

export async function deleteTimetable(timetableId: string) {
  const res = await fetch(`/api/community/timetables/${timetableId}`, { method: 'DELETE' })
  const data = await res.json()
  return { ok: res.ok, error: data?.error }
}

export const useTimeBands = (timetableId?: string) => {
  const key = timetableId && `/api/community/timetables/${timetableId}/timebands`
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ items: TimeBand[] }>(key, fetcher)
  const timeBands =
    data?.items?.map(b => ({
      ...b,
      startTime: new Date(b.startTime as unknown as string),
      endTime: new Date(b.endTime as unknown as string),
    })) ?? undefined
  const timeBandsLoading = loading(timetableId, isLoading, isValidating, error)
  return { timeBands, timeBandsLoading, mutateTimeBands: mutate }
}

export async function createTimeBand(
  timetableId: string,
  params: { personId: string; startTime: Date | string; endTime: Date | string; comment: string }
) {
  const body = {
    personId: params.personId,
    startTime: typeof params.startTime === 'string' ? params.startTime : params.startTime.toISOString(),
    endTime: typeof params.endTime === 'string' ? params.endTime : params.endTime.toISOString(),
    comment: params.comment ?? '',
  }
  const res = await fetch(`/api/community/timetables/${timetableId}/timebands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (res.ok) {
    data.startTime = new Date(data.startTime)
    data.endTime = new Date(data.endTime)
  }
  return { ok: res.ok, error: data?.error, timeBand: res.ok ? (data as TimeBand) : undefined }
}

export async function deleteTimeBand(timeBandId: string) {
  const res = await fetch(`/api/community/timebands/${timeBandId}`, { method: 'DELETE' })
  const data = await res.json()
  return { ok: res.ok, error: data?.error }
}

export function useGroupFileList(
  groupId: string | undefined,
  path?: string
): {
  files?: { name: string; size: number }[]
  groupFileListLoading?: 'error' | 'validating' | 'loading'
  mutateGroupFileList: KeyedMutator<{ name: string; size: number }[]>
} {
  const encodedPath = path ? path.split('/').map((s: string) => encodeURIComponent(s)).join('/') : ''
  const key = groupId ? `/api/groups/${groupId}/files/${encodedPath || ''}` : null
  
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ name: string; size: number }[]>(
    key, 
    async (url: string) => {
      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error(`${res.statusText}`)
      }
      
      const text = await res.text()
      
      try {
        const json = JSON.parse(text)

        return json
      } catch (e) {
        throw e
      }
    }
  )
  const groupFileListLoading = loading(groupId, isLoading, isValidating, error)

  
  return {
    files: data ?? [],
    groupFileListLoading,
    mutateGroupFileList: mutate,
  }
}

export function useGroupFileContent(
  groupId: string | undefined,
  path: string | undefined
): {
  content?: string
  groupFileContentLoading?: 'error' | 'validating' | 'loading'
  mutateGroupFileContent: KeyedMutator<string>
} {
  const encodedPath = path ? path.split('/').map((s: string) => encodeURIComponent(s)).join('/') : ''
  const key = groupId && path && `/api/groups/${groupId}/files/${encodedPath}`
  const { data, error, isLoading, isValidating, mutate } = useSWR<string>(key, async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.statusText}`)
    return res.text()
  })
  const groupFileContentLoading = loading(key, isLoading, isValidating, error)
  return {
    content: data,
    groupFileContentLoading,
    mutateGroupFileContent: mutate,
  }
}

export async function uploadGroupFile(groupId: string, path: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const encodedPath = path.split('/').map(s => encodeURIComponent(s)).join('/')

  const res = await fetch(`/api/groups/${groupId}/files/${encodedPath}`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  return { ok: res.ok, error: data.error }
}

export async function deleteGroupFile(groupId: string, path: string) {
  const encodedPath = path.split('/').map(s => encodeURIComponent(s)).join('/')

  const res = await fetch(`/api/groups/${groupId}/files/${encodedPath}`, {
    method: 'DELETE',
  })

  const data = await res.json()
  return { ok: res.ok, error: data.error }
}
