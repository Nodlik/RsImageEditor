module UI {
    export interface ViewInterface {
        needRefresh: boolean;

        type(): Core.ModuleViewType;
        selected(): Core.RsImage[];
        getInformation(): string;

        render();
        update();

        setImages(images: Core.ImageCollection);

        showLoading();
        hideLoading();

        getActualImage(): Core.RsImage[];
    }
}
