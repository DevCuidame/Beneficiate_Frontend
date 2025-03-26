export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  message: string;
  sender_type: 'USER' | 'AGENT' | 'BOT' | 'SYSTEM';
  sent_at: string;
  status?: 'sent' | 'delivered' | 'read';
  
  // Nuevas propiedades para soporte de opciones seleccionables
  list?: boolean;
  options?: string[];
  is_search?: boolean;
}