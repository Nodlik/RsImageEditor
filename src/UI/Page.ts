/// <reference path="View/ViewInterface.ts"/>
/// <reference path="View/SingleView.ts"/>
/// <reference path="View/GridView.ts"/>

/// <reference path="Toolbar/Toolbar.ts"/>
/// <reference path="Toolbar/GridToolbar.ts"/>
/// <reference path="Toolbar/SingleToolbar.ts"/>

module UI {
    export class Page {
        constructor(private editor: Editor, private imageCollection: Core.ImageCollection, private parent: Page = null) {

        }

        hasParent(): boolean {
            return (this.parent != null);
        }

        getParent(): Page {
            return this.parent;
        }

        appendImage(image: Core.RsImage) {
            this.imageCollection.add(image);
        }

        getView(): ViewInterface {
            if (this.imageCollection.getImages().length == 1) {
                return new SingleView(this, this.imageCollection.getImages()[0]);
            }

            return new GridView(this, this.imageCollection);
        }

        getToolbar(): Toolbar {
            if (this.imageCollection.getImages().length == 1) {
                return new SingleToolbar(this, this.editor.getEditor());
            }

            return new GridToolbar(this, this.editor.getEditor());
        }

        render() {
            this.getToolbar().render();

            this.getImagePlace().html("");
            this.getView().render();
        }

        getImagePlace(): JQuery {
            return this.editor.getImagePlace();
        }
    }
}
