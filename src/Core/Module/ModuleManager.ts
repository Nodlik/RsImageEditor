module Core {
    export class ModuleManager {
        private modules: {[name: string]: EditorModule} = {};

        constructor(private editor: RsImageEditor) {
            this.registerModule('resize', new Modules.ResizeModule());
        }

        registerModule(name: string, editorModule: EditorModule) {
            if (!(name in this.modules)) {
                this.modules[name] = editorModule;
            }
        }

        getModule(name: string): EditorModule {
            if (name in this.modules) {
                return this.modules[name];
            }

            throw new Error('Invalid module name')
        }

        getModules(): EditorModule[] {
            return _.values(this.modules);
        }
    }
}