module Core {
    export interface EditorModule {
        actions: Core.EditorAction[];

        icon(): string;
        type(): Core.ModuleType;
        parent(): EditorModule;
    }
}