/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>

module Modules {
    export class FitAction implements Core.EditorAction {
        private originalImage: ImageData;
        private oldWidth: number;
        private oldHeight: number;

        private isCropped: boolean = false;

        private size: Size;

        constructor(public image: Core.RsImage, private rect: Rect, private method: FitMethod) {
            if (method == FitMethod.RESIZE) {
                this.size = SizeCalculation.getFitSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else if (method == FitMethod.WIDTH) {
                this.size = SizeCalculation.getStretchWidthSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else if (method == FitMethod.HEIGHT) {
                this.size = SizeCalculation.getStretchHeightSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else {
                this.size = SizeCalculation.getStretchRectSize(rect.width, rect.height, this.image.width, this.image.height);
            }
        }

        execute() {
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();

            if ((this.size.width > this.rect.width) || (this.size.height > this.rect.height)) {
                this.originalImage = this.image.getOriginalImage();
                this.isCropped = true;
            }

            this.image.width = this.size.width | 0;
            this.image.height = this.size.height | 0;

            return this.image.save().then((image) => {
                if (this.isCropped) {
                    var w = this.image.width;
                    if (w > this.rect.width) {
                        w = this.rect.width;
                    }

                    var h = this.image.height;
                    if (h > this.rect.height) {
                        h = this.rect.height;
                    }

                    this.image.crop(0, 0, w, h);
                    return this.image.save();
                }
                else {
                    return Promise.resolve(image)
                }
            });
/*
            return new Promise<Core.RsImage>(
                (resolve, reject) => {
                    this.image.save().then((image) => {
                        if (this.isCropped) {
                            var w = this.image.width;
                            if (w > this.rect.width) {
                                w = this.rect.width;
                            }

                            var h = this.image.height;
                            if (h > this.rect.height) {
                                h = this.rect.height;
                            }

                            this.image.crop(0, 0, w, h);
                            this.image.save().then((image) => {
                                resolve(image);
                            })
                        }
                        else {
                            resolve(image);
                        }
                    });
                }
            );*/
        }

        unExecute() {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;

            if (this.isCropped) {
                this.image.replaceOriginal(this.originalImage);
            }

            return this.image.save();
        }
    }
}