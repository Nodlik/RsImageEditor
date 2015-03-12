module Core {
    export class RsImage {
        private actionDispatcher: ActionDispatcher = null;

        constructor() {
            this.actionDispatcher = new ActionDispatcher(this);
        }

        getActionDispatcher(): ActionDispatcher {
            return this.actionDispatcher;
        }
    }
}