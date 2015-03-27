/// <reference path="../Image/RsImage.ts"/>
/// <reference path="EditorAction.ts"/>

module Core {
    export class EditorActionDispatcher {
        private actions: EditorAction[];
        private current: number = -1;

        constructor() {
            this.actions = [];
        }

        process(action: EditorAction): boolean {
            this.actions.splice(this.current + 1);
            this.actions.push(action);
            this.current++;

            return action.execute();
        }

        undo(): boolean {
            if (this.current >= 0) {
                var act = this.actions[this.current];
                this.current--;
                return act.unExecute();
            }

            return true;
        }

        redo(): boolean {
            if (this.current < this.actions.length - 1) {
                this.current++;
                var act = this.actions[this.current];

                return act.execute();
            }

            return true;
        }

        canUndo(): boolean {
            return (this.current >= 0);
        }

        canRedo(): boolean {
            return (this.current < this.actions.length - 1);
        }
    }
}