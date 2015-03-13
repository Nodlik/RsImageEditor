module Core {
    export class ImageLoader {
        constructor(private editor: RsImageEditor) {

        }

        load(files: FileList) {
            var i = 0;

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
                this.editor.appendImage(new RsImage((<MSBaseReader>e.target).result, file.name, file.type));

                if (isLast) {
                    resolve(1);
                }
            };

            reader.readAsDataURL(file);
        }
    }
}