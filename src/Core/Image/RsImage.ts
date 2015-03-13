module Core {
    export class RsImage {
        private id = '';
        private actionDispatcher: ActionDispatcher = null;

        constructor(private imageData: string, private imageName: string, private imageType: string) {
            this.actionDispatcher = new ActionDispatcher(this);
        }

        getActionDispatcher(): ActionDispatcher {
            return this.actionDispatcher;
        }

        setId(id: string) {
            this.id = id;
        }

        getId(): string {
            return this.id;
        }

        getImage(): Promise<HTMLImageElement> {
            return new Promise<HTMLImageElement>(
                (resolve, reject) => {
                    var img = new Image();

                    img.onload = () => {
                        resolve(img);
                    };

                    img.src = this.imageData;
                });
        }
    }
}