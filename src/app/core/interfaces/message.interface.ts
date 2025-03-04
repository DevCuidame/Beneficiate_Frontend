export interface Message {
    id: number;
    chat_id: number;
    sender_id: number;
    message: string;
    sender_type: 'USER' | 'AGENT';
    sent_at: string; 
    status?: 'sent' | 'delivered' | 'read'; 
    list?: boolean; 
    options?: string[];
    // senderName?: string;
    // avatarUrl?: string;
    // mediaUrl?: string;
  }
  