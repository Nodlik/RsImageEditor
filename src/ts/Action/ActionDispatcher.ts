module Core {
    export class ActionDispatcher {
        private image: RsImage;
        private actions: EditorAction[];
        private current: number = 0;

        constructor(image: RsImage) {
            this.image = image;
            this.actions = [];
        }

        process(action: EditorAction): Promise<RsImage> {
            this.actions.push(action);
            this.current++;

            return action.execute();
        }

        undo() {
            if (this.current > 0) {
                this.actions[this.current--].unExecute();
            }
        }

        redo() {
            if (this.current < this.actions.length - 1) {
                this.actions[this.current++].execute();
            }
        }
    }
}