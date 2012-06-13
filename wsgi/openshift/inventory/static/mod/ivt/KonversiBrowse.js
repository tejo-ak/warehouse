/**
 * Created by PyCharm.
 * User: jote
 * Date: 5/11/12
 * Time: 9:25 PM
 * To change this template use File | Settings | File Templates.
 */
define(['dojo',
    'dojo/parser',
    'dijit/registry',
    'lib/TabUtil',
    'lib/AccordUtil',
    'lib/dojote',
    'dojox/form/Manager',
    'dijit/form/TextBox',
    'dijit/form/Textarea',
    'lib/CustomDatebox',
    'lib/CustomButton',
    'lib/LookupParam',
    'mod/ivt/KonversiMgt'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            dojo.subscribe('onMenuBrowseKonversi', dojo.hitch(this, 'prepareFormBrowseKonversi'));
        },

        //========================================
        //Sub rutin browse Konversi
        //========================================
        //
        prepareFormBrowseKonversi:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formBrowseKonversi)) {
                this.formBrowseKonversi = tabUtil.putinFirstTab('Lookup Konversi', 'loading form browse konversi,...');
                this.formBrowseKonversi.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performBrowse(false, this.formBrowseKonversi.lookupParam);
                }));
                dojote.callXhrPost('/inventory/konversi/', {c:'formbrowsekonversi'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formBrowseKonversi)) {
                        this.formBrowseKonversi.set('content', res);
                        this.prepareGridHasilBrowse()
                        this.performBrowse(false, {par_status:arg.status})
                        this.formBrowseKonversi.status = arg.status
                        this.manageCrudButton();
                        this.formBrowseKonversi.openArg = arg;
                    }
                }))
                this.formBrowseKonversi.openArg = arg;
            } else {
                if (this.formBrowseKonversi.status != arg.status) {
                    //status berubah, perlu query ulang
                    this.performBrowse(false, {par_status:arg.status});
                    this.formBrowseKonversi.lookupParam = {par_status:arg.status};
                    this.formBrowseKonversi.status = arg.status
                }
                dojote.clearSideMainPane();
                this.formBrowseKonversi.openArg = arg;
                tabUtil.closeAfterTab(this.formBrowseKonversi);
                this.manageCrudButton();
                this.selectGrid();
            }
        },
        selectGrid:function () {
            if (dojote.cekWidget(this.gdHasilBrowse)) {
                this.onGdHasilBrowseRowClick({grid:this.gdHasilBrowse});
            }
        },
        onGdHasilBrowseRowClick:function (e) {
            var items = e.grid.selection.getSelected();
            if (items.length && items[0] && items[0].id) {
                if ('sider' == this.formBrowseKonversi.openArg.sider) {
                }
                //this.prepareKonversiSider(items[0].id)
                else if ('saldo' == this.formBrowseKonversi.openArg.sider) {
                }
                //this.prepareSaldoKonversiSider(items[0].id)
            }
        },
        onGdHasilBrowseRowDblClick:function (e) {
            var items = e.grid.selection.getSelected();
            var mode = (1 == items[0].status) ? "edit" : (2 == items[0].status) ? "view" : "";
            if (items.length && items[0].id) {
                if ('edit-view'.indexOf(mode) != -1)
                    dojo.publish('onMenuKonversi', [
                        {layer:true, id:items[0].id, mode:mode}
                    ])

            }
        },
        prepareGridHasilBrowse:function () {
            if (!dojote.cekWidget(this.gdHasilBrowse)) {
                var konversiLayout = [
                    {field:'nomor', name:'Nomor Konversi', width:'80%', formatter:dojo.hitch(this, function (val, idx) {
                        var brs = this.gdHasilBrowse.getItem(idx);
                        return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                            val + '</div><div>' +
                            ((brs.tanggal) ? dojote.toDate(brs.tanggal) : '-') + '</div>';
                    })} ,
                    {field:'status', name:'Status', width:'20%', formatter:dojo.hitch(function (val, idx) {
                        return (1 == val) ? 'Draft' : (2 == val) ? 'Finished' : '';
                    }) }

                ];
                this.gdHasilBrowse = new dojox.grid.DataGrid({
                    store:null, id:'gdHasilBrowse',
                    structure:konversiLayout
                }, dojo.query('.dicBrowse')[0]);

                this.gdHasilBrowse.startup();
                if (!this.formBrowseKonversi.gdResultClick)
                    this.formBrowseKonversi.gdResultClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowClick', dojo.hitch(this, this.onGdHasilBrowseRowClick));
                if (!this.formBrowseKonversi.gdResultDblClick)
                    this.formBrowseKonversi.gdResultDblClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowDblClick', dojo.hitch(this, this.onGdHasilBrowseRowDblClick));

            }
        },
        performBrowse:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'browsekonversi', init:true, n:30} :
                dojo.mixin(param, {c:'browsekonversi', n:30});
            dojote.callXhrJsonPost('/inventory/konversi/',
                param,
                dojo.hitch(this, this.renderHasilBrowse))
        },
        renderHasilBrowse:function (data) {
            var psOs = new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:data.data})});
            if (dojote.cekWidget(this.gdHasilBrowse)) {
                var menuStore = new dojo.store.Memory({data:data.data});
                this.gdHasilBrowse.setStore(new dojo.data.ObjectStore({objectStore:menuStore}));
            }
        },
        formatListKonversi:function (val, idx) {
            var brs = this.gdHasilBrowse.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.alamat + '</div>';
        },

        prepareKonversiSider:function (id) {
            if (!dojote.cekWidget(this.konversiSider)) {
                this.konversiSider = dojote.preparePortlet('Konversi', 2, 'Loading Informasi  Konversi ...');
            }
            dojote.callXhrJsonPost('/inventory/konversi/', {c:'konversisider', id:id}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.konversiSider)) {
                    this.konversiSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newKonversi');
            //check if the event already connected, don;t connect it twice
            if (btnnew && !this.formBrowseKonversi.btnNewClick) {
                this.formBrowseKonversi.btnNewClick = dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarKonversi', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupKonversi');
            if (btnlookup && !this.btnLookupClick) {
                this.formBrowseKonversi.btnLookupClick = dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    var prm = accordUtil.openLookup([
                        {field:'par_nomor', name:'Nomor', type:'teks'},
                        {field:'par_tanggal', name:'Tanggal', type:'tanggalRange'},
                        {field:'par_status', name:'status', type:'hidden'}
                    ], dojo.hitch(this, function (params) {
                        this.performBrowse(false, params);
                        this.formBrowseKonversi.lookupParam = params;
                    }));
                    prm.setValue(dojo.mixin(this.formBrowseKonversi.lookupParam, {par_status:this.formBrowseKonversi.status}))
                }))
            }
            var btnrefresh = dojo.byId('lookupKonversi');
            if (btnrefresh && !this.formBrowseKonversi.btnrefreshClick) {
                this.formBrowseKonversi.btnrefreshClick = dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performBrowse(false, this.formBrowseKonversi.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showKonversi');
            if (btnshow && !this.formBrowseKonversi.btnShowClick) {
                this.formBrowseKonversi.btnShowClick = dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarKonversi', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu konversi dari daftar konversi yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editKonversi');
            if (btnedit && !this.formBrowseKonversi.btnEditClick) {
                this.formBrowseKonversi.btnEditClick = dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarKonversi', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu konversi dari daftar konversi yang tersedia', 'fatal')
                    }
                }))
            }
            var display = (this.formBrowseKonversi.openArg.nocrud) ? "none" : "inline-block";
            dojo.style(btnedit, 'display', display);
            dojo.style(btnnew, 'display', display);
            //dojo.style(btndel,'display',display);
        }
    }
    singleton.init();
    return singleton;
})