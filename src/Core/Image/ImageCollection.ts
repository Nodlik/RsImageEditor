module Core {
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

        remove (image: RsImage) {
            var idx = this.images.indexOf(image);

            if (idx > -1) {
                this.images.splice(idx, 1);
            }
        }

        getImages(): RsImage[] {
            return this.images;
        }
    }
}