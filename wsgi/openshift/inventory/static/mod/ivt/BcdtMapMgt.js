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
            this.bcdtMapFormType = "";
        },
        startup:function () {
            this.searchPasienHandle = dojo.subscribe('onMenuBcdtMap', dojo.hitch(this, 'prepareFormBcdtMap'));
        },
        initForm:function (arg) {
            if (!this.formBcdtMap.onMapHandler)
                this.formBcdtMap.onMapHandler = dojo.connect(dojote.dijitByName('btnMap'),
                    'onClick', dojo.hitch(this, function (e) {
                            if (this.gdItem) {
                                var items = this.gdItem.selection.getSelected();
                                var itm_id = (items && items.length) ? items[0].id : null;
                                var par = {
                                    c:'mapbarang',
                                    item_id:itm_id,
                                    barang_id:dojote.dijitByName('barang_nama').getValueId()
                                };
                                dojote.callXhrJsonPost('/inventory/bcdt/', par, dojo.hitch(this, function (e) {
                                    console.log('observe map result');
                                    console.log(e);
                                    this.showMapping(this.formBcdtMap.hdrId)

                                }))

                                this.gdItem.focus.focusGrid();
                            }
                        }
                    ))
            this.prepareGrid();
            this.prepareDocDetailer()
            this.prepareBrgDetailer();

            // INISIASI EVENT DAN ENVENT HANDLER
            //
            this.formBcdtMap.btnKirimFile = dojote.byName('btnKirimFile');
            if (!this.formBcdtMap.btnKirimFileClickListener)
                this.formBcdtMap.btnKirimFileClickListener =
                    dojo.connect(this.formBcdtMap.btnKirimFile, 'onclick', dojo.hitch(this, function (e) {
                        this.formBcdtMap.btnKirimFile.disabled = true;
                        dojote.notify("Mohon tunggu sedang mengirim file arsip BC 2.3");
                    }))

            this.formBcdtMap.btnRegBrg = dojote.dijitByName('btnRegBrg');
            if (!this.formBcdtMap.btnRegBrgClickHandler)
                this.formBcdtMap.btnRegBrgClickHandler = dojo.connect(
                    this.formBcdtMap.btnRegBrg, 'onClick', dojo.hitch(this, function () {
                        dojo.publish('onMenuDaftarBarang', [
                            {layer:true, mode:'new'}
                        ])
                    }))


            this.formBcdtMap.btnSimpanMapping = dojote.dijitByName('btnSimpanMapping');
            if (!this.formBcdtMap.btnSimpanMappingClickHandler)
                this.formBcdtMap.btnSimpanMappingClickHandler = dojo.connect(
                    this.formBcdtMap.btnSimpanMapping, 'onClick', dojo.hitch(this, function (e) {
                        var par = {c:'simpanmapping', id:dojote.byName('id').value}
                        dojote.callXhrJsonPost('/inventory/bcdt/', par, dojo.hitch(this, function (e) {
                            this.disableButtons(true);
                            dojote.notify('Perekaman Mapping data BC 2.3 berhasil !')

                        }))
                    }))
            var ifUpload = dojo.byId('ifUploader');
            if (ifUpload) {
                if (!this.formBcdtMap.onIfLoad)
                    this.formBcdtMap.onIfLoad = dojo.connect(ifUpload, 'onload', dojo.hitch(this, function (e) {
                        var ifUpload = dojo.byId('ifUploader');
                        if (ifUpload) {
                            var ifbody = ifUpload.contentWindow.document.body;
                            var txt = ifbody.innerHTML;
                            if (txt && txt != '' && txt.indexOf('sukses') != -1) {
                                //sukses here
                                var jresp = dojo.fromJson(txt);
                                if (jresp.sukses) {
                                    dojote.notify('upload arsip bcdt berhasil');
                                    this.formBcdtMap.btnKirimFile.disabled = false;
                                    if (jresp.id) {
                                        this.formBcdtMap.hdrId = jresp.id;
                                        dojote.byName('id').value = jresp.id;
                                        this.showMapping(jresp.id);
                                        this.showHeader(jresp.id);
                                    }

                                } else {
                                    dojote.byName('id').value = '';
                                    dojote.notify('upload belum sukses')
                                }

                            } else {
                                dojote.preparePortlet('error upload', 2, txt);
                            }
                        }
                    }))
            }
            if ('edit-view'.indexOf(arg.mode) != -1) {
                this.showHeader(arg.id);
                this.showMapping(arg.id);
                this.disableButtons((arg.mode == 'view'));
            }

        },
        prepareFormBcdtMap:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            if (!dojote.cekWidget(this.formBcdtMap)) {
                this.formBcdtMap = tabUtil.putinTab('BcdtMap', 'loading form bcdtMap');
                var param = {c:'formbcdtmap'};
                if ('edit-show'.indexOf(arg.mode) != -1) {
                    var param = dojo.mixin(param, {'id':arg.id})
                }
                dojote.callXhrJsonPost('/inventory/bcdt/', param, dojo.hitch(this, function (res) {
                        if (tabUtil.cekTab(this.formBcdtMap)) {
                            //
                            //Inisiasi form bcdtMap disini
                            //
                            this.formBcdtMap.set('content', res.html);
                            console.log('observer arg')
                            console.log(arg)
                            this.initForm(arg);
                        }

                    }
                ))
            } else {
                this.initForm(arg);
            }

        },
        disableButtons:function (disable) {
            this.formBcdtMap.btnSimpanMapping.set('disabled', disable);
            dojote.dijitByName('btnMap').set('disabled', disable);
            this.formBcdtMap.btnKirimFile.disabled = disable;
        },
        showHeader:function (id) {
            dojote.callXhrJsonPost('/inventory/bcdt/', {c:'getmapheader', id:id}, dojo.hitch(this, function (e) {
                if (e.hdr) {
                    dojote.dijitByName('no_mapping').set('value', e.hdr.nomor);
                    dojote.dijitByName('tgl_mapping').set('value', e.hdr.tanggal);
                    dojote.byName('id').value = e.hdr.id
                    if (this.mapHeaderDetailer) {
                        this.mapHeaderDetailer.set('data', {
                            car:e.hdr.car,
                            valuta:e.hdr.valuta,
                            ndpbm:e.hdr.ndpbm
                        })
                    }
                }
            }))
        },
        showMapping:function (id) {
//set list to grid
            var dfr = dojote.callXhrJsonPost('/inventory/bcdt/', {c:'getmapping', id:id}, dojo.hitch(this, function (e) {
                if (e.items) {
                    console.log(e.items)
                    var itemStore = new dojo.store.Memory({data:e.items});
                    var itemObject = new dojo.data.ObjectStore({objectStore:itemStore});
                    if (this.gdItem) {
                        this.gdItem.setStore(itemObject);
                        if (this.gdItem.rowCount > 0 && !this.gdItem.selection.getSelected().length) {
                            this.gdItem.focus.setFocusCell(this.gdItem.layout.cells[0], 0);
                        }
                        this.gdItem.focus.focusGrid()
                    }
                }
            }))
            return dfr;
        },
        prepareGrid:function () {
            var itemLayout = [
                {field:'nama', name:'Dokumen', width:'50%%' },
                {field:'barang_nama', name:'Warehouse', width:'50%%', formatter:dojo.hitch(this, function (val, idx) {
                    return val;
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
            if (!this.gdItem.rowClickHandler)
                this.gdItem.rowClickHandler = dojo.connect(this.gdItem, 'onRowClick', dojote.thitch(this, function (e) {
                    var items = e.grid.selection.getSelected();
                    if (items && items.length) {
                        if (this.docBarangDetailer && items[0].id) {
                            this.docBarangDetailer.set('data', {
                                barang:items[0].nama,
                                merk:items[0].merk,
                                satuan:items[0].satuan,
                                jumlah:items[0].jumlah,
                                harga:dojo.number.format((items[0].cif / items[0].jumlah), {pattern:'#,###.##'})
                            })
                        }

                        if (items[0].barang_id) {
                            dojote.dijitByName('barang_nama').setValueId(items[0].barang_id);
                            console.log('publishing event message')
                            dojo.publish('onRequestSaldoBarangSider', [
                                {id:items[0].barang_id}
                            ])

                        } else {
                            dojo.publish('onRequestSaldoBarangSider', [
                                {destroy:true}
                            ])
                            dojote.dijitByName('barang_nama').clearValue();
                        }
                    }
                    dojote.dijitByName('barang_nama').focus();
                }))
        },
        prepareBrgDetailer:function () {
            this.mapHeaderDetailer = new lib.DetailView({}, 'docDetail');
        },
        prepareDocDetailer:function () {
            this.docBarangDetailer = new lib.DetailView({}, 'detailBarangDokumen');
        }

    }
    singleton.init();
    return singleton;
})

