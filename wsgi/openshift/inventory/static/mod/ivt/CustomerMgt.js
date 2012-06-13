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
            dojo.subscribe('onMenuDaftarCustomer', dojo.hitch(this, 'prepareFormCustomer'));
            dojo.subscribe('onMenuPencarianCustomer', dojo.hitch(this, 'prepareFormPencarianCustomer'));
        },
        //========================================
        //Sub rutin pencarian Customer
        //========================================
        //
        prepareFormPencarianCustomer:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formPencarianCustomer)) {
                this.formPencarianCustomer = tabUtil.putinFirstTab('Lookup Customer', 'loading form pencarian customer,...');
                this.formPencarianCustomer.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performPencarian(false, this.formPencarianCustomer.lookupParam);
                }));
                dojote.callXhrPost('/inventory/customer/', {c:'formpencariancustomer'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formPencarianCustomer)) {
                        this.formPencarianCustomer.set('content', res);
                        this.prepareGridHasilPencarian()
                        this.performPencarian(true)
                        this.manageCrudButton();
                    }
                }))
            } else {
                tabUtil.selectTab(this.formPencarianCustomer);
            }
            this.formPencarianCustomer.openArg = arg;

        },
        prepareGridHasilPencarian:function () {
            if (!dojote.cekWidget(this.gdHasilPencarian)) {
                var customerLayout = [
                    {field:'nama', name:'Nama', width:'85%', formatter:dojo.hitch(this, this.formatListCustomer)},
                    {field:'telp', name:'Telp', width:'15%', formatter:dojo.hitch(this, function (val, idx) {
                        return '<div  style="text-align: center;font:12px verdana">' +
                            '' + this.gdHasilPencarian.getItem(idx).area + '-' + val +
                            '</div>';
                    })}
                ];
                this.gdHasilPencarian = new dojox.grid.DataGrid({
                    store:null, id:'gdHasilPencarian',
                    structure:customerLayout
                }, dojo.query('.dicHasilPencarian')[0]);

                this.gdHasilPencarian.startup();
                dojo.connect(this.gdHasilPencarian, 'onRowClick', dojo.hitch(this, function (e) {
                    var items = e.grid.selection.getSelected();
                    if (items.length && items[0].id) {
                        this.prepareCustomerSider(items[0].id)
                    }
                }));
            }
        },
        performPencarian:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'pencariancustomer', init:true, n:30} :
                dojo.mixin(param, {c:'pencariancustomer', n:30});
            dojote.callXhrJsonPost('/inventory/customer/',
                param,
                dojo.hitch(this, this.renderHasilPencarian))
        },
        renderHasilPencarian:function (data) {
            var psOs = new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:data.data})});
            if (dojote.cekWidget(this.gdHasilPencarian)) {
                var menuStore = new dojo.store.Memory({data:data.data});
                this.gdHasilPencarian.setStore(new dojo.data.ObjectStore({objectStore:menuStore}));
            }
        }, formatListCustomer:function (val, idx) {
            var brs = this.gdHasilPencarian.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.alamat + '</div>';
        },
        prepareCustomerSider:function (pasId) {
            if (!dojote.cekWidget(this.customerSider)) {
                this.customerSider = dojote.preparePortlet('Customer', 2, 'Loading Informasi Customer ...');
            }
            dojote.callXhrJsonPost('/inventory/customer/', {c:'customersider', id:pasId}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.customerSider)) {
                    this.customerSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newCustomer');
            if (btnnew) {
                dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarCustomer', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupCustomer');
            if (btnlookup) {
                dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    accordUtil.openLookup([
                        {field:'par_nama', name:'Nama', type:'teks'},
                        {field:'par_alamat', name:'Alamat', type:'teks'}
                    ], dojo.hitch(this, function (params) {
                        this.performPencarian(false, params);
                        this.formPencarianCustomer.lookupParam = params;
                    }));
                }))
            }
            var btnrefresh = dojo.byId('lookupCustomer');
            if (btnrefresh) {
                dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performPencarian(false, this.formPencarianCustomer.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showCustomer');
            if (btnshow) {
                dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilPencarian.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarCustomer', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu customer dari daftar customer yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editCustomer');
            if (btnedit) {
                dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilPencarian.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarCustomer', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu customer dari daftar customer yang tersedia', 'fatal')
                    }
                }))
            }
            if (this.formPencarianCustomer.openArg.nocrud) {
                var display = (this.formPencarianCustomer.openArg.nocrud) ? "none" : "inline-block";
                dojo.style(btnedit, 'display', display);
                dojo.style(btnnew, 'display', display);
                //dojo.style(btndel,'display',display);
            }
        },
        //========================================
        //Sub rutin Form Customer
        //========================================
        //
        prepareFormCustomer:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            this.formCustomer = tabUtil.putinTab('Customer Mgt', 'loading form customer');
            var param = {c:'formcustomer'};
            if ('edit-show'.indexOf(arg.mode) != -1) {
                var param = dojo.mixin(param, {'id':arg.id})
            }
            dojote.callXhrJsonPost('/inventory/customer/', param, dojo.hitch(this, function (res) {
                if (tabUtil.cekTab(this.formCustomer)) {
                    this.formCustomer.set('content', res.html);
                    this.manageFormCustomerButton(arg.mode);
                    if (res.data) {
                        dijit.byId('formCustomer').setFormValues(res.data)
                    }
                }
            }))
        },
        manageFormCustomerButton:function (mode) {
            dojo.connect(dojo.byId('btnSimpanCustomer'), 'onclick', dojo.hitch(this, function () {
                dojote.callXhrJsonPost('/inventory/customer/', dojo.mixin(dijit.byId('formCustomer').gatherFormValues(), {c:'simpancustomer'}),
                    dojo.hitch(this, function (res) {
                        this.formCustomer.set('content', 'Penyimpanan data berhasil');
                        dojote.notify('Penyempanan data berhasil');
                    }))
            }));

            dojo.connect(dojo.byId('btnUpdateCustomer'), 'onclick', dojo.hitch(this, function () {
                dojote.callXhrJsonPost('/inventory/customer/', dojo.mixin(dijit.byId('formCustomer').gatherFormValues(), {c:'simpancustomer'}),
                    dojo.hitch(this, function (res) {
                        this.formCustomer.set('content', 'Update data berhasil');
                        dojote.notify('Update data berhasil');
                    }))
            }))


            var btnToKeep = [
                {mode:'new', btn:'btnSimpanCustomer'},
                {mode:'edit', btn:'btnUpdateCustomer'},
                {mode:'del', btn:'btnHapusCustomer'}
            ]
            btnToKeep.forEach(function (tpl) {
                if (tpl.mode != mode) {
                    dijit.byId(tpl.btn).destroy();
                }
            })
        },
        //========================================
        //Sub rutin Lookup Customer
        //========================================
        //
        prepareFormLookupCustomer:function (destroy, invade) {
            if (invade) {
                dojote.clearSideMainPane();
            }
            if (!dojote.cekWidget(this.lookupForm)) {
                this.lookupForm = dojote.preparePortlet('Lookup', 2, 'Loading lookup customer');
            }
            var lovCustomer = new lib.LovLookup({url:'/inventory/customer/'});
            lovCustomer.set('lookupParam', {c:'lookupcustomer'})
            this.lookupForm.set('content', lovCustomer);
        }
    }

    singleton.init();
    return singleton;
})