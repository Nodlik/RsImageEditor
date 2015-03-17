/// <reference path="../Image/RsImage.ts"/>

module Core {
    export interface ActionModule {
        process(): Promise<RsImage>;
    }
}