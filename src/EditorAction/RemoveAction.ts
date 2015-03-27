module EditorAction {
    export class RemoveAction implements Core.EditorAction {
        constructor(public editor: UI.Editor, public images: Core.RsImage[])
        {

        }

        execute(): boolean {
            this.images.forEach((image) => {
               image.isDeleted = true;
            });

            return true;
        }

        unExecute(): boolean {
            this.images.forEach((image) => {
                image.isDeleted = false;
            });


            return true;
        }
    }
}
