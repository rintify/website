import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import useSWR, { KeyedMutator } from 'swr';
 
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<User>;
}

export function useSessionUser() {
  const { data, status } = useSession();

  return {
    session: data?.user,
    sessionLoading: status === 'loading'
  };
}

export const useUser = (id?: string): {
  user?: User,
  mutate: KeyedMutator<User>,
  userLoading?: 'error' | 'validating' | 'loading'
} => {
  const url = id && `/api/users/${encodeURIComponent(id)}`;
  const { data, error, mutate, isValidating, isLoading } = useSWR<User>(url, fetcher);
  const preId = useRef(id)

  const userLoading =
    !!error ? 'error' :
    !id || !isLoading && !isValidating && data ? undefined :
      id === preId.current ? 'validating' : 'loading'

  if(!userLoading) preId.current = id

  if(data){
    data.createdAt = new Date(data.createdAt)
    data.updatedAt = new Date(data.updatedAt)
  }

  return {
    user: data,
    userLoading,
    mutate,
  };
};



