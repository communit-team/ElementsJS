/**
 * Namespace to hold event management wrappers
 * @namespace Elements
 * @type {{dispatch: Elements.dispatch, unbind: Elements.unbind, on: Elements.on}}
 */
const Elements = {
    /**
     * A wrapper to addEventListener to help manage events on a larger scale and enable removing them easily
     *
     * @param action {String} - the name of the event we would like to listen to
     * @param callback {Function} - the event handler - the callback function to handle the event
     */
    on: function(action, callback) {
        if (typeof this._eventsRegistry === 'undefined') { this._eventsRegistry = {}; }
        let actions = (action.match(/\s/)) ? action.split(" ") : [action];

        actions.forEach((action) => {
            if (typeof this._eventsRegistry[action] === 'undefined') { this._eventsRegistry[action] = []; }

            this._eventsRegistry[action].push(callback);

            this.addEventListener(action, callback);
        });

    },
    /**
     * A wrapper to dispatchEvent, meant to simplify creating custom event
     *
     * @param action {String} - the name for the event that is being dispatched
     * @param detail {Object} (optional) - the event details - default is an empty object, best practice will be to
     *                                     pass the details as properties
     * @param event_init {EventInit} (optional) - a dictionary with the following fields: bubbles, cancelable, composed
     */
    dispatch: function(action, detail, event_init) {
        detail = detail || {};
        event_init = event_init || {};
        this.dispatchEvent(new CustomEvent(action, Object.assign({}, {detail: detail}, event_init)));
    },
    /**
     * A wrapper to manage and simplify the removal of event handlers, by using the _eventRegistry you can unbind
     * your event handlers without saving and supplying them on your own, enabling the use of arrow functions as
     * event handlers and maintaining scope easier
     *
     * @param action {String} - the name for the event that we want to unbind
     * @param callback {Function} (optional) - the event handler - the callback function to unbind
     */
    unbind: function (action, callback) {
        if (typeof this._eventsRegistry !== 'undefined') {
            if (typeof action !== 'undefined') {
                if (typeof callback !== 'undefined') {
                    this.removeEventListener(action, callback);
                } else {
                    if (typeof this._eventsRegistry[action] !== 'undefined') {
                        this._eventsRegistry[action].forEach( (c) => { this.removeEventListener(action, c); });
                        this._eventsRegistry[action] = [];
                    }
                }
            } else {
                Object.keys(this._eventsRegistry).forEach( (a) => {
                    a.forEach( (c) => { this.removeEventListener(action, c); })
                });

                this._eventsRegistry = {};
            }
        }
    }
};

/**
 * Remove element from parent node
 */
if (typeof Element.prototype.remove !== 'function') {
    Element.prototype.remove = function() {
        this.parentNode.removeChild(this);
    };
}

/**
 * Remove elements children
 */
Element.prototype.empty = function() {
    while(this.firstChild) { this.removeChild(this.firstChild); }
};

/**
 * Easily add multiple classes to element
 *
 * @param cls {String} - list of class names separated by spaces
 * @return {Element} - return this (the element who called the function)
 */
Element.prototype.addClass = function(cls) {
    if (typeof cls !== "undefined" && cls.trim().length > 0) {
        cls.split(" ").forEach((c) => { this.classList.add(c.trim()) });
    }
    return this;
};

/**
 * Easily remove multiple classes from element
 *
 * @param cls {String} - list of class names separated by spaces
 * @return {Element} - return this (the element who called the function)
 */
Element.prototype.removeClass = function(cls) {
    if (typeof cls !== "undefined") {
        cls.split(" ").forEach((c) => { this.classList.remove(c.trim()) });
    }
    return this;
};

/**
 * Check if element has a certain class
 *
 * @param cls - a class name
 * @return {boolean} - indicating if the element has the class
 */
Element.prototype.hasClass = function(cls) {
    return this.classList.contains(cls);
};

/**
 * Toggle element classes
 *
 * @param cls {String} - a list of class names separated with spaces
 * @return {Element} - return this (the element who called the function)
 */
Element.prototype.toggleClass = function(cls) {
    return this.hasClass(cls) ? this.removeClass(cls) : this.addClass(cls);
};

/**
 * Support iterating a single element
 *
 * @param callback {function} - the iteration callback function
 * @return {*} - return the callback return value
 */
