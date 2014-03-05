/**
 * Object observer
 */
(function (Object) {
    /**
     * Is ie 8 browser
     */
    var isIE8 = (function () {
        return navigator.userAgent.indexOf("MSIE 8") > -1;
    }());

    /**
     * Observer
     * @param key
     * @param val
     * @constructor
     */
    function Observer() {
        this.events = {};
        this.members = {};
    }

    /**
     * Get val
     * @param key
     * @returns {*}
     */
    Observer.prototype.getVal = function (key) {
        return this.members[key];
    };
    /**
     * Set val
     * @param key
     * @param val
     */
    Observer.prototype.setVal = function (key, val) {
        this.members[key] = val;
        return val;
    };
    /**
     * Destroy
     * @param key
     */
    Observer.prototype.destroy = function (ref, key) {
        this.trigger(ref, key, undefined, this.members[key]);
        delete this.members[key];
        delete this.events[key];
    }
    /**
     * Key
     * @param key
     */
    Observer.prototype.trigger = function (ref, key, nVal, oVal) {
        this.events[key].forEach(function (callback) {
            callback.call(ref, nVal, oVal, key);
        });
    }
    /**
     * Add
     * @param key
     * @param callback
     */
    Observer.prototype.add = function (key, callback) {
        if (typeof key === 'string' && typeof callback === 'function') {
            if (!this.events[key]) {
                this.events[key] = [];
            }
            this.events[key].push(callback);
        }
    }
    /**
     * Create IE8 observer
     * @param ob
     * @param name
     * @param setter
     * @param getter
     */
    function createIE8observer(ob, name, setter, getter) {
        /**
         * Head
         * @type {*}
         */
        var head = document.getElementsByTagName('head')[0],
            /**
             * Dirty check
             */
            dirty = function () {
                getter();
                setter(ob[name]);
            },
            /**
             * Loop check
             */
            loop = function () {
                var script = document.createElement('script');
                // this is fired instantly after is rendered
                // this is real async 0 timeout
                script.onreadystatechange = function () {
                    dirty();
                    head.removeChild(script);
                    loop();
                }
                head.appendChild(script);
            };
        /// instant loop
        loop();
    }

    /**
     * Create an observer
     * @param name
     * @param callback
     */
    function createObserver(name, callback) {
        /**
         * Observer
         */
        if (!this.__$$observer__) {
            this.__$$observer__ = new Observer();
        }
        /**
         * add
         */
        this.__$$observer__.add(name, callback);
        /**
         * Observer
         * @type {Observer|*}
         */
        var observer = this.__$$observer__,
            /**
             * Reference
             * @type {Object}
             */
                self = this,
            /**
             * is array
             * @type {*}
             */
                isArray = Array.isArray(this[name]),
            /**
             * Mutator
             * @type {string[]}
             */
                mutators = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'],
            /**
             * Getter
             * @returns {*}
             */
                getter = function () {
                return observer.getVal(name);
            },
            /**
             * Setter
             * @param val
             */
                setter = function (val) {
                var oVal = observer.getVal(name),
                    nVal = observer.setVal(name, val);
                observer.trigger(self, name, nVal, oVal);
            };
        /**
         * Set val
         */
        observer.setVal(name, this[name]);
        /**
         * Is array
         */
        if (isArray) {
            var value = observer.getVal(name);
            mutators.forEach(function (key) {
                var method = value[key];
                value[key] = function () {
                    var oVal = observer.getVal(name).slice();
                    method.apply(value, Array.prototype.slice.call(arguments));
                    observer.trigger(self, name, observer.getVal(name), oVal);
                }
            });
        }


        /**
         * define property
         */
        try {
            if (isIE8) {
                createIE8observer(this, name, setter, getter);
            } else {
                Object.defineProperty(this, name, {
                    get: getter,
                    set: setter,
                    enumerable: true,
                    configurable: true
                });
            }
        } catch (e) {
            try {
                //firefox
                Object.prototype.__defineGetter__.call(this, name, getter);
                Object.prototype.__defineSetter__.call(this, name, setter);
            } catch (e2) {
                throw new Error("Browser don't support getters and setters", [e, e2]);
            }
        }
    }

    /**
     * Destroy
     * @param member
     */
    function destory(member, deleteMember) {
        if (!(this.__$$observer__ instanceof Observer)) {
            return false;
        }
        var key, val;
        if (member && !(typeof member === 'boolean')) {
            if (!deleteMember) {
                // get the value
                val = this[member];
            }
            // destroy the member
            this.__$$observer__.destroy(this, member);
            delete this[member];
            if (!deleteMember) {
                this[member] = val;
            }
        } else {
            if (typeof member === 'boolean') {
                deleteMember = member;
            }
            delete this.__$$observer__;
            for (key in this) {
                if (!deleteMember) {
                    val = this[key];
                }
                delete this[key];
                if (!deleteMember) {
                    this[key] = val;
                }

            }
        }
    }

    /**
     * Observe
     * @param name
     * @param callback
     */
    function observe(name, callback) {
        var key;
        if (typeof name === 'string' && typeof callback === 'function') {
            createObserver.call(this, name, callback);
        } else if (typeof name === 'function') {
            for (key in this) {
                if (this.hasOwnProperty(key)) {
                    observe.call(this, key, name);
                }
            }
        } else {
            throw new Error('Object.observer is not called correctly parameters are not provided correctly')
        }

    }


    /**
     * Observer
     */
    Object.observe = function (ob) {
        var args = Array.prototype.slice.call(arguments, 1);
        observe.apply(ob, args);
    }
    /**
     * Destroy
     * @param ob
     */
    Object.destroy = function (ob) {
        var args = Array.prototype.slice.call(arguments, 1);
        destory.apply(ob, args);
    }

}(Object));

