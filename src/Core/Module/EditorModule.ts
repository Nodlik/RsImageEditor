/// <reference path="ModuleType.ts"/>

module Core {
    export interface EditorModule {
        icon(): string;
        name(): string;
        type(): Core.ModuleType;
        parent(): EditorModule;
        deinit(): void;
        init($el: JQuery);

        viewType(): ModuleViewType;
    }
}