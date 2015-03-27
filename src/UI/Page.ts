/// <reference path="View/ViewInterface.ts"/>
/// <reference path="View/SingleView.ts"/>
/// <reference path="View/GridView.ts"/>

/// <reference path="Toolbar/Toolbar.ts"/>
/// <reference path="Toolbar/GridToolbar.ts"/>
/// <reference path="Toolbar/SingleToolbar.ts"/>

module UI {
    export class Page {
        private view: ViewInterface = null;

        constructor(private editor: Editor, private imageCollection: Core.ImageCollection, private parent: Page = null) {

        }

        hasParent(): boolean {
            return (this.parent != null);
        }

        getParent(): Page {
            return this.parent;
        }

        setImages(imageCollection: Core.ImageCollection) {
            this.imageCollection = imageCollection;

            this.getView().setImages(this.imageCollection);
        }

        appendImage(image: Core.RsImage) {
            this.imageCollection.add(image);
        }

        images(): Core.ImageCollection {
            return this.imageCollection;
        }

        getView(): ViewInterface {
            if (this.view != null) {
                return this.view;
            }

            if (this.imageCollection.getImages().length == 1) {
                this.view = new SingleView(this, this.imageCollection.getImages()[0]);
            }
            else {
                this.view = new GridView(this, this.imageCollection);
            }

            return this.view;
        }

        getToolbar(): Toolbar {
            if (this.imageCollection.getImages().length == 1) {
                return new SingleToolbar(this, this.editor);
            }

            return new GridToolbar(this, this.editor);
        }

        renderInformation() {
            var inf = this.getView().getInformation();
            if (inf != '') {
                this.getInformationPlace().parent().show();
                this.getInformationPlace().html(inf);
            }
            else {
                this.getInformationPlace().parent().hide();
            }
        }

        renderToolbar() {
            this.getToolbar().render();
        }

        render() {
            this.renderToolbar();

            this.getImagePlace().html("");
            this.renderInformation();

            this.getView().render();
        }

        getImagePlace(): JQuery {
            return this.editor.getInterface().getImagePlace();
        }

        getInformationPlace(): JQuery {
            return this.editor.getInterface().getInformationPlace();
        }
    }
}
