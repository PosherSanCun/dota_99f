declare interface Event {
    on(strEvent: string, callback: (this: void, ...args: any[]) => any): number;
    on(strEvent: string, funcName: string, self: Object): number;
    send(strEvent: string, ...args: any[]): void;
    unregisterByID(nCallbackHandle: number): void;
    unregisterByIDs(tCallbackHandles: number[]): void;
    unregisterAll(this: void): void;
}

declare global {
    var Event: Event;
    interface CDOTAGameRules {
        Event: Event;
    }
}

export {};
