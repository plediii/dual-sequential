/*jslint node: true */
"use strict";

var isoid = require('crypto').randomBytes(20).toString('hex');

module.exports = function (param, isolated) {

    var queue = {};

    var enqueue = function (id, f) {
        if (queue.hasOwnProperty(id)) {
            queue[id].push(f);
        }
        else {
            queue[id] = [];
            f();
        }
    };

    var next = function (id) {
        if (queue[id].length > 0) {
            var q = queue[id];
            var f = q[0];
            queue[id] = q.slice(1);
            f();
        }
        else {
            delete queue[id];
        }
    };
    
    var mount = {
        '::isoroute': function (ctxt) {
            var isoroute = ctxt.params.isoroute;
            if (isoroute[0] !== isoid) {
                var qid = ctxt.params[param];
                if (!qid) {
                    throw 'Invalid isolated host: ' + qid + ' ' + JSON.stringify(ctxt.params);
                }
                enqueue(qid, function () {
                    ctxt.domain.get(ctxt.to.slice(0, ctxt.to.length - (isoroute.length)).concat(isoid).concat(isoroute)).then(function (getctxt) {
                        next(qid);
                        getctxt.forward(ctxt.from);
                    });
                });
            }
        }
    };
    mount[isoid] = isolated;
    return mount;
};
