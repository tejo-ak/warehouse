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
            this.opnameFormType = "";
        },
        startup:function () {
            this.searchPasienHandle = dojo.subscribe('onMenuOpname', dojo.hitch(this, 'prepareFormOpname'));
        },
        prepareFormOpname:function (arg) {
            //dojote.clearSideMainPane();

            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            this.formOpname = tabUtil.putinTab('Opname', 'Loading form opname');
            var param = {c:'formopname'};

            dojote.callXhrJsonPost('/inventory/opname/', param, dojo.hitch(this, function (res) {
                if (tabUtil.cekTab(this.formOpname)) {
                    //
                    //Inisiasi form opname disini
                    //

                    this.formOpname.set('content', res.html);
                    dojote.dijitByName('inventory_id').set('value', 1)
                    var form = dijit.byId('formOpname')
                    if (res.data) {
                        form.setFormValues(res.data)
                    }
                    this.formOpname.onSimpanItem = dojo.connect(dojote.dijitByName('btnSimpanItemOpname'),
                        'onClick', dojo.hitch(this, this.onSimpanItemOpname))
                    if (!this.formOpname.onSimpanOpnameHandler)
                        this.formOpname.onSimpanOpnameHandler = dojo.connect(dojote.dijitByName('btnSimpanOpname'),
                            'onClick', dojo.hitch(this, this.onSimpanOpname))
                    this.prepareGridItemOpname();
                    this.prepareBarangOpname();
                    if ('edit-view'.indexOf(arg.mode) != -1) {
                        this.prepareDaftarOpname(arg.id);
                        this.prepareHdrOpname(arg.id);
                        this.disableButton(('view' == arg.mode))
                    }
                }
            }))
        },
        simpanItemOpname:function (idx, grid) {

            var par = {
                c:'simpanitemopname',
                id:dojote.dijitByName('id').get('value'),
                barang_id:grid.getItem(idx).barang_id,
                inventory_id:dojote.dijitByName('inventory_id').get('value'),
                opname:grid.getItem(idx).opname,
                saldo:grid.getItem(idx).saldo,
                keterangan:grid.getItem(idx).keterangan
            };
            console.log('observe grid apply edit');
            console.log(par)
            dojote.callXhrJsonPost('/inventory/opname/', par, dojo.hitch(this, function (e) {
                //do nothing on success
                console.log(e);
                dojote.dijitByName('id', this.formOpname.domNode).set('value', e.opname_id)
                dojote.dijitByName('no_opname').set('value', e.opname_nomor)
                dojote.dijitByName('tgl_opname').set('value', e.opname_tanggal)

            }))

        },
        prepareGridItemOpname:function () {
            //
            //inisiasi formater detail opname
            //
            var itemLayout = [
                {field:'barang_nama', name:'Barang', width:'35%%', formatter:dojo.hitch(this, function (v, i) {
                    var dv = '<div style="font: 11px verdana;font-weight: bold;text-decoration: underline">' + v + '</div> ';
                    var dv = dv + '<div style="font:10px verdana">Merk:' +
                        dijit.byId('dgItemBarang').getItem(i).barang_merk + '</div>';
                    return dv;
                })},
                {field:'saldo', name:'Saldo', width:'12.5%', formatter:dojo.hitch(this, function (val, idx) {
                    return '<div style="text-align: right">' + val + '</div>';
                }) },
                {field:'opname', name:'Opname', width:'12.5%', editable:true},
                {field:'keterangan', name:'Keterangan', width:'40%', editable:true }


            ];
            this.gdItem = new dojox.grid.DataGrid({
                query:{}, store:null, singleClickEdit:true,
                structure:itemLayout
            }, 'dgItemBarang');
            this.gdItem.canSort = function () {
                return false
            };

            if (!this.formOpname.gridCellApplyEditHandler)
                this.formOpname.gridCellApplyEditHandler = dojo.connect(this.gdItem, 'onApplyCellEdit'
                    , dojo.hitch(this, function (val, idx, field) {
                        if (!this.formOpname.noCellEdit)
                            this.simpanItemOpname(idx, this.gdItem)
                    })
                )
            this.gdItem.startup();

        },
        disableButton:function (disable) {
            dojote.dijitByName('btnSimpanOpname').set('disabled', disable);
            this.formOpname.noCellEdit = disable;
        },
        onSimpanOpname:function () {
            var data =
            {c:'simpanopname', id:dojote.dijitByName('id').get('value')};
            dojote.callXhrJsonPost('/inventory/opname/', data, dojo.hitch(this, function (res) {
                if (res.sukses) {
                    dojote.notify('perekaman opname inventory barang berhasil');
                    dojote.dijitByName('btnSimpanOpname').set('disabled', true);
                    this.formOpname.noCellEdit = true;
                } else {
                    alert(res.msg)
                }

            }), 'Error simpan data rencana opname');
        },
        prepareHdrOpname:function (id) {
            dojote.callXhrJsonPost('/inventory/opname/', {id:id, c:'gethdropname', a:20}, dojo.hitch(
                this, function (e) {
                    var jresp = e.data;
                    dojote.dijitByName('no_opname').set('value', jresp.nomor);
                    dojote.dijitByName('tgl_opname').set('value', jresp.tanggal);
                    dojote.dijitByName('id', this.formOpname.domNode).set('value', jresp.id);
                }))
        },
        prepareBarangOpname:function () {
            dojote.callXhrJsonPost('/inventory/opname/',
                {
                    c:'prepareitemopname',
                    inventory_id:dojote.dijitByName('inventory_id').get('value'),
                    a:500},
                dojo.hitch(this, function (jresp) {
                    dijit.byId('dgItemBarang').setStore(
                        new dojo.data.ObjectStore(
                            {objectStore:new dojo.store.Memory({data:jresp})}));
                }))
        },
        prepareDaftarOpname:function (id) {
            dojote.callXhrJsonPost('/inventory/opname/', {id:id, c:'getitemopname', a:20}, dojo.hitch(
                this, function (jresp) {
                    console.log(jresp)
                    if (this.gdItem) {
                        var imax = this.gdItem.rowCount;
                        var jmax = jresp.length;
                        for (var i = 0; i < imax; i++) {
                            var gi = this.gdItem.getItem(i);
                            for (j = 0; j < jmax; j++) {
                                if (gi.barang_id == jresp[j].barang_id) {
                                    this.gdItem.store.setValue(gi, 'opname', jresp[j].inspeksi)
                                    this.gdItem.store.setValue(gi, 'keterangan', jresp[j].keterangan)
                                }
                            }
                        }
                    }
                }))

        }

    }
    singleton.init();
    return singleton;
})

