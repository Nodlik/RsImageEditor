/// <reference path="../Image/RsImage.ts"/>
/// <reference path="../Image/RsImage.ts"/>
/// <reference path="ImageAction.ts"/>
var Core;
(function (Core) {
    var ActionDispatcher = (function () {
        function ActionDispatcher(image) {
            this.current = -1;
            this.image = image;
            this.actions = [];
            this.actionsResult = [];
        }
        ActionDispatcher.prototype.process = function (action) {
            this.actions.splice(this.current + 1);
            this.actions.push(action);
            this.current++;
            this.actionsResult.splice(this.current);
            this.actionsResult.push(this.doAction(action.execute, action));
            return _.last(this.actionsResult);
        };
        ActionDispatcher.prototype.getUndoAction = function () {
            if (this.current >= 0) {
                return this.actions[this.current];
            }
            return null;
        };
        ActionDispatcher.prototype.getRedoAction = function () {
            if (this.current < this.actions.length - 1) {
                return this.actions[this.current + 1];
            }
            return null;
        };
        ActionDispatcher.prototype.undo = function () {
            if (this.current >= 0) {
                var act = this.actions[this.current];
                this.current--;
                this.actionsResult.push(this.doAction(act.unExecute, act));
                return _.last(this.actionsResult);
            }
            return Promise.resolve(this.image);
        };
        ActionDispatcher.prototype.redo = function () {
            if (this.current < this.actions.length - 1) {
                this.current++;
                var act = this.actions[this.current];
                this.actionsResult.push(this.doAction(act.execute, act));
                return _.last(this.actionsResult);
            }
            return Promise.resolve(this.image);
        };
        ActionDispatcher.prototype.doAction = function (actionFunction, object) {
            var _this = this;
            if (this.actionsResult.length == 0) {
                return actionFunction.apply(object);
            }
            return new Promise(function (resolve, reject) {
                _.last(_this.actionsResult).then(function (img) {
                    actionFunction.apply(object).then(function (img) {
                        resolve(img);
                    });
                });
            });
        };
        return ActionDispatcher;
    })();
    Core.ActionDispatcher = ActionDispatcher;
})(Core || (Core = {}));
/// <reference path="../Action/ActionDispatcher.ts"/>
var Core;
(function (Core) {
    var RsImage = (function () {
        function RsImage(imageName, imageType) {
            this.imageName = imageName;
            this.imageType = imageType;
            this.id = '';
            this.actionDispatcher = null;
            this.imageBase64 = ''; // BASE 64 processed image
            this.image = null;
            this.caman = null;
            this.forceCamanUpdate = false;
            this.isDeleted = false;
            this.brightness = 0;
            this.vibrance = 0;
            this.hue = 0;
            this.gamma = 0;
            this.clip = 0;
            this.stackBlur = 0;
            this.contrast = 0;
            this.saturation = 0;
            this.exposure = 0;
            this.sepia = 0;
            this.noise = 0;
            this.sharpen = 0;
            this.filter = null;
            this.actionDispatcher = new Core.ActionDispatcher(this);
        }
        RsImage.prototype.create = function (imageBase64) {
            var _this = this;
            this.imageBase64 = imageBase64;
            return new Promise(function (resolve, reject) {
                _this.createImagePromise();
                _this.getImage().then(function (img) {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0);
                    _this.originalImage = context.getImageData(0, 0, img.width, img.height);
                    _this.imageBase64 = canvas.toDataURL(_this.imageType, 0.8);
                    canvas.width = 1;
                    canvas.height = 1;
                    _this.init();
                    resolve(_this);
                });
            });
        };
        RsImage.prototype.init = function () {
            this.processedImage = this.originalImage;
            this.width = this.originalImage.width;
            this.height = this.originalImage.height;
            this.brightness = 0;
        };
        RsImage.prototype.getOriginalCoordinates = function (x, y) {
            return {
                x: (this.originalImage.width * x) / this.processedImage.width | 0,
                y: (this.originalImage.height * y) / this.processedImage.height | 0
            };
        };
        RsImage.prototype.getOriginalImage = function () {
            return this.originalImage;
        };
        RsImage.prototype.replaceOriginal = function (image) {
            this.originalImage = image;
        };
        RsImage.prototype.crop = function (left, top, width, height) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = this.originalImage.width;
            canvas.height = this.originalImage.height;
            context.putImageData(this.originalImage, 0, 0);
            var corner = this.getOriginalCoordinates(left, top);
            var size = this.getOriginalCoordinates(width, height);
            this.originalImage = null;
            this.originalImage = context.getImageData(corner.x, corner.y, size.x, size.y);
            this.width = width;
            this.height = height;
            this.forceCamanUpdate = true;
        };
        RsImage.prototype.getCaman = function (imageData, update) {
            if (update === void 0) { update = false; }
            if ((!update) && (this.caman != null)) {
                return Promise.resolve(this.caman);
            }
            return new Promise(function (resolve, reject) {
                var camanCanvas = document.createElement('canvas');
                var camanContext = camanCanvas.getContext('2d');
                camanCanvas.width = imageData.width;
                camanCanvas.height = imageData.height;
                camanContext.putImageData(imageData, 0, 0);
                Caman(camanCanvas, function () {
                    resolve(this);
                });
            });
        };
        RsImage.prototype.save = function () {
            var _this = this;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = this.originalImage.width;
            canvas.height = this.originalImage.height;
            console.time('save');
            context.putImageData(this.originalImage, 0, 0);
            /* RESIZE */
            var resizePromise;
            var updateCaman = false;
            if (this.forceCamanUpdate) {
                updateCaman = true;
                this.forceCamanUpdate = false;
            }
            if ((this.width != this.processedImage.width) && (this.height != this.processedImage.height)) {
                updateCaman = true;
            }
            if ((this.width != this.originalImage.width) || (this.height != this.originalImage.height)) {
                resizePromise = (new Core.ImageResizer(this.originalImage, this.width, this.height)).resize();
            }
            else {
                resizePromise = Promise.resolve(context.getImageData(0, 0, this.width, this.height));
            }
            canvas.width = 1;
            canvas.height = 1;
            canvas = null;
            /* CAMAN */
            return resizePromise.then(function (imageData) {
                return _this.getCaman(imageData, updateCaman);
            }).then(function (caman) {
                _this.caman = caman;
                _this.caman.revert();
                _this.caman.brightness(_this.brightness);
                _this.caman.vibrance(_this.vibrance);
                if (_this.filter !== null) {
                    _this.caman[_this.filter.name].apply(_this.caman, _this.filter.parameters);
                }
                return new Promise(function (resolve, reject) {
                    _this.caman.render(function () {
                        resolve(_this.caman.imageData);
                    });
                });
            }).then(function (imageData) {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                _this.processedImage = null;
                _this.processedImage = imageData;
                canvas.width = _this.processedImage.width;
                canvas.height = _this.processedImage.height;
                context.putImageData(_this.processedImage, 0, 0);
                _this.imageBase64 = canvas.toDataURL(_this.imageType, 0.8);
                canvas.width = 1;
                canvas.height = 1;
                canvas = null;
                _this.getImage().then(function () {
                    _this.createImagePromise();
                });
                console.timeEnd('save');
                return _this;
            });
        };
        RsImage.prototype.getSize = function () {
            return Math.round(atob(this.getImageBase64().substr(this.getImageBase64().indexOf(';base64') + 8)).length / (1000));
        };
        RsImage.prototype.getImageData = function () {
            return this.processedImage;
        };
        RsImage.prototype.getWidth = function () {
            return this.processedImage.width;
        };
        RsImage.prototype.getHeight = function () {
            return this.processedImage.height;
        };
        RsImage.prototype.getName = function () {
            return this.imageName;
        };
        RsImage.prototype.getLabel = function () {
            return '';
        };
        RsImage.prototype.getType = function () {
            return this.imageType;
        };
        RsImage.prototype.getImageBase64 = function () {
            return this.imageBase64;
        };
        RsImage.prototype.getActionDispatcher = function () {
            return this.actionDispatcher;
        };
        RsImage.prototype.setId = function (id) {
            this.id = id;
        };
        RsImage.prototype.getId = function () {
            return this.id;
        };
        RsImage.prototype.createImagePromise = function () {
            var _this = this;
            this.imagePromise = new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    if (_this.image != null) {
                        _this.image.src = "about:blank";
                    }
                    _this.image = img;
                    resolve(_this.image);
                };
                img.src = _this.imageBase64;
            });
        };
        RsImage.prototype.getImage = function () {
            return this.imagePromise;
        };
        return RsImage;
    })();
    Core.RsImage = RsImage;
})(Core || (Core = {}));
/// <reference path="../Action/ActionDispatcher.ts"/>
var Core;
(function (Core) {
    var ImageResizer = (function () {
        function ImageResizer(original, newWidth, newHeight) {
            this.original = original;
            this.newWidth = newWidth;
            this.newHeight = newHeight;
            this.size = this.original.data.length;
        }
        ImageResizer.prototype.resize = function () {
            return this.picaResize();
        };
        ImageResizer.prototype.picaResize = function (quality) {
            var _this = this;
            if (quality === void 0) { quality = 3; }
            return new Promise(function (resolve, reject) {
                pica.resizeBuffer({
                    src: _this.original.data,
                    width: _this.original.width,
                    height: _this.original.height,
                    toWidth: _this.newWidth,
                    toHeight: _this.newHeight,
                    alpha: true,
                    quality: quality
                }, function (err, data) {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    var newImageData = context.createImageData(_this.newWidth, _this.newHeight);
                    for (var i = 0; i < data.length; i++) {
                        newImageData.data[i] = data[i];
                    }
                    canvas.width = 1;
                    canvas.height = 1;
                    resolve(newImageData);
                });
            });
        };
        return ImageResizer;
    })();
    Core.ImageResizer = ImageResizer;
})(Core || (Core = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>
var Modules;
(function (Modules) {
    var BrightnessAction = (function () {
        function BrightnessAction(image, brightness) {
            this.image = image;
            this.brightness = brightness;
            this.needRender = false;
        }
        BrightnessAction.prototype.execute = function () {
            this.oldBrightness = this.image.brightness;
            this.image.brightness = this.brightness;
            return this.image.save();
        };
        BrightnessAction.prototype.unExecute = function () {
            this.image.brightness = this.oldBrightness;
            return this.image.save();
        };
        return BrightnessAction;
    })();
    Modules.BrightnessAction = BrightnessAction;
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
/// <reference path="ModuleType.ts"/>
/// <reference path="EditorModule.ts"/>
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
        /**
         * generate unique id to image
         *
         * @param image
         */
        ImageManager.prototype.tryAdd = function (image) {
            // wtf?
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
/// <reference path="ImageManager.ts"/>
/// <reference path="RsImage.ts"/>
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
        ImageCollection.prototype.getResolutionStats = function () {
            var min = {
                width: this.images[0].width,
                height: this.images[0].height
            };
            var max = {
                width: 0,
                height: 0
            };
            this.images.forEach(function (img) {
                if (!img.isDeleted) {
                    if ((img.width * img.height) < (min.width * min.height)) {
                        min.width = img.width;
                        min.height = img.height;
                    }
                    if ((img.width * img.height) > (max.width * max.height)) {
                        max.width = img.width;
                        max.height = img.height;
                    }
                }
            });
            return {
                min: min,
                max: max
            };
        };
        ImageCollection.prototype.count = function () {
            return this.getImages().length;
        };
        ImageCollection.prototype.getAll = function () {
            return this.images;
        };
        ImageCollection.prototype.getImages = function () {
            var result = [];
            this.images.forEach(function (img) {
                if (!img.isDeleted) {
                    result.push(img);
                }
            });
            return result;
        };
        ImageCollection.prototype.getImage = function (imageId) {
            var result = new ImageCollection(this.manager);
            this.images.forEach(function (image) {
                if (!image.isDeleted) {
                    if (image.getId() == imageId) {
                        result.add(image);
                    }
                }
            });
            return result;
        };
        ImageCollection.prototype.findImage = function (ids) {
            var result = [];
            this.images.forEach(function (image) {
                if (_.contains(ids, image.getId())) {
                    if (!image.isDeleted) {
                        result.push(image);
                    }
                }
            });
            return result;
        };
        return ImageCollection;
    })();
    Core.ImageCollection = ImageCollection;
})(Core || (Core = {}));
/// <reference path="../Image/RsImage.ts"/>
/// <reference path="../Image/RsImage.ts"/>
/// <reference path="EditorAction.ts"/>
var Core;
(function (Core) {
    var EditorActionDispatcher = (function () {
        function EditorActionDispatcher() {
            this.current = -1;
            this.actions = [];
        }
        EditorActionDispatcher.prototype.process = function (action) {
            this.actions.splice(this.current + 1);
            this.actions.push(action);
            this.current++;
            return action.execute();
        };
        EditorActionDispatcher.prototype.undo = function () {
            if (this.current >= 0) {
                var act = this.actions[this.current];
                this.current--;
                return act.unExecute();
            }
            return true;
        };
        EditorActionDispatcher.prototype.redo = function () {
            if (this.current < this.actions.length - 1) {
                this.current++;
                var act = this.actions[this.current];
                return act.execute();
            }
            return true;
        };
        EditorActionDispatcher.prototype.canUndo = function () {
            return (this.current >= 0);
        };
        EditorActionDispatcher.prototype.canRedo = function () {
            return (this.current < this.actions.length - 1);
        };
        return EditorActionDispatcher;
    })();
    Core.EditorActionDispatcher = EditorActionDispatcher;
})(Core || (Core = {}));
var UI;
(function (UI) {
    var ZoomType;
    (function (ZoomType) {
        ZoomType[ZoomType["WIDTH"] = 0] = "WIDTH";
        ZoomType[ZoomType["HEIGHT"] = 1] = "HEIGHT";
        ZoomType[ZoomType["SOURCE"] = 2] = "SOURCE";
    })(ZoomType || (ZoomType = {}));
    var SingleView = (function () {
        function SingleView(page, image) {
            this.page = page;
            this.image = image;
            this.needRefresh = false;
            this.canvas = null;
            this.scale = 1;
            this.scale = 1;
            this.$loading = $('<div class="rs-singleView-loader" style="display: none">' + '<i class="fa fa-cog fa-spin"></i> Rendering... </div>"');
        }
        SingleView.prototype.type = function () {
            return 0 /* SINGLE */;
        };
        SingleView.prototype.getActualImage = function () {
            return [this.image];
        };
        SingleView.prototype.update = function () {
            this.hideLoading();
            if (!this.needRefresh) {
                this.renderImage();
                this.page.renderInformation();
                $("#zoomValue").text(Math.floor(this.scale * 100) + '%');
            }
            else {
                this.render();
            }
        };
        SingleView.prototype.setImages = function (images) {
            if (images.count() != 1) {
                throw new Error('Invalid image collection');
            }
            this.image = images.getImages()[0];
            this.scale = 1;
        };
        SingleView.prototype.showLoading = function () {
            this.$loading.show();
        };
        SingleView.prototype.hideLoading = function () {
            this.$loading.hide();
        };
        SingleView.prototype.render = function () {
            var _this = this;
            this.hideLoading();
            this.page.getImagePlace().html(nunjucks.render('single.image.html.njs', {}));
            this.getCanvas();
            this.renderImage();
            this.setScale(this.scale);
            var $b = $('body');
            $b.off('.view');
            $b.on('click.view', '#fitToWidth', function () {
                _this.setZoom(0 /* WIDTH */);
                return false;
            });
            $b.on('click.view', '#sourceSize', function () {
                _this.setZoom(2 /* SOURCE */);
                return false;
            });
            this.page.getImagePlace().find('.rs-single-image').append(this.$loading);
            this.needRefresh = false;
        };
        SingleView.prototype.setZoom = function (zoom) {
            var $container = this.page.getImagePlace().find('.rs-single-image');
            var $canvas = $container.find('canvas');
            var value = 1;
            if (zoom == 0 /* WIDTH */) {
                value = ($container.width() / $canvas.width());
                $container.css('overflow', 'hidden');
            }
            else if (zoom == 2 /* SOURCE */) {
                $container.css('overflow', 'scroll');
            }
            this.setScale(value);
        };
        SingleView.prototype.setScale = function (scale) {
            var $container = this.page.getImagePlace().find('.rs-single-image');
            var $canvas = $container.find('canvas');
            $container.scrollLeft(0);
            $container.scrollTop(0);
            $canvas.css('transform-origin', '0 0');
            $canvas.css('transform', 'scale(' + scale + ')');
            this.scale = scale;
            $("#zoomValue").text(Math.floor(scale * 100) + '%');
        };
        SingleView.prototype.getScale = function () {
            return this.scale;
        };
        SingleView.prototype.selected = function () {
            return [this.image];
        };
        SingleView.prototype.getAreaElement = function () {
            return this.page.getImagePlace().find('#rsSingleImage');
        };
        SingleView.prototype.getInformation = function () {
            return nunjucks.render('single.information.html.njs', {
                resolution: this.image.width + 'x' + this.image.height,
                size: this.image.getSize() + ' kb',
                type: this.image.getType()
            });
        };
        SingleView.prototype.renderImage = function () {
            this.canvas.width = this.image.getWidth();
            this.canvas.height = this.image.getHeight();
            this.context.putImageData(this.image.getImageData(), 0, 0);
        };
        SingleView.prototype.getCanvas = function () {
            var $canvas = this.page.getImagePlace().find('#' + this.image.getId());
            if ($canvas.length == 0) {
                this.page.getImagePlace().find('#rsSingleImage').html('<canvas id="' + this.image.getId() + '"></canvas>');
            }
            this.canvas = this.page.getImagePlace().find('#' + this.image.getId())[0];
            this.context = this.canvas.getContext('2d');
        };
        return SingleView;
    })();
    UI.SingleView = SingleView;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var GridView = (function () {
        function GridView(page, imageCollection) {
            this.page = page;
            this.imageCollection = imageCollection;
            this.needRefresh = false;
        }
        GridView.prototype.type = function () {
            return 1 /* GRID */;
        };
        GridView.prototype.getActualImage = function () {
            return this.selected();
        };
        GridView.prototype.render = function () {
            var _this = this;
            this.page.getImagePlace().html("");
            var images = this.imageCollection.getImages();
            this.needRefresh = false;
            images.forEach(function (img) {
                _this.renderImage(img);
            });
        };
        GridView.prototype.setImages = function (images) {
            this.imageCollection = images;
        };
        GridView.prototype.getInformation = function () {
            if (this.imageCollection.count() > 0) {
                var r = this.imageCollection.getResolutionStats();
                return nunjucks.render('grid.information.html.njs', {
                    count: this.imageCollection.count(),
                    minResolution: r.min.width + 'x' + r.min.height,
                    maxResolution: r.max.width + 'x' + r.max.height
                });
            }
            return '';
        };
        GridView.prototype.selected = function () {
            var ids = [];
            this.page.getImagePlace().find('.rs-image-selected').each(function (i, $el) {
                ids.push($($el).data('id'));
            });
            return this.imageCollection.findImage(ids);
        };
        GridView.prototype.update = function () {
            var _this = this;
            if (!this.needRefresh) {
                var images = this.imageCollection.getImages();
                images.forEach(function (el) {
                    _this.updateImage(el);
                });
                this.page.renderInformation();
            }
            else {
                this.render();
            }
        };
        GridView.prototype.showLoading = function () {
            this.page.getImagePlace().find('.rs-image-selected').find('.rs-image-block').addClass('loading');
        };
        GridView.prototype.hideLoading = function () {
            this.page.getImagePlace().find('.rs-image-selected').find('.rs-image-block').removeClass('loading');
        };
        GridView.prototype.updateImage = function (image) {
            var $el = this.page.getImagePlace().find('#img__' + image.getId());
            image.getImage().then(function (img) {
                var $imageBlock = $el.find('.rs-image-block');
                $el.find('img').remove();
                $imageBlock[0].appendChild(img);
                $imageBlock.removeClass('loading');
            });
        };
        GridView.prototype.renderImage = function (image) {
            var _this = this;
            image.getImage().then(function (img) {
                if (!image.isDeleted) {
                    var $block = $(nunjucks.render('grid.image.html.njs', {
                        image: {
                            src: img,
                            name: image.getName(),
                            id: image.getId(),
                            label: image.getLabel()
                        }
                    }));
                    $block.find('.rs-image-block')[0].appendChild(img);
                    _this.page.getImagePlace().append($block);
                }
            });
        };
        return GridView;
    })();
    UI.GridView = GridView;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Toolbar = (function () {
        function Toolbar(page, editor) {
            this.page = page;
            this.editor = editor;
            this.$toolbar = this.editor.getInterface().getToolbarPlace().find('#rsToolbarMainAction');
            this.$editorToolbar = this.editor.getInterface().getToolbarPlace().find('#rsToolbarEditorAction');
        }
        Toolbar.prototype.render = function () {
            this.$toolbar.html("");
            this.$editorToolbar.html("");
            if ((this.page.getParent() !== null) && (this.page.getParent().images().count() > 1)) {
                this.renderBackButton(this.$toolbar);
            }
            this.renderCommonButton(this.$toolbar);
        };
        Toolbar.prototype.renderDelimiter = function ($el) {
            $el.append($('<div class="t-delimeter"></div>'));
        };
        Toolbar.prototype.renderModuleToolbar = function (type, $el, css) {
            var _this = this;
            if (css === void 0) { css = ''; }
            var modules = this.editor.getEditor().getModuleManager().getModules(this.editor.getType(), null);
            modules.forEach(function (m) {
                var $button = $(nunjucks.render('toolbar.button.html.njs', {
                    button: {
                        name: m.name(),
                        icon: m.icon(),
                        localizedName: m.name(),
                        css: css
                    }
                }));
                $el.append($button);
                _this.editor.initModule($button, m);
            });
        };
        Toolbar.prototype.renderRemoveButton = function ($el) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'remove',
                    icon: 'fa fa-remove',
                    localizedName: 'remove'
                }
            })));
        };
        Toolbar.prototype.renderCommonButton = function ($el) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'upload',
                    icon: 'fa fa-upload',
                    localizedName: 'upload'
                }
            })));
        };
        Toolbar.prototype.renderUndoRedoButton = function ($el) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'undo',
                    icon: 'fa fa-undo',
                    localizedName: 'undo'
                }
            })));
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'redo',
                    icon: 'fa fa-repeat',
                    localizedName: 'redo'
                }
            })));
        };
        Toolbar.prototype.renderBackButton = function ($el) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'back',
                    icon: 'fa fa-arrow-left',
                    localizedName: 'back'
                }
            })));
        };
        return Toolbar;
    })();
    UI.Toolbar = Toolbar;
})(UI || (UI = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var GridToolbar = (function (_super) {
        __extends(GridToolbar, _super);
        function GridToolbar(page, editor) {
            _super.call(this, page, editor);
        }
        GridToolbar.prototype.render = function () {
            _super.prototype.render.call(this);
            this.renderDelimiter(this.$toolbar);
            if (this.editor.selected().length > 0) {
                var $group = $('<div class="rs-toolbar-group"></div>');
                this.$toolbar.append($group);
                this.renderUndoRedoButton($group);
                this.renderDelimiter($group);
                this.renderModuleToolbar(1 /* GRID */, $group, 't-grid-button');
                this.renderDelimiter($group);
                this.renderRemoveButton($group);
            }
            if (this.editor.getActionDispather().canUndo()) {
                this.$editorToolbar.append($(nunjucks.render('toolbar.button.html.njs', {
                    button: {
                        name: 'undo-editor',
                        icon: 'fa fa-undo',
                        localizedName: 'undo-editor'
                    }
                })));
            }
            if (this.editor.getActionDispather().canRedo()) {
                this.$editorToolbar.append($(nunjucks.render('toolbar.button.html.njs', {
                    button: {
                        name: 'redo-editor',
                        icon: 'fa fa-repeat',
                        localizedName: 'redo-editor'
                    }
                })));
            }
            this.editor.getInterface().initToolbar(this.$toolbar);
            this.editor.getInterface().initEditorToolbar(this.$editorToolbar);
        };
        return GridToolbar;
    })(UI.Toolbar);
    UI.GridToolbar = GridToolbar;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var SingleToolbar = (function (_super) {
        __extends(SingleToolbar, _super);
        function SingleToolbar(page, editor) {
            _super.call(this, page, editor);
        }
        SingleToolbar.prototype.render = function () {
            _super.prototype.render.call(this);
            this.renderDelimiter(this.$toolbar);
            this.renderUndoRedoButton(this.$toolbar);
            var $group = $('<div class="rs-toolbar-group"></div>');
            this.$toolbar.append($group);
            this.renderModuleToolbar(0 /* SINGLE */, $group, 't-grid-button');
            this.renderRemoveButton($group);
            this.editor.getInterface().initToolbar(this.$toolbar);
            this.editor.getInterface().initEditorToolbar(this.$editorToolbar);
        };
        return SingleToolbar;
    })(UI.Toolbar);
    UI.SingleToolbar = SingleToolbar;
})(UI || (UI = {}));
/// <reference path="View/ViewInterface.ts"/>
/// <reference path="View/SingleView.ts"/>
/// <reference path="View/GridView.ts"/>
/// <reference path="Toolbar/Toolbar.ts"/>
/// <reference path="Toolbar/GridToolbar.ts"/>
/// <reference path="Toolbar/SingleToolbar.ts"/>
var UI;
(function (UI) {
    var Page = (function () {
        function Page(editor, imageCollection, parent) {
            if (parent === void 0) { parent = null; }
            this.editor = editor;
            this.imageCollection = imageCollection;
            this.parent = parent;
            this.view = null;
        }
        Page.prototype.hasParent = function () {
            return (this.parent != null);
        };
        Page.prototype.getParent = function () {
            return this.parent;
        };
        Page.prototype.setImages = function (imageCollection) {
            this.imageCollection = imageCollection;
            this.getView().setImages(this.imageCollection);
        };
        Page.prototype.appendImage = function (image) {
            this.imageCollection.add(image);
        };
        Page.prototype.images = function () {
            return this.imageCollection;
        };
        Page.prototype.getView = function () {
            if (this.view != null) {
                return this.view;
            }
            if (this.imageCollection.getImages().length == 1) {
                this.view = new UI.SingleView(this, this.imageCollection.getImages()[0]);
            }
            else {
                this.view = new UI.GridView(this, this.imageCollection);
            }
            return this.view;
        };
        Page.prototype.getToolbar = function () {
            if (this.imageCollection.getImages().length == 1) {
                return new UI.SingleToolbar(this, this.editor);
            }
            return new UI.GridToolbar(this, this.editor);
        };
        Page.prototype.renderInformation = function () {
            var inf = this.getView().getInformation();
            if (inf != '') {
                this.getInformationPlace().parent().show();
                this.getInformationPlace().html(inf);
            }
            else {
                this.getInformationPlace().parent().hide();
            }
        };
        Page.prototype.renderToolbar = function () {
            this.getToolbar().render();
        };
        Page.prototype.render = function () {
            this.renderToolbar();
            this.getImagePlace().html("");
            this.renderInformation();
            this.getView().render();
        };
        Page.prototype.getImagePlace = function () {
            return this.editor.getInterface().getImagePlace();
        };
        Page.prototype.getInformationPlace = function () {
            return this.editor.getInterface().getInformationPlace();
        };
        return Page;
    })();
    UI.Page = Page;
})(UI || (UI = {}));
/// <reference path="../Image/RsImage.ts"/>
/// <reference path="../../Core/Module/ActionModule.ts"/>
var UI;
(function (UI) {
    var ModuleInitialization = (function () {
        function ModuleInitialization() {
        }
        ModuleInitialization.init = function ($button, editorModule, editor) {
            if (editorModule.type() == 0 /* ACTION */) {
                this.initAction($button, editorModule, editor);
            }
            else if (editorModule.type() == 1 /* DELEGATE */) {
                this.initDelegate($button, editorModule, editor);
            }
            else {
                alert('GROUP!!!');
            }
            return editorModule;
        };
        ModuleInitialization.initAction = function ($button, editorModule, editor) {
            $button.click(function () {
                editorModule.process();
            });
        };
        ModuleInitialization.initDelegate = function ($button, editorModule, editor) {
            var _this = this;
            $button.click(function () {
                $('.rs-toolbar-button').removeClass('active');
                $button.addClass('active');
                _this.renderModule(editorModule, editor);
            });
        };
        ModuleInitialization.renderModule = function (editorModule, editor) {
            if (editor.getActiveModule() != null) {
                editor.getActiveModule().deinit();
            }
            editorModule.init(editor.getInterface().showPopover(editorModule.html()));
            editor.setActiveModule(editorModule);
            return false;
        };
        return ModuleInitialization;
    })();
    UI.ModuleInitialization = ModuleInitialization;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Widgets;
    (function (Widgets) {
        var RsWidget = (function () {
            function RsWidget() {
                this.events = {};
            }
            RsWidget.prototype.on = function (eventName, callback, eventNamespace) {
                if (eventNamespace === void 0) { eventNamespace = '_'; }
                if (!_.has(this.events, eventName)) {
                    this.events[eventName] = {};
                }
                if (!_.has(this.events[eventName], eventNamespace)) {
                    this.events[eventName][eventNamespace] = [];
                }
                this.events[eventName][eventNamespace].push(callback);
                return this;
            };
            RsWidget.prototype.off = function (eventNamespace) {
                var _this = this;
                if (eventNamespace === void 0) { eventNamespace = '_'; }
                _.map(this.events, function (event, eventName) {
                    _this.events[eventName] = _.omit(event, eventNamespace);
                });
            };
            RsWidget.prototype.trigger = function (eventName, data) {
                var _this = this;
                if (data === void 0) { data = null; }
                if (_.has(this.events, eventName)) {
                    _.map(this.events[eventName], function (callbacks, eventNamespace) {
                        callbacks.forEach(function (f) {
                            f({
                                data: data,
                                widget: _this
                            });
                        });
                    });
                }
            };
            return RsWidget;
        })();
        Widgets.RsWidget = RsWidget;
    })(Widgets = UI.Widgets || (UI.Widgets = {}));
})(UI || (UI = {}));
/// <reference path="RsWidget.ts"/>
var UI;
(function (UI) {
    var Widgets;
    (function (Widgets) {
        var RsProgressBar = (function (_super) {
            __extends(RsProgressBar, _super);
            function RsProgressBar($el) {
                _super.call(this);
                this.$el = $el;
                this.$label = $('<div class="rs-progress-label"></div>');
                this.$line = $('<div class="rs-progress-line"></div>');
                this.$el.html("");
                this.$el.append(this.$label);
                this.$el.append(this.$line);
            }
            RsProgressBar.prototype.getOpCount = function () {
                return this.opCount;
            };
            RsProgressBar.prototype.start = function (label, opCount) {
                this.opCount = opCount;
                this.setProgress(0, label);
                this.trigger('start');
                this.$el.show();
            };
            RsProgressBar.prototype.setProgress = function (op, label) {
                this.$label.text(label);
                this.$line.css('width', ((op / this.opCount) * 100) + '%');
                if (op >= this.opCount) {
                    this.trigger('stop');
                }
                else {
                    this.trigger('progress', op);
                }
            };
            RsProgressBar.prototype.stop = function (label) {
                var _this = this;
                this.$label.text(label);
                setTimeout(function () {
                    _this.$el.hide();
                }, 200);
            };
            return RsProgressBar;
        })(Widgets.RsWidget);
        Widgets.RsProgressBar = RsProgressBar;
    })(Widgets = UI.Widgets || (UI.Widgets = {}));
})(UI || (UI = {}));
/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
/// <reference path="Widgets/RsProgressBar.ts"/>
var UI;
(function (UI) {
    var EditorView = (function () {
        function EditorView($el, controller) {
            var _this = this;
            this.$el = $el;
            this.controller = controller;
            this.$el.html(nunjucks.render('editor.html.njs', {}));
            var $fileLoader = this.$el.find('#rsFileInput');
            $fileLoader.on('change', function () {
                controller.getEditor().getLoader().load(this.files);
            });
            this.$el.on('click', '#t-button__upload', function () {
                $fileLoader.trigger('click');
                return false;
            });
            this.$el.on('click', '.rs-image-block, .rs-image-data__inf', function (e) {
                _this.editImage($(e.target).closest('.rs-image').data('id'));
            });
            this.$el.on('click', '#t-button__back', function () {
                _this.controller.back();
                return false;
            });
            this.$el.on('click', '.rs-image-selection-checkbox', function (e) {
                _this.selectImage($(e.target).closest('.rs-image'));
            });
            this.$popOver = this.$el.find('#rsPopover');
            this.$toolbarPlace = this.$el.find('#rsToolbarPlace');
            this.$imagePlace = this.$el.find('#rsImagePlace');
            this.$informationPlace = this.$el.find('#rsInformation');
            this.progressBar = new UI.Widgets.RsProgressBar(this.$el.find('#rsProgressBar'));
            this.progressBar.on('stop', function (e) {
                _this.progressBar.stop('Loading complete!');
            });
        }
        EditorView.prototype.showProgressBar = function (opCount) {
            this.progressBar.start('Loading image...', opCount);
        };
        EditorView.prototype.progress = function (op) {
            this.progressBar.setProgress(op, 'Image ' + op + ' from ' + this.progressBar.getOpCount());
        };
        EditorView.prototype.showPopover = function (content) {
            this.$popOver.html(content);
            this.$popOver.show();
            return this.$popOver;
        };
        EditorView.prototype.clearPopover = function () {
            this.$popOver.html("");
            this.$popOver.hide();
        };
        EditorView.prototype.getImagePlace = function () {
            return this.$imagePlace;
        };
        EditorView.prototype.getToolbarPlace = function () {
            return this.$toolbarPlace;
        };
        EditorView.prototype.getInformationPlace = function () {
            return this.$informationPlace;
        };
        EditorView.prototype.initToolbar = function ($toolbar) {
            var _this = this;
            if (this.controller.getActiveModule() != null) {
                $toolbar.find('#t-button__' + this.controller.getActiveModule().name()).addClass('active');
            }
            $toolbar.find('#t-button__redo').click(function () {
                _this.controller.getActions().imageRedo();
                return false;
            });
            $toolbar.find('#t-button__undo').click(function () {
                _this.controller.getActions().imageUndo();
                return false;
            });
            $toolbar.find('#t-button__remove').click(function () {
                _this.controller.getActions().removeSelected();
                return false;
            });
        };
        EditorView.prototype.initEditorToolbar = function ($toolbar) {
            var _this = this;
            $toolbar.find('#t-button__redo-editor').click(function () {
                _this.controller.getActions().redo();
                return false;
            });
            $toolbar.find('#t-button__undo-editor').click(function () {
                _this.controller.getActions().undo();
                return false;
            });
        };
        EditorView.prototype.editImage = function (imageId) {
            this.controller.openImageEditor(this.controller.getImages().getImage(imageId));
        };
        EditorView.prototype.selectImage = function ($el) {
            var image = this.controller.getImages().getImage($el.data('id')).getImages()[0];
            if ($el.hasClass('rs-image-selected')) {
                $el.removeClass('rs-image-selected');
                this.controller.unSelectImage(image);
            }
            else {
                $el.addClass('rs-image-selected');
                this.controller.selectImage(image);
            }
        };
        return EditorView;
    })();
    UI.EditorView = EditorView;
})(UI || (UI = {}));
var EditorAction;
(function (EditorAction) {
    var RemoveAction = (function () {
        function RemoveAction(editor, images) {
            this.editor = editor;
            this.images = images;
        }
        RemoveAction.prototype.execute = function () {
            this.images.forEach(function (image) {
                image.isDeleted = true;
            });
            return true;
        };
        RemoveAction.prototype.unExecute = function () {
            this.images.forEach(function (image) {
                image.isDeleted = false;
            });
            return true;
        };
        return RemoveAction;
    })();
    EditorAction.RemoveAction = RemoveAction;
})(EditorAction || (EditorAction = {}));
/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
/// <reference path="Widgets/RsProgressBar.ts"/>
/// <reference path="../EditorAction/RemoveAction.ts"/>
var UI;
(function (UI) {
    var EditorActions = (function () {
        function EditorActions(controller) {
            this.controller = controller;
        }
        EditorActions.prototype.imageUndo = function () {
            this.imageHistoryAction('Undo');
        };
        EditorActions.prototype.imageRedo = function () {
            this.imageHistoryAction('Redo');
        };
        EditorActions.prototype.redo = function () {
            this.controller.getActionDispather().redo();
            this.controller.render();
        };
        EditorActions.prototype.undo = function () {
            this.controller.getActionDispather().undo();
            this.controller.render();
        };
        EditorActions.prototype.removeSelected = function () {
            var act = new EditorAction.RemoveAction(this.controller, this.getView().selected());
            this.controller.getActionDispather().process(act);
            if (this.controller.getType() == 0 /* SINGLE */) {
                this.controller.back();
            }
            else {
                this.controller.render();
            }
        };
        EditorActions.prototype.doModuleAction = function (action, type) {
            if (type === void 0) { type = 2 /* ANY */; }
            if (this.controller.getActiveModule() != null) {
                var m = this.controller.getActiveModule();
                if ((m.viewType() == type) || (m.viewType() == 2 /* ANY */)) {
                    action.call(this.controller, m);
                }
            }
        };
        EditorActions.prototype.getView = function () {
            return this.controller.getView();
        };
        EditorActions.prototype.imageHistoryAction = function (action) {
            var _this = this;
            var p = [];
            this.getView().showLoading();
            this.getView().getActualImage().forEach(function (img) {
                var act = img.getActionDispatcher()['get' + action + 'Action']();
                if ((act) && (act.needRender)) {
                    _this.getView().needRefresh = true;
                }
                p.push(img.getActionDispatcher()[action.toLowerCase()]());
            });
            Promise.all(p).then(function () {
                _this.getView().update();
                _this.doModuleAction(function (m) {
                    m.update();
                }, _this.controller.getType());
            });
        };
        return EditorActions;
    })();
    UI.EditorActions = EditorActions;
})(UI || (UI = {}));
/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="../Core/Action/EditorActionDispatcher.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
/// <reference path="Widgets/RsProgressBar.ts"/>
/// <reference path="EditorView.ts"/>
/// <reference path="EditorActions.ts"/>
var UI;
(function (UI) {
    var Editor = (function () {
        function Editor($el, editor, images) {
            this.$el = $el;
            this.editor = editor;
            this.images = images;
            this.page = null;
            this.gridPage = null;
            this.singlePage = null;
            this.activeModule = null;
            this.editorView = new UI.EditorView($el, this);
            this.editorAction = new UI.EditorActions(this);
            this.gridPage = new UI.Page(this, this.images);
            this.singlePage = new UI.Page(this, this.images, this.gridPage);
            this.actionController = new Core.EditorActionDispatcher();
        }
        Editor.prototype.getActionDispather = function () {
            return this.actionController;
        };
        Editor.prototype.getInterface = function () {
            return this.editorView;
        };
        Editor.prototype.getActions = function () {
            return this.editorAction;
        };
        Editor.prototype.initModule = function ($button, editorModule) {
            UI.ModuleInitialization.init($button, editorModule, this);
        };
        Editor.prototype.getActiveModule = function () {
            return this.activeModule;
        };
        Editor.prototype.setActiveModule = function (editorModule) {
            this.activeModule = editorModule;
        };
        Editor.prototype.getView = function () {
            return this.getPage().getView();
        };
        Editor.prototype.back = function () {
            if (this.page.hasParent()) {
                this.page = this.page.getParent();
                this.render();
            }
        };
        /**
         * Get selected image in editor
         * @returns Core.RsImage[]
         */
        Editor.prototype.selected = function () {
            return this.getPage().getView().selected();
        };
        Editor.prototype.getEditor = function () {
            return this.editor;
        };
        Editor.prototype.getPage = function () {
            if (this.page == null) {
                if (this.images.count() == 1) {
                    this.page = this.singlePage;
                }
                else {
                    this.page = this.gridPage;
                }
            }
            return this.page;
        };
        Editor.prototype.getType = function () {
            return this.getPage().getView().type();
        };
        Editor.prototype.render = function () {
            var _this = this;
            if (this.activeModule != null) {
                this.activeModule.deinit();
            }
            this.getPage().render();
            this.getActions().doModuleAction(function () {
                UI.ModuleInitialization.renderModule(_this.activeModule, _this);
            }, this.getType());
        };
        Editor.prototype.appendImage = function (image) {
            this.gridPage.appendImage(image);
            if (this.images.count() == 1) {
                this.singlePage.setImages(this.images.getImage(this.images.getImages()[0].getId()));
                this.page = this.singlePage;
            }
            else {
                this.page = this.gridPage;
            }
        };
        Editor.prototype.openImageEditor = function (image) {
            this.singlePage.setImages(image);
            this.page = this.singlePage;
            this.render();
        };
        Editor.prototype.getImages = function () {
            return this.images;
        };
        Editor.prototype.unSelectImage = function (image) {
            var _this = this;
            this.page.renderToolbar();
            this.getActions().doModuleAction(function () {
                _this.activeModule.unSelectImage(image);
            }, this.getType());
        };
        Editor.prototype.selectImage = function (image) {
            var _this = this;
            this.page.renderToolbar();
            this.getActions().doModuleAction(function () {
                _this.activeModule.selectImage(image);
            }, this.getType());
        };
        return Editor;
    })();
    UI.Editor = Editor;
})(UI || (UI = {}));
/// <reference path="EditorModule.ts"/>
var Core;
(function (Core) {
    (function (ModuleViewType) {
        ModuleViewType[ModuleViewType["SINGLE"] = 0] = "SINGLE";
        ModuleViewType[ModuleViewType["GRID"] = 1] = "GRID";
        ModuleViewType[ModuleViewType["ANY"] = 2] = "ANY";
    })(Core.ModuleViewType || (Core.ModuleViewType = {}));
    var ModuleViewType = Core.ModuleViewType;
    var ModuleManager = (function () {
        function ModuleManager(editor) {
            this.editor = editor;
            this.modules = {};
            this.registerModule('resize', new Modules.ResizeModule(this.editor.UI()), 0 /* SINGLE */);
            this.registerModule('color', new Modules.ColorModule(this.editor.UI()), 2 /* ANY */);
            this.registerModule('filter', new Modules.FilterModule(this.editor.UI()), 2 /* ANY */);
            this.registerModule('crop', new Modules.CropModule(this.editor.UI()), 0 /* SINGLE */);
            this.registerModule('crop-resize', new Modules.CropResizeModule(this.editor.UI()), 1 /* GRID */);
        }
        ModuleManager.prototype.registerModule = function (name, editorModule, type) {
            if (!(name in this.modules)) {
                this.modules[name] = {
                    module: editorModule,
                    type: type
                };
            }
        };
        ModuleManager.prototype.getModule = function (name) {
            if (name in this.modules) {
                return this.modules[name].module;
            }
            throw new Error('Invalid module name');
        };
        ModuleManager.prototype.getModules = function (type, parent) {
            if (type === void 0) { type = 2 /* ANY */; }
            if (parent === void 0) { parent = null; }
            return _.map(_.filter(this.modules, function (value) {
                if ((value.type == type) || (type == 2 /* ANY */) || (value.type == 2 /* ANY */)) {
                    if (value.module.parent() == parent) {
                        return true;
                    }
                }
                return false;
            }), function (value) {
                return value.module;
            });
        };
        return ModuleManager;
    })();
    Core.ModuleManager = ModuleManager;
})(Core || (Core = {}));
/// <reference path="../RsImageEditor.ts"/>
/// <reference path="../Image/RsImage.ts"/>
var Core;
(function (Core) {
    var ImageLoader = (function () {
        function ImageLoader(editor) {
            this.editor = editor;
            this.total = 0;
            this.total = 0;
        }
        ImageLoader.prototype.load = function (files) {
            var _this = this;
            var i = 0;
            this.total = 0;
            this.editor.UI().getInterface().showProgressBar(files.length);
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
                var img = new Core.RsImage(file.name, file.type);
                img.create(e.target.result).then(function (image) {
                    _this.editor.appendImage(image);
                    _this.total++;
                    _this.editor.UI().getInterface().progress(_this.total);
                    if (isLast) {
                        resolve(1);
                    }
                });
            };
            reader.readAsDataURL(file);
        };
        return ImageLoader;
    })();
    Core.ImageLoader = ImageLoader;
})(Core || (Core = {}));
/// <reference path="../UI/Editor.ts"/>
/// <reference path="Image/ImageManager.ts"/>
/// <reference path="Module/ModuleManager.ts"/>
/// <reference path="Loader/ImageLoader.ts"/>
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
            this.ui.appendImage(image);
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
/// <reference path="RsWidget.ts"/>
var UI;
(function (UI) {
    var Widgets;
    (function (Widgets) {
        var RsSlider = (function (_super) {
            __extends(RsSlider, _super);
            function RsSlider($el, min, max, step, start) {
                var _this = this;
                if (step === void 0) { step = 1; }
                if (start === void 0) { start = 0; }
                _super.call(this);
                this.$el = $el;
                this.min = min;
                this.max = max;
                this.step = step;
                this.start = start;
                this.$slider = $('<div class="rs-slider-handle"></div>');
                this.$el.html("");
                this.$el.addClass('rs-slider');
                this.$el.append(this.$slider);
                this.$slider.css('left', this.getPixelPos(this.start) + 'px');
                var $body = $(document);
                this.$slider.mousedown(function (downEvent) {
                    var x = downEvent.clientX - parseInt(_this.$slider.css('left'));
                    $body.off('.RsSlider');
                    $body.on('mousemove.RsSlider', function (moveEvent) {
                        var pos = moveEvent.clientX - x;
                        if (pos < 0) {
                            pos = 0;
                        }
                        var size = _this.$el.width() - _this.$slider.width();
                        if (pos > size) {
                            pos = size;
                        }
                        _this.$slider.css('left', pos + 'px');
                        _this.trigger('move', _this.getVal(pos));
                    });
                    $body.on('mouseup.RsSlider', function () {
                        var newPos = parseInt(_this.$slider.css('left'));
                        _this.trigger('stopmove', _this.getVal(newPos));
                        $body.off('.RsSlider');
                    });
                });
                this.on('move', function (e) {
                    _this.$slider.text(e.data);
                });
                this.trigger('move', this.start);
            }
            RsSlider.prototype.set = function (value, label) {
                if (label === void 0) { label = ''; }
                this.$slider.css('left', this.getPixelPos(value) + 'px');
                if (label == '') {
                    this.$slider.text(value.toString());
                }
                else {
                    this.$slider.text(label);
                }
            };
            RsSlider.prototype.getVal = function (pixelPos) {
                return Math.round((pixelPos * ((this.max - this.min) / this.step)) / (this.$el.width() - this.$slider.width())) * this.step + this.min;
            };
            RsSlider.prototype.getPixelPos = function (val) {
                return (((val - this.min) / this.step) * (this.$el.width() - this.$slider.width())) / ((this.max - this.min) / this.step);
            };
            return RsSlider;
        })(Widgets.RsWidget);
        Widgets.RsSlider = RsSlider;
    })(Widgets = UI.Widgets || (UI.Widgets = {}));
})(UI || (UI = {}));
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>
/// <reference path="../../UI/Editor.ts"/>
var Modules;
(function (Modules) {
    var ColorModule = (function () {
        function ColorModule(editor) {
            this.editor = editor;
        }
        ColorModule.prototype.html = function () {
            return nunjucks.render('color.dialog.html.njs', {});
        };
        ColorModule.prototype.viewType = function () {
            return 2 /* ANY */;
        };
        ColorModule.prototype.unSelectImage = function (image) {
            this.updateSelectState();
        };
        ColorModule.prototype.selectImage = function (image) {
            this.updateSelectState();
        };
        ColorModule.prototype.update = function () {
            this.updateSelectState();
        };
        ColorModule.prototype.updateSelectState = function () {
            var images = this.editor.selected();
            if (images.length == 1) {
                var image = images[0];
                this.brightnessSlider.set(image.brightness);
                this.vibranceSlider.set(image.vibrance);
            }
            else if (images.length > 0) {
                this.setSliderValue('brightness', this.brightnessSlider, images);
                this.setSliderValue('vibrance', this.vibranceSlider, images);
            }
            else {
                this.brightnessSlider.set(0, '-');
                this.vibranceSlider.set(0, '-');
            }
        };
        ColorModule.prototype.setSliderValue = function (prop, slider, images) {
            var v = images[0][prop];
            for (var i = 0; i < images.length; i++) {
                if (v != images[i][prop]) {
                    slider.set(0, '-');
                    return;
                }
            }
            slider.set(v);
        };
        ColorModule.prototype.init = function ($el) {
            var _this = this;
            var brightness = 0;
            var vibrance = 0;
            if (this.editor.getType() == 0 /* SINGLE */) {
                var img = this.editor.selected()[0];
                brightness = img.brightness;
                vibrance = img.vibrance;
            }
            this.brightnessSlider = new UI.Widgets.RsSlider($el.find('#brightnessSlider'), -100, 100, 1, brightness);
            this.brightnessSlider.on('stopmove', function (e) {
                _this.doAction(Modules.BrightnessAction, e.data);
            });
            this.vibranceSlider = new UI.Widgets.RsSlider($el.find('#vibranceSlider'), -200, 200, 5, vibrance);
            this.vibranceSlider.on('stopmove', function (e) {
                _this.doAction(Modules.VibranceAction, e.data);
            });
        };
        ColorModule.prototype.deinit = function () {
            this.editor.getInterface().clearPopover();
        };
        ColorModule.prototype.icon = function () {
            return 'fa fa-image';
        };
        ColorModule.prototype.type = function () {
            return 1 /* DELEGATE */;
        };
        ColorModule.prototype.parent = function () {
            return null;
        };
        ColorModule.prototype.name = function () {
            return 'color';
        };
        ColorModule.prototype.doAction = function (action, value) {
            var _this = this;
            this.editor.getView().showLoading();
            var promiseArray = [];
            this.editor.selected().forEach(function (img) {
                var act = new action(img, value);
                promiseArray.push(img.getActionDispatcher().process(act));
            });
            Promise.all(promiseArray).then(function () {
                _this.editor.getView().update();
            });
        };
        return ColorModule;
    })();
    Modules.ColorModule = ColorModule;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>
var Modules;
(function (Modules) {
    var VibranceAction = (function () {
        function VibranceAction(image, value) {
            this.image = image;
            this.value = value;
            this.needRender = false;
        }
        VibranceAction.prototype.execute = function () {
            this.oldValue = this.image.vibrance;
            this.image.vibrance = this.value;
            return this.image.save();
        };
        VibranceAction.prototype.unExecute = function () {
            this.image.vibrance = this.oldValue;
            return this.image.save();
        };
        return VibranceAction;
    })();
    Modules.VibranceAction = VibranceAction;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>
var Modules;
(function (Modules) {
    var CropAction = (function () {
        function CropAction(image, left, top, width, height, position) {
            if (position === void 0) { position = null; }
            this.image = image;
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            this.position = position;
            this.needRender = false;
        }
        CropAction.prototype.execute = function () {
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();
            this.originalImage = this.image.getOriginalImage();
            var x = this.left;
            var y = this.top;
            if (this.position != null) {
                if ((this.position == 1 /* TOP */) || (this.position == 7 /* BOTTOM */) || (this.position == 4 /* CENTER */)) {
                    x = (this.image.width - this.width) / 2;
                }
                else if ((this.position == 2 /* RIGHT_TOP */) || (this.position == 5 /* RIGHT */) || (this.position == 8 /* RIGHT_BOTTOM */)) {
                    x = (this.image.width - this.width);
                }
                if ((this.position == 3 /* LEFT */) || (this.position == 5 /* RIGHT */) || (this.position == 4 /* CENTER */)) {
                    y = (this.image.height - this.height) / 2;
                }
                else if ((this.position == 6 /* LEFT_BOTTOM */) || (this.position == 7 /* BOTTOM */) || (this.position == 8 /* RIGHT_BOTTOM */)) {
                    y = (this.image.height - this.height);
                }
            }
            this.image.crop(x, y, this.width, this.height);
            return this.image.save();
        };
        CropAction.prototype.unExecute = function () {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;
            this.image.replaceOriginal(this.originalImage);
            return this.image.save();
        };
        return CropAction;
    })();
    Modules.CropAction = CropAction;
})(Modules || (Modules = {}));
/// <reference path="RsWidget.ts"/>
var UI;
(function (UI) {
    var Widgets;
    (function (Widgets) {
        var RsResizableItem = (function (_super) {
            __extends(RsResizableItem, _super);
            function RsResizableItem($el, $parent, index) {
                _super.call(this);
                this.$el = $el;
                this.$parent = $parent;
                this.index = index;
                this.itemHalfSize = 5;
                this.init();
            }
            RsResizableItem.prototype.getElementCorners = function () {
                var topLeft = { x: this.$el.position().left, y: this.$el.position().top };
                var topRight = { x: topLeft.x + this.$el.width(), y: topLeft.y };
                var bottomRight = { x: topLeft.x + this.$el.width(), y: topLeft.y + this.$el.height() };
                var bottomLeft = { x: topLeft.x, y: topLeft.y + this.$el.height() };
                return {
                    topLeft: topLeft,
                    topRight: topRight,
                    bottomRight: bottomRight,
                    bottomLeft: bottomLeft
                };
            };
            RsResizableItem.prototype.getPosition = function () {
                return this.position;
            };
            RsResizableItem.prototype.getIndex = function () {
                return this.index;
            };
            RsResizableItem.prototype.toPlace = function () {
                var cord;
                var elementCorners = this.getElementCorners();
                if (this.index == 0) {
                    cord = elementCorners.topLeft;
                }
                else if (this.index == 1) {
                    cord = {
                        x: elementCorners.topLeft.x + (elementCorners.topRight.x - elementCorners.topLeft.x) / 2,
                        y: elementCorners.topRight.y
                    };
                }
                else if (this.index == 2) {
                    cord = elementCorners.topRight;
                }
                else if (this.index == 3) {
                    cord = {
                        x: elementCorners.topRight.x,
                        y: elementCorners.topRight.y + (elementCorners.bottomRight.y - elementCorners.topRight.y) / 2
                    };
                }
                else if (this.index == 4) {
                    cord = elementCorners.bottomRight;
                }
                else if (this.index == 5) {
                    cord = {
                        x: elementCorners.topLeft.x + (elementCorners.topRight.x - elementCorners.topLeft.x) / 2,
                        y: elementCorners.bottomRight.y
                    };
                }
                else if (this.index == 6) {
                    cord = elementCorners.bottomLeft;
                }
                else if (this.index == 7) {
                    cord = {
                        x: elementCorners.topLeft.x,
                        y: elementCorners.topRight.y + (elementCorners.bottomRight.y - elementCorners.topRight.y) / 2
                    };
                }
                this.position = cord;
                this.$item.css({
                    'left': (cord.x - this.itemHalfSize) + 'px',
                    'top': (cord.y - this.itemHalfSize) + 'px'
                });
            };
            RsResizableItem.prototype.init = function () {
                var _this = this;
                this.$item = $('<div class="rs-resizable-item item_' + this.index + '"></div>');
                this.$parent.append(this.$item);
                this.toPlace();
                var $body = $(document);
                this.$item.mousedown(function (downEvent) {
                    var x = downEvent.clientX - parseInt(_this.$item.css('left')) - _this.itemHalfSize;
                    var y = downEvent.clientY - parseInt(_this.$item.css('top')) - _this.itemHalfSize;
                    $body.on('mousemove.RsResize_' + _this.index, function (moveEvent) {
                        var pos = {
                            x: moveEvent.clientX - x,
                            y: moveEvent.clientY - y
                        };
                        _this.moveItem(pos);
                        _this.trigger('move', {
                            index: _this.index,
                            newPosition: _this.position,
                            oldPosition: {
                                x: x,
                                y: y
                            }
                        });
                    });
                    $body.on('mouseup.RsResize_' + _this.index, function () {
                        $body.off('.RsResize_' + _this.index);
                    });
                });
            };
            RsResizableItem.prototype.moveItem = function (pos) {
                var c = this.getElementCorners();
                if ((this.index == 0) || (this.index == 7) || (this.index == 6)) {
                    if (pos.x >= c.topRight.x - 10) {
                        pos.x = c.topRight.x - 10;
                    }
                }
                if ((this.index == 0) || (this.index == 1) || (this.index == 2)) {
                    if (pos.y >= c.bottomRight.y - 10) {
                        pos.y = c.bottomRight.y - 10;
                    }
                }
                if ((this.index == 1) || (this.index == 5)) {
                    this.$item.css({
                        'top': (pos.y - 5) + 'px'
                    });
                }
                else if ((this.index == 7) || (this.index == 3)) {
                    this.$item.css({
                        'left': (pos.x - 5) + 'px'
                    });
                }
                else {
                    this.$item.css({
                        'left': (pos.x - 5) + 'px',
                        'top': (pos.y - 5) + 'px'
                    });
                }
                this.position = {
                    x: parseInt(this.$item.css('left')) + 5,
                    y: parseInt(this.$item.css('top')) + 5
                };
            };
            return RsResizableItem;
        })(Widgets.RsWidget);
        var RsResizable = (function (_super) {
            __extends(RsResizable, _super);
            function RsResizable($el, $parent) {
                var _this = this;
                _super.call(this);
                this.$el = $el;
                this.$parent = $parent;
                this.items = [];
                this.$el.addClass('rs-resizable');
                for (var i = 0; i < 8; i++) {
                    var item = new RsResizableItem(this.$el, this.$parent, i);
                    this.items.push(item);
                    item.on('move', function (ev) {
                        _this.onItemMove(ev.data.index, ev.data.newPosition, ev.data.oldPosition);
                    });
                }
                var $body = $(document);
                this.$el.mousedown(function (downEvent) {
                    var x = downEvent.clientX - parseInt(_this.$el.css('left'));
                    var y = downEvent.clientY - parseInt(_this.$el.css('top'));
                    $body.on('mousemove.RsResize', function (moveEvent) {
                        var pos = {
                            x: moveEvent.clientX - x,
                            y: moveEvent.clientY - y
                        };
                        _this.$el.css({
                            'left': pos.x,
                            'top': pos.y
                        });
                        _this.updateItems();
                    });
                    $body.on('mouseup.RsResize', function () {
                        $body.off('.RsResize');
                    });
                });
            }
            RsResizable.prototype.onItemMove = function (index, newPosition, oldPosition) {
                if (index == 0) {
                    this.$el.css({
                        left: newPosition.x + 'px',
                        top: newPosition.y + 'px',
                        width: (this.items[4].getPosition().x - newPosition.x) + 'px',
                        height: (this.items[4].getPosition().y - newPosition.y) + 'px'
                    });
                    this.updateItems([4]);
                }
                else if (index == 1) {
                    this.$el.css({
                        top: newPosition.y + 'px',
                        height: (this.items[4].getPosition().y - newPosition.y) + 'px'
                    });
                    this.updateItems([4]);
                }
                else if (index == 2) {
                    this.$el.css({
                        right: newPosition.x + 'px',
                        top: newPosition.y + 'px',
                        width: (newPosition.x - this.items[6].getPosition().x) + 'px',
                        height: (this.items[6].getPosition().y - newPosition.y) + 'px'
                    });
                    this.updateItems([6]);
                }
                else if (index == 3) {
                    this.$el.css({
                        right: newPosition.x + 'px',
                        width: (newPosition.x - this.items[6].getPosition().x) + 'px'
                    });
                    this.updateItems([6]);
                }
                else if (index == 4) {
                    this.$el.css({
                        right: newPosition.x + 'px',
                        bottom: newPosition.y + 'px',
                        width: (newPosition.x - this.items[0].getPosition().x) + 'px',
                        height: (newPosition.y - this.items[0].getPosition().y) + 'px'
                    });
                    this.updateItems([0]);
                }
                else if (index == 5) {
                    this.$el.css({
                        bottom: newPosition.y + 'px',
                        height: (newPosition.y - this.items[0].getPosition().y) + 'px'
                    });
                    this.updateItems([0]);
                }
                else if (index == 6) {
                    this.$el.css({
                        left: newPosition.x + 'px',
                        bottom: newPosition.y + 'px',
                        width: (this.items[2].getPosition().x - newPosition.x) + 'px',
                        height: (newPosition.y - this.items[2].getPosition().y) + 'px'
                    });
                    this.updateItems([2]);
                }
                else if (index == 7) {
                    this.$el.css({
                        left: newPosition.x + 'px',
                        width: (this.items[2].getPosition().x - newPosition.x) + 'px'
                    });
                    this.updateItems([2]);
                }
            };
            RsResizable.prototype.getBounds = function () {
                return {
                    width: this.$el.width(),
                    height: this.$el.height(),
                    left: this.items[0].getPosition().x,
                    top: this.items[0].getPosition().y
                };
            };
            RsResizable.prototype.updateItems = function (stopItem) {
                if (stopItem === void 0) { stopItem = []; }
                this.trigger('resize', {
                    width: this.$el.width(),
                    height: this.$el.height(),
                    left: this.items[0].getPosition().x,
                    top: this.items[0].getPosition().y
                });
                this.items.forEach(function (item) {
                    if (!_.contains(stopItem, item.getIndex())) {
                        item.toPlace();
                    }
                });
            };
            return RsResizable;
        })(Widgets.RsWidget);
        Widgets.RsResizable = RsResizable;
    })(Widgets = UI.Widgets || (UI.Widgets = {}));
})(UI || (UI = {}));
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsResizable.ts"/>
var Modules;
(function (Modules) {
    var CropModule = (function () {
        function CropModule(editor) {
            this.editor = editor;
            this.view = null;
        }
        CropModule.prototype.html = function () {
            return nunjucks.render('crop.dialog.html.njs', {});
        };
        CropModule.prototype.selectImage = function (image) {
        };
        CropModule.prototype.unSelectImage = function (image) {
        };
        CropModule.prototype.update = function () {
        };
        CropModule.prototype.deinit = function () {
            this.editor.getInterface().clearPopover();
            if (this.view != null) {
                this.$cropRect.remove();
                this.view.getAreaElement().find('.rs-resizable-item').remove();
            }
        };
        CropModule.prototype.viewType = function () {
            return 0 /* SINGLE */;
        };
        CropModule.prototype.init = function ($el) {
            var _this = this;
            this.view = this.editor.getView();
            this.$cropRect = $('<div class="crop-rect"></div>');
            this.view.getAreaElement().append(this.$cropRect);
            this.cropResizableWidget = new UI.Widgets.RsResizable(this.$cropRect, this.view.getAreaElement());
            $('#crop_ok').click(function () {
                var b = _this.cropResizableWidget.getBounds();
                var w = Math.round(b.width / _this.view.getScale());
                _this.doAction(b.left / _this.view.getScale(), b.top / _this.view.getScale(), w, b.height / _this.view.getScale());
            });
        };
        CropModule.prototype.icon = function () {
            return 'fa fa-crop';
        };
        CropModule.prototype.type = function () {
            return 1 /* DELEGATE */;
        };
        CropModule.prototype.parent = function () {
            return null;
        };
        CropModule.prototype.name = function () {
            return 'crop';
        };
        CropModule.prototype.doAction = function (left, top, width, height) {
            var _this = this;
            var promiseArray = [];
            this.editor.selected().forEach(function (img) {
                var act = new Modules.CropAction(img, left, top, width, height);
                promiseArray.push(img.getActionDispatcher().process(act));
            });
            Promise.all(promiseArray).then(function () {
                _this.editor.render();
            });
        };
        return CropModule;
    })();
    Modules.CropModule = CropModule;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
var Modules;
(function (Modules) {
    var CropResizeModule = (function () {
        function CropResizeModule(editor) {
            this.editor = editor;
            this.images = [];
            this.fit = null;
            this.crop = null;
        }
        CropResizeModule.prototype.init = function ($el) {
            this.view = this.editor.getView();
            this.$el = $el;
            this.update();
        };
        CropResizeModule.prototype.deleteHelpers = function () {
            if (this.fit != null) {
                this.fit.destroy();
                this.fit = null;
            }
            if (this.crop != null) {
                this.crop.destroy();
                this.crop = null;
            }
        };
        CropResizeModule.prototype.initFit = function () {
            var _this = this;
            this.fit = new Modules.Fit(this.$el, this.images, this.editor);
            this.fit.on('apply', function (e) {
                _this.doAction(_this.createFitActions(e.data.rect, e.data.method, e.data.fitPosition, e.data.isCanCrop));
            });
        };
        CropResizeModule.prototype.initCrop = function () {
            var _this = this;
            this.crop = new Modules.Crop(this.$el, this.images, this.editor);
            this.crop.on('apply', function (e) {
                _this.doAction(_this.createCropActions(e.data.size, e.data.fitPosition));
            });
        };
        CropResizeModule.prototype.update = function () {
            this.deleteHelpers();
            this.images = this.editor.selected();
            if (this.images.length > 0) {
                this.$el.show();
                this.initFit();
                this.initCrop();
            }
            else {
                this.$el.hide();
            }
        };
        CropResizeModule.prototype.createCropActions = function (size, position) {
            this.editor.getView().showLoading();
            var result = [];
            this.editor.selected().forEach(function (img) {
                var act = new Modules.CropAction(img, 0, 0, size.width, size.height, position);
                result.push(img.getActionDispatcher().process(act));
            });
            return result;
        };
        CropResizeModule.prototype.createFitActions = function (rect, method, position, isCanCrop) {
            this.editor.getView().showLoading();
            var result = [];
            this.editor.selected().forEach(function (img) {
                var act = new Modules.FitAction(img, rect, method, position, isCanCrop);
                result.push(img.getActionDispatcher().process(act));
            });
            return result;
        };
        CropResizeModule.prototype.doAction = function (actions) {
            var _this = this;
            Promise.all(actions).then(function () {
                _this.editor.getView().update();
            });
        };
        CropResizeModule.prototype.html = function () {
            return nunjucks.render('crop-resize.dialog.html.njs', {});
        };
        CropResizeModule.prototype.selectImage = function (image) {
            this.update();
        };
        CropResizeModule.prototype.unSelectImage = function (image) {
            this.update();
        };
        CropResizeModule.prototype.viewType = function () {
            return 1 /* GRID */;
        };
        CropResizeModule.prototype.icon = function () {
            return 'fa fa-crop';
        };
        CropResizeModule.prototype.type = function () {
            return 1 /* DELEGATE */;
        };
        CropResizeModule.prototype.parent = function () {
            return null;
        };
        CropResizeModule.prototype.name = function () {
            return 'crop-resize';
        };
        CropResizeModule.prototype.deinit = function () {
            this.deleteHelpers();
            this.editor.getInterface().clearPopover();
        };
        return CropResizeModule;
    })();
    Modules.CropResizeModule = CropResizeModule;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>
var Modules;
(function (Modules) {
    var FitAction = (function () {
        function FitAction(image, rect, method, position, isCanCrop) {
            this.image = image;
            this.rect = rect;
            this.method = method;
            this.position = position;
            this.isCanCrop = isCanCrop;
            this.needRender = false;
            this.isCropped = false;
            if (method == 0 /* RESIZE */) {
                this.size = Modules.SizeCalculation.getFitSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else if (method == 1 /* WIDTH */) {
                this.size = Modules.SizeCalculation.getStretchWidthSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else if (method == 2 /* HEIGHT */) {
                this.size = Modules.SizeCalculation.getStretchHeightSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else {
                this.size = Modules.SizeCalculation.getStretchRectSize(rect.width, rect.height, this.image.width, this.image.height);
            }
        }
        FitAction.prototype.execute = function () {
            var _this = this;
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();
            if ((this.size.width > this.rect.width) || (this.size.height > this.rect.height)) {
                this.originalImage = this.image.getOriginalImage();
                this.isCropped = true;
            }
            this.image.width = this.size.width | 0;
            this.image.height = this.size.height | 0;
            return this.image.save().then(function (image) {
                if ((_this.isCropped) && (_this.isCanCrop)) {
                    var x = 0;
                    var y = 0;
                    var w = _this.image.width;
                    if (w > _this.rect.width) {
                        w = _this.rect.width;
                        if ((_this.position == 1 /* TOP */) || (_this.position == 7 /* BOTTOM */)) {
                            x = (_this.image.width - _this.rect.width) / 2;
                        }
                        else if ((_this.position == 2 /* RIGHT_TOP */) || (_this.position == 5 /* RIGHT */) || (_this.position == 8 /* RIGHT_BOTTOM */)) {
                            x = (_this.image.width - _this.rect.width);
                        }
                    }
                    var h = _this.image.height;
                    if (h > _this.rect.height) {
                        h = _this.rect.height;
                        if ((_this.position == 3 /* LEFT */) || (_this.position == 5 /* RIGHT */)) {
                            y = (_this.image.height - _this.rect.height) / 2;
                        }
                        else if ((_this.position == 6 /* LEFT_BOTTOM */) || (_this.position == 7 /* BOTTOM */) || (_this.position == 8 /* RIGHT_BOTTOM */)) {
                            y = (_this.image.height - _this.rect.height);
                        }
                    }
                    return _this.image.getImage().then(function (img) {
                        _this.image.crop(x, y, w, h);
                        return _this.image.save();
                    });
                }
                else {
                    return Promise.resolve(image);
                }
            });
        };
        FitAction.prototype.unExecute = function () {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;
            if ((this.isCropped) && (this.isCanCrop)) {
                this.image.replaceOriginal(this.originalImage);
            }
            return this.image.save();
        };
        return FitAction;
    })();
    Modules.FitAction = FitAction;
})(Modules || (Modules = {}));
var Modules;
(function (Modules) {
    var Crop = (function (_super) {
        __extends(Crop, _super);
        function Crop($el, images, ui) {
            var _this = this;
            _super.call(this);
            this.$el = $el;
            this.images = images;
            this.ui = ui;
            this.$widthInput = $el.find('.crop__width input');
            this.$heightInput = $el.find('.crop__height input');
            this.$widthInput.val(this.images[0].width.toString());
            this.$heightInput.val(this.images[0].height.toString());
            this.$position = $el.find('#cropPosition .fp');
            this.$button = $el.find('#cropButton');
            this.$button.on('click.CropResize', function () {
                if (_this.isSizeValid(_this.getRectSize())) {
                    _this.trigger('apply', {
                        fitPosition: _this.getPosition(),
                        size: _this.getRectSize()
                    });
                }
                return false;
            });
            this.$position.on('click.CropResize', function (e) {
                _this.$position.removeClass('selected');
                _this.selectPosition($(e.target));
            });
            this.$widthInput.on('input.CropResize', function (e) {
            });
            this.$heightInput.on('input.CropResize', function (e) {
            });
        }
        Crop.prototype.isSizeValid = function (size) {
            return !(((size.width < 30) && (size.width > 9999)) || ((size.height < 30) && (size.height > 9999)));
        };
        Crop.prototype.selectPosition = function ($el) {
            $el.addClass('selected');
        };
        Crop.prototype.getPosition = function () {
            var $selected = this.$position.filter('.selected');
            if ($selected) {
                if ($selected.hasClass('fp-left-top')) {
                    return 0 /* LEFT_TOP */;
                }
                else if ($selected.hasClass('fp-top')) {
                    return 1 /* TOP */;
                }
                else if ($selected.hasClass('fp-right-top')) {
                    return 2 /* RIGHT_TOP */;
                }
                else if ($selected.hasClass('fp-left')) {
                    return 3 /* LEFT */;
                }
                else if ($selected.hasClass('fp-center')) {
                    return 4 /* CENTER */;
                }
                else if ($selected.hasClass('fp-right')) {
                    return 5 /* RIGHT */;
                }
                else if ($selected.hasClass('fp-left-bottom')) {
                    return 6 /* LEFT_BOTTOM */;
                }
                else if ($selected.hasClass('fp-bottom')) {
                    return 7 /* BOTTOM */;
                }
                else if ($selected.hasClass('fp-right-bottom')) {
                    return 8 /* RIGHT_BOTTOM */;
                }
            }
            return null;
        };
        Crop.prototype.getRectSize = function () {
            return {
                width: parseInt(this.$widthInput.val()),
                height: parseInt(this.$heightInput.val())
            };
        };
        Crop.prototype.destroy = function () {
            this.$button.off('.CropResize');
            this.$position.off('.CropResize');
            this.$widthInput.off('.CropResize');
            this.$heightInput.off('.CropResize');
        };
        return Crop;
    })(UI.Widgets.RsWidget);
    Modules.Crop = Crop;
})(Modules || (Modules = {}));
var Modules;
(function (Modules) {
    (function (FitMethod) {
        FitMethod[FitMethod["RESIZE"] = 0] = "RESIZE";
        FitMethod[FitMethod["WIDTH"] = 1] = "WIDTH";
        FitMethod[FitMethod["HEIGHT"] = 2] = "HEIGHT";
        FitMethod[FitMethod["RECT"] = 3] = "RECT";
    })(Modules.FitMethod || (Modules.FitMethod = {}));
    var FitMethod = Modules.FitMethod;
    (function (FitPosition) {
        FitPosition[FitPosition["LEFT_TOP"] = 0] = "LEFT_TOP";
        FitPosition[FitPosition["TOP"] = 1] = "TOP";
        FitPosition[FitPosition["RIGHT_TOP"] = 2] = "RIGHT_TOP";
        FitPosition[FitPosition["LEFT"] = 3] = "LEFT";
        FitPosition[FitPosition["CENTER"] = 4] = "CENTER";
        FitPosition[FitPosition["RIGHT"] = 5] = "RIGHT";
        FitPosition[FitPosition["LEFT_BOTTOM"] = 6] = "LEFT_BOTTOM";
        FitPosition[FitPosition["BOTTOM"] = 7] = "BOTTOM";
        FitPosition[FitPosition["RIGHT_BOTTOM"] = 8] = "RIGHT_BOTTOM";
    })(Modules.FitPosition || (Modules.FitPosition = {}));
    var FitPosition = Modules.FitPosition;
    var Fit = (function (_super) {
        __extends(Fit, _super);
        function Fit($el, images, ui) {
            var _this = this;
            _super.call(this);
            this.$el = $el;
            this.images = images;
            this.ui = ui;
            this.selected = 0 /* RESIZE */;
            this.fitCanvas = new Modules.FitMethodCanvas($el.find('#fitCanvas')[0]);
            this.$widthInput = $el.find('.sizes__width input');
            this.$heightInput = $el.find('.sizes__height input');
            this.$widthInput.val(this.images[0].width.toString());
            this.$heightInput.val(this.images[0].height.toString());
            this.$position = $el.find('#fitPosition .fp');
            this.$button = $el.find('.fit-button');
            this.$methods = $el.find('.module-list li');
            this.$methods.on('click.CropResize', function (e) {
                _this.$methods.removeClass('selected');
                _this.selectMethod($(e.target));
            });
            this.$button.on('click.CropResize', function () {
                if (_this.isSizeValid(_this.getRectSize())) {
                    _this.trigger('apply', {
                        method: _this.selected,
                        fitPosition: _this.getPosition(),
                        rect: _this.getRect(),
                        isCanCrop: $el.find('#fitCrop').is(':checked')
                    });
                }
                return false;
            });
            this.$position.on('click.CropResize', function (e) {
                _this.$position.removeClass('selected');
                _this.selectPosition($(e.target));
            });
            this.$widthInput.on('input.CropResize', function (e) {
                _this.update();
            });
            this.$heightInput.on('input.CropResize', function (e) {
                _this.update();
            });
            this.$methods.removeClass('selected');
            this.selectMethod(this.$methods.eq(0));
            this.update();
        }
        Fit.prototype.update = function () {
            var size = this.getRectSize();
            if (this.isSizeValid(size)) {
                this.updateCanvas();
            }
        };
        Fit.prototype.isSizeValid = function (size) {
            return !(((size.width < 30) && (size.width > 9999)) || ((size.height < 30) && (size.height > 9999)));
        };
        Fit.prototype.selectPosition = function ($el) {
            $el.addClass('selected');
            this.updateCanvas();
        };
        Fit.prototype.getPosition = function () {
            var $selected = this.$position.filter('.selected');
            if ($selected) {
                if ($selected.hasClass('fp-left-top')) {
                    return 0 /* LEFT_TOP */;
                }
                else if ($selected.hasClass('fp-top')) {
                    return 1 /* TOP */;
                }
                else if ($selected.hasClass('fp-right-top')) {
                    return 2 /* RIGHT_TOP */;
                }
                else if ($selected.hasClass('fp-left')) {
                    return 3 /* LEFT */;
                }
                else if ($selected.hasClass('fp-center')) {
                    return 4 /* CENTER */;
                }
                else if ($selected.hasClass('fp-right')) {
                    return 5 /* RIGHT */;
                }
                else if ($selected.hasClass('fp-left-bottom')) {
                    return 6 /* LEFT_BOTTOM */;
                }
                else if ($selected.hasClass('fp-bottom')) {
                    return 7 /* BOTTOM */;
                }
                else if ($selected.hasClass('fp-right-bottom')) {
                    return 8 /* RIGHT_BOTTOM */;
                }
            }
            return null;
        };
        Fit.prototype.getSelectedMethod = function () {
            return this.selected;
        };
        Fit.prototype.getRect = function () {
            return {
                left: 0,
                top: 0,
                width: parseInt(this.$widthInput.val()),
                height: parseInt(this.$heightInput.val())
            };
        };
        Fit.prototype.getRectSize = function () {
            return {
                width: parseInt(this.$widthInput.val()),
                height: parseInt(this.$heightInput.val())
            };
        };
        Fit.prototype.selectMethod = function ($item) {
            this.images = this.ui.selected();
            $item.addClass('selected');
            if ($item.data('value') == 'resize-all') {
                this.selected = 0 /* RESIZE */;
            }
            else if ($item.data('value') == 'stretch-to-width') {
                this.selected = 1 /* WIDTH */;
            }
            else if ($item.data('value') == 'stretch-to-height') {
                this.selected = 2 /* HEIGHT */;
            }
            else if ($item.data('value') == 'stretch-to-rect') {
                this.selected = 3 /* RECT */;
            }
            this.updateCanvas();
        };
        Fit.prototype.updateCanvas = function () {
            var rect = this.getRectSize();
            if (this.selected == 0 /* RESIZE */) {
                this.fitCanvas.drawResizeAll(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight(), this.getPosition());
            }
            else if (this.selected == 1 /* WIDTH */) {
                this.fitCanvas.drawStretchToWidth(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight(), this.getPosition());
            }
            else if (this.selected == 2 /* HEIGHT */) {
                this.fitCanvas.drawStretchToHeight(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight(), this.getPosition());
            }
            else if (this.selected == 3 /* RECT */) {
                this.fitCanvas.drawStretchToRect(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight(), this.getPosition());
            }
        };
        Fit.prototype.destroy = function () {
            this.$methods.off('.CropResize');
            this.$button.off('.CropResize');
            this.$position.off('.CropResize');
            this.$widthInput.off('.CropResize');
            this.$heightInput.off('.CropResize');
        };
        return Fit;
    })(UI.Widgets.RsWidget);
    Modules.Fit = Fit;
})(Modules || (Modules = {}));
var Modules;
(function (Modules) {
    var FitMethodCanvas = (function () {
        function FitMethodCanvas(canvas) {
            this.canvas = canvas;
            this.canvasWidth = 120;
            this.canvasHeight = 90;
            this.canvasPadding = 5;
            this.context = this.canvas.getContext('2d');
        }
        FitMethodCanvas.prototype.initCanvas = function () {
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;
            this.context.fillStyle = '#FFFFFF';
            this.context.strokeStyle = '#000000';
            this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        };
        FitMethodCanvas.prototype.getNewSize = function (rect, image) {
            var k = Math.min((this.canvasWidth - this.canvasPadding * 2) / Math.max(rect.width, image.width), (this.canvasHeight - this.canvasPadding * 2) / Math.max(rect.height, image.height));
            return {
                rect: { width: rect.width * k, height: rect.height * k },
                image: { width: image.width * k, height: image.height * k }
            };
        };
        /**
         * dw = (rect.width - image.width) * k
         * dh = (rect.height - image.height) * k
         *
         * @param image
         * @param rect
         * @param dw
         * @param dh
         */
        FitMethodCanvas.prototype.getCalculatedPosition = function (image, rect, dw, dh) {
            var dRect = { x: 0, y: 0 };
            var dImage = { x: 0, y: 0 };
            if (rect.height >= image.height) {
                dImage.y = dh;
                dRect.y = 0;
            }
            else {
                dImage.y = 0;
                dRect.y = -dh;
            }
            if (rect.width >= image.width) {
                dImage.x = dw;
                dRect.x = 0;
            }
            else {
                dImage.x = 0;
                dRect.x = -dw;
            }
            return {
                'image': dImage,
                'rect': dRect
            };
        };
        FitMethodCanvas.prototype.getStartCord = function (image, rect, fitPoint) {
            if (fitPoint == 0 /* LEFT_TOP */) {
                return { 'rect': { x: 0, y: 0 }, 'image': { x: 0, y: 0 } };
            }
            else if (fitPoint == 1 /* TOP */) {
                return this.getCalculatedPosition(image, rect, (rect.width - image.width) / 2, 0);
            }
            else if (fitPoint == 2 /* RIGHT_TOP */) {
                return this.getCalculatedPosition(image, rect, rect.width - image.width, 0);
            }
            else if (fitPoint == 3 /* LEFT */) {
                return this.getCalculatedPosition(image, rect, 0, (rect.height - image.height) / 2);
            }
            else if (fitPoint == 5 /* RIGHT */) {
                return this.getCalculatedPosition(image, rect, rect.width - image.width, (rect.height - image.height) / 2);
            }
            else if (fitPoint == 6 /* LEFT_BOTTOM */) {
                return this.getCalculatedPosition(image, rect, 0, (rect.height - image.height));
            }
            else if (fitPoint == 7 /* BOTTOM */) {
                return this.getCalculatedPosition(image, rect, (rect.width - image.width) / 2, rect.height - image.height);
            }
            else if (fitPoint == 8 /* RIGHT_BOTTOM */) {
                return this.getCalculatedPosition(image, rect, rect.width - image.width, rect.height - image.height);
            }
        };
        FitMethodCanvas.prototype.drawIntersect = function (rect, image) {
            this.context.setLineDash([]);
            this.context.fillStyle = 'gray';
            this.context.fillRect(Math.max(rect.left, image.left), Math.max(rect.top, image.top), Math.min(rect.width, image.width), Math.min(rect.height, image.height));
        };
        FitMethodCanvas.prototype.draw = function (rect, image) {
            this.context.strokeRect(rect.left, rect.top, rect.width, rect.height);
            this.context.strokeStyle = '#FF0000';
            this.context.setLineDash([2]);
            this.context.strokeRect(image.left, image.top, image.width, image.height);
            this.drawIntersect(rect, image);
        };
        FitMethodCanvas.prototype.render = function (sizes, fitPoint) {
            this.initCanvas();
            var start = this.getStartCord(sizes.image, sizes.rect, fitPoint);
            this.draw({ left: this.canvasPadding + start.rect.x, top: this.canvasPadding + start.rect.y, width: sizes.rect.width, height: sizes.rect.height }, { left: this.canvasPadding + start.image.x, top: this.canvasPadding + start.image.y, width: sizes.image.width, height: sizes.image.height });
        };
        FitMethodCanvas.prototype.drawResizeAll = function (rectWidth, rectHeight, imageWidth, imageHeight, fitPoint) {
            this.render(this.getNewSize({ width: rectWidth, height: rectHeight }, Modules.SizeCalculation.getFitSize(rectWidth, rectHeight, imageWidth, imageHeight)), fitPoint);
        };
        FitMethodCanvas.prototype.drawStretchToWidth = function (rectWidth, rectHeight, imageWidth, imageHeight, fitPoint) {
            this.render(this.getNewSize({ width: rectWidth, height: rectHeight }, Modules.SizeCalculation.getStretchWidthSize(rectWidth, rectHeight, imageWidth, imageHeight)), fitPoint);
        };
        FitMethodCanvas.prototype.drawStretchToHeight = function (rectWidth, rectHeight, imageWidth, imageHeight, fitPoint) {
            this.render(this.getNewSize({ width: rectWidth, height: rectHeight }, Modules.SizeCalculation.getStretchHeightSize(rectWidth, rectHeight, imageWidth, imageHeight)), fitPoint);
        };
        FitMethodCanvas.prototype.drawStretchToRect = function (rectWidth, rectHeight, imageWidth, imageHeight, fitPoint) {
            this.render(this.getNewSize({ width: rectWidth, height: rectHeight }, Modules.SizeCalculation.getStretchRectSize(rectWidth, rectHeight, imageWidth, imageHeight)), fitPoint);
        };
        return FitMethodCanvas;
    })();
    Modules.FitMethodCanvas = FitMethodCanvas;
})(Modules || (Modules = {}));
var Modules;
(function (Modules) {
    var SizeCalculation = (function () {
        function SizeCalculation() {
        }
        SizeCalculation.getFitSize = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            if ((imageWidth <= rectWidth) && (imageHeight <= rectHeight)) {
                return { width: imageWidth, height: imageHeight };
            }
            var k = Math.min(rectWidth / imageWidth, rectHeight / imageHeight);
            return { width: imageWidth * k, height: imageHeight * k };
        };
        SizeCalculation.getStretchWidthSize = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            return {
                width: rectWidth,
                height: rectWidth / (imageWidth / imageHeight)
            };
        };
        SizeCalculation.getStretchHeightSize = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            return {
                width: rectHeight * (imageWidth / imageHeight),
                height: rectHeight
            };
        };
        SizeCalculation.getStretchRectSize = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            var k = Math.max(rectWidth / imageWidth, rectHeight / imageHeight);
            return { width: imageWidth * k, height: imageHeight * k };
        };
        return SizeCalculation;
    })();
    Modules.SizeCalculation = SizeCalculation;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>
var Modules;
(function (Modules) {
    var FilterAction = (function () {
        function FilterAction(image, filterName, vignette) {
            if (vignette === void 0) { vignette = false; }
            this.image = image;
            this.filterName = filterName;
            this.vignette = vignette;
            this.needRender = false;
            this.oldFilter = {
                name: '',
                parameters: []
            };
        }
        FilterAction.prototype.execute = function () {
            this.oldFilter = this.image.filter;
            if (this.filterName == 'reset') {
                this.image.filter = null;
            }
            else {
                this.image.filter = {
                    name: this.filterName,
                    parameters: [this.vignette]
                };
            }
            return this.image.save();
        };
        FilterAction.prototype.unExecute = function () {
            this.image.filter = this.oldFilter;
            return this.image.save();
        };
        return FilterAction;
    })();
    Modules.FilterAction = FilterAction;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>
/// <reference path="../../UI/Editor.ts"/>
var Modules;
(function (Modules) {
    var FilterModule = (function () {
        function FilterModule(editor) {
            this.editor = editor;
            this.image = null;
        }
        FilterModule.prototype.html = function () {
            return nunjucks.render('filters.html.njs', {});
        };
        FilterModule.prototype.viewType = function () {
            return 2 /* ANY */;
        };
        FilterModule.prototype.unSelectImage = function (image) {
            this.updateSelectState();
        };
        FilterModule.prototype.selectImage = function (image) {
            this.updateSelectState();
        };
        FilterModule.prototype.update = function () {
            this.updateSelectState(true);
        };
        FilterModule.prototype.updateSelectState = function (forceUpdate) {
            if (forceUpdate === void 0) { forceUpdate = false; }
            if (this.editor.selected().length > 0) {
                this.$el.show();
                var img = this.editor.selected()[0];
                if ((img != this.image) || (forceUpdate)) {
                    if (this.widget != null) {
                        this.widget.destroy();
                    }
                    this.image = img;
                    this.initWidget();
                }
                if (this.widget == null) {
                    this.initWidget();
                }
            }
            else {
                this.$el.hide();
            }
        };
        FilterModule.prototype.initWidget = function () {
            var _this = this;
            var filter = '';
            if (this.image.filter != null) {
                filter = this.image.filter.name;
            }
            this.widget = new Modules.FiltersListWidget(this.$el, filter);
            this.widget.draw(this.image);
            this.widget.on('filter', function (e) {
                _this.doAction(e.data.filter, e.data.vignette);
            });
            this.widget.on('reset', function (e) {
                _this.doAction('reset');
            });
        };
        FilterModule.prototype.init = function ($el) {
            this.$el = $el;
            this.updateSelectState(true);
        };
        FilterModule.prototype.deinit = function () {
            if (this.widget != null) {
                this.widget.destroy();
                this.widget = null;
            }
            this.editor.getInterface().clearPopover();
        };
        FilterModule.prototype.icon = function () {
            return 'fa fa-filter';
        };
        FilterModule.prototype.type = function () {
            return 1 /* DELEGATE */;
        };
        FilterModule.prototype.parent = function () {
            return null;
        };
        FilterModule.prototype.name = function () {
            return 'filter';
        };
        FilterModule.prototype.doAction = function (filterName, vignette) {
            var _this = this;
            if (vignette === void 0) { vignette = false; }
            this.editor.getView().showLoading();
            var promiseArray = [];
            this.editor.selected().forEach(function (img) {
                var act = new Modules.FilterAction(img, filterName, vignette);
                promiseArray.push(img.getActionDispatcher().process(act));
            });
            Promise.all(promiseArray).then(function () {
                _this.editor.getView().update();
            });
        };
        return FilterModule;
    })();
    Modules.FilterModule = FilterModule;
})(Modules || (Modules = {}));
var Modules;
(function (Modules) {
    var FilterWidget = (function (_super) {
        __extends(FilterWidget, _super);
        function FilterWidget($el, filterName, displayFilterName, isSelected) {
            if (isSelected === void 0) { isSelected = false; }
            _super.call(this);
            this.$el = $el;
            this.filterName = filterName;
            this.displayFilterName = displayFilterName;
            this.isSelected = isSelected;
            this.canvasWidth = 50;
            this.render();
        }
        FilterWidget.prototype.render = function () {
            var _this = this;
            this.$block = $(nunjucks.render('filter.html.njs', {
                'filter': {
                    'name': this.filterName,
                    'displayName': this.displayFilterName
                }
            }));
            if (this.isSelected) {
                this.$block.addClass('selected');
            }
            this.$block.on('click.FilterWidget', function (e) {
                if ($(e.target).attr('type') != 'checkbox') {
                    _this.trigger('select', {
                        block: _this.$block,
                        name: _this.filterName,
                        vignette: _this.$block.find('#mFilter-' + _this.filterName + '-vignette').is(':checked')
                    });
                }
                else {
                    _this.trigger('update', {
                        block: _this.$block,
                        name: _this.filterName,
                        vignette: _this.$block.find('#mFilter-' + _this.filterName + '-vignette').is(':checked')
                    });
                }
            });
            this.$el.append(this.$block);
        };
        FilterWidget.prototype.draw = function (caman, w, h) {
            caman.revert();
            caman[this.filterName]();
            var canvas = this.$block.find('canvas')[0];
            canvas.width = w;
            canvas.height = 33;
            var context = canvas.getContext('2d');
            context.fillRect(0, 0, w, h);
            return new Promise(function (resolve, reject) {
                caman.render(function () {
                    context.putImageData(caman.imageData, 0, 0);
                    return resolve(caman);
                });
            });
        };
        FilterWidget.prototype.destroy = function () {
            var c = this.$block.find('canvas')[0];
            c.width = 1;
            c.height = 1;
            c = null;
            this.$block.off('.FilterWidget');
            this.$block.html("");
        };
        return FilterWidget;
    })(UI.Widgets.RsWidget);
    Modules.FilterWidget = FilterWidget;
})(Modules || (Modules = {}));
var Modules;
(function (Modules) {
    var FiltersListWidget = (function (_super) {
        __extends(FiltersListWidget, _super);
        function FiltersListWidget($el, selected) {
            if (selected === void 0) { selected = ''; }
            _super.call(this);
            this.$el = $el;
            this.canvasWidth = 50;
            this.filters = [];
            this.$filtersList = $el.find('.m-filters__filters-list');
            this.createFilter('lomo', 'Lomo', selected);
            this.createFilter('vintage', 'Vintage', selected);
            this.createFilter('clarity', 'Clarity', selected);
            this.createFilter('sinCity', 'Sin City', selected);
            this.createFilter('sunrise', 'Sunrise', selected);
            this.createFilter('crossProcess', 'Cross Process', selected);
            this.createFilter('orangePeel', 'Orange Peel', selected);
            this.createFilter('love', 'Love', selected);
            this.createFilter('grungy', 'Grungy', selected);
            this.createFilter('jarques', 'Jarques', selected);
            this.createFilter('pinhole', 'Pinhole', selected);
            this.createFilter('oldBoot', 'Old Boot', selected);
            this.createFilter('glowingSun', 'Glowing Sun', selected);
            this.createFilter('hazyDays', 'Hazy Days', selected);
            this.createFilter('herMajesty', 'Her Majesty', selected);
            this.createFilter('nostalgia', 'Nostalgia', selected);
            this.createFilter('hemingway', 'Hemingway', selected);
            this.createFilter('concentrate', 'Concentrate', selected);
        }
        FiltersListWidget.prototype.draw = function (image) {
            var _this = this;
            var w = this.canvasWidth;
            var h = image.height * this.canvasWidth / image.width;
            this.initCaman(image, w, h).then(function (caman) {
                var drawPromise = null;
                _this.filters.forEach(function (f) {
                    if (drawPromise != null) {
                        drawPromise = drawPromise.then(function (c) {
                            return f.draw(c, w, h);
                        });
                    }
                    else {
                        drawPromise = f.draw(caman, w, h);
                    }
                });
            });
        };
        FiltersListWidget.prototype.destroy = function () {
            this.filters.forEach(function (f) {
                f.destroy();
            });
            this.filters = [];
        };
        FiltersListWidget.prototype.initCaman = function (image, w, h) {
            return new Promise(function (resolve, reject) {
                (new Core.ImageResizer(image.getImageData(), w, h)).resize().then(function (imageData) {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = w;
                    canvas.height = 33;
                    context.putImageData(imageData, 0, 0);
                    Caman(canvas, function () {
                        resolve(this);
                    });
                });
            });
        };
        FiltersListWidget.prototype.createFilter = function (name, displayName, selectedFilter) {
            var _this = this;
            var isSelected = false;
            if (selectedFilter == name) {
                isSelected = true;
            }
            this.filters.push((new Modules.FilterWidget(this.$filtersList, name, displayName, isSelected)).on('select', function (e) {
                _this.selectFilter(e.data.block, e.data.name, e.data.vignette);
            }).on('update', function (e) {
                _this.setFilter(e.data.block, e.data.name, e.data.vignette);
            }));
        };
        FiltersListWidget.prototype.setFilter = function ($el, name, vignette) {
            this.$el.find('.m-filter').removeClass('selected');
            $el.addClass('selected');
            this.trigger('filter', { filter: name, vignette: vignette });
        };
        FiltersListWidget.prototype.selectFilter = function ($el, name, vignette) {
            if ($el.hasClass('selected')) {
                this.trigger('reset');
                this.$el.find('.m-filter').removeClass('selected');
            }
            else {
                this.$el.find('.m-filter').removeClass('selected');
                $el.addClass('selected');
                this.trigger('filter', { filter: name, vignette: vignette });
            }
        };
        return FiltersListWidget;
    })(UI.Widgets.RsWidget);
    Modules.FiltersListWidget = FiltersListWidget;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/ImageAction.ts"/>
var Modules;
(function (Modules) {
    var ResizeAction = (function () {
        function ResizeAction(image, width, height) {
            this.image = image;
            this.width = width;
            this.height = height;
            this.needRender = true;
        }
        ResizeAction.prototype.execute = function () {
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();
            this.image.width = this.width;
            this.image.height = this.height;
            return this.image.save();
        };
        ResizeAction.prototype.unExecute = function () {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;
            return this.image.save();
        };
        return ResizeAction;
    })();
    Modules.ResizeAction = ResizeAction;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
var Modules;
(function (Modules) {
    var ResizeModule = (function () {
        function ResizeModule(editor) {
            this.editor = editor;
            this.isLocked = true;
            this.image = null;
        }
        ResizeModule.prototype.html = function () {
            return nunjucks.render('resize-single.dialog.html.njs', {
                isLocked: this.isLocked
            });
        };
        ResizeModule.prototype.selectImage = function (image) {
        };
        ResizeModule.prototype.unSelectImage = function (image) {
        };
        ResizeModule.prototype.update = function () {
        };
        ResizeModule.prototype.deinit = function () {
            this.editor.getInterface().clearPopover();
        };
        ResizeModule.prototype.viewType = function () {
            return 0 /* SINGLE */;
        };
        ResizeModule.prototype.init = function ($el) {
            var _this = this;
            this.image = this.editor.selected()[0];
            this.$widthInput = $el.find('.m__single-resize__val.width input');
            this.$heightInput = $el.find('.m__single-resize__val.height input');
            this.$lock = $el.find('.m__single-resize__lock');
            this.$widthInput.val(this.image.width.toString());
            this.$heightInput.val(this.image.height.toString());
            var render = _.debounce(function () {
                _this.doAction(_this.$widthInput.val(), _this.$heightInput.val());
            }, 500);
            this.$lock.click(function () {
                if (_this.isLocked) {
                    _this.isLocked = false;
                    _this.$lock.find('i').attr('class', 'fa fa-unlock');
                }
                else {
                    _this.isLocked = true;
                    _this.updateSize(_this.image);
                    render();
                    _this.$lock.find('i').attr('class', 'fa fa-lock');
                }
            });
            this.$widthInput.on('input', function () {
                var val = parseInt(_this.$widthInput.val());
                if (!isNaN(val) && (val >= 50)) {
                    if (_this.isLocked) {
                        _this.$heightInput.val(Math.round(_this.image.getOriginalImage().height * val / _this.image.getOriginalImage().width) + '');
                    }
                    var h = parseInt(_this.$heightInput.val());
                    if (!isNaN(h) && (h >= 30)) {
                        render();
                    }
                }
            });
            this.$heightInput.on('input', function () {
                var val = parseInt(_this.$heightInput.val());
                if (!isNaN(val) && (val >= 30)) {
                    if (_this.isLocked) {
                        _this.$widthInput.val(Math.round(_this.image.getOriginalImage().width * val / _this.image.getOriginalImage().height) + '');
                    }
                    var w = parseInt(_this.$widthInput.val());
                    if (!isNaN(w) && (w >= 50)) {
                        render();
                    }
                }
            });
        };
        ResizeModule.prototype.updateSize = function (image) {
            var w = parseInt(this.$widthInput.val());
            var h = parseInt(this.$heightInput.val());
            if (!isNaN(w) && !isNaN(h) && (w >= 50) && (h >= 30)) {
                if (w > h) {
                    this.$heightInput.val(Math.round(image.getOriginalImage().height * w / image.getOriginalImage().width) + '');
                }
                else {
                    this.$widthInput.val(Math.round(image.getOriginalImage().width * h / image.getOriginalImage().height) + '');
                }
            }
        };
        ResizeModule.prototype.icon = function () {
            return 'fa fa-expand';
        };
        ResizeModule.prototype.type = function () {
            return 1 /* DELEGATE */;
        };
        ResizeModule.prototype.parent = function () {
            return null;
        };
        ResizeModule.prototype.name = function () {
            return 'resize';
        };
        ResizeModule.prototype.doAction = function (width, height) {
            var _this = this;
            var act = new Modules.ResizeAction(this.image, width, height);
            this.image.getActionDispatcher().process(act).then(function () {
                _this.editor.getView().update();
            });
        };
        return ResizeModule;
    })();
    Modules.ResizeModule = ResizeModule;
})(Modules || (Modules = {}));
