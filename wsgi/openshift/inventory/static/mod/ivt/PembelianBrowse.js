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
    'mod/ivt/PembelianMgt'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            dojo.subscribe('onMenuBrosePembelian', dojo.hitch(this, 'prepareFormBrowsePembelian'));
        },

        //========================================
        //Sub rutin browse Pembelian
        //========================================
        //
        prepareFormBrowsePembelian:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formBrowsePembelian)) {
                this.formBrowsePembelian = tabUtil.putinFirstTab('Lookup Pembelian', 'loading form browse pembelian,...');
                this.formBrowsePembelian.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performBrowse(false, this.formBrowsePembelian.lookupParam);
                }));
                dojote.callXhrPost('/inventory/pembelian/', {c:'formbrowsepembelian'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formBrowsePembelian)) {
                        this.formBrowsePembelian.set('content', res);
                        this.prepareGridHasilBrowse()
                        this.performBrowse(true)
                        this.manageCrudButton();
                    }
                }))
                this.formBrowsePembelian.openArg = arg;
            } else {
                dojote.clearSideMainPane();
                this.formBrowsePembelian.openArg = arg;
                tabUtil.closeAfterTab(this.formBrowsePembelian);
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
            if (items.length && items[0].id) {
                if ('sider' == this.formBrowsePembelian.openArg.sider)
                    this.preparePembelianSider(items[0].id)
                else if ('saldo' == this.formBrowsePembelian.openArg.sider)
                    this.prepareSaldoPembelianSider(items[0].id)
            }
        },
        onGdHasilBrowseRowDblClick:function (e) {
            var items = e.grid.selection.getSelected();
            if (items.length && items && items[0].id) {

                dojo.publish('onMenuRencanaPembelian', [
                    {
                        mode:(items[0].status == 1) ? 'edit' : 'view', id:items[0].id, layer:true
                    }
                ])

            }
        },
        prepareGridHasilBrowse:function () {
            if (!dojote.cekWidget(this.gdHasilBrowse)) {
                var pembelianLayout = [
                    {field:'nama', name:'Nama', width:'60%', formatter:dojo.hitch(this, this.formatListPembelian)},
                    {field:'nomor', name:'Pembelian', width:'30%', formatter:dojo.hitch(this, function (val, idx) {
                        var brs = this.gdHasilBrowse.getItem(idx);
                        return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                            val + '</div><div>' + brs.tanggal + '</div>';
                    })},
                    {field:'status', name:'Status', width:'10%', formatter:dojo.hitch(this, function (val, i) {
                        return (val == 1) ? 'draft' : 'finished'
                    }) }

                ];
                this.gdHasilBrowse = new dojox.grid.DataGrid({
                    store:null, id:'gdHasilBrowse',
                    structure:pembelianLayout
                }, dojo.query('.dicBrowse')[0]);

                this.gdHasilBrowse.startup();
                if (!this.formBrowsePembelian.gdResultClick)
                    this.formBrowsePembelian.gdResultClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowClick', dojo.hitch(this, this.onGdHasilBrowseRowClick));
                if (!this.formBrowsePembelian.gdResultDblClick)
                    this.formBrowsePembelian.gdResultDblClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowDblClick', dojo.hitch(this, this.onGdHasilBrowseRowDblClick));

            }
        },
        performBrowse:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'browsepembelian', init:true, n:30} :
                dojo.mixin(param, {c:'browsepembelian', n:30});
            dojote.callXhrJsonPost('/inventory/pembelian/',
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
        formatListPembelian:function (val, idx) {
            var brs = this.gdHasilBrowse.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.alamat + '</div>';
        },

        preparePembelianSider:function (id) {
            if (!dojote.cekWidget(this.pembelianSider)) {
                this.pembelianSider = dojote.preparePortlet('Pembelian', 2, 'Loading Informasi  Pembelian ...');
            }
            dojote.callXhrJsonPost('/inventory/pembelian/', {c:'pembeliansider', id:id}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.pembelianSider)) {
                    this.pembelianSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newPembelian');
            //check if the event already connected, don;t connect it twice
            if (btnnew && !this.formBrowsePembelian.btnNewClick) {
                this.formBrowsePembelian.btnNewClick = dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarPembelian', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupPembelian');
            if (btnlookup && !this.btnLookupClic) {
                this.formBrowsePembelian.btnLookupClick = dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    accordUtil.openLookup([
                        {field:'par_nama', name:'Nama', type:'teks'},
                        {field:'par_merk', name:'Merk', type:'teks'},
                        {field:'par_kode', name:'Kode', type:'teks'}
                    ], dojo.hitch(this, function (params) {
                        this.performBrowse(false, params);
                        this.formBrowsePembelian.lookupParam = params;
                    }));
                }))
            }
            var btnrefresh = dojo.byId('lookupPembelian');
            if (btnrefresh && !this.formBrowsePembelian.btnrefreshClick) {
                this.formBrowsePembelian.btnrefreshClick = dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performBrowse(false, this.formBrowsePembelian.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showPembelian');
            if (btnshow && !this.formBrowsePembelian.btnShowClick) {
                this.formBrowsePembelian.btnShowClick = dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarPembelian', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu pembelian dari daftar pembelian yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editPembelian');
            if (btnedit && !this.formBrowsePembelian.btnEditClick) {
                this.formBrowsePembelian.btnEditClick = dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarPembelian', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu pembelian dari daftar pembelian yang tersedia', 'fatal')
                    }
                }))
            }
            var display = (this.formBrowsePembelian.openArg.nocrud) ? "none" : "inline-block";
            dojo.style(btnedit, 'display', display);
            dojo.style(btnnew, 'display', display);
            //dojo.style(btndel,'display',display);
        }
    }

    singleton.init();
    return singleton;
})