/// <reference path="EditorModule.ts"/>

module Core {
    export enum ModuleViewType {
        SINGLE,
        GRID,
        ANY
    }

    export class ModuleManager {
        private modules: {[name: string]: {module: EditorModule; type: ModuleViewType}} = {};

        constructor(private editor: RsImageEditor)
        {
            this.registerModule('resize', new Modules.ResizeModule(this.editor), ModuleViewType.ANY);
            this.registerModule('color', new Modules.ColorModule(this.editor), ModuleViewType.ANY);
        }

        registerModule(name: string, editorModule: EditorModule, type: ModuleViewType) {
            if (!(name in this.modules)) {
                this.modules[name] = {
                    module: editorModule,
                    type: type
                };
            }
        }

        getModule(name: string): EditorModule {
            if (name in this.modules) {
                return this.modules[name].module;
            }

            throw new Error('Invalid module name')
        }

        getModules(type: ModuleViewType = ModuleViewType.ANY, parent: EditorModule = null): EditorModule[] {
            return _.map(this.modules,
                (value) => {
                    if ((value.type == type) || (type == ModuleViewType.ANY) || (value.type == ModuleViewType.ANY)) {

                        if (value.module.parent() == parent) {
                            return value.module;
                        }
                    }
                }
            );
        }
    }
}