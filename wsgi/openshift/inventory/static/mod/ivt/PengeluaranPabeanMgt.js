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
            this.pengeluaranpabeanFormType = "";
        },
        startup:function () {
            this.searchPasienHandle = dojo.subscribe('onMenuPengeluaranPabean', dojo.hitch(this, 'prepareFormPengeluaranPabean'));
        },
        prepareFormPengeluaranPabean:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            if (!dojote.cekWidget(this.formPengeluaranPabean)) {
                this.formPengeluaranPabean = tabUtil.putinTab('PengeluaranPabean', 'Loading form pengeluaranpabean');
                var param = {c:'formpengeluaranpabean'};

                dojote.callXhrJsonPost('/inventory/pabean/', param, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formPengeluaranPabean)) {
                        //
                        //Inisiasi form pengeluaranpabean disini
                        //

                        this.formPengeluaranPabean.set('content', res.html);
                        var form = dijit.byId('formPengeluaranPabean')
                        if (res.data) {
                            form.setFormValues(res.data)
                        }
                        this.prepareGridItemPengeluaranPabean();
                        this.initForm(arg)
                    }
                }))
            } else {
                tabUtil.selectTab(this.formPengeluaranPabean);
                this.initForm(arg)
            }

        },
        initForm:function (arg) {
            dojote.dijitByName('inventory_id').set('value', 1);
            dojote.dijitByName('jenisDokumen_id').set('value', arg.jenisDokumen);

            this.formPengeluaranPabean.tksBarang = dojote.dijitByName('barang_nama')
            this.formPengeluaranPabean.tksBarang.focus()
            //
            //inisiasi event
            //
            dojote.callXhrJsonPost('/inventory/pabean/', {c:'getjenisdokumen', jenisDokumen:arg.jenisDokumen}, dojo.hitch(this, function (e) {
                if (tabUtil.cekTab(this.formPengeluaranPabean)) {
                    var namadok = dojote.byName('jenis_dokumen', this.formPengeluaranPabean.domNode)
                    if (namadok)
                        namadok.innerHTML=e.data;
                }
            }))
            if (!this.formPengeluaranPabean.onSimpanItemHandler)
                this.formPengeluaranPabean.onSimpanItemHandler = dojo.connect(dojote.dijitByName('btnSimpanItemPengeluaranPabean'),
                    'onClick', dojo.hitch(this, this.onSimpanItemPengeluaranPabean))
            if (!this.formPengeluaranPabean.onSimpanPengeluaranPabean)
                this.formPengeluaranPabean.onSimpanPengeluaranPabean = dojo.connect(dojote.dijitByName('btnSimpanPengeluaranPabean'),
                    'onClick', dojo.hitch(this, this.onSimpanPengeluaranPabean))

            if ('edit-view'.indexOf(arg.mode) != -1) {
                this.prepareDaftarPengeluaranPabean(arg.id);
                this.prepareHdrPengeluaranPabean(arg.id);
                this.disableButton(('view' == arg.mode))
            }
        },
        prepareGridItemPengeluaranPabean:function () {
            //
            //inisiasi formater detail pengeluaranpabean
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
            dojote.dijitByName('btnSimpanItemPengeluaranPabean').set('disabled', disable);
            dojote.dijitByName('btnSimpanPengeluaranPabean').set('disabled', disable)
        },
        onSimpanItemPengeluaranPabean:function () {
            var data = dojo.mixin(dijit.byId('formPengeluaranPabean').gatherFormValues(),
                {c:'simpanitempengeluaranpabean'});
            dojote.callXhrJsonPost('/inventory/pabean/', data, dojo.hitch(this, function (res) {
                res['barang_id'] = null;
                dijit.byId('formPengeluaranPabean').setFormValues(res);
                this.clearEntryBarang();
                this.prepareHdrPengeluaranPabean(res.id)
                this.clearEntryBarang();
                dojote.dijitByName('barang_nama').focus();
                this.prepareDaftarPengeluaranPabean(res.id);
            }), 'Error simpan data');
        },
        clearEntryBarang:function () {
            var kosong = dojote.createEmtyTuple(['barang_nama', 'barang_harga', 'merk',
                'barang_qty', 'hs', 'uraian', 'nilaiPabean', 'pungutanBayar', 'pungutanBebas']);
            dijit.byId('formPengeluaranPabean').setFormValues(kosong);

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
                dojote.dijitByName('total', this.formPengeluaranPabean.domNode).set(
                    'value', dojo.number.format(subs, {pattern:'#,###.##'}));
                dojo.style(dojote.byName('total', this.formPengeluaranPabean.domNode), 'textAlign', 'right');

            }
        },
        onSimpanPengeluaranPabean:function () {
            var data = dojo.mixin(dijit.byId('formPengeluaranPabean').gatherFormValues(),
                {c:'simpanpengeluaranpabean'});
            dojote.notify('proses penyimpanana pengeluaran Pabean');
            dojote.callXhrJsonPost('/inventory/pabean/', data, dojo.hitch(this, function (res) {
                if (res.sukses) {
                    dojote.notify('perekaman pengeluaranpabean inventory barang berhasil');
                    this.disableButton(true);
                } else {
                    alert(res.msg)
                }

            }), 'Error simpan data rencana pengeluaranpabean');
        },
        prepareHdrPengeluaranPabean:function (id) {
            dojote.callXhrJsonPost('/inventory/pabean/', {id:id, c:'gethdrpengeluaranpabean', a:20}, dojo.hitch(
                this, function (e) {
                    var jresp = e.data;
                    dijit.byId('formPengeluaranPabean').setFormValues(jresp);
                }))
        },
        prepareDaftarPengeluaranPabean:function (id) {
            dojote.callXhrJsonPost('/inventory/pabean/', {id:id, c:'getitempengeluaranpabean', a:20}, dojo.hitch(
                this, function (jresp) {
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

