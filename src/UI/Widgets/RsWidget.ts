module UI.Widgets {
    export interface RsWidgetEvent {
        data: any
        widget: RsWidget
    }

    export class RsWidget {
        private events: {[name: string]: {
                [namespace: string]: Array<(e: RsWidgetEvent) => any>
            }
        } = {};

        constructor() {
            
        }

        on(eventName: string, callback: (e: RsWidgetEvent) => any, eventNamespace = '_') {
            if (!_.has(this.events, eventName)) {
                this.events[eventName] = {};
            }

            if (!_.has(this.events[eventName], eventNamespace)) {
                this.events[eventName][eventNamespace] = [];
            }

            this.events[eventName][eventNamespace].push(callback);
        }

        off(eventNamespace: string = '_') { // or event ???
            _.map(this.events, (event, eventName) => {
                this.events[eventName] = _.omit(event, eventNamespace);
            });
        }

        trigger(eventName: string, data: any = null) {
            if (_.has(this.events, eventName)) {
                _.map(this.events[eventName], (callbacks, eventNamespace) => {
                    callbacks.forEach((f: (e: RsWidgetEvent) => any) => {
                        f({
                            data: data,
                            widget: this
                        });
                    })
                });
            }
        }
    }
}
