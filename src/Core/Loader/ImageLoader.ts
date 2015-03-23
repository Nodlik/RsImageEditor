/// <reference path="../RsImageEditor.ts"/>
/// <reference path="../Image/RsImage.ts"/>

module Core {
    export class ImageLoader {
        private total: number = 0;

        constructor(private editor: RsImageEditor) {
            this.total = 0;
        }

        load(files: FileList) {
            var i = 0;
            this.total = 0;

            this.editor.UI().showLoader(files.length);

            var p = new Promise<number>(
                (resolve, reject) => {
                    var intervalId = setInterval(
                        () => {
                            if (i < files.length) {
                                var isLast = false;

                                if (i == files.length - 1) {
                                    isLast = true;
                                }

                                this.loadFile(files[i], resolve, isLast);
                                i++;
                            }
                            else {
                                clearInterval(intervalId);
                            }
                        }
                        , 100);
                }
            );

            p.then(() => {
                    this.editor.UI().render();
                }
            );
        }

        loadFile(file: File, resolve, isLast: boolean)
        {
            if (!file.type.match(/image.*/)) {
                return false
            }

            var reader: FileReader = new FileReader();
            reader.onload = (e) => {
                var img = new RsImage(file.name, file.type);
                img.create((<MSBaseReader>e.target).result).then((image) => {
                    this.editor.appendImage(image);

                    this.total++;
                    this.editor.UI().progressLoader(this.total);


                    if (isLast) {
                        resolve(1);
                    }
                });
            };

            reader.readAsDataURL(file);
        }
    }
}