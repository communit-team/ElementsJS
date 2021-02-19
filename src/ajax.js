/**
 * Parse an object to params string - won't parse complex object
 *
 * @param args {Object} - an object to parse - example - {
 *     key_1: simple_value {String|Number},
 *     key_2: [value1, value2, etc...] - an array of simple values,
 *     key_3: {
 *         sub_key_1: simple_value,
 *         etc
 *     },
 *     etc
 * }
 * @return {string} - URI-encoded params string
 * @constructor
 */
const ToParamString = function (args) {
    let new_args = [];

    // preprocess
    Object.keys(args).forEach(function(k) {
        let v = args[k];

        if (typeof v !== 'undefined' && v !== null) {
            if (v.constructor === Object) {
                Object.keys(v).forEach(function (sub_k) {
                    let sub_v = v[sub_k];
                    let sub_k_str = k + '[' + sub_k + ']';
                    new_args.push([sub_k_str, sub_v])
                });
            } else if (v.constructor === Array) {
                v.forEach(function (sub_v) {
                    let sub_k_str = k + '[]';
                    new_args.push([sub_k_str, sub_v])
                })
            } else {
                new_args.push([k, v])
            }
        }
    });

    return new_args.map( (arr) => { return encodeURIComponent(arr[0]) + '=' + encodeURIComponent(arr[1]) }).join("&");
};

/**
 * A jQuery-like ajax function for asynchronous HTTP requests
 *
 * @param settings {Object} - a dictionary object with jQuery-like ajax key/value properties -
 * {
 *     type: {String} - the request type (default: GET),
 *     content_type: {String} - the request content_type (default: application/x-www-form-urlencoded),
 *                              passing content_type false is used for multipart/form-data forms that pass files
 *     url: {String} - the request url
 *
 * }
 *
 * @constructor
 */
const Ajax = function (settings) {
    let xhr = new XMLHttpRequest();

    let request_type = (settings.type || 'GET').toUpperCase(); // get is default for ajax
    let content_type = (typeof settings.content_type === 'undefined') ? "application/x-www-form-urlencoded" : settings.content_type;

    let url = settings.url;

    let body = null;

    if (typeof settings.data !== 'undefined') {
        if (request_type === 'GET') {
            url += `?${ ToParamString(settings.data)}`;
        } else {
            if (settings.data instanceof FormData) {
                body = settings.data;
            } else if (settings.content_type === 'application/json') {
                body = JSON.stringify(settings.data);
            } else {
                body = ToParamString(settings.data);
            }
        }
    }

    xhr.open(request_type, url, true);
    if (content_type.toString() !== 'false') { xhr.setRequestHeader("Content-Type", content_type); }

    xhr.onreadystatechange = function() {
        // Process the server response here.
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // request completed successfully
                if (typeof settings.success === 'function') {

                    // todo - support different response type, optional ways: xhr.responseType, xhr.getResponseHeader('content-type')
                    if (xhr.getResponseHeader('content-type').indexOf('application/json') > -1) {
                        let jsonResponse = JSON.parse(xhr.responseText);
                        settings.success(jsonResponse, xhr);
                    } else {
                        settings.success(xhr.responseText, xhr);
                    }
                }
            } else {
                // there was an error with the request
                if (typeof settings.error === 'function') { settings.error(xhr.statusText); }
            }
        } else {
            // request not ready yet
        }
    };

    xhr.send(body);
};