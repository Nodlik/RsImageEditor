/// <reference path="../Image/RsImage.ts"/>

module Core {
    export enum ActionType {
        FIXED,
        NOT_FIXED
    }

    export interface EditorAction {
        image: RsImage;

        getName(): string;
        getType(): ActionType;

        execute(): Promise<RsImage>;
        unExecute(): Promise<RsImage>;
    }
}