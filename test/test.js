/*jslint node: true */
"use strict";

var isolated = require('../index');
var dual = require('dualapi');
var assert = require('assert');

describe('dual isolated', function () {

    it('should allow messages to isolated hosts', function (done) {
        var domain = dual();
        domain.mount({
            iso: {
                ':id': isolated('id', {
                    wonder: function () {
                        done();
                    }
                })
            }
        });
        domain.send(['iso', 'small', 'wonder']);
    });

    it('should allow messages from isolated hosts on the message domain', function (done) {
        var domain = dual();
        domain.mount({
            iso: {
                ':id': isolated('id', {
                    wonder: function (ctxt) {
                        ctxt.domain.send(['lawson']);
                    }
                })
            }
            , lawson: function () {
                done();
            }
        });
        domain.send(['iso', 'small', 'wonder']);
    });

    it('should send messages in parallel to isolated hosts with different ids', function (done) {
        var domain = dual();
        var count = 0;
        domain.mount({
            iso: {
                ':id': isolated('id', {
                    wonder: function (ctxt, next) {
                        count++;
                        if (count > 1) {
                            done();
                        }
                    }
                })
            }
            , lawson: function () {
                done();
            }
        });
        domain.send(['iso', 'small', 'wonder']);
        domain.send(['iso', 'small', 'vicki']);
    });

    it('should send messages in sequence to isolated hosts with the same ids', function (done) {
        var domain = dual();
        var count = 0;
        domain.mount({
            iso: {
                ':id': isolated('id', {
                    wonder: function (ctxt, next) {
                        count++;
                        if (ctxt.params.id === 'vicki' && count > 2) {
                            assert.equal(3, count);
                            return done();
                        }
                        if (ctxt.params.id === 'vicki') {
                            return next();
                        }
                    }
                })
            }
            , lawson: function () {
                done();
            }
        });
        domain.send(['iso', 'small', 'wonder']);
        domain.send(['iso', 'small', 'vicki']);
        domain.send(['iso', 'small', 'wonder']);
        domain.send(['iso', 'small', 'vicki']);
    });

    it('should send messages in sequence to different isolated hosts with the same ids', function (done) {
        var domain = dual();
        var count = 0;
        domain.mount({
            iso: {
                ':id': isolated('id', {
                    wonder: function (ctxt, next) {
                        count++;
                        if (ctxt.params.id === 'vicki' && count > 2) {
                            assert.equal(3, count);
                            return done();
                        }
                        if (ctxt.params.id === 'vicki') {
                            return next();
                        }
                    }
                    , robot: function (ctxt, next) {
                        count++;
                    }
                })
            }
            , lawson: function () {
                done();
            }
        });
        domain.send(['iso', 'small', 'wonder']);
        domain.send(['iso', 'small', 'vicki']);
        domain.send(['iso', 'small', 'robot']);
        domain.send(['iso', 'small', 'vicki']);
    });


});
