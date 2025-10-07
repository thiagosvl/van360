export type CobrancaNotificacao = {
    id: string;
    cobranca_id: string;
    tipo_origem: 'auto' | 'manual';
    tipo_evento: string; 
    canal: 'whatsapp' | 'email' | 'sms';
    data_envio: Date;
};