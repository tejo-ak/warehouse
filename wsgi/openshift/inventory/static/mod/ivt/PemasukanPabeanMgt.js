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
            this.pemasukanpabeanFormType = "";
        },
        startup:function () {
            this.searchPasienHandle = dojo.subscribe('onMenuPemasukanPabean', dojo.hitch(this, 'prepareFormPemasukanPabean'));
        },
        prepareFormPemasukanPabean:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            if (!dojote.cekWidget(this.formPemasukanPabean)) {
                this.formPemasukanPabean = tabUtil.putinTab('Pemasukan Pabean', 'Loading form pemasukan pabean');
                var param = {c:'formpemasukanpabean'};

                dojote.callXhrJsonPost('/inventory/pabean/', param, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formPemasukanPabean)) {
                        //
                        //Inisiasi form pemasukanpabean disini
                        //

                        this.formPemasukanPabean.set('content', res.html);
                        this.prepareGridItemPemasukanPabean();
                        this.initForm(arg)
                    }
                }))
            } else {
                tabUtil.selectTab(this.formPemasukanPabean);
                this.initForm(arg)
            }

        },
        initForm:function (arg) {
            dojote.dijitByName('inventory_id').set('value', arg.inventory_id);
            dojote.dijitByName('jenisDokumen_id').set('value', arg.jenisDokumen);
            dojote.callXhrJsonPost('/inventory/pabean/', {c:'getjenisdokumen', jenisDokumen:arg.jenisDokumen}, dojo.hitch(this, function (e) {
                if (tabUtil.cekTab(this.formPemasukanPabean)) {
                    var namadok = dojote.byName('jenis_dokumen', this.formPemasukanPabean.domNode)
                    if (namadok)
                        namadok.innerHTML=e.data;
                }
            }))
            this.formPemasukanPabean.tksBarang = dojote.dijitByName('barang_nama')
            this.formPemasukanPabean.tksBarang.focus()
            //
            //inisiasi event
            //
            if (!this.formPemasukanPabean.onSimpanItemHandler)
                this.formPemasukanPabean.onSimpanItemHandler = dojo.connect(dojote.dijitByName('btnSimpanItemPemasukanPabean'),
                    'onClick', dojo.hitch(this, this.onSimpanItemPemasukanPabean))
            if (!this.formPemasukanPabean.onSimpanPemasukanPabean)
                this.formPemasukanPabean.onSimpanPemasukanPabean = dojo.connect(dojote.dijitByName('btnSimpanPemasukanPabean'),
                    'onClick', dojo.hitch(this, this.onSimpanPemasukanPabean))

            if ('edit-view'.indexOf(arg.mode) != -1) {
                this.prepareDaftarPemasukanPabean(arg.id);
                this.prepareHdrPemasukanPabean(arg.id);
                this.disableButton(('view' == arg.mode))
            }
        },
        prepareGridItemPemasukanPabean:function () {
            //
            //inisiasi formater detail pemasukanpabean
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
            dojote.dijitByName('btnSimpanItemPemasukanPabean').set('disabled', disable);
            dojote.dijitByName('btnSimpanPemasukanPabean').set('disabled', disable)
        },
        onSimpanItemPemasukanPabean:function () {
            var data = dojo.mixin(dijit.byId('formPemasukanPabean').gatherFormValues(),
                {c:'simpanitempemasukanpabean'});
            dojote.callXhrJsonPost('/inventory/pabean/', data, dojo.hitch(this, function (res) {
                res['barang_id'] = null;
                dijit.byId('formPemasukanPabean').setFormValues(res);
                this.clearEntryBarang();
                this.prepareHdrPemasukanPabean(res.id)
                this.clearEntryBarang();
                dojote.dijitByName('barang_nama').focus();
                this.prepareDaftarPemasukanPabean(res.id);
            }), 'Error simpan data');
        },
        clearEntryBarang:function () {
            var kosong = dojote.createEmtyTuple(['barang_nama', 'barang_harga', 'merk',
                'barang_qty', 'hs', 'uraian', 'nilaiPabean', 'pungutanBayar', 'pungutanBebas']);
            dijit.byId('formPemasukanPabean').setFormValues(kosong);

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
                dojote.dijitByName('total', this.formPemasukanPabean.domNode).set(
                    'value', dojo.number.format(subs, {pattern:'#,###.##'}));
                dojo.style(dojote.byName('total', this.formPemasukanPabean.domNode), 'textAlign', 'right');

            }
        },
        onSimpanPemasukanPabean:function () {
            var data = dojo.mixin(dijit.byId('formPemasukanPabean').gatherFormValues(),
                {c:'simpanpemasukanpabean'});
            dojote.notify('proses penyimpanana pengeluaran Pabean');
            dojote.callXhrJsonPost('/inventory/pabean/', data, dojo.hitch(this, function (res) {
                if (res.sukses) {
                    dojote.notify('perekaman pemasukanpabean inventory barang berhasil');
                    this.disableButton(true);
                } else {
                    alert(res.msg)
                }

            }), 'Error simpan data rencana pemasukanpabean');
        },
        prepareHdrPemasukanPabean:function (id) {
            dojote.callXhrJsonPost('/inventory/pabean/', {id:id, c:'gethdrpemasukanpabean', a:20}, dojo.hitch(
                this, function (e) {
                    var jresp = e.data;
                    dijit.byId('formPemasukanPabean').setFormValues(jresp);
                }))
        },
        prepareDaftarPemasukanPabean:function (id) {
            dojote.callXhrJsonPost('/inventory/pabean/', {id:id, c:'getitempemasukanpabean', a:20}, dojo.hitch(
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

