/**
 * Created by PyCharm.
 * User: jote
 * Date: 1/11/12
 * Time: 1:32 PM
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
    'lib/CustomDatebox',
    'lib/CustomButton',
    'lib/LookupTextbox',
    'lib/LovLookup',
    'dojo/number',
    'lib/LookupParam'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
            this.konversiFormType = "";
        },
        startup:function () {
            this.searchPasienHandle = dojo.subscribe('onMenuKonversi', dojo.hitch(this, 'prepareFormKonversi'));
        },
        prepareFormKonversi:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            this.formKonversi = tabUtil.putinTab('Konversi Wip', 'Loading form konversi');
            var param = {c:'formkonversi'};

            dojote.callXhrJsonPost('/inventory/konversi/', param, dojo.hitch(this, function (res) {
                if (tabUtil.cekTab(this.formKonversi)) {
                    //
                    //Inisiasi form konversi disini
                    //
                    this.formKonversi.set('content', res.html);
                    var form = dijit.byId('formKonversi')
                    if (res.data) {
                        form.setFormValues(res.data)
                    }
                    this.formKonversi.inventory_id = dojote.dijitByName('inventory_id');
                    this.formKonversi.inventory_id.set('value', 2);

                    var tksbrg = dojote.dijitByName('barang_nama');
                    tksbrg.focus();
                    var ivid = this.formKonversi.inventory_id.get('value');
                    tksbrg.set('lookupParam', {c:'lookupbdi', inventory_id:ivid});
                    dojote.dijitByName('barang_produksi_nama').set('lookupParam', {c:'lookupbdi', inventory_id:ivid});
                    dojote.dijitByName('barang_produksi_sampingan_nama').set('lookupParam', {c:'lookupbdi', inventory_id:ivid});

                    //
                    //inisiasi event
                    //
                    if (!this.formKonversi.onSimpanInputItem)
                        this.formKonversi.onSimpanInputItem = dojo.connect(dojote.dijitByName('btnSimpanInputItem'),
                            'onClick', dojo.hitch(this, this.onSimpanKonversiItem, 'barang_', 'K', ''))
                    if (!this.formKonversi.onSimpanProdukItem)
                        this.formKonversi.onSimpanProdukItem = dojo.connect(dojote.dijitByName('btnSimpanProdukItem'),
                            'onClick', dojo.hitch(this, this.onSimpanKonversiItem, 'barang_produksi_', 'D', 1))
                    if (!this.formKonversi.onSimpanByProdukItem)
                        this.formKonversi.onSimpanByProdukItem = dojo.connect(dojote.dijitByName('btnSimpanByProdukItem'),
                            'onClick', dojo.hitch(this, this.onSimpanKonversiItem, 'barang_produksi_sampingan_', 'D', 2))
                    if (!this.formKonversi.onSimpanKonversiHandler)
                        this.formKonversi.onSimpanKonversiHandler = dojo.connect(dojote.dijitByName('btnSimpanKonversi'),
                            'onClick', dojo.hitch(this, this.onSimpanKonversi))
                    this.prepareGridInputItem();
                    this.prepareGridProdukItem();
                    this.prepareGridByProdukItem();
                    if ('edit-view'.indexOf(arg.mode) != -1) {
                        this.prepareDaftarItemKonversi(arg.id, 'K');
                        this.prepareDaftarItemKonversi(arg.id, 'D', 1);
                        this.prepareDaftarItemKonversi(arg.id, 'D', 2);
                        this.prepareHdrKonversi(arg.id);
                        this.disableButton(('view' == arg.mode))
                    }
                }
            }))
        },
        onDeleteInputItem:function (itemId, kredebit, jenisProduk) {
            var par = {c:'hapusitemkonversi',
                itemId:itemId
            };
            dojote.callXhrJsonPost('/inventory/konversi/', par, dojo.hitch(this, function (res) {
                this.prepareDaftarItemKonversi(res.konversi_id, kredebit, jenisProduk);
            }), 'Error simpan data');
        },
        onSimpanKonversiItem:function (ctlprefix, kredebit, jenisProduk) {
            var par = {c:'simpanitemkonversi',
                kredebit:kredebit,
                inventory_id:dojote.dijitByName('inventory_id').get('value'),
                jenisProduk:jenisProduk,
                barang_qty:dojote.dijitByName(ctlprefix + 'qty').get('value'),
                barang_id:dojote.dijitByName(ctlprefix + 'id').get('value'),
                id:dojote.dijitByName('id').get('value')
            };
            dojote.callXhrJsonPost('/inventory/konversi/', par, dojo.hitch(this, function (res) {
                //assign to no and tanggal konversi, filter tuples with this value
                //dijit.byId('formKonversi').setFormValues(dojote.jPrefix(res, "",
//                ['id', 'no_konversi', 'tgl_konversi']));
                this.prepareHdrKonversi(res.konversi_id)
                dojote.dijitByName(ctlprefix + 'nama').clearValue()
                dojote.dijitByName(ctlprefix + 'nama').focus();
                dojote.dijitByName(ctlprefix + 'qty').set('value', '')
                dojote.dijitByName('id').set('value', res.konversi_id);
                this.prepareDaftarItemKonversi(res.konversi_id, kredebit, jenisProduk);
            }), 'Error simpan data');
        },
        prepareGridInputItem:function () {
            //
            //inisiasi formater detail konversi
            //
            var itemLayout = [
                {field:'nama', name:'Barang', width:'70%%', formatter:dojo.hitch(this, function (v, i) {
                    var dv = '<div style="font: 11px verdana;font-weight: bold;text-decoration: underline">' + v + '</div> ';
                    var dv = dv + '<div style="font:10px verdana">Merk:' +
                        dijit.byId('divDaftarInput').getItem(i).merk + '</div>';
                    return dv;
                })},
                {field:'jumlah', name:'Qty', width:'30%' }
            ];
            this.gdInputItem = new dojox.grid.DataGrid({
                query:{}, store:null,
                structure:itemLayout
            }, 'divDaftarInput');
            this.gdInputItem.canSort = function () {
                return false
            };
            this.gdInputItem.startup();
            if (!this.formKonversi.onDaftarInputDblClickHandler)
                this.formKonversi.onDaftarInputDblClickHandler = dojo.connect(
                    this.gdInputItem, 'onRowDblClick', dojo.hitch(this, function (e) {
                        var items = e.grid.selection.getSelected();
                        if (items && items.length)
                            this.onDeleteInputItem(items[0].id, 'K', 0);
                    })
                )
        },
        prepareGridProdukItem:function () {
            //
            //inisiasi formater detail konversi
            //
            var itemLayout = [
                {field:'nama', name:'Barang', width:'70%%', formatter:dojo.hitch(this, function (v, i) {
                    var dv = '<div style="font: 11px verdana;font-weight: bold;text-decoration: underline">' + v + '</div> ';
                    var dv = dv + '<div style="font:10px verdana">Merk:' +
                        dijit.byId('divDaftarProduk').getItem(i).merk + '</div>';
                    return dv;
                })},
                {field:'jumlah', name:'Qty', width:'30%' }
            ];
            this.gdProdukItem = new dojox.grid.DataGrid({
                query:{}, store:null,
                structure:itemLayout
            }, 'divDaftarProduk');
            this.gdProdukItem.canSort = function () {
                return false
            };
            this.gdProdukItem.startup();
            if (!this.formKonversi.onDaftarProdukDblClickHandler)
                this.formKonversi.onDaftarProdukDblClickHandler = dojo.connect(
                    this.gdProdukItem, 'onRowDblClick', dojo.hitch(this, function (e) {
                        var items = e.grid.selection.getSelected();
                        if (items && items.length)
                            this.onDeleteInputItem(items[0].id, 'D', 1);
                    })
                )

        },
        prepareGridByProdukItem:function () {
            //
            //inisiasi formater detail konversi
            //
            var itemLayout = [
                {field:'nama', name:'Barang', width:'70%%', formatter:dojo.hitch(this, function (v, i) {
                    var dv = '<div style="font: 11px verdana;font-weight: bold;text-decoration: underline">' + v + '</div> ';
                    var dv = dv + '<div style="font:10px verdana">Merk:' +
                        dijit.byId('divDaftarByProduk').getItem(i).merk + '</div>';
                    return dv;
                })},
                {field:'jumlah', name:'Qty', width:'30%' }
            ];
            this.gdByProdukItem = new dojox.grid.DataGrid({
                query:{}, store:null,
                structure:itemLayout
            }, 'divDaftarByProduk');
            this.gdByProdukItem.canSort = function () {
                return false
            };
            this.gdByProdukItem.startup();
            if (!this.formKonversi.onDaftarByProdukDblClickHandler)
                this.formKonversi.onDaftarByProdukDblClickHandler = dojo.connect(
                    this.gdByProdukItem, 'onRowDblClick', dojo.hitch(this, function (e) {
                        var items = e.grid.selection.getSelected();
                        if (items && items.length)
                            this.onDeleteInputItem(items[0].id, 'D', 2);
                    })
                )

        },
        disableButton:function (disable) {
            dojote.dijitByName('btnSimpanInputItem').set('disabled', disable);
            dojote.dijitByName('btnSimpanProdukItem').set('disabled', disable);
            dojote.dijitByName('btnSimpanByProdukItem').set('disabled', disable);
            dojote.dijitByName('btnSimpanKonversi').set('disabled', disable)
        },

        clearEntryBarang:function () {
            dojote.dijitByName('barang_nama').clearValue();
            dojote.dijitByName('barang_qty').set('value', "");
        },
        setTotal:function () {
            if (this.gdItemKonversiWip) {
                var imax = this.gdItemKonversiWip.rowCoun;
                var subs = 0;
                for (var i = 0; i < imax; i++) {
                    var itm = this.gdItemKonversiWip.getItem(i);
                    var sub = itm.jumlah * itm.harga;
                    subs = subs + sub
                }
                dojote.dijitByName('total').set('value', dojo.number.format(subs, {pattern:'#,###.##'}));
                dojo.style(dojote.byName('total'), 'textAlign', 'right');

            }
        },
        onSimpanKonversi:function () {
            var data = {c:'simpankonversi', id:dojote.dijitByName('id').get('value')};
            dojote.callXhrJsonPost('/inventory/konversi/', data, dojo.hitch(this, function (res) {
                if (res.sukses) {
                    dojote.notify('perekaman konversi inventory barang berhasil');
                    this.disableButton(true);
                    //dojote.dijitByName('btnSimpanItemKonversi').set('disabled', true);
                } else {
                    alert(res.msg)
                }

            }), 'Error simpan data rencana konversi');
        },
        prepareHdrKonversi:function (id) {
            dojote.callXhrJsonPost('/inventory/konversi/', {id:id, c:'gethdrkonversi', a:20}, dojo.hitch(
                this, function (e) {
                    var jresp = e.data;
                    dojote.dijitByName('no_konversi').set('value', jresp.nomor);
                    dojote.dijitByName('tgl_konversi').set('value', jresp.tanggal);
                    dojote.dijitByName('id').set('value', jresp.id);
                }))
        },
        prepareDaftarItemKonversi:function (id, kredebit, jenisProduk) {
            dojote.callXhrJsonPost('/inventory/konversi/', {id:id, c:'getitemkonversi',
                kredebit:kredebit, jenisProduk:jenisProduk, a:20}, dojo.hitch(
                this, function (jresp) {
                    var gridInstance = "";
                    if ('K' == kredebit)
                        gridInstance = "divDaftarInput";
                    if ('D' == kredebit && 1 == jenisProduk)
                        gridInstance = "divDaftarProduk";
                    if ('D' == kredebit && 2 == jenisProduk)
                        gridInstance = "divDaftarByProduk";


                    dijit.byId(gridInstance).setStore(
                        new dojo.data.ObjectStore(
                            {objectStore:new dojo.store.Memory({data:jresp})}));
                    this.setTotal();
                }))

        }


    }
        ;
    singleton.init();
    return singleton;
})

