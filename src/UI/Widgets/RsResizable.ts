/// <reference path="RsWidget.ts"/>

module UI.Widgets {
    interface Point {
        x: number;
        y: number;
    }

    interface ItemCorners {
        topLeft: Point;
        topRight: Point;
        bottomRight: Point;
        bottomLeft: Point;
    }

    class RsResizableItem extends RsWidget {
        private itemHalfSize: number = 5;
        private $item: JQuery;

        private position: Point;

        constructor(private $el: JQuery, private $parent: JQuery, private index: number) {
            super();
            this.init();
        }

        private getElementCorners(): ItemCorners {
            var topLeft = {x: this.$el.position().left, y: this.$el.position().top};
            var topRight = {x: topLeft.x + this.$el.width(), y: topLeft.y};
            var bottomRight = {x: topLeft.x + this.$el.width(), y: topLeft.y + this.$el.height()};
            var bottomLeft = {x: topLeft.x, y: topLeft.y + this.$el.height()};

            return {
                topLeft: topLeft,
                topRight: topRight,
                bottomRight: bottomRight,
                bottomLeft: bottomLeft
            }
        }

        public getPosition(): Point {
            return this.position;
        }

        public getIndex(): number {
            return this.index;
        }

        public toPlace() {
            var cord: Point;
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
        }

        private init() {
            this.$item = $('<div class="rs-resizable-item item_' + this.index + '"></div>');
            this.$parent.append(this.$item);

            this.toPlace();

            var $body: JQuery = $(document);
            this.$item.mousedown((downEvent: JQueryMouseEventObject) => {
                var x = downEvent.clientX - parseInt(this.$item.css('left')) - this.itemHalfSize;
                var y = downEvent.clientY - parseInt(this.$item.css('top')) - this.itemHalfSize;

                $body.on('mousemove.RsResize_' + this.index, (moveEvent: JQueryMouseEventObject) => {
                    var pos = {
                        x: moveEvent.clientX - x,
                        y: moveEvent.clientY - y
                    };

                    this.moveItem(pos);

                    this.trigger('move', {
                        index: this.index,
                        newPosition: this.position,
                        oldPosition: {
                            x: x,
                            y: y
                        }
                    });
                });

                $body.on('mouseup.RsResize_' + this.index, () => {
                    $body.off('.RsResize_' + this.index);
                });
            });
        }

        private moveItem(pos: Point) {
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
            }
        }
    }

    export class RsResizable extends RsWidget {
        private items: RsResizableItem[] = [];

        constructor(private $el: JQuery, private $parent: JQuery) {
            super();

            this.$el.addClass('rs-resizable');

            for (var i = 0; i < 8; i++) {
                var item = new RsResizableItem(this.$el, this.$parent, i);
                this.items.push(item);

                item.on('move', (ev) => {
                    this.onItemMove(ev.data.index, ev.data.newPosition, ev.data.oldPosition);
                })
            }

            var $body: JQuery = $(document);
            this.$el.mousedown((downEvent: JQueryMouseEventObject) => {
                var x = downEvent.clientX - parseInt(this.$el.css('left'));
                var y = downEvent.clientY - parseInt(this.$el.css('top'));

                $body.on('mousemove.RsResize', (moveEvent: JQueryMouseEventObject) => {
                    var pos = {
                        x: moveEvent.clientX - x,
                        y: moveEvent.clientY - y
                    };

                    this.$el.css({
                        'left': pos.x,
                        'top': pos.y
                    });
                    this.updateItems();
                });

                $body.on('mouseup.RsResize', () => {
                    $body.off('.RsResize');
                });
            });
        }

        private onItemMove(index: number, newPosition: Point, oldPosition: Point) {
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
        }

        private updateItems(stopItem: number[] = []) {
            this.trigger('resize', {
                width: this.$el.width(),
                height: this.$el.height(),
                left: this.items[0].getPosition().x,
                top: this.items[0].getPosition().y
            });

            this.items.forEach((item) => {
                if (!_.contains(stopItem, item.getIndex())) {
                    item.toPlace();
                }
            });
        }
    }
}
