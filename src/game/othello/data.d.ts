export interface OthelloMessage {
    x: number;
    y: number;
    childType: 'COME_ROOM' | 'INTI_GAME' | 'READY_GAME' | 'PUT_CHESS' | 'RESTART_GAME';
}

export interface Message {
    type: string;
    data: string;
    targetId: string;
}
