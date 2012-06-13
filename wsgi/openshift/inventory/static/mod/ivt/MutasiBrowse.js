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
    'mod/ivt/MutasiWipMgt'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            dojo.subscribe('onMenuBrowseMutasi', dojo.hitch(this, 'prepareFormBrowseMutasi'));
        },

        //========================================
        //Sub rutin browse Mutasi
        //========================================
        //
        prepareFormBrowseMutasi:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formBrowseMutasi)) {
                this.formBrowseMutasi = tabUtil.putinFirstTab('Lookup Mutasi', 'loading form browse mutasi,...');
                this.formBrowseMutasi.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performBrowse(false, this.formBrowseMutasi.lookupParam);
                }));
                dojote.callXhrPost('/inventory/mutasi/', {c:'formbrowsemutasi'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formBrowseMutasi)) {
                        this.formBrowseMutasi.set('content', res);
                        this.prepareGridHasilBrowse()
                        this.performBrowse(false, {par_status:arg.status})
                        this.formBrowseMutasi.status = arg.status
                        this.manageCrudButton();
                        this.formBrowseMutasi.openArg = arg;
                    }
                }))
                this.formBrowseMutasi.openArg = arg;
            } else {
                if (this.formBrowseMutasi.status != arg.status) {
                    //status berubah, perlu query ulang
                    this.performBrowse(false, {par_status:arg.status});
                    this.formBrowseMutasi.lookupParam = {par_status:arg.status};
                    this.formBrowseMutasi.status = arg.status
                }
                dojote.clearSideMainPane();
                this.formBrowseMutasi.openArg = arg;
                tabUtil.closeAfterTab(this.formBrowseMutasi);
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
                if ('sider' == this.formBrowseMutasi.openArg.sider) {
                }
                //this.prepareMutasiSider(items[0].id)
                else if ('saldo' == this.formBrowseMutasi.openArg.sider) {
                }
                //this.prepareSaldoMutasiSider(items[0].id)
            }
        },
        onGdHasilBrowseRowDblClick:function (e) {
            var items = e.grid.selection.getSelected();
            var mode = (1 == items[0].status) ? "edit" : (2 == items[0].status) ? "view" : "";
            if (items.length && items[0].id) {
                if ('edit-view'.indexOf(mode) != -1)
                    dojo.publish('onMenuMutasiWIP', [
                        {layer:true, id:items[0].id, mode:mode}
                    ])

            }
        },
        prepareGridHasilBrowse:function () {
            if (!dojote.cekWidget(this.gdHasilBrowse)) {
                var mutasiLayout = [
                    {field:'nomor', name:'Nomor Mutasi', width:'80%', formatter:dojo.hitch(this, function (val, idx) {
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
                    structure:mutasiLayout
                }, dojo.query('.dicBrowse')[0]);

                this.gdHasilBrowse.startup();
                if (!this.formBrowseMutasi.gdResultClick)
                    this.formBrowseMutasi.gdResultClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowClick', dojo.hitch(this, this.onGdHasilBrowseRowClick));
                if (!this.formBrowseMutasi.gdResultDblClick)
                    this.formBrowseMutasi.gdResultDblClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowDblClick', dojo.hitch(this, this.onGdHasilBrowseRowDblClick));

            }
        },
        performBrowse:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'browsemutasi', init:true, n:30} :
                dojo.mixin(param, {c:'browsemutasi', n:30});
            dojote.callXhrJsonPost('/inventory/mutasi/',
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
        formatListMutasi:function (val, idx) {
            var brs = this.gdHasilBrowse.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.alamat + '</div>';
        },

        prepareMutasiSider:function (id) {
            if (!dojote.cekWidget(this.mutasiSider)) {
                this.mutasiSider = dojote.preparePortlet('Mutasi', 2, 'Loading Informasi  Mutasi ...');
            }
            dojote.callXhrJsonPost('/inventory/mutasi/', {c:'mutasisider', id:id}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.mutasiSider)) {
                    this.mutasiSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newMutasi');
            //check if the event already connected, don;t connect it twice
            if (btnnew && !this.formBrowseMutasi.btnNewClick) {
                this.formBrowseMutasi.btnNewClick = dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarMutasi', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupMutasi');
            if (btnlookup && !this.btnLookupClick) {
                this.formBrowseMutasi.btnLookupClick = dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    var prm = accordUtil.openLookup([
                        {field:'par_nomor', name:'Nomor', type:'teks'},
                        {field:'par_tanggal', name:'Tanggal', type:'tanggalRange'},
                        {field:'par_status', name:'status', type:'hidden'}
                    ], dojo.hitch(this, function (params) {
                        this.performBrowse(false, params);
                        this.formBrowseMutasi.lookupParam = params;
                    }));
                    prm.setValue(dojo.mixin(this.formBrowseMutasi.lookupParam, {par_status:this.formBrowseMutasi.status}))
                }))
            }
            var btnrefresh = dojo.byId('lookupMutasi');
            if (btnrefresh && !this.formBrowseMutasi.btnrefreshClick) {
                this.formBrowseMutasi.btnrefreshClick = dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performBrowse(false, this.formBrowseMutasi.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showMutasi');
            if (btnshow && !this.formBrowseMutasi.btnShowClick) {
                this.formBrowseMutasi.btnShowClick = dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarMutasi', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu mutasi dari daftar mutasi yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editMutasi');
            if (btnedit && !this.formBrowseMutasi.btnEditClick) {
                this.formBrowseMutasi.btnEditClick = dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarMutasi', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu mutasi dari daftar mutasi yang tersedia', 'fatal')
                    }
                }))
            }
            var display = (this.formBrowseMutasi.openArg.nocrud) ? "none" : "inline-block";
            dojo.style(btnedit, 'display', display);
            dojo.style(btnnew, 'display', display);
            //dojo.style(btndel,'display',display);
        }
    }
    singleton.init();
    return singleton;
})