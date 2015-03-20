/// <reference path="ImageManager.ts"/>
/// <reference path="RsImage.ts"/>

module Core {
    interface ImageResolution {
        width: number;
        height: number;
    }

    export interface ImageCollectionResolution {
        min: ImageResolution;
        max: ImageResolution;
    }

    export class ImageCollection {
        private images: RsImage[] = [];

        constructor(private manager: ImageManager) {

        }

        add(image: RsImage) {
            this.manager.tryAdd(image);
            this.images.push(image);
        }

        has(image: RsImage) {
            return (this.images.indexOf(image) > -1);
        }

        remove(image: RsImage) {
            var idx = this.images.indexOf(image);

            if (idx > -1) {
                this.images.splice(idx, 1);
            }
        }

        getResolutionStats(): ImageCollectionResolution {
            var min: ImageResolution = {
                width: this.images[0].width,
                height:  this.images[0].height
            };

            var max: ImageResolution = {
                width: 0,
                height: 0
            };

            this.images.forEach((img) => {
                if ((img.width * img.height) < (min.width * min.height)) {
                    min.width = img.width;
                    min.height = img.height;
                }

                if ((img.width * img.height) > (max.width * max.height)) {
                    max.width = img.width;
                    max.height = img.height;
                }
            });

            return {
                min: min,
                max: max
            }
        }

        count(): number {
            return this.images.length;
        }

        getImages(): RsImage[] {
            return this.images;
        }

        getImage(imageId: string): ImageCollection {
            var result = new ImageCollection(this.manager);

            this.images.forEach((image) => {
                if (image.getId() == imageId) {
                    result.add(image);
                }
            });

            return result;
        }

        findImage(ids: string[]): RsImage[] {
            var result: RsImage[] = [];

            this.images.forEach((image) => {
                if (_.contains(ids, image.getId())) {
                    result.push(image);
                }
            });

            return result;
        }
    }
}