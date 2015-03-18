/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
/// <reference path="../../Core/Action/AbstractAction.ts"/>

module Modules {
    export class ResizeAction extends Core.AbstractAction {
        constructor(image:Core.RsImage, private width:number, private height:number) {
            super(image);

            this.image = image;
        }

        getName(): string {
            return 'resize';
        }

        getType(): Core.ActionType {
            return Core.ActionType.FIXED;
        }

        execute() {
            this.saveOldImage();

            var canvasObject = this.drawTempImage();

            return (new Core.ImageResizer(
                    canvasObject.context.getImageData(0, 0, canvasObject.canvas.width, canvasObject.canvas.height),
                    this.width,
                    this.height
                )).resize().then(
                (resizeImage: ImageData) => {
                    canvasObject.canvas.width = this.width;
                    canvasObject.canvas.height = this.height;

                    canvasObject.context.putImageData(resizeImage, 0, 0);
                    this.image.update(resizeImage, canvasObject.canvas.toDataURL());

                    return this.image;
                }
            )
        }
    }
}