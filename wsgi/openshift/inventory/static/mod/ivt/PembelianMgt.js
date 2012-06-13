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
    'dijit/form/Textarea',
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
            this.pembelianFormType = "";
        },
        startup:function () {
            this.searchPasienHandle = dojo.subscribe('onMenuRencanaPembelian', dojo.hitch(this, 'prepareFormPembelian'));
        },
        prepareFormPembelian:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            this.formPembelian = tabUtil.putinTab('Pembelian', 'Loading form pembelian');
            var param = {c:'formpembelian'};

            dojote.callXhrJsonPost('/inventory/pembelian/', param, dojo.hitch(this, function (res) {
                if (tabUtil.cekTab(this.formPembelian)) {
                    //
                    //Inisiasi form pembelian disini
                    //
                    this.formPembelian.set('content', res.html);
                    var form = dijit.byId('formPembelian')
                    if (res.data) {
                        form.setFormValues(res.data)
                    }
                    dojote.dijitByName('supplier_nama').focus()
                    var brg = dojote.dijitByName('barang_nama');
                    //
                    //inisiasi event
                    //
                    if (!this.formPembelian.onBrgResult)
                        this.formPembelian.onBrgResult = dojo.connect(brg, 'onLookupResult', dojo.hitch(this, function (e) {
                            dojote.dijitByName('barang_harga').set('value', e.row.harga);
                        }));
                    if (!this.formPembelian.onSimpanItem)
                        this.formPembelian.onSimpanItem = dojo.connect(dojote.dijitByName('btnSimpanItemPembelian'),
                            'onClick', dojo.hitch(this, this.onSimpanItemPembelian))
                    if (!this.formPembelian.onSimpanPembelian)
                        this.formPembelian.onSimpanPembelian = dojo.connect(dojote.dijitByName('btnSimpanPembelian'),
                            'onClick', dojo.hitch(this, this.onSimpanPembelian))
                    this.prepareGridItemPembelian();
                    if ('edit-view'.indexOf(arg.mode) != -1) {
                        this.prepareDaftarPembelian(arg.id);
                        this.prepareHdrPembelian(arg.id);
                        this.disableButton(('view' == arg.mode))
                    }
                }
            }))
        },

        prepareGridItemPembelian:function () {
            //
            //inisiasi formater detail pembelian
            //
            var gd = dijit.byId('dgItemPembelian');
            this.gdItemPembelian = gd;
            console.log('observe layout,... begining')
            if (dojote.cekWidget(gd)) {
                console.log('observe layout,...')
                gd.layout.cells[0].formatter = dojo.hitch(this, function (v, i) {
                    var dv = '<div style="font: 11px verdana;font-weight: bold;text-decoration: underline">' + v + '</div> ';
                    var dv = dv + '<div style="font:10px verdana">Merk:' +
                        dijit.byId('dgItemPembelian').getItem(i).merk + '</div>';
                    return dv;
                })
                gd.layout.cells[3].formatter = dojo.hitch(this, function (v, i) {
                    var itm = dijit.byId('dgItemPembelian').getItem(i)
                    var dv = '<div style="font:12px verdana;text-align: right">' +
                        itm.harga + '</div>';
                    return dv;
                });
                gd.layout.cells[4].formatter = dojo.hitch(this, function (v, i) {
                    var itm = dijit.byId('dgItemPembelian').getItem(i)
                    var dv = '<div style="font:12px verdana;text-align: right">' +
                        dojo.number.format((itm.jumlah * itm.harga), {pattern:'#,###.##'}) + '</div>';
                    return dv;
                })
            }
        },
        disableButton:function (disable) {
            dojote.dijitByName('btnSimpanItemPembelian').set('disabled', disable);
            dojote.dijitByName('btnSimpanPembelian').set('disabled', disable)
        },
        onSimpanItemPembelian:function () {
            var data = dojo.mixin(dijit.byId('formPembelian').gatherFormValues(),
                {c:'simpanitempembelian'});
            dojote.callXhrJsonPost('/inventory/pembelian/', data, dojo.hitch(this, function (res) {
                dojote.dijitByName('barang_nama').focus();
                //assign to no and tanggal pembelian, filter tuples with this value
                dijit.byId('formPembelian').setFormValues(dojote.jPrefix(res, "",
                    ['id', 'no_rencana_pembelian', 'tgl_rencana_pembelian']));
                this.clearEntryBarang();
                dojote.dijitByName('barang_nama').focus();
                this.prepareDaftarPembelian(res.id);
            }), 'Error simpan data');
        },
        clearEntryBarang:function () {
            dojote.dijitByName('barang_nama').clearValue();
            dojote.dijitByName('barang_harga').set('value', "");
            dojote.dijitByName('barang_qty').set('value', "");
        },
        setTotal:function () {
            if (this.gdItemPembelian) {
                var imax = this.gdItemPembelian.rowCount;
                var subs = 0;
                for (var i = 0; i < imax; i++) {
                    var itm = this.gdItemPembelian.getItem(i);
                    var sub = itm.jumlah * itm.harga;
                    subs = subs + sub
                }
                dojote.dijitByName('total').set('value', dojo.number.format(subs, {pattern:'#,###.##'}));
                dojo.style(dojote.byName('total'), 'textAlign', 'right');

            }
        },
        onSimpanPembelian:function () {
            var data = dojo.mixin(dijit.byId('formPembelian').gatherFormValues(),
                {c:'simpanrencanapembelian'});
            dojote.callXhrJsonPost('/inventory/pembelian/', data, dojo.hitch(this, function (res) {
                if (res.sukses) {
                    dojote.notify('perekaman pembelian berhasil');
                    dojote.dijitByName('btnSimpanPembelian').set('disabled', true);
                    dojote.dijitByName('btnSimpanItemPembelian').set('disabled', true);
                } else {
                    alert(res.msg)
                }

            }), 'Error simpan data rencana pembelian');
        },
        prepareHdrPembelian:function (id) {
            dojote.callXhrJsonPost('/inventory/pembelian/', {id:id, c:'gethdrpembelian', a:20}, dojo.hitch(
                this, function (e) {
                    var jresp = e.data;
                    dojote.dijitByName('no_rencana_pembelian').set('value', jresp.nomor);
                    dojote.dijitByName('tgl_rencana_pembelian').set('value', jresp.tanggal);
                    dojote.dijitByName('supplier_id').set('value', jresp.supplier_id);
                    dojote.dijitByName('id').set('value', jresp.id);
                }))
        },
        prepareDaftarPembelian:function (id) {
            dojote.callXhrJsonPost('/inventory/pembelian/', {id:id, c:'getitempembelian', a:20}, dojo.hitch(
                this, function (jresp) {
                    dijit.byId('dgItemPembelian').setStore(
                        new dojo.data.ObjectStore(
                            {objectStore:new dojo.store.Memory({data:jresp})}));
                    this.setTotal();
                }))

        }

    }
    singleton.init();
    return singleton;
})

