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
    'lib/LookupParam'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            dojo.subscribe('onMenuDaftarSupplier', dojo.hitch(this, 'prepareFormSupplier'));
            dojo.subscribe('onMenuPencarianSupplier', dojo.hitch(this, 'prepareFormPencarianSupplier'));
        },
        //========================================
        //Sub rutin pencarian Supplier
        //========================================
        //
        prepareFormPencarianSupplier:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formPencarianSupplier)) {
                this.formPencarianSupplier = tabUtil.putinFirstTab('Lookup Supplier', 'loading form pencarian supplier,...');
                this.formPencarianSupplier.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performPencarian(false, this.formPencarianSupplier.lookupParam);
                }));
                dojote.callXhrPost('/inventory/supplier/', {c:'formpencariansupplier'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formPencarianSupplier)) {
                        this.formPencarianSupplier.set('content', res);
                        this.prepareGridHasilPencarian()
                        this.performPencarian(true)
                        this.manageCrudButton();
                    }
                }))
            } else {
                tabUtil.selectTab(this.formPencarianSupplier);
            }
            this.formPencarianSupplier.openArg = arg;

        },
        prepareGridHasilPencarian:function () {
            if (!dojote.cekWidget(this.gdHasilPencarian)) {
                var supplierLayout = [
                    {field:'nama', name:'Nama', width:'85%', formatter:dojo.hitch(this, this.formatListSupplier)},
                    {field:'telp', name:'Telp', width:'15%', formatter:dojo.hitch(this, function (val, idx) {
                        return '<div  style="text-align: center;font:12px verdana">' +
                            '' + this.gdHasilPencarian.getItem(idx).area + '-' + val +
                            '</div>';
                    })}
                ];
                this.gdHasilPencarian = new dojox.grid.DataGrid({
                    store:null, id:'gdHasilPencarian',
                    structure:supplierLayout
                }, dojo.query('.dicHasilPencarian')[0]);

                this.gdHasilPencarian.startup();
                dojo.connect(this.gdHasilPencarian, 'onRowClick', dojo.hitch(this, function (e) {
                    var items = e.grid.selection.getSelected();
                    if (items.length && items[0].id) {
                        this.prepareSupplierSider(items[0].id)
                    }
                }));
            }
        },
        performPencarian:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'pencariansupplier', init:true, n:30} :
                dojo.mixin(param, {c:'pencariansupplier', n:30});
            dojote.callXhrJsonPost('/inventory/supplier/',
                param,
                dojo.hitch(this, this.renderHasilPencarian))
        },
        renderHasilPencarian:function (data) {
            var psOs = new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:data.data})});
            if (dojote.cekWidget(this.gdHasilPencarian)) {
                var menuStore = new dojo.store.Memory({data:data.data});
                this.gdHasilPencarian.setStore(new dojo.data.ObjectStore({objectStore:menuStore}));
            }
        }, formatListSupplier:function (val, idx) {
            var brs = this.gdHasilPencarian.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.alamat + '</div>';
        },
        prepareSupplierSider:function (pasId) {
            if (!dojote.cekWidget(this.supplierSider)) {
                this.supplierSider = dojote.preparePortlet('Supplier', 2, 'Loading Informasi Supplier ...');
            }
            dojote.callXhrJsonPost('/inventory/supplier/', {c:'suppliersider', id:pasId}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.supplierSider)) {
                    this.supplierSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newSupplier');
            if (btnnew) {
                dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarSupplier', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupSupplier');
            if (btnlookup) {
                dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    accordUtil.openLookup([
                        {field:'par_nama', name:'Nama', type:'teks'},
                        {field:'par_alamat', name:'Alamat', type:'teks'}
                    ], dojo.hitch(this, function (params) {
                        this.performPencarian(false, params);
                        this.formPencarianSupplier.lookupParam = params;
                    }));
                }))
            }
            var btnrefresh = dojo.byId('lookupSupplier');
            if (btnrefresh) {
                dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performPencarian(false, this.formPencarianSupplier.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showSupplier');
            if (btnshow) {
                dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilPencarian.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarSupplier', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu supplier dari daftar supplier yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editSupplier');
            if (btnedit) {
                dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilPencarian.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarSupplier', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu supplier dari daftar supplier yang tersedia', 'fatal')
                    }
                }))
            }
            if (this.formPencarianSupplier.openArg.nocrud) {
                var display = (this.formPencarianSupplier.openArg.nocrud) ? "none" : "inline-block";
                dojo.style(btnedit, 'display', display);
                dojo.style(btnnew, 'display', display);
                //dojo.style(btndel,'display',display);
            }
        },
        //========================================
        //Sub rutin Form Supplier
        //========================================
        //
        prepareFormSupplier:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            this.formSupplier = tabUtil.putinTab('Supplier Mgt', 'loading form supplier');
            var param = {c:'formsupplier'};
            if ('edit-show'.indexOf(arg.mode) != -1) {
                var param = dojo.mixin(param, {'id':arg.id})
            }
            dojote.callXhrJsonPost('/inventory/supplier/', param, dojo.hitch(this, function (res) {
                if (tabUtil.cekTab(this.formSupplier)) {
                    this.formSupplier.set('content', res.html);
                    this.manageFormSupplierButton(arg.mode);
                    if (res.data) {
                        dijit.byId('formSupplier').setFormValues(res.data)
                    }
                }
            }))
        },
        manageFormSupplierButton:function (mode) {
            dojo.connect(dojo.byId('btnSimpanSupplier'), 'onclick', dojo.hitch(this, function () {
                dojote.callXhrJsonPost('/inventory/supplier/', dojo.mixin(dijit.byId('formSupplier').gatherFormValues(), {c:'simpansupplier'}),
                    dojo.hitch(this, function (res) {
                        this.formSupplier.set('content', 'Penyimpanan data berhasil');
                        dojote.notify('Penyempanan data berhasil');
                    }))
            }));

            dojo.connect(dojo.byId('btnUpdateSupplier'), 'onclick', dojo.hitch(this, function () {
                dojote.callXhrJsonPost('/inventory/supplier/', dojo.mixin(dijit.byId('formSupplier').gatherFormValues(), {c:'simpansupplier'}),
                    dojo.hitch(this, function (res) {
                        this.formSupplier.set('content', 'Update data berhasil');
                        dojote.notify('Update data berhasil');
                    }))
            }))


            var btnToKeep = [
                {mode:'new', btn:'btnSimpanSupplier'},
                {mode:'edit', btn:'btnUpdateSupplier'},
                {mode:'del', btn:'btnHapusSupplier'}
            ]
            btnToKeep.forEach(function (tpl) {
                if (tpl.mode != mode) {
                    dijit.byId(tpl.btn).destroy();
                }
            })
        },
        //========================================
        //Sub rutin Lookup Supplier
        //========================================
        //
        prepareFormLookupSupplier:function (destroy, invade) {
            if (invade) {
                dojote.clearSideMainPane();
            }
            if (!dojote.cekWidget(this.lookupForm)) {
                this.lookupForm = dojote.preparePortlet('Lookup', 2, 'Loading lookup supplier');
            }
            var lovSupplier = new lib.LovLookup({url:'/inventory/supplier/'});
            lovSupplier.set('lookupParam', {c:'lookupsupplier'})
            this.lookupForm.set('content', lovSupplier);
        }
    }
    singleton.init();
    return singleton;
})