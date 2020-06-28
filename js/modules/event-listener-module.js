/* Event Listener Module */
/* Version 0.8.1 */

class EventFunction {
    constructor(Func, type, mods) {
        /* modifiers */
        this.keys = [];
        this.stop = false;
        this.prevent = false;
        this.capture = false;
        this.self = false;
        this.sync = false;
        this.once = false;
        this.passive = false;
        this.exact = false;

        /* core data */
        this.type = type;
        this.Call = Func;

        if (mods) {
            for (const mod of mods) {
                switch (mod) {
                    case "stop": this.exact = true; break;
                    case "prevent": this.prevent = true; break;
                    case "capture": this.capture = true; break;
                    case "self": this.self = true; break;
                    case "sync": this.sync = true; break;
                    case "once": this.once = true; break;
                    case "passive": this.passive = true; break;
                    case "exact": this.exact = true; break;
                    default: this.keys.push(mod);
                }
            }
        }
    }

    IsSameAs(EventFunction) {
        return this.Function.toString() === EventFunction.Function.toString();
    }
}

class EventListener {
    constructor(element, EventFunctions) {
        this.domainElement = element;
        this.mountedEventFunctions = EventFunctions;

        this.Mount();
    }

    HasSameElementAs(element) {
        return this.domainElement === element;
    }

    Add(EventFunctions) {
        for (const type in EventFunctions) {
            if (!this.mountedEventFunctions[type]) this.mountedEventFunctions[type] = EventFunctions[type];
            else this.mountedEventFunctions[type].push(...EventFunctions[type]);
        }

        this.Mount();
    }

    Mount() {
        for (const type in this.mountedEventFunctions) {
            this.domainElement["on" + type] = e => {
                for (const ef of this.mountedEventFunctions[type]) {
                    if (ef.prevent) e.preventDefault();
                    if (ef.stop) e.stopPropagation();

                    if (ef.keys.length) {
                        for (const key of ef.keys) {
                            if (e.key && e.key.toLowerCase() === key) {
                                ef.Call(e, this.domainElement);
                                return;
                            }
                        }
                    }
                    else {
                        ef.Call(e, this.domainElement);
                    }
                }
            }
        }
    }
}

export default class EventListenerModule {
    constructor() {
        this.eventListeners = [];
        this.eventFunctions = [];
    }

    ParseElement(queryEl) {
        if (!queryEl) throw "Error: There is none or empty argument to the method.";

        switch (true) {
            case (Array.isArray(queryEl)): {
                if (!queryEl.length) throw "Error: Empty array argument to the method.";
                return;
            }
            case (queryEl instanceof HTMLElement): {
                return [queryEl];
            }
            default: {
                return document.querySelectorAll(queryEl);
            }
        }
    }

    Add(queryEl, listenerModules) {
        // collect functions
        const collectedEventFunctions = {};
        for (const type in listenerModules) {
            const [realType, ...modifiers] = type.split(".");
            const isArray = Array.isArray(listenerModules[type]);

            if (!collectedEventFunctions[realType]) collectedEventFunctions[realType] = [];

            // building new event function objects
            let newEventFunction;
            if (isArray) {
                newEventFunction = [];
                for (const Func of listenerModules[type]) {
                    const tempNew = new EventFunction(Func, realType, modifiers);
                    newEventFunction.push(tempNew);
                    collectedEventFunctions[realType].push(tempNew);
                }
            }
            else {
                newEventFunction = new EventFunction(listenerModules[type], realType, modifiers);
                collectedEventFunctions[realType].push(newEventFunction);
            }

            // checking for duplication and save the modules
            for (const EventFunction of this.eventFunctions) {
                if (isArray) {
                    const filteredEventFunctions = [];
                    for (const newEF of newEventFunction) {
                        if (!EventFunction.IsSameAs(newEF)) {
                            filteredEventFunctions.push(newEventFunction);
                        }
                    }
                    this.eventFunctions.push(...filteredEventFunctions);
                }
                else if (!EventFunction.IsSameAs(newEventFunction)) {
                    this.eventFunctions.push(newEventFunction);
                }
            }
        }

        // collect element and mounted functions
        for (const newEl of this.ParseElement(queryEl)) {

            // check for duplicated objects
            let isFoundDuplicated = false;
            for (const existedEl of this.eventListeners) {
                if (existedEl.HasSameElementAs(newEl)) {
                    existedEl.Add(collectedEventFunctions);
                    isFoundDuplicated = true;
                    break;
                }
            }

            if (!isFoundDuplicated) this.eventListeners.push(new EventListener(newEl, collectedEventFunctions));
        }
    }

    Remove(queryEl, ...types) {
        queryEl = this.ParseElement(queryEl);
        for (const type of types) {
            for (const el of queryEl) {
                el["on" + type] = null;
            }
        }
    }

    RemoveAll(queryEl) {
        if (!queryEl) {
            for (const listenerKey in this.listeners) {
                
            }

            this.listeners = {};
            this.functions = {};
        }
        else {
            switch (true) {
                case (Array.isArray(queryEl)): {
                    delete this.data[queryEl.toString()];
                } break;
                case (queryEl instanceof HTMLElement): {
                    const tempEl = document.createElement("div");
                    tempEl.appendChild(queryEl.cloneNode(false));
    
                    delete this.data[tempEl.innerHTML];
                } break;
                default: {
                    delete this.data[queryEl];
                }
            }
        }
    }

    RemovePartials(queryEl, listenerModules) {

    }

    ContainsElement(element) {

    }

    ContainsFunction(Function, saveOption) {

    }

    FilterElementFunction(...Funcs) {

    }
}