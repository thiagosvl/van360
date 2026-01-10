export const WHATSAPP_STATUS = {
    CONNECTED: "CONNECTED",
    DISCONNECTED: "DISCONNECTED",
    CONNECTING: "CONNECTING",
    OPEN: "open", // Evolution API Status
    CLOSE: "close", // Evolution API Status
    UNKNOWN: "UNKNOWN",
    NOT_FOUND: "NOT_FOUND",
    PAIRED: "PAIRED",
    ERROR: "ERROR"
} as const;

export type ConnectionState = typeof WHATSAPP_STATUS[keyof typeof WHATSAPP_STATUS];
