module UI {
    export interface ViewInterface {
        needRefresh: boolean;

        type(): Core.ModuleViewType;
        selected(): Core.RsImage[];
        getInformation(): string;

        render();
        update();
        update(image: Core.RsImage);

        setImages(images: Core.ImageCollection);

        showLoading();
        hideLoading();

        getActualImage(): Core.RsImage[];
    }
}
