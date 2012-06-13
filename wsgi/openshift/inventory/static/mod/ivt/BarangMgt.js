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
    'lib/CustomDatebox',
    'lib/CustomButton',
    'lib/LookupParam'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            dojo.subscribe('onMenuDaftarBarang', dojo.hitch(this, 'prepareFormBarang'));
            dojo.subscribe('onMenuPencarianBarang', dojo.hitch(this, 'prepareFormPencarianBarang'));
            dojo.subscribe('onMenuSaldoBarang', dojo.hitch(this, 'setupSaldoBarang'));
            dojo.subscribe('onMenuUploadBarang', dojo.hitch(this, 'prepareFormPencarianBarang'));
            dojo.subscribe('onRequestSaldoBarangSider', dojo.hitch(this, 'prepareSaldoBarangSider'));
        },
        //========================================
        //Sub rutin pencarian Barang
        //========================================
        //
        setImage:function () {
            if (dojote.cekWidget(this.formUpload) && this.formUpload.uploadImage) {
                this.formUpload.uploadImage.innerHTML = "";
                var img = dojo.doc.createElement('img');
                img.src = '../site_media/folder_gambar_barang/' +
                    dojote.lpad(this.formUpload.txtId.value, 6, '0') + '.jpg?k=' + dojote.getUuid();
                this.formUpload.uploadImage.appendChild(img)
            }
        },
        prepareFormUploadBarang:function (arg) {
            var arg = (arg) ? arg : {};
            if (!dojote.cekWidget(this.formUpload)) {
                this.formUpload = tabUtil.putinTab('Upload', 'loading upload barang...');
            }
            dojote.callXhrJsonPost('/inventory/barang/', {c:'formupload'}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.formUpload)) {
                    this.formUpload.set('content', res.html);
                    var ifr = dojo.byId('tes');
                    this.formUpload.btnKirimFile = dojo.query('.btnKirimFile', this.formUpload.domNode)[0];
                    this.formUpload.uploadStatus = dojo.query('.uploadStatus', this.formUpload.domNode)[0];
                    this.formUpload.uploadImage = dojo.query('.uploadImage', this.formUpload.domNode)[0];
                    this.formUpload.txtId = dojote.byName('id', this.formUpload.domNode);
                    this.formUpload.txtId.value = arg.id;
                    this.setImage();
                    if (!this.formUpload.btnKirimFileClickListener) {
                        this.formUpload.btnKirimFileClickListener =
                            dojo.connect(this.formUpload.btnKirimFile, 'onclick', dojo.hitch(this, function (e) {
                                this.formUpload.btnKirimFile.disabled = true;
                                this.formUpload.uploadStatus.innerHTML = "Mohon tunggu sedang mengirim file";
                            }))
                    }
                    if (!this.formUpload.iframeLoad)
                        this.formUpload.iframeLoad = dojo.connect(ifr, 'onload', dojo.hitch(this, function () {
                            var ifr = dojo.byId('tes');
                            var teks = ifr.contentWindow.document.body.innerHTML;
                            if (teks.indexOf('sukses') != -1) {

                                this.formUpload.uploadStatus.innerHTML = "Upload file berhasil";
                                this.formUpload.btnKirimFile.disabled = false;
                                var jresult = dojo.fromJson(teks);
                                this.setImage();
                                ifr.contentWindow.document.body.innerHTML = "";

                            } else {
                                this.formUpload.uploadStatus.innerHTML = teks;
                            }
                            ifr.contentWindow.document.body.innerHTML = "";
                        }))
                }
            }))
        },
        //========================================
        //Sub rutin pencarian Barang
        //========================================
        //
        setupSaldoBarang:function () {
            this.prepareFormPencarianBarang({sider:'saldo', nocrud:true, detail:'view'});
        },
        //========================================
        //Sub rutin pencarian Barang
        //========================================
        //
        prepareFormPencarianBarang:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formPencarianBarang)) {
                if (!arg.layer) {
                    this.formPencarianBarang = tabUtil.putinFirstTab('Lookup Barang', 'loading form pencarian barang,...');
                } else {
                    this.formPencarianBarang = tabUtil.putinTab('Lookup Barang', 'loading form pencarian barang,...');
                }
                this.formPencarianBarang.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performPencarian(false, this.formPencarianBarang.lookupParam);
                }));
                dojote.callXhrPost('/inventory/barang/', {c:'formpencarianbarang'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formPencarianBarang)) {
                        this.formPencarianBarang.set('content', res);
                        this.prepareGridHasilPencarian()
                        this.performPencarian(true)
                        this.manageCrudButton();
                    }
                }))
                this.formPencarianBarang.openArg = arg;
            } else {
                dojote.clearSideMainPane();
                this.formPencarianBarang.openArg = arg;
                tabUtil.selectTab(this.formPencarianBarang);
                //TODO jote periksa apakah implementasi manage crud button cukup aman dengan
                //re connection event
                //display none
                this.manageCrudButton();
                this.selectGrid();
            }
        },
        selectGrid:function () {
            if (dojote.cekWidget(this.gdHasilPencarian)) {
                this.onGdHasilPencarianRowClick({grid:this.gdHasilPencarian});
            }
        },
        onGdHasilPencarianRowClick:function (e) {
            var items = e.grid.selection.getSelected();
            if (items.length && items[0].id) {
                if ('sider' == this.formPencarianBarang.openArg.sider)
                    this.prepareBarangSider(items[0].id)
                else if ('saldo' == this.formPencarianBarang.openArg.sider)
                    this.prepareSaldoBarangSider({id:items[0].id})
            }
        },
        onGdHasilPencarianRowDblClick:function (e) {
            var items = e.grid.selection.getSelected();
            if (items.length && items[0].id) {
                if ('upload' == this.formPencarianBarang.openArg.detail)
                    this.prepareFormUploadBarang({layer:true, id:items[0].id})

            }
        },
        prepareGridHasilPencarian:function () {
            if (!dojote.cekWidget(this.gdHasilPencarian)) {
                var barangLayout = [
                    {field:'nama', name:'Nama', width:'80%', formatter:dojo.hitch(this, this.formatListBarang)},
                    {field:'kode', name:'Kode', width:'20%', formatter:dojo.hitch(this, function (val, idx) {
                        return val;
                    })}

                ];
                this.gdHasilPencarian = new dojox.grid.DataGrid({
                    store:null, id:'gdHasilPencarian',
                    structure:barangLayout
                }, dojo.query('.dicHasilPencarian')[0]);

                this.gdHasilPencarian.startup();
                if (!this.formPencarianBarang.gdResultClick)
                    this.formPencarianBarang.gdResultClick = dojo.connect(
                        this.gdHasilPencarian, 'onRowClick', dojo.hitch(this, this.onGdHasilPencarianRowClick));
                if (!this.formPencarianBarang.gdResultDblClick)
                    this.formPencarianBarang.gdResultDblClick = dojo.connect(
                        this.gdHasilPencarian, 'onRowDblClick', dojo.hitch(this, this.onGdHasilPencarianRowDblClick));

            }
        },
        performPencarian:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'pencarianbarang', init:true, n:30} :
                dojo.mixin(param, {c:'pencarianbarang', n:30});
            dojote.callXhrJsonPost('/inventory/barang/',
                param,
                dojo.hitch(this, this.renderHasilPencarian))
        },
        renderHasilPencarian:function (data) {
            var psOs = new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:data.data})});
            if (dojote.cekWidget(this.gdHasilPencarian)) {
                var menuStore = new dojo.store.Memory({data:data.data});
                this.gdHasilPencarian.setStore(new dojo.data.ObjectStore({objectStore:menuStore}));
            }
        },
        formatListBarang:function (val, idx) {
            var brs = this.gdHasilPencarian.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.merk + '</div>';
        },
        prepareSaldoBarangSider:function (arg) {
            var arg = (arg) ? arg : {};
            if (arg.destroy) {
                if (dojote.cekWidget(this.saldoBarangSider))
                    this.saldoBarangSider.destroyRecursive();
                return;
            }
            if (!dojote.cekWidget(this.saldoBarangSider)) {
                this.saldoBarangSider = dojote.preparePortlet('Saldo Barang', 2, 'Loading Informasi Saldo Barang ...');
            }
            if (arg.id)
                dojote.callXhrJsonPost('/inventory/barang/', {c:'sidesaldo', barang_id:arg.id}, dojo.hitch(this, function (res) {
                    if (dojote.cekWidget(this.saldoBarangSider)) {
                        this.saldoBarangSider.set('content', res.html);
                    }
                }))
        },
        prepareBarangSider:function (id) {
            if (!dojote.cekWidget(this.barangSider)) {
                this.barangSider = dojote.preparePortlet('Barang', 2, 'Loading Informasi  Barang ...');
            }
            dojote.callXhrJsonPost('/inventory/barang/', {c:'barangsider', id:id}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.barangSider)) {
                    this.barangSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newBarang');
            //check if the event already connected, don;t connect it twice
            if (btnnew && !this.formPencarianBarang.btnNewClick) {
                this.formPencarianBarang.btnNewClick = dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarBarang', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupBarang');
            if (btnlookup && !this.btnLookupClic) {
                this.formPencarianBarang.btnLookupClick = dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    accordUtil.openLookup([
                        {field:'par_nama', name:'Nama', type:'teks'},
                        {field:'par_merk', name:'Merk', type:'teks'},
                        {field:'par_kode', name:'Kode', type:'teks'}
                    ], dojo.hitch(this, function (params) {
                        this.performPencarian(false, params);
                        this.formPencarianBarang.lookupParam = params;
                    }));
                }))
            }
            var btnrefresh = dojo.byId('lookupBarang');
            if (btnrefresh && !this.formPencarianBarang.btnrefreshClick) {
                this.formPencarianBarang.btnrefreshClick = dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performPencarian(false, this.formPencarianBarang.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showBarang');
            if (btnshow && !this.formPencarianBarang.btnShowClick) {
                this.formPencarianBarang.btnShowClick = dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilPencarian.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarBarang', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu barang dari daftar barang yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editBarang');
            if (btnedit && !this.formPencarianBarang.btnEditClick) {
                this.formPencarianBarang.btnEditClick = dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilPencarian.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarBarang', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu barang dari daftar barang yang tersedia', 'fatal')
                    }
                }))
            }
            var display = (this.formPencarianBarang.openArg.nocrud) ? "none" : "inline-block";
            dojo.style(btnedit, 'display', display);
            dojo.style(btnnew, 'display', display);
            //dojo.style(btndel,'display',display);
        },
