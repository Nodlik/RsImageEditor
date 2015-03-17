/// <reference path="../Image/RsImage.ts"/>
/// <reference path="EditorAction.ts"/>

module Core {
    interface ActionFunction {
        (): Promise<RsImage>;
    }

    export class ActionDispatcher {
        private image: RsImage;
        private actions: EditorAction[];
        private actionsResult: Promise<RsImage>[];
        private current: number = -1;

        constructor(image: RsImage) {
            this.image = image;
            this.actions = [];
            this.actionsResult = [];
        }

        process(action: EditorAction): Promise<any> {
            this.actions = this.actions.splice(this.current);
            this.actions.push(action);
            this.current++;

            this.actionsResult.push(this.doAction(action.execute, action));

            return _.last(this.actionsResult);
        }

        undo(): Promise<RsImage> {
            if (this.current >= 0) {
                var act = this.actions[this.current];
                this.current--;
                this.actionsResult.push(this.doAction(act.unExecute, act));
                return _.last(this.actionsResult);
            }

            return Promise.resolve(this.image);
        }

        redo(): Promise<RsImage> {
            if (this.current < this.actions.length - 1) {
                this.current++;
                var act = this.actions[this.current];
                this.actionsResult.push(this.doAction(act.execute, act));
                return _.last(this.actionsResult);
            }

            return Promise.resolve(this.image);
        }

        private doAction(actionFunction: ActionFunction, object: EditorAction): Promise<any> {
            if (this.actionsResult.length == 0) {
                return actionFunction.apply(object);
            }

            return new Promise<any>(
                (resolve, reject) =>
                {
                    _.last(this.actionsResult).then((img) => {
                        actionFunction.apply(object).then((img) => {
                                resolve(img);
                            }
                        );
                    });
                }
            );
        }
    }
}