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
    'mod/ivt/PengeluaranPabeanMgt'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            dojo.subscribe('onMenuBrowseDokumenPabean', dojo.hitch(this, 'prepareFormBrowseDokumenPabean'));
        },

        //========================================
        //Sub rutin browse DokumenPabean
        //========================================
        //
        prepareFormBrowseDokumenPabean:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formBrowseDokumenPabean)) {
                this.formBrowseDokumenPabean = tabUtil.putinFirstTab('Lookup DokumenPabean', 'loading form browse dokumenpabean,...');
                this.formBrowseDokumenPabean.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performBrowse(false, this.formBrowseDokumenPabean.lookupParam);
                }));
                dojote.callXhrPost('/inventory/pabean/', {c:'formbrowsedokumenpabean'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formBrowseDokumenPabean)) {
                        this.formBrowseDokumenPabean.set('content', res);
                        this.prepareGridHasilBrowse()
                        this.performBrowse(false, {par_status:arg.status})
                        this.formBrowseDokumenPabean.status = arg.status
                        this.manageCrudButton();
                        this.formBrowseDokumenPabean.openArg = arg;
                    }
                }))
                this.formBrowseDokumenPabean.openArg = arg;
            } else {
                if (this.formBrowseDokumenPabean.status != arg.status) {
                    //status berubah, perlu query ulang
                    this.performBrowse(false, {par_status:arg.status});
                    this.formBrowseDokumenPabean.lookupParam = {par_status:arg.status};
                    this.formBrowseDokumenPabean.status = arg.status
                }
                dojote.clearSideMainPane();
                this.formBrowseDokumenPabean.openArg = arg;
                tabUtil.closeAfterTab(this.formBrowseDokumenPabean);
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
                if ('sider' == this.formBrowseDokumenPabean.openArg.sider) {
                }
                //this.prepareDokumenPabeanSider(items[0].id)
                else if ('saldo' == this.formBrowseDokumenPabean.openArg.sider) {
                }
                //this.prepareSaldoDokumenPabeanSider(items[0].id)
            }
        },
        onGdHasilBrowseRowDblClick:function (e) {
            var items = e.grid.selection.getSelected();
            var mode = (1 == items[0].status) ? "edit" : (2 == items[0].status) ? "view" : "";
            if (items.length && items[0].id) {
                if ('edit-view'.indexOf(mode) != -1)
                    dojo.publish('onMenuPengeluaranPabean', [
                        {layer:true, id:items[0].id, mode:mode, jenisDokumen:items[0].jenisDokumen_id}
                    ])

            }
        },
        prepareGridHasilBrowse:function () {
            if (!dojote.cekWidget(this.gdHasilBrowse)) {
                var dokumenpabeanLayout = [
                    {field:'nomor', name:'Nomor Dokumen', width:'35%', formatter:dojo.hitch(this, function (val, idx) {
                        var brs = this.gdHasilBrowse.getItem(idx);
                        return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                            val + '</div><div>' +
                            ((brs.tanggal) ? dojote.toDate(brs.tanggal) : '-') + '</div>';
                    })} ,
                    {field:'nomorDokumen', name:'Nomor Dokumen Pabean', width:'35%', formatter:dojo.hitch(this, function (val, idx) {
                        var brs = this.gdHasilBrowse.getItem(idx);
                        return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                            val + '</div><div>' +
                            ((brs.tanggalDokumen) ? dojote.toDate(brs.tanggalDokumen) : '-') + '</div>';
                    })} ,
                    {field:'jenisDokumen_id', name:'Dokumen Pabean', width:'20%', formatter:dojo.hitch(this, function (val, idx) {
                        var brs = this.gdHasilBrowse.getItem(idx);
                        return '<div style="font:12px verdana;">' +
                            brs.doc_nama + '</div>';
                    })} ,
                    {field:'status', name:'Status', width:'10%', formatter:dojo.hitch(function (val, idx) {
                        return (1 == val) ? 'Draft' : (2 == val) ? 'Finished' : '';
                    }) }

                ];
                this.gdHasilBrowse = new dojox.grid.DataGrid({
                    store:null, id:'gdHasilBrowse',
                    structure:dokumenpabeanLayout
                }, dojo.query('.dicBrowse')[0]);

                this.gdHasilBrowse.startup();
                if (!this.formBrowseDokumenPabean.gdResultClick)
                    this.formBrowseDokumenPabean.gdResultClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowClick', dojo.hitch(this, this.onGdHasilBrowseRowClick));
                if (!this.formBrowseDokumenPabean.gdResultDblClick)
                    this.formBrowseDokumenPabean.gdResultDblClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowDblClick', dojo.hitch(this, this.onGdHasilBrowseRowDblClick));

            }
        },
        performBrowse:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'browsedokumenpabean', init:true, n:30} :
                dojo.mixin(param, {c:'browsedokumenpabean', n:30});
            dojote.callXhrJsonPost('/inventory/pabean/',
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
        formatListDokumenPabean:function (val, idx) {
            var brs = this.gdHasilBrowse.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.alamat + '</div>';
        },

        prepareDokumenPabeanSider:function (id) {
            if (!dojote.cekWidget(this.dokumenpabeanSider)) {
                this.dokumenpabeanSider = dojote.preparePortlet('DokumenPabean', 2, 'Loading Informasi  DokumenPabean ...');
            }
            dojote.callXhrJsonPost('/inventory/pabean/', {c:'dokumenpabeansider', id:id}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.dokumenpabeanSider)) {
                    this.dokumenpabeanSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newDokumenPabean');
            //check if the event already connected, don;t connect it twice
            if (btnnew && !this.formBrowseDokumenPabean.btnNewClick) {
                this.formBrowseDokumenPabean.btnNewClick = dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarDokumenPabean', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupDokumenPabean');
            if (btnlookup && !this.btnLookupClick) {
                this.formBrowseDokumenPabean.btnLookupClick = dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    var prm = accordUtil.openLookup([
                        {field:'par_nomor', name:'Nomor', type:'teks'},
                        {field:'par_tanggal', name:'Tanggal', type:'tanggalRange'},
                        {field:'par_status', name:'status', type:'hidden'}
                    ], dojo.hitch(this, function (params) {
                        this.performBrowse(false, params);
                        this.formBrowseDokumenPabean.lookupParam = params;
                    }));
                    prm.setValue(dojo.mixin(this.formBrowseDokumenPabean.lookupParam, {par_status:this.formBrowseDokumenPabean.status}))
                }))
            }
            var btnrefresh = dojo.byId('lookupDokumenPabean');
            if (btnrefresh && !this.formBrowseDokumenPabean.btnrefreshClick) {
                this.formBrowseDokumenPabean.btnrefreshClick = dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performBrowse(false, this.formBrowseDokumenPabean.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showDokumenPabean');
            if (btnshow && !this.formBrowseDokumenPabean.btnShowClick) {
                this.formBrowseDokumenPabean.btnShowClick = dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarDokumenPabean', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu dokumenpabean dari daftar dokumenpabean yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editDokumenPabean');
            if (btnedit && !this.formBrowseDokumenPabean.btnEditClick) {
                this.formBrowseDokumenPabean.btnEditClick = dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarDokumenPabean', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu dokumenpabean dari daftar dokumenpabean yang tersedia', 'fatal')
                    }
                }))
            }
            var display = (this.formBrowseDokumenPabean.openArg.nocrud) ? "none" : "inline-block";
            dojo.style(btnedit, 'display', display);
            dojo.style(btnnew, 'display', display);
            //dojo.style(btndel,'display',display);
        }
    }

    singleton.init();
    return singleton;
})