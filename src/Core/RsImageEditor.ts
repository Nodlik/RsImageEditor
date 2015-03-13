module Core {
    export class RsImageEditor {
        private ui: UI.Editor;
        private moduleManager: ModuleManager;
        private imageManager: ImageManager;
        private loader: ImageLoader;

        constructor($editor: JQuery) {
            this.imageManager = new ImageManager();
            this.ui = new UI.Editor($editor, this, this.imageManager.newCollection([]));
            this.moduleManager = new ModuleManager(this);
            this.loader = new ImageLoader(this);

            this.ui.render();
        }

        UI(): UI.Editor {
            return this.ui;
        }

        getModuleManager(): ModuleManager {
            return this.moduleManager;
        }

        appendImage(image: RsImage) {
            this.ui.getPage().appendImage(image);
        }

        getLoader(): ImageLoader {
            return this.loader;
        }

        getImageManager(): ImageManager {
            return this.imageManager;
        }
    }
}