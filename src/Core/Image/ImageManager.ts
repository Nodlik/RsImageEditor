module Core {
    export class ImageManager {
        private images: {[id: string]: RsImage} = {};
        private collections: ImageCollection[] = [];

        constructor() {

        }

        newCollection(images: RsImage[]): ImageCollection {
            var c = new ImageCollection(this);

            for (var img in images) {
                c.add(img);
            }

            this.collections.push(c);

            return c;
        }

        tryAdd(image: RsImage) {
            if (image.getId() == '') {
                var key = Math.random().toString(36).substring(7);

                while (_.has(this.images, key)) {
                    key = Math.random().toString(36).substring(7);
                }

                image.setId(key);
                this.add(image);
            }
        }

        add(image: RsImage) {
            this.images[image.getId()] = image;
        }

        has(image: RsImage) {
            return _.has(this.images, image.getId());
        }

        remove(image: RsImage) {

        }
    }
}