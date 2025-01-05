import { Chat } from './types'

export async function fetchChats(page: number): Promise<Chat[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/chats?page=${page}`, {
    credentials: 'include',
  })
  
  if (response.ok) {
    const data = await response.json()
    return data.chats
  } else if (response.status === 401) {
    throw new Error('Unauthorized')
  } else {
    throw new Error('Failed to fetch chats')
  }
}
