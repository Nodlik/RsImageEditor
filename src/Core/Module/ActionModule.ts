module Core {
    export interface ActionModule {
        process(): Promise<RsImage>;
    }
}