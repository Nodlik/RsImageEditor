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

        undo(): Promise<RsImage> {
            if (this.current > 0) {
                return this.actions[this.current--].unExecute();
            }

            return Promise.resolve();
        }

        redo(): Promise<RsImage> {
            if (this.current < this.actions.length - 1) {
                return this.actions[this.current++].execute();
            }

            return Promise.resolve();
        }
    }
}