export interface Chat {
    id: string
    last_message: string
    status: 'read' | 'sent' | 'unread' | null
    username: string
    last_action_timestamp: string
  }
  