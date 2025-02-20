export interface Chat {
    id: number;
    sender_id: number;
    receiver_id: number;
    status: 'ACTIVE' | 'CLOSED' | 'PENDING';
    closed_by?: number | null;
    last_message?: string | null;
    created_at: Date;
    updated_at: Date;
  }
  