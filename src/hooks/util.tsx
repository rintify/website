import { useEffect, useState } from 'react'

export const useClient = () => {
  const [client, setClient] = useState<{ document?: Document; window?: Window }>({})
  useEffect(() => {
    setClient({ document, window })
  }, [])
  return client
}
