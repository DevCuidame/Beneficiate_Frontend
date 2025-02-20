export interface Message {
    id: number;
    message: string;
    type: 'sent' | 'received';
    sent_at: string; 
    status?: 'sent' | 'delivered' | 'read'; 
    // senderName?: string;
    // avatarUrl?: string;
    // mediaUrl?: string;
  }
  