Element.prototype.forEach = function(callback) {
    return callback.call(this, this, 0);
};

/**
 * Append as child element if element is of type Element, if it's of type string or number add as text
 *
 * @param element {Element|String|Number} - the data to append
 * @return {Element} - return this (the element who called the function)
 */
const nativeAppend = Element.prototype.append;
if (typeof nativeAppend !== 'function') {
    Element.prototype.append = function(element) {
        if (element instanceof Element) {
            this.appendChild(element);
            return this;
        } else if (typeof element === 'string' || typeof element === 'number') {
            this.text(element);
            return this;
        }

        return this;
    };
} else {
    Element.prototype.append = function(...element) {
        nativeAppend.call(this, ...element);

        return this;
    }
}

/**
 * Override the element inner HTML with the given element data
 *
 * @param element {Element|String|Number} - the new data to override with
 * @return {Element} - return this (the element who called the function)
 */
Element.prototype.html = function(element) {
    this.innerHTML = '';

    return this.append(element);
};

/**
 * Append the child element before all other child elements
 *
 * @param element {Element} - the element to prepend
 * @return {Element} - return this (the element who called the function)
 */
const nativePrepend = Element.prototype.prepend;
if (typeof nativePrepend !== 'function') {
    Element.prototype.prepend = function(element) {
        if (element instanceof Element) {
            this.insertBefore(element, this.firstChild)
        }

        return this;
    };
} else {
    Element.prototype.prepend = function(...element) {
        nativePrepend.call(this, ...element);

        return this;
    };
}

/**
 * Query elements different from the given element
 *
 * @param element {Element} - the element we wish to exclude
 * @return {any} - this element if it doesn't match the given element, otherwise an empty span
 */
Element.prototype.not = function(element) {
    return (this === element) ? document.createElement('span') : this;
};

/**
 * Get or set an element's inner text
 *
 * @param text {*}, optional - the text to be set for the element
 * @return {string|Element} - return the element if text was set, otherwise return the existing element's text
 */
Element.prototype.text = function(text) {
    if (typeof text !== 'undefined') {
        this.appendChild(document.createTextNode(text));
        return this;
    }

    return this.innerText;
};

/**
 * Get or set an element's attribute
 *
 * @param k {String} - the attribute key
 * @param v {*}, optional - the attribute value
 * @return {String|Element|*} - returns this if attr was set (v is defined), return (get) the attr's value if
 *                              v is undefined
 */
Element.prototype.attr = function(k, v) {
    if (k === 'value') {
        if (typeof v !== 'undefined') {
            this.value = v;
        } else if (typeof this.value !== 'undefined' && this.value.toString().length > 0) {
            return this.value
        }
    }

    if (typeof v !== 'undefined') {
        this.setAttribute(k, v);
    } else {
        let attr = this.getAttribute(k);

        if (attr !== null && typeof attr !== "undefined") { return attr; }
    }
    return this;
};

/**
 * Get or set the value attr specifically
 *
 * @param v {*}, optional - the value to set
 * @return {String|Element|*} - returns this if value was set (v is defined), return (get) the value if v is undefined
 */
Element.prototype.val = function(v) {
    return this.attr('value', v);
};

/**
 * Use our predefined on function to listen to event on elements
 *
 * @param action {String} - event name
 * @param callback {Function} - event handler callback
 */
Element.prototype.on = function(action, callback) { Elements.on.call(this, action, callback) };

/**
 * Use our predefined dispatch function to trigger new custom events from the element
 *
 * @param action {String}, event name
 * @param detail {Object},(optional) - the event details - default is an empty object,
 *                                     best practice will be to pass the details as properties
 * @param event_init {EventInit} (optional) - a dictionary with the following fields: bubbles, cancelable, composed
 */
Element.prototype.dispatch = function(action, detail, event_init) { Elements.dispatch.call(this, action, detail, event_init) };

/**
 * Use our predefined unbind function to easily remove event listeners set with our on function from the element
 *
 * @param action {String} - the name for the event that we want to unbind
 * @param callback {Function} (optional) - the event handler - the callback function to unbind
 */
Element.prototype.unbind = function(action, callback) { Elements.unbind.call(this, action, callback) };

/**
 * Query for sub-elements of the calling element
 *
 * @param t {String} - the query string (class names, id, etc...)
 * @return {Element|undefined} - return the sub elements that were queried or undefined if they do not exist
 */
Element.prototype.find = function(t) {
    return Query(t, this);
};

/**
 * Set the an elements css dynamically using a property name to value dictionary
 *
 * @param stylesHash {Object} - property name to value dictionary {display: 'block', 'z-index': 10, ...}
 * @return {Element} - return this (the element who called the function)
 */
Element.prototype.css = function(stylesHash) {
    Object.keys(stylesHash).forEach( (k) => {
        if (typeof stylesHash[k] !== 'undefined') {
            this.style[k] = stylesHash[k];
            return this;
        }
    });

    return this;
};

/**
 * Sets the Element object length to 1 to support enumeration
 *
 * @type {number}
 */
Element.prototype.length = 1;

/**
 * Use our predefined on function to listen to event on the Document
 *
 * @param action {String} - event name
 * @param callback {Function} - event handler callback
 */
Document.prototype.on = function(action, callback) { Elements.on.call(this, action, callback) };

/**
 * Use our predefined dispatch function to trigger new custom events from the Document
 *
 * @param action {String}, event name
 * @param detail {Object},(optional) - the event details - default is an empty object,
 *                                     best practice will be to pass the details as properties
 *
 * @param event_init {EventInit} (optional) - a dictionary with the following fields: bubbles, cancelable, composed
 */
Document.prototype.dispatch = function(action, detail, event_init) { Elements.dispatch.call(this, action, detail, event_init) };

/**
 * Use our predefined unbind function to easily remove event listeners set with our on function from the Document
 *
 * @param action {String} - the name for the event that we want to unbind
 * @param callback {Function} (optional) - the event handler - the callback function to unbind
 */
Document.prototype.unbind = function(action, callback) { Elements.unbind.call(this, action, callback) };

/**
 * Use our predefined on function to listen to event on the Window
 *
 * @param action {String} - event name
 * @param callback {Function} - event handler callback
 */
Window.prototype.on = function(action, callback) { return Elements.on.call(this, action, callback) };

/**
 * Use our predefined dispatch function to trigger new custom events from the Window
 *
 * @param action {String}, event name
 * @param detail {Object},(optional) - the event details - default is an empty object,
 *                                     best practice will be to pass the details as properties
 *
 * @param event_init {EventInit} (optional) - a dictionary with the following fields: bubbles, cancelable, composed
 */
Window.prototype.dispatch = function(action, detail, event_init) { Elements.dispatch.call(this, action, detail, event_init) };

/**
 * Use our predefined unbind function to easily remove event listeners set with our on function from the Window
 *
 * @param action {String} - the name for the event that we want to unbind
 * @param callback {Function} (optional) - the event handler - the callback function to unbind
 */
Window.prototype.unbind = function(action, callback) { Elements.unbind.call(this, action, callback) };

/**
 * Trigger click event for all elements in the NodeList
 *
 * @return {NodeList} - return this (the NodeList who called the function)
 */
NodeList.prototype.click = function() {
    this.forEach((n) => { n.click()});
    return this;
};

/**
 * Remove all the elements in the NodeList from the DOM
 *
 * @return {NodeList} - return this (the NodeList who called the function)
 */
NodeList.prototype.remove = function() {
    this.forEach((n) => { n.remove()});
    return this;
};

/**
 * Empty all the content from the elements in the NodeList
 *
 * @return {NodeList} - return this (the NodeList who called the function)
 */
NodeList.prototype.empty = function() {
    this.forEach((n) => { n.empty()});
    return this;
};

/**
 * Apply Element.prototype.addClass to all the elements in the NodeList
 *
 * @param cls {String} - a space separated list of classes to add
 * @return {NodeList} - return this (the NodeList who called the function)
 */
NodeList.prototype.addClass = function(cls) {
    this.forEach((n) => { n.addClass(cls)});
    return this;
};

/**
 * Apply Element.prototype.removeClass to all the elements in the NodeList
 *
 * @param cls {String} - a space separated list of classes to remove
 * @return {NodeList} - return this (the NodeList who called the function)
 */
NodeList.prototype.removeClass = function(cls) {
    this.forEach((n) => { n.removeClass(cls)});
    return this;
};

/**
 * Apply Element.prototype.toggleClass to all the elements in the NodeList
 *
 * @param cls {String} - a list of class names separated with spaces
 * @return {NodeList} - return this (the NodeList who called the function)
 */
NodeList.prototype.toggleClass = function(cls) {
    this.forEach((n) => { n.toggleClass(cls)});
    return this;
};

/**
 * Check if any of the elements in the NodeList have the class
 *
 * @param cls {String} - a class name
 * @return {boolean}
 */
NodeList.prototype.hasClass = function(cls) {
    let flag = false;

    this.forEach((n) => { if (n.hasClass(cls)) { flag = true; } });

    return flag;
};

/**
 *
 * @param element {Element|String|Number} - the element (can also be string or number) to append
 * @return {NodeList} - return this (the NodeList who called the function)
 */
NodeList.prototype.append = function(element) {
    this.forEach((n) => { n.append(element)});
    return this;
};

/**
 * Filter out elements from the NodeList using a css selector or an Element or a NodeList
 *
 * @param cssSelectorOrNodeOrNodeList {String|Element|NodeList} - the data to filter away
 * @return {NodeList} - a filtered NodeList
 */
// TT Note - origin: https://stackoverflow.com/questions/49848148/pure-javascript-how-to-select-all-selectors-but-not-this
NodeList.prototype.not = function ( cssSelectorOrNodeOrNodeList ) {
    //Change object name(constructor.name) to "NodeList" from "Array" in console window
    let list = ( () => { class NodeList extends Array {} return new NodeList(); } )(), excludes;

    if ( typeof cssSelectorOrNodeOrNodeList === "string" ) excludes = document.querySelectorAll( cssSelectorOrNodeOrNodeList );
    else if ( cssSelectorOrNodeOrNodeList instanceof NodeList ) excludes = cssSelectorOrNodeOrNodeList;
    else if ( cssSelectorOrNodeOrNodeList instanceof Node ) excludes = [ cssSelectorOrNodeOrNodeList ];

    if ( excludes === undefined || !excludes.length ) return this;

    for ( const node of this ) {
        let flag = true;
        for ( const compare of excludes ) {
            if ( node === compare ) {
                flag = false;
                break;
            }
        }
        if ( flag ) list.push( node );
    }
    Object.setPrototypeOf( list, NodeList.prototype );

    return list;
};

/**
 * Apply Element's replaceWith on all elements in the NodeList
 *
 * @param element {Node|String} - the data (Node, String) to replace with
 * @return {NodeList} - return this (the NodeList who called the function)
 */
NodeList.prototype.replaceWith = function(element) {
    this.forEach((n) => { n.replaceWith(element)});
    return this;
};

/**
 *
 *
 * @param element {Element} - the element to prepend
 * @return {NodeList} - return this (the NodeList who called the function)
 */
NodeList.prototype.prepend = function(element) {
    this.forEach((n) => { n.prepend(element)});
    return this;
};

/**
 * Override the existing NodeList's elements HTML with the given element
 *
 * @param element {Element} - a DOM element to set over the existing elements HTML
 * @return {NodeList} - this
 */
NodeList.prototype.html = function(element) {
    this.forEach((n) => { n.html(element)});
    return this;
};

/**
 * Get or set NodeList text
 * Override the existing NodeList's elements text with the given text or return text of the first node in the list
 *
 * @param text {String} - the new text to override with
 * @return {NodeList|String|*} - this or the text of the first element
 */
NodeList.prototype.text = function(text) {
    if (typeof text === 'undefined' && this.length > 0) { return this[0].text() }

    this.forEach((n) => { n.text(text)});
    return this;
};

/**
 * Get or set NodeList elements value attribute
 * Override the existing NodeList's elements value attribute with the given text or
 * return value of the first node in the list
 *
 * @param v {*} - any value that can be converted to string
 * @return {NodeList|String|Element|string|*} - this or the value attribute of the first element
 */
NodeList.prototype.val = function(v) {
    if (typeof v === 'undefined' && this.length > 0) { return this[0].val() }

    this.forEach((n) => { n.val(v)});
    return this;
};

/**
 * Set the attribute for all elements in the NodeList
 *
 * @param k {String} - the attribute key
 * @param v {*} - the attribute's value (any value that can be converted to string)
 * @return {NodeList} - this
 */
