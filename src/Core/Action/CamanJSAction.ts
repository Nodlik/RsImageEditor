/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
/// <reference path="../../Core/Action/AbstractAction.ts"/>


module Core {
    export class CamanJSAction extends Core.AbstractAction {
        constructor(image: Core.RsImage) {
            super(image);

            this.image = image;
        }

        getName(): string {
            return 'brightness';
        }

        getType(): Core.ActionType {
            return Core.ActionType.NOT_FIXED;
        }

        camanAction(camanObject: CamanInitCallback) {
            throw new Error('Not implement');
        }


        execute() {
            this.saveOldImage();

            var canvasObject = this.drawTempImage();

            return new Promise<Core.RsImage>(
                (resolve, reject) => {
                    var self = this;
                    Caman(canvasObject.canvas, function() {
                        self.camanAction(<CamanInitCallback>this);

                        this.render(function () {
                            self.image.update(canvasObject.context.getImageData(0, 0, canvasObject.canvas.width, canvasObject.canvas.height), canvasObject.canvas.toDataURL());

                            resolve(self.image);
                        });
                    });
                }
            )
        }
    }
}