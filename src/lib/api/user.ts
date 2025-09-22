import { Group, Person, TimeBand, Timetable, User } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useRef } from 'react'
import useSWR, { KeyedMutator } from 'swr'

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${res.statusText}`)
  }
  return res.json()
}

export function loading(id: string | undefined, isLoading: boolean, isValidating: boolean, error: any) {
  const preId = useRef(id)

  const loading = !!error
    ? 'error'
    : !id || (!isLoading && !isValidating && id)
      ? undefined
      : id === preId.current
        ? 'validating'
        : 'loading'

  if (!loading) preId.current = id

  return loading
}

export function useSessionUser() {
  const { data, status } = useSession()

  return {
    session: data?.user,
    sessionLoading: status === 'loading',
  }
}

export const useUser = (
  userId?: string
): {
  user?: User
  mutate: KeyedMutator<User>
  userLoading?: 'error' | 'validating' | 'loading'
} => {
  const key = userId && `/api/users/${userId}`
  const { data, error, mutate, isValidating, isLoading } = useSWR<User>(key, fetcher)

  const userLoading = loading(userId, isLoading, isValidating, error)

  if (data) {
    data.createdAt = new Date(data.createdAt)
    data.updatedAt = new Date(data.updatedAt)
  }

  return {
    user: data,
    userLoading,
    mutate,
  }
}


export async function uploadUserIcon(userId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`/api/users/${userId}/icon`, { 
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  return { ok: res.ok, error: data.error }
}