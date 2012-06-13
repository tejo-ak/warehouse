define(['dojo',
    'dojo/parser',
    'dijit/registry',
    'dojo/number'
], function (dojo, parser, dijit, nomor) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            this.mainPane = dojo.byId('gridContainer');
            this.sidePane = dojo.byId('gridSider');
            this.portainer = dijit.byId('gridContainer');
            this.sidePortainer = dijit.byId('gridSider');
//        this.portainer.disableDnd();
            this.sidePortainer.disableDnd();
//        this.clearMainPane();

        },
        to2Dec:function (dec) {
            return nomor.format(dec, {pattern:'#,###.##'});
        },
        to4Dec:function (dec) {
            return nomor.format(dec, {pattern:'#,###.####'});
        },
        toDate:function (date) {
            return dojo.date.locale.format(new Date(date), {selector:"date", datePattern:'dd-MMM-yyyy' });
        },
        clearMainPane:function () {
            dijit.byId('gridContainer').getChildren().forEach(function (w) {
                this.killWidget(w);
            })
            var ld;
            if (ld = dojo.byId('loadingInit')) {
                dojo.style(ld, {'display':'none'})
            }
        },
        notify:function (message, level) {
            dijit.byId('toaster').setContent(message, level);
            dijit.byId('toaster').show();
        },
        clearSideMainPane:function () {
            dijit.byId('gridSider').getChildren().forEach(dojo.hitch(this, function (w) {
                this.killWidget(w);
            }))
            var ld;
            if (ld = dojo.byId('loadingInit')) {
                dojo.style(ld, {'display':'none'})
            }
        },
        thitch:function (konteks, fn, args) {
            return dojo.hitch(konteks, function (args) {
                var f = dojo.hitch(this, fn, args);
                setTimeout(f, 50);
            })

            //timeouthitch,..
        },
        killWidget:function (wgt) {
            if (!wgt)return;
            this.killWidgetDescendant(wgt)
            wgt.destroy();
        },
        cekWidget:function (widget) {
            if (widget && widget.id && dijit.byId(widget.id)) {
                return true;
            } else {
                return false;
            }
        },
        lpad:function (originalstr, length, strToPad) {
            while (originalstr.length < length)
                originalstr = strToPad + originalstr;
            return originalstr;
        },

        rpad:function (originalstr, length, strToPad) {
            while (originalstr.length < length)
                originalstr = originalstr + strToPad;
            return originalstr;
        },
        byName:function (name, scope) {
            if (scope) {
                var nodes = dojo.query('[name="' + name + '"]', scope);
            } else {
                var nodes = dojo.query('[name="' + name + '"]');
            }
            if (nodes.length) {
                return nodes[0];
            }
            return null;
        },
        dijitByName:function (name, scope) {
            var node = this.byName(name, scope);
            if (node) {
                return dijit.getEnclosingWidget(node);
            }
            return null;
        },
        killWidgetDescendant:function (wgt) {
            if (wgt) {
                var wgs = dijit.findWidgets(wgt.domNode);
                dojo.forEach(wgs, function (w) {
                    w.destroyRecursive();
                })
            }
        },
        preparePortlet:function (title, column, content, id) {
            content = (content) ? content : 'loading...';

            id = (id) ? id : '';
            if ('' == id) {
                var defaultPortlet = dijit.byId('defaultSider');
                if (this.cekWidget(defaultPortlet)) {
                    defaultPortlet.destroy();
                }
            }
            var pt = new dojox.widget.Portlet({
                //column:column,
                id:id,
                closable:true,
                onClose:function () {
                    this.killWidgetDescendant(this);
                    this.destroy();
                },
                dndType:'Portlet',
                title:title,
                content:content
            });
            if (1 == column) {
                this.portainer.addChild(pt, (column - 1));
            } else {
                this.sidePortainer.addChild(pt, (column - 2));
            }
            return pt;
        },
        callXhrGet:function (url, content, load, errorFlag) {
            dojo.xhrGet({url:url, content:content, load:load, error:function (e) {
                    errorFlag = (errorFlag) ? errorFlag : 'Error';
                    alert(errorFlag + '\n' + e.message);
                }
                }
            )
        },
        callXhrPost:function (url, content, load, errorFlag) {
            dojo.xhrPost({url:url, content:content, load:load, error:function (e) {
                    errorFlag = (errorFlag) ? errorFlag : 'Error';
                    alert(errorFlag + '\n' + e.message + e);
                }
                }
            )
        },
        seekExceptionMessage:function (txt) {
            this.txt = txt;
            if (txt) {
                var idex, idstart, idstop;
                if ((idex = txt.indexOf('Exception Value')) != -1) {
                    idstart = txt.indexOf('<td><pre>', idex) + 9;
                    idstop = txt.indexOf('</pre></td>', idstart);
                    this.txt = txt.substr(idstart, (idstop - idstart));
                    return txt.substr(idstart, (idstop - idstart));
                }
                return txt;
            }
            return 'Internal Server Error';
        },
        /*
         Membuat pasangan object dengan nilai "" dari array id yang diberikan sebagai parameter.
         */
        createEmtyTuple:function (ids) {
            var tuple = {}
            if (ids && ids.length) {
                for (var i = 0; i < ids.length; i++) {
                    tuple[ids[i]] = "";
                }
            }
            return tuple
        },
        callXhrJsonPost:function (url, content, load, errorFlag) {
            dojo.xhrPost({url:url, content:content, load:load, handleAs:'json', error:function (e, obj) {
                    errorFlag = (errorFlag) ? errorFlag : 'Error';
                    var pesan = (obj && obj.xhr && obj.xhr.response) ? obj.xhr.response : e;
                    pesan = this.seekExceptionMessage(pesan);
                    alert(errorFlag + '\n00000' + pesan);
                }
                }
            )
        },
        getUuid:function () {
            var s = [], itoh = '0123456789ABCDEF';
            // Make array of random hex digits. The UUID only has 32 digits in it, but we
            // allocate an extra items to make room for the '-'s we'll be inserting.
            for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10);
            // Conform to RFC-4122, section 4.4
            s[14] = 4;  // Set 4 high bits of time_high field to version
            s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
            // Convert to hex chars
            for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];
            // Insert '-'s
            s[8] = s[13] = s[18] = s[23] = '-';
            return s.join('');
        },
        jorder:function (json, filter) {
            var newJson = {};
            if (filter && filter.length) {
                for (var i = 0; i < filter.length; i++) {
                    flt = filter[i];
                    if (flt.indexOf('+') != -1) {
                        fls = flt.split('+');
                        var kunciKomposit = '';
                        var nilaiKomposit = '';
                        for (j = 0; j < fls.length; j++) {
                            var idxAt = fls[j].indexOf('@');
                            var kunci = fls[j];
                            var kunciBener = ''
                            if (idxAt != -1) {
                                kunciBener = kunci.substr(0, idxAt);
                                var tipe = kunci.substr(idxAt + 1, kunci.length);
                                if ('decimal' == tipe)
                                    nilaiKomposit += this.to2Dec(json[kunciBener]) + ' ,';
                                else if ('date' == tipe)
                                    nilaiKomposit += this.toDate(json[kunciBener]) + ' ,';
                            } else {
                                kunciBener = kunci;
                                nilaiKomposit += json[kunciBener] + ' ,';
                            }
                            kunciKomposit += kunciBener + ' ,';

                        }
                        newJson[kunciKomposit.substr(0, kunciKomposit.length - 1)] = nilaiKomposit.substr(0, nilaiKomposit.length - 1)
                    } else {
                        var idxAt = flt.indexOf('@');
                        var kunci = flt;
                        var kunciBener = ''
                        var kunciKomposit = '';
                        var nilaiKomposit = '';
                        if (idxAt != -1) {
                            kunciBener = kunci.substr(0, idxAt);
                            var tipe = kunci.substr(idxAt + 1, kunci.length);
                            if ('decimal' == tipe)
                                nilaiKomposit += this.to2Dec(json[kunciBener])
                            else if ('date' == tipe)
                                nilaiKomposit += this.toDate(json[kunciBener])
                        } else {
                            kunciBener = kunci;
                            nilaiKomposit += json[kunciBener]
                        }
                        kunciKomposit += kunciBener
                        newJson[kunciKomposit] = nilaiKomposit;
                    }
                }
            }
            return newJson;
        },
        jPrefix:function (json, prefix, filter, exclude, replace) {
            var jresult = {};
            var jproc = {};

            for (var k in json) {
                var filterfound = true;
                var foundtoExlude = false;
                if (filter && filter.length) {
                    for (var i = 0; i < filter.length; i++) {
                        filterfound = false;
                        if (k == filter[i]) {
                            filterfound = true;
                            break;
                        }
                    }

                }
                if (exclude && exclude.length) {
                    for (var i = 0; i < exclude.length; i++) {
                        if (k == exclude[i]) {
                            //not adding to the jresult
                            foundtoExlude = true
                            break;
                        }
                    }
                }
                if (foundtoExlude)  continue;
                if (!filterfound)  continue;
                if (prefix) {
                    jresult[prefix + k] = json[k];
                } else {
                    jresult[k] = json[k];
                }
            }
            return jresult;
        },
        ensureGridFirstRow:function (grid) {
            if (grid == null) {
                return;
            }

            if (grid.selection && grid.selection.selectedIndex == -1) {
                this.navigateGrid(grid, '40');
            }

        },
        onOk:function (control, target, handler) {
            if (!control) {
                return;
            }
            dojo.connect(control, "onKeyPress", function (evt) {
                if ("13" == evt.keyCode) {
                    if (handler) {
                        handler();
                    }
                    if (target && target.focus) {
                        target.focus();
                    } else {
                        evt.keyCode = 9;
                    }
                }
            })
        },
        lookupText:function (txtctl, eventName) {
            if (txtctl && txtctl.id) {
                dojo.connect(txtctl, 'onChange', dojo.hitch(this, function (value) {
                    if (txtctl.focused) {
                        dojo.publish(eventName, {mode:'change', value:value})
                    }
                }));
                dojo.connect(txtctl, 'onKeyPress', dojo.hitch(this, function (value) {
                    dojo.publish(eventName, {mode:'keypress', value:value});
                }));
            }
        },
        navigateGrid:function (grid, keycode) {
            if ('38-40'.indexOf(keycode) == -1) {
                return;
            }
            if (grid && grid.selection) {
                this.maxGrid = grid.rowCount;
                this.current = grid.selection.selectedIndex

                if (this.current != -1) {
                    //some item selected
                    this.next = (this.maxGrid - 1 > this.current) ? this.current + 1 : this.current;
                    this.prev = (this.current == 0) ? this.current : this.current - 1;

                } else {
                    this.next = 0
                    this.changed = true;
                }
                if ('40' == keycode) {
                    //down arrow
                    this.changed = (this.next != this.current);
                    if (this.changed) {
                        grid.selection.setSelected(this.next, true);
                    }
                } else if ('38' == keycode) {
                    //upp arrow
                    this.changed = (this.prev != this.current);
                    if (this.changed) {
                        grid.selection.setSelected(this.prev, true);
                    }
                }
                if (this.changed) {
                    grid.selection.setSelected(this.current, false);
                }
            }
        }
    };
    singleton.init();
    return singleton
})