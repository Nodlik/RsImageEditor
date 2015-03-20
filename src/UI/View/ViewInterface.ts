module UI {
    export interface ViewInterface {
        type(): Core.ModuleViewType;
        selected(): Core.RsImage[];
        getInformation(): string;
        render();
    }
}
