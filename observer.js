/**
 * Object observer
 */
(function (Object) {
    "use strict";
    /**
     * Observer key
     * @type {string}
     */
    var oKey = '__$$observer__';
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
     * Create an observer
     * @param name
     * @param callback
     */
    function createObserver(name, callback) {
        /**
         * Observer
         */
        if (!this[oKey]) {
            this[oKey] = new Observer();
        }
        /**
         * add
         */
        this[oKey].add(name, callback);
        /**
         * Observer
         * @type {Observer|*}
         */
        var observer = this[oKey],
            /**
             * Reference
             * @type {Object}
             */
            self = this,
            /**
             * is array
             * @type {*}
             */
            isArray = Object.prototype.toString.call(this[name]) === '[object Array]',
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
            Object.defineProperty(this, name, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
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
        if (!(this[oKey] instanceof Observer)) {
            return false;
        }
        var key, val;
        if (member && !(typeof member === 'boolean')) {
            if (!deleteMember) {
                // get the value
                val = this[member];
            }
            // destroy the member
            this[oKey].destroy(this, member);
            delete this[member];
            if (!deleteMember) {
                this[member] = val;
            }
        } else {
            if (typeof member === 'boolean') {
                deleteMember = member;
            }
            delete this[oKey];
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
     * Don't observe values in exclude
     * @param name
     * @param callback
     * @param exclude Array of keys
     */
    function observe(name, callback, exclude) {
        var key;
        if (typeof name === 'string' && typeof callback === 'function') {
            if (Array.isArray(exclude) && !Array.isArray(this)) {
                if (exclude.indexOf(name) === -1) {
                    createObserver.call(this, name, callback);
                }
            } else {
                createObserver.call(this, name, callback);
            }
        } else if (typeof name === 'function') {
            for (key in this) {
                if (this.hasOwnProperty(key) && key !== oKey) {
                    observe.call(this, key, name, callback);
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

