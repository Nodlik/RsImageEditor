module UI {
    export interface ViewInterface {
        type(): Core.ModuleViewType;
        selected(): Core.RsImage[];
        getInformation(): string;

        render();
        update();

        setImages(images: Core.ImageCollection);
    }
}
