var Modules;
(function (Modules) {
    var ResizeAction = (function () {
        function ResizeAction(image) {
            this.image = image;
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
var Modules;
(function (Modules) {
    var ResizeModule = (function () {
        function ResizeModule() {
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
        ResizeModule.prototype.name = function () {
            return 'resize';
        };
        ResizeModule.prototype.process = function () {
            var i = new Core.RsImage('1', '2', '3');
            var act = new Modules.ResizeAction(i);
            return i.getActionDispatcher().process(act);
        };
        return ResizeModule;
    })();
    Modules.ResizeModule = ResizeModule;
})(Modules || (Modules = {}));
var UI;
(function (UI) {
    var Editor = (function () {
        function Editor($el, editor, images) {
            this.$el = $el;
            this.editor = editor;
            this.images = images;
            this.page = null;
            this.$el.append($('<input type="file" id="rsFileInput" multiple />'));
            this.$el.find('#rsFileInput').on('change', function () {
                editor.getLoader().load(this.files);
            });
            this.$el.append($('<div id="rsImagePlace"></div>'));
            this.$imagePlace = this.$el.find('#rsImagePlace');
        }
        Editor.prototype.back = function () {
            if (this.page.hasParent()) {
                this.page = this.page.getParent();
                this.render();
            }
        };
        Editor.prototype.getImagePlace = function () {
            return this.$imagePlace;
        };
        /**
         * Get selected image in editor
         * @returns {any[]}
         */
        Editor.prototype.selected = function () {
            return [];
        };
        Editor.prototype.getEditor = function () {
            return this.editor;
        };
        Editor.prototype.getPage = function () {
            if (this.page == null) {
                this.page = new UI.Page(this, this.images);
            }
            return this.page;
        };
        Editor.prototype.render = function () {
            this.getPage().render();
        };
        return Editor;
    })();
    UI.Editor = Editor;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Page = (function () {
        function Page(editor, imageCollection, parent) {
            if (parent === void 0) { parent = null; }
            this.editor = editor;
            this.imageCollection = imageCollection;
            this.parent = parent;
        }
        Page.prototype.hasParent = function () {
            return (this.parent != null);
        };
        Page.prototype.getParent = function () {
            return this.parent;
        };
        Page.prototype.appendImage = function (image) {
            this.imageCollection.add(image);
        };
        Page.prototype.getView = function () {
            if (this.imageCollection.getImages().length == 1) {
                return new UI.SingleView(this, this.imageCollection.getImages()[0]);
            }
            return new UI.GridView(this, this.imageCollection);
        };
        Page.prototype.getToolbar = function () {
            if (this.imageCollection.getImages().length == 1) {
                return new UI.SingleToolbar(this);
            }
            return new UI.GridToolbar(this);
        };
        Page.prototype.render = function () {
            this.getToolbar().render();
            this.getImagePlace().html("");
            this.getView().render();
        };
        Page.prototype.getImagePlace = function () {
            return this.editor.getImagePlace();
        };
        return Page;
    })();
    UI.Page = Page;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var GridToolbar = (function () {
        function GridToolbar(page) {
            this.page = page;
        }
        GridToolbar.prototype.render = function () {
        };
        return GridToolbar;
    })();
    UI.GridToolbar = GridToolbar;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var SingleToolbar = (function () {
        function SingleToolbar(page) {
            this.page = page;
        }
        SingleToolbar.prototype.render = function () {
        };
        return SingleToolbar;
    })();
    UI.SingleToolbar = SingleToolbar;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var GridView = (function () {
        function GridView(page, imageCollection) {
            this.page = page;
            this.imageCollection = imageCollection;
        }
        GridView.prototype.render = function () {
            var _this = this;
            this.imageCollection.getImages().forEach(function (img) {
                _this.renderImage(img);
            });
        };
        GridView.prototype.renderImage = function (image) {
            var _this = this;
            image.getImage().then(function (img) {
                var html = '<div id="' + image.getId() + '"><img style="max-width: 200px" src="' + img.src + '" /></div>';
                _this.page.getImagePlace().append($(html));
            });
        };
        return GridView;
    })();
    UI.GridView = GridView;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var SingleView = (function () {
        function SingleView(page, image) {
            this.page = page;
            this.image = image;
            this.canvas = null;
        }
        SingleView.prototype.render = function () {
            var _this = this;
            this.getCanvas().then(function () {
                _this.renderImage();
            });
        };
        SingleView.prototype.renderImage = function () {
            this.context.drawImage(this.htmlImage, 0, 0);
        };
        SingleView.prototype.getCanvas = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.page.getImagePlace().append($('<canvas id="' + _this.image.getId() + '"></canvas>'));
                _this.canvas = _this.page.getImagePlace().find('#' + _this.image.getId())[0];
                _this.image.getImage().then(function (img) {
                    _this.htmlImage = img;
                    _this.canvas.width = img.width;
                    _this.canvas.height = img.height;
                    _this.context = _this.canvas.getContext('2d');
                    resolve(true);
                });
            });
        };
        return SingleView;
    })();
    UI.SingleView = SingleView;
})(UI || (UI = {}));
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
                return this.actions[this.current--].unExecute();
            }
            return Promise.resolve();
        };
        ActionDispatcher.prototype.redo = function () {
            if (this.current < this.actions.length - 1) {
                return this.actions[this.current++].execute();
            }
            return Promise.resolve();
        };
        return ActionDispatcher;
    })();
    Core.ActionDispatcher = ActionDispatcher;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var ImageCollection = (function () {
        function ImageCollection(manager) {
            this.manager = manager;
            this.images = [];
        }
        ImageCollection.prototype.add = function (image) {
            this.manager.tryAdd(image);
            this.images.push(image);
        };
        ImageCollection.prototype.has = function (image) {
            return (this.images.indexOf(image) > -1);
        };
        ImageCollection.prototype.remove = function (image) {
            var idx = this.images.indexOf(image);
            if (idx > -1) {
                this.images.splice(idx, 1);
            }
        };
        ImageCollection.prototype.getImages = function () {
            return this.images;
        };
        return ImageCollection;
    })();
    Core.ImageCollection = ImageCollection;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var ImageManager = (function () {
        function ImageManager() {
            this.images = {};
            this.collections = [];
        }
        ImageManager.prototype.newCollection = function (images) {
            var c = new Core.ImageCollection(this);
            for (var img in images) {
                c.add(img);
            }
            this.collections.push(c);
            return c;
        };
        ImageManager.prototype.tryAdd = function (image) {
            if (image.getId() == '') {
                var key = Math.random().toString(36).substring(7);
                while (_.has(this.images, key)) {
                    key = Math.random().toString(36).substring(7);
                }
                image.setId(key);
                this.add(image);
            }
        };
        ImageManager.prototype.add = function (image) {
            this.images[image.getId()] = image;
        };
        ImageManager.prototype.has = function (image) {
            return _.has(this.images, image.getId());
        };
        ImageManager.prototype.remove = function (image) {
        };
        return ImageManager;
    })();
    Core.ImageManager = ImageManager;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var RsImage = (function () {
        function RsImage(imageData, imageName, imageType) {
            this.imageData = imageData;
            this.imageName = imageName;
            this.imageType = imageType;
            this.id = '';
            this.actionDispatcher = null;
            this.actionDispatcher = new Core.ActionDispatcher(this);
        }
        RsImage.prototype.getActionDispatcher = function () {
            return this.actionDispatcher;
        };
        RsImage.prototype.setId = function (id) {
            this.id = id;
        };
        RsImage.prototype.getId = function () {
            return this.id;
        };
        RsImage.prototype.getImage = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    resolve(img);
                };
                img.src = _this.imageData;
            });
        };
        return RsImage;
    })();
    Core.RsImage = RsImage;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var ImageLoader = (function () {
        function ImageLoader(editor) {
            this.editor = editor;
        }
        ImageLoader.prototype.load = function (files) {
            var _this = this;
            var i = 0;
            var p = new Promise(function (resolve, reject) {
                var intervalId = setInterval(function () {
                    if (i < files.length) {
                        var isLast = false;
                        if (i == files.length - 1) {
                            isLast = true;
                        }
                        _this.loadFile(files[i], resolve, isLast);
                        i++;
                    }
                    else {
                        clearInterval(intervalId);
                    }
                }, 100);
            });
            p.then(function () {
                _this.editor.UI().render();
            });
        };
        ImageLoader.prototype.loadFile = function (file, resolve, isLast) {
            var _this = this;
            if (!file.type.match(/image.*/)) {
                return false;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                _this.editor.appendImage(new Core.RsImage(e.target.result, file.name, file.type));
                if (isLast) {
                    resolve(1);
                }
            };
            reader.readAsDataURL(file);
        };
        return ImageLoader;
    })();
    Core.ImageLoader = ImageLoader;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var ModuleManager = (function () {
        function ModuleManager(editor) {
            this.editor = editor;
            this.modules = {};
            this.registerModule('resize', new Modules.ResizeModule());
        }
        ModuleManager.prototype.registerModule = function (name, editorModule) {
            if (!(name in this.modules)) {
                this.modules[name] = editorModule;
            }
        };
        ModuleManager.prototype.getModule = function (name) {
            if (name in this.modules) {
                return this.modules[name];
            }
            throw new Error('Invalid module name');
        };
        ModuleManager.prototype.getModules = function () {
            return _.values(this.modules);
        };
        return ModuleManager;
    })();
    Core.ModuleManager = ModuleManager;
})(Core || (Core = {}));
var Core;
(function (Core) {
    (function (ModuleType) {
        ModuleType[ModuleType["ACTION"] = 0] = "ACTION";
        ModuleType[ModuleType["DELEGATE"] = 1] = "DELEGATE";
        ModuleType[ModuleType["GROUP"] = 2] = "GROUP";
    })(Core.ModuleType || (Core.ModuleType = {}));
    var ModuleType = Core.ModuleType;
})(Core || (Core = {}));
var Core;
(function (Core) {
    var RsImageEditor = (function () {
        function RsImageEditor($editor) {
            this.imageManager = new Core.ImageManager();
            this.ui = new UI.Editor($editor, this, this.imageManager.newCollection([]));
            this.moduleManager = new Core.ModuleManager(this);
            this.loader = new Core.ImageLoader(this);
            this.ui.render();
        }
        RsImageEditor.prototype.UI = function () {
            return this.ui;
        };
        RsImageEditor.prototype.getModuleManager = function () {
            return this.moduleManager;
        };
        RsImageEditor.prototype.appendImage = function (image) {
            this.ui.getPage().appendImage(image);
        };
        RsImageEditor.prototype.getLoader = function () {
            return this.loader;
        };
        RsImageEditor.prototype.getImageManager = function () {
            return this.imageManager;
        };
        return RsImageEditor;
    })();
    Core.RsImageEditor = RsImageEditor;
})(Core || (Core = {}));
