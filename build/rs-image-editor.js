var Core;
(function (Core) {
    var RsImage = (function () {
        function RsImage() {
            this.actionDispatcher = null;
            this.actionDispatcher = new Core.ActionDispatcher(this);
        }
        RsImage.prototype.getActionDispatcher = function () {
            return this.actionDispatcher;
        };
        return RsImage;
    })();
    Core.RsImage = RsImage;
})(Core || (Core = {}));
/// <reference path="../../ts/Action/EditorAction.ts" />
/// <reference path="../../ts/Image/RsImage.ts" />
var Modules;
(function (Modules) {
    var ResizeAction = (function () {
        function ResizeAction(image) {
            this.image = image;
        }
        ResizeAction.prototype.execute = function () {
            return Promise.resolve(this.image);
        };
        ResizeAction.prototype.unExecute = function () {
            return Promise.resolve(this.image);
        };
        return ResizeAction;
    })();
    Modules.ResizeAction = ResizeAction;
})(Modules || (Modules = {}));
var Core;
(function (Core) {
    (function (ModuleType) {
        ModuleType[ModuleType["ACTION"] = 0] = "ACTION";
        ModuleType[ModuleType["DELEGATE"] = 1] = "DELEGATE";
        ModuleType[ModuleType["GROUP"] = 2] = "GROUP";
    })(Core.ModuleType || (Core.ModuleType = {}));
    var ModuleType = Core.ModuleType;
})(Core || (Core = {}));
/// <reference path="../../ts/Module/HtmlModule.ts" />
/// <reference path="../../ts/Module/ModuleType.ts" />
/// <reference path="../../ts/Module/ModuleType.ts" />
/// <reference path="ResizeAction.ts" />
var Modules;
(function (Modules) {
    var ResizeModule = (function () {
        function ResizeModule() {
            this.actions = [];
        }
        ResizeModule.prototype.html = function () {
            return 'good';
        };
        ResizeModule.prototype.init = function ($el) {
        };
        ResizeModule.prototype.icon = function () {
            return 'fa fa-icon';
        };
        ResizeModule.prototype.type = function () {
            return 0 /* ACTION */;
        };
        ResizeModule.prototype.parent = function () {
            return null;
        };
        ResizeModule.prototype.process = function () {
            var i = new Core.RsImage();
            var act = new Modules.ResizeAction(i);
            return i.getActionDispatcher().process(act);
        };
        return ResizeModule;
    })();
    Modules.ResizeModule = ResizeModule;
})(Modules || (Modules = {}));
var Core;
(function (Core) {
    var ActionDispatcher = (function () {
        function ActionDispatcher(image) {
            this.current = 0;
            this.image = image;
            this.actions = [];
        }
        ActionDispatcher.prototype.process = function (action) {
            this.actions.push(action);
            this.current++;
            return action.execute();
        };
        ActionDispatcher.prototype.undo = function () {
            if (this.current > 0) {
                this.actions[this.current--].unExecute();
            }
        };
        ActionDispatcher.prototype.redo = function () {
            if (this.current < this.actions.length - 1) {
                this.actions[this.current++].execute();
            }
        };
        return ActionDispatcher;
    })();
    Core.ActionDispatcher = ActionDispatcher;
})(Core || (Core = {}));
$(function () {
    var m = new Modules.ResizeModule();
    var v = new UI.Editor($('#editor'));
    console.log(m.process().then(function (img) {
        console.log(img);
        return Promise.resolve(img);
    }));
});
var UI;
(function (UI) {
    var Editor = (function () {
        function Editor($editor) {
            this.$editor = $editor;
            this.$editor.css('background-color', 'blue');
        }
        return Editor;
    })();
    UI.Editor = Editor;
})(UI || (UI = {}));
