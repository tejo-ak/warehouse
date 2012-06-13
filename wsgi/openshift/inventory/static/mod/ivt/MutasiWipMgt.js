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
            this.mutasiFormType = "";
        },
        startup:function () {
            this.searchPasienHandle = dojo.subscribe('onMenuMutasiWIP', dojo.hitch(this, 'prepareFormMutasi'));
        },
        prepareFormMutasi:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            this.formMutasiWip = tabUtil.putinTab('MutasiWip', 'Loading form mutasi');
            var param = {c:'formmutasi'};

            dojote.callXhrJsonPost('/inventory/mutasi/', param, dojo.hitch(this, function (res) {
                if (tabUtil.cekTab(this.formMutasiWip)) {
                    //
                    //Inisiasi form mutasi disini
                    //

                    this.formMutasiWip.set('content', res.html);
                    var form = dijit.byId('formMutasiWip')
                    if (res.data) {
                        form.setFormValues(res.data)
                    }
                    dojote.dijitByName('inventory_asal_id').set('value', 1);
                    dojote.dijitByName('inventory_tujuan_id').set('value', 2);

                    this.formMutasiWip.tksBarang = dojote.dijitByName('barang_nama')
                    this.formMutasiWip.tksBarang.focus()
                    //
                    //inisiasi event
                    //
                    if (!this.formMutasiWip.onSimpanItem)
                        this.formMutasiWip.onSimpanItem = dojo.connect(dojote.dijitByName('btnSimpanItemMutasi'),
                            'onClick', dojo.hitch(this, this.onSimpanItemMutasi))
                    if (!this.formMutasiWip.onSimpanMutasiWip)
                        this.formMutasiWip.onSimpanMutasiWip = dojo.connect(dojote.dijitByName('btnSimpanMutasi'),
                            'onClick', dojo.hitch(this, this.onSimpanMutasi))
                    this.prepareGridItemMutasiWip();
                    if ('edit-view'.indexOf(arg.mode) != -1) {
                        this.prepareDaftarMutasi(arg.id);
                        this.prepareHdrMutasi(arg.id);
                        this.disableButton(('view' == arg.mode))
                    }
                }
            }))
        },

        prepareGridItemMutasiWip:function () {
            //
            //inisiasi formater detail mutasi
            //
            var itemLayout = [
                {field:'nama', name:'Barang', width:'40%%', formatter:dojo.hitch(this, function (v, i) {
                    var dv = '<div style="font: 11px verdana;font-weight: bold;text-decoration: underline">' + v + '</div> ';
                    var dv = dv + '<div style="font:10px verdana">Merk:' +
                        dijit.byId('dgItemBarang').getItem(i).merk + '</div>';
                    return dv;
                })},
                {field:'jumlah', name:'qty', width:'10%' },
                {field:'satuan', name:'Satuan', width:'10%' },
                {field:'harga', name:'Harga', width:'20%', formatter:dojo.hitch(this, function (val, idx) {
                    var itm = dijit.byId('dgItemBarang').getItem(idx)
                    var dv = '<div style="font:12px verdana;text-align: right">' +
                        dojote.to2Dec(itm.harga) + '</div>';
                    return dv;
                }) },
                {field:'subtotal', name:'Sub Total', width:'20%', formatter:dojo.hitch(this, function (val, idx) {
                    var itm = dijit.byId('dgItemBarang').getItem(idx)
                    var dv = '<div style="font:12px verdana;text-align: right">' +
                        dojote.to2Dec(itm.jumlah * itm.harga) + '</div>';
                    return dv;
                }) }
            ];
            this.gdItem = new dojox.grid.DataGrid({
                query:{}, store:null,
                structure:itemLayout
            }, 'dgItemBarang');
            this.gdItem.canSort = function () {
                return false
            };
            this.gdItem.startup();

        },
        disableButton:function (disable) {
            dojote.dijitByName('btnSimpanItemMutasi').set('disabled', disable);
            dojote.dijitByName('btnSimpanMutasi').set('disabled', disable)
        },
        onSimpanItemMutasi:function () {
            var data = dojo.mixin(dijit.byId('formMutasi').gatherFormValues(),
                {c:'simpanitemmutasi'});
            dojote.callXhrJsonPost('/inventory/mutasi/', data, dojo.hitch(this, function (res) {
                //assign to no and tanggal mutasi, filter tuples with this value
                //dijit.byId('formMutasi').setFormValues(dojote.jPrefix(res, "",
//                ['id', 'no_mutasi', 'tgl_mutasi']));
                this.prepareHdrMutasi(res.mutasi_id)
                this.clearEntryBarang();
                dojote.dijitByName('barang_nama').focus();
                dojote.dijitByName('id').set('value', res.mutasi_id);
                this.prepareDaftarMutasi(res.mutasi_id);
            }), 'Error simpan data');
        },
        clearEntryBarang:function () {
            dojote.dijitByName('barang_nama').clearValue();
            dojote.dijitByName('barang_qty').set('value', "");
        },
        setTotal:function () {
            if (this.gdItem) {
                var imax = this.gdItem.rowCount;
                var subs = 0;
                for (var i = 0; i < imax; i++) {
                    var itm = this.gdItem.getItem(i);
                    var sub = itm.jumlah * itm.harga;
                    subs = subs + sub
                }
                dojote.dijitByName('total').set('value', dojo.number.format(subs, {pattern:'#,###.##'}));
                dojo.style(dojote.byName('total'), 'textAlign', 'right');

            }
        },
        onSimpanMutasi:function () {
            var data = dojo.mixin(dijit.byId('formMutasi').gatherFormValues(),
                {c:'simpanmutasi'});
            dojote.callXhrJsonPost('/inventory/mutasi/', data, dojo.hitch(this, function (res) {
                if (res.sukses) {
                    dojote.notify('perekaman mutasi inventory barang berhasil');
                    dojote.dijitByName('btnSimpanMutasi').set('disabled', true);
                    dojote.dijitByName('btnSimpanItemMutasi').set('disabled', true);
                } else {
                    alert(res.msg)
                }

            }), 'Error simpan data rencana mutasi');
        },
        prepareHdrMutasi:function (id) {
            dojote.callXhrJsonPost('/inventory/mutasi/', {id:id, c:'gethdrmutasi', a:20}, dojo.hitch(
                this, function (e) {
                    var jresp = e.data;
                    dojote.dijitByName('no_mutasi').set('value', jresp.nomor);
                    dojote.dijitByName('tgl_mutasi').set('value', jresp.tanggal);
                    dojote.dijitByName('id').set('value', jresp.id);
                }))
        },
        prepareDaftarMutasi:function (id) {
            dojote.callXhrJsonPost('/inventory/mutasi/', {id:id, c:'getitemmutasi', a:20}, dojo.hitch(
                this, function (jresp) {
                    console.log('observe jrep')
                    console.log(jresp)
                    dijit.byId('dgItemBarang').setStore(
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

