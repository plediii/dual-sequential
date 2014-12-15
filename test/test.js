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
                    wonder: function (ctxt) {
                        assert.equal('small', ctxt.params.id);
                        ctxt.reply('Its a');
                    }
                })
            }
        });
        domain.get(['iso', 'small', 'wonder']).then(function (ctxt) {
            assert.equal('Its a', ctxt.body);
            done();
        });
    });

    it('should allow messages to second level isolated hosts', function (done) {
        var domain = dual();
        domain.mount({
            root: {
                iso: {
                    ':id': isolated('id', {
                        wonder: function (ctxt) {
                            assert.equal('small', ctxt.params.id);
                            ctxt.reply('Its a');
                        }
                    })
                }
            }
        });
        domain.get(['root', 'iso', 'small', 'wonder']).then(function (ctxt) {
            assert.equal('Its a', ctxt.body);
            done();
        });
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
                    wonder: function (ctxt) {
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
        domain.send(['iso', 'vicki', 'wonder']);
    });

    it('should send messages in sequence to isolated hosts with the same ids', function (done) {
        var domain = dual();
        var count = 0;
        domain.mount({
            iso: {
                ':id': isolated('id', {
                    wonder: function (ctxt) {
                        count++;
                        if (ctxt.params.id === 'vicki' && count > 2) {
                            assert.equal(3, count);
                            return done();
                        }
                        if (ctxt.params.id === 'vicki') {
                            ctxt.reply('lawson');
                        }
                    }
                })
            }
        });
        domain.send(['iso', 'small', 'wonder']);
        domain.send(['iso', 'vicki', 'wonder']);
        domain.send(['iso', 'small', 'wonder']);
        domain.send(['iso', 'vicki', 'wonder']);
    });

    it('should send messages in sequence to different isolated hosts with the same ids', function (done) {
        var domain = dual();
        var count = 0;
        domain.mount({
            iso: {
                ':id': isolated('id', {
                    wonder: function (ctxt) {
                        count++;
                        if (ctxt.params.id === 'vicki' && count > 2) {
                            assert.equal(3, count);
                            return done();
                        }
                        if (ctxt.params.id === 'vicki') {
                            ctxt.reply('GOTIT');
                        }
                    }
                    , robot: function (ctxt) {
                        count++;
                    }
                })
            }
        });
        domain.send(['iso', 'small', 'wonder']);
        domain.send(['iso', 'vicki', 'wonder']);
        domain.send(['iso', 'small', 'robot']);
        domain.send(['iso', 'vicki', 'wonder']);
    });

});