NodeList.prototype.attr = function(k,v) {
    this.forEach((n) => { n.attr(k,v)});
    return this;
};

/**
 * Set event listener to all elements in the NodeList
 *
 * @param action {String} - event name
 * @param callback {function} - event handler (callback function)
 * @return {NodeList} - this
 */
NodeList.prototype.on = function(action, callback) {
    this.forEach((n) => { n.on(action, callback)});
    return this;
};

/**
 * Trigger a new custom event for all elements in the NodeList
 *
 * @param action {String}, event name
 * @param detail {Object},(optional) - the event details - default is an empty object,
 *                                     best practice will be to pass the details as properties
 *
 * @param event_init {EventInit} (optional) - a dictionary with the following fields: bubbles,
 *                                            cancelable, composed
 * @return {NodeList} - this
 */
NodeList.prototype.dispatch = function(action, detail, event_init) {
    this.forEach((n) => { n.dispatch(action, detail, event_init) });
    return this;
};

/**
 * Unbind the event handler from all elements in the NodeList
 *
 * @param action {String} - the name for the event that we want to unbind
 * @param callback {Function} (optional) - the event handler - the callback function to unbind
 * @return {NodeList} - this
 */
NodeList.prototype.unbind = function(action, callback) {
    this.forEach((n) => { n.unbind(action, callback) });
    return this;
};

/**
 * Query from all NodeList's elements and return merged results
 *
 * @param t {String} - query string
 * @return {NodeListOf<ChildNode>} - all queried results
 */
NodeList.prototype.querySelectorAll = function(t) {
    let fragment = document.createDocumentFragment();

    this.forEach((n) => {
        let nodeList = n.querySelectorAll(t);
        nodeList.forEach(($el) => { fragment.appendChild($el) })
    });

    return fragment.childNodes;
};

/**
 * Set css attributes for all elements in the NodeList from a dictionary object of form
 * { css_property_name: css_property_value }
 *
 * @param stylesHash {Object} - a dictionary object as described above
 * @return {NodeList} - this
 */
NodeList.prototype.css = function(stylesHash) {
    this.forEach((n) => { n.css(stylesHash)});
    return this;
};

/**
 * Query for existing element ot create it
 *
 * @param t {String|ElementCreationOptions|Element} - the element we wish to create or a css selector string or a DOM
 *                                                    element
 * @param $el {Element} - DOM element to query from
 * @return {any|HTMLElement} - returns a new element we wanted to create,
 *                             the element we queried for oR an empty NodeList
 * @constructor
 */
const El = function(t, $el) {
    let q = Query(t, $el);
    if (typeof q !== 'undefined') { return q; }

    return document.createElement(t);
};

/**
 *
 * @param t {String|ElementCreationOptions|Element} - the element we wish to create or a css selector string or a DOM
 *                                                    element
 *
 * @param $el {Element|undefined=} - DOM element to query from
 * @return {any} - returns the element we queried for oR an empty NodeList
 * @constructor
 */
const Query = function(t, $el) {
    let q;

    if (typeof t === 'object' || typeof $el !== 'undefined') {
        $el = $el || Body();
        t = (typeof t === 'object') ? "."+Array.from(t.classList).join(".") : t;

        q = $el.querySelectorAll(t);
    } else if (t.startsWith('#') || t.startsWith('.')) {
        q = Body().querySelectorAll(t);
    }

    if (typeof q !== 'undefined' && q.length === 1) { q = q[0] }

    return q
};

/**
 *
 * @return {Element} - return a new div element
 * @constructor
 */
const Div = function() { return El('div') };

/**
 *
 * @return {Element} - return a new textarea element
 * @constructor
 */
const TextArea = function() { return El('textarea') };

/**
 *
 * @return {Element} - return a new input element
 * @constructor
 */
const Input = function() { return El('input') };

/**
 *
 * @return {Element} - return a new span element
 * @constructor
 */
const Span = function() { return El('span') };

/**
 *
 * @return {Element} - return a new img element
 * @constructor
 */
const Img = function() { return El('img') };

/**
 *
 * @return {Element} - return the body
 * @constructor
 */
const Body = function() { return document.querySelector('body') };