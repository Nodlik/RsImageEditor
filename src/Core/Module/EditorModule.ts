/// <reference path="ModuleType.ts"/>

module Core {
    export interface EditorModule {
        icon(): string;
        name(): string;
        type(): Core.ModuleType;
        parent(): EditorModule;
        deinit(): void;
        init($el: JQuery);

        update(): void;

        viewType(): ModuleViewType;
        selectImage(image: RsImage);
        unSelectImage(image: RsImage);
    }
}