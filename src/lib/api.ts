import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import useSWR, { KeyedMutator } from 'swr';
import base64url from 'base64url'

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${res.statusText}`);
  }
  return res.json();
}

function loading(id: string | undefined, isLoading: boolean, isValidating: boolean, error: any) {
  const preId = useRef(id)

  const loading =
    !!error ? 'error' :
      !id || !isLoading && !isValidating && id ? undefined :
        id === preId.current ? 'validating' : 'loading'

  if (!loading) preId.current = id

  return loading
}

export function useSessionUser() {
  const { data, status } = useSession();

  return {
    session: data?.user,
    sessionLoading: status === 'loading'
  };
}

export const useUser = (userId?: string): {
  user?: User,
  mutate: KeyedMutator<User>,
  userLoading?: 'error' | 'validating' | 'loading'
} => {
  const key = userId && `/api/users/${userId}`;
  const { data, error, mutate, isValidating, isLoading } = useSWR<User>(key, fetcher);

  const userLoading = loading(userId, isLoading, isValidating, error)

  if (data) {
    data.createdAt = new Date(data.createdAt)
    data.updatedAt = new Date(data.updatedAt)
  }

  return {
    user: data,
    userLoading,
    mutate,
  };
};

export function useFiles(userId: string | undefined, scope: string | undefined) {
  const key = userId && scope && `/api/files/${userId}/${scope}`

  const { data, isLoading, isValidating, error, mutate } = useSWR<string[]>(key, fetcher)

  const filesLoading = loading(userId, isLoading, isValidating, error)

  return {
    files: data ?? [],
    filesLoading,
    mutateFiles: mutate,
  }
}

export function useFileContent(userId: string | undefined, scope: string | undefined, filename: string | undefined) {
  const key = userId && filename && `/api/files/${userId}/${scope}/${base64url.encode(filename)}`

  const { data, error,isLoading, isValidating, mutate } = useSWR<string>(key, async (url: string) => {
    const res = await fetch(url!)
    if (!res.ok) throw new Error(`${res.statusText}`)
    return res.text()
  })

  const fileContentLoading = loading(key,isLoading,isValidating,error)

  return {
    content: data,
    fileContentLoading,
    mutateFileContent: mutate,
  }
}

export async function uploadFile(
  userId: string,
  scope: string,
  file: File,
) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`/api/files/${userId}/${scope}`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  return {ok: res.ok, error: data.error}
}