//========================================
//Sub rutin Form Barang
//========================================
//
        prepareFormBarang:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            this.formBarang = tabUtil.putinTab('Barang Mgt', 'loading form barang');
            var param = {c:'formbarang'};
            if ('edit-show'.indexOf(arg.mode) != -1) {
                var param = dojo.mixin(param, {'id':arg.id})
            }
            dojote.callXhrJsonPost('/inventory/barang/', param, dojo.hitch(this, function (res) {
                if (tabUtil.cekTab(this.formBarang)) {
                    this.formBarang.set('content', res.html);
                    this.manageFormBarangButton(arg.mode);
                    if (res.data) {
                        dijit.byId('formBarang').setFormValues(res.data)
                    }
                }
            }))
        },
        manageFormBarangButton:function (mode) {
            dojo.connect(dojo.byId('btnSimpanBarang'), 'onclick', dojo.hitch(this, function () {
                dojote.callXhrJsonPost('/inventory/barang/', dojo.mixin(dijit.byId('formBarang').gatherFormValues(), {c:'simpanbarang'}),
                    dojo.hitch(this, function (res) {
                        this.formBarang.set('content', 'Penyimpanan data berhasil');
                        dojote.notify('Penyempanan data berhasil');
                    }))
            }));

            dojo.connect(dojo.byId('btnUpdateBarang'), 'onclick', dojo.hitch(this, function () {
                dojote.callXhrJsonPost('/inventory/barang/', dojo.mixin(dijit.byId('formBarang').gatherFormValues(), {c:'updatebarang'}),
                    dojo.hitch(this, function (res) {
                        this.formBarang.set('content', 'Update data berhasil');
                        dojote.notify('Update data berhasil');
                    }))
            }))


            var btnToKeep = [
                {mode:'new', btn:'btnSimpanBarang'},
                {mode:'edit', btn:'btnUpdateBarang'},
                {mode:'del', btn:'btnHapusBarang'}
            ]
            btnToKeep.forEach(function (tpl) {
                if (tpl.mode != mode) {
                    dijit.byId(tpl.btn).destroy();
                }
            })
        },
//========================================
//Sub rutin Lookup Barang
//========================================
//
        prepareFormLookupBarang:function (destroy, invade) {
            if (invade) {
                dojote.clearSideMainPane();
            }
            if (!dojote.cekWidget(this.lookupForm)) {
                this.lookupForm = dojote.preparePortlet('Lookup', 2, 'Loading lookup barang');
            }
            var lovBarang = new lib.LovLookup({url:'/inventory/barang/'});
            lovBarang.set('lookupParam', {c:'lookupbarang'})
            this.lookupForm.set('content', lovBarang);
        }
    }
    singleton.init();
    return singleton;
})