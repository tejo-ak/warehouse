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
    'lib/Greditor',
    'lib/LookupParam'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
//            dojo.subscribe('onMenuDaftarPartner', dojo.hitch(this, 'prepareFormPartner'));
            dojo.subscribe('onMenuPartnerBrowse', dojo.hitch(this, 'prepareFormPencarianPartner'));
        },
        //========================================
        //Sub rutin pencarian Partner
        //========================================
        //
        prepareFormPencarianPartner:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formPencarianPartner)) {
                this.formPencarianPartner = tabUtil.putinFirstTab('Lookup Partner', 'loading form pencarian partner,...');
                this.formPencarianPartner.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performPencarian(false, this.formPencarianPartner.lookupParam);
                }));
                dojote.callXhrPost('/inventory/partner/', {c:'formpencarianpartner'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formPencarianPartner)) {
                        this.formPencarianPartner.set('content', res);
                        this.prepareGrid()
//                        this.performPencarian(true)
//                        this.manageCrudButton();
                    }
                }))
            } else {
                tabUtil.selectTab(this.formPencarianPartner);
            }
            this.formPencarianPartner.openArg = arg;

        },
        prepareGrid:function () {
            if (!dojote.cekWidget(this.gdPartner)) {
                var partnerLayout = [
                    {field:'nama', name:'Nama', width:'85%', formatter:dojo.hitch(this, this.formatListPartner)},
                    {field:'telp', name:'Telp', width:'15%', formatter:dojo.hitch(this, function (val, idx) {
                        return '<div  style="text-align: center;font:12px verdana">' +
                            '' + this.gdPartner.getItem(idx).area + '-' + val +
                            '</div>';
                    })}
                ];
                this.gdPartner = new lib.Greditor({
                    store:null, id:'gdPartner',
                    structure:partnerLayout
                }, dojo.query('.dicHasilPencarian', this.formPencarianPartner.domNode)[0]);

//                this.gdPartner.startup();
//                dojo.connect(this.gdPartner, 'onRowClick', dojo.hitch(this, function (e) {
//                    var items = e.grid.selection.getSelected();
//                    if (items.length && items[0].id) {
//                        this.preparePartnerSider(items[0].id)
//                    }
//                }));
            }
        },
        performPencarian:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'pencarianpartner', init:true, n:30} :
                dojo.mixin(param, {c:'pencarianpartner', n:30});
            dojote.callXhrJsonPost('/inventory/partner/',
                param,
                dojo.hitch(this, this.renderHasilPencarian))
        },
        renderHasilPencarian:function (data) {
            var psOs = new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:data.data})});
            if (dojote.cekWidget(this.gdPartner)) {
                var menuStore = new dojo.store.Memory({data:data.data});
                this.gdPartner.setStore(new dojo.data.ObjectStore({objectStore:menuStore}));
            }
        }, formatListPartner:function (val, idx) {
            var brs = this.gdPartner.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.alamat + '</div>';
        },
        preparePartnerSider:function (pasId) {
            if (!dojote.cekWidget(this.partnerSider)) {
                this.partnerSider = dojote.preparePortlet('Partner', 2, 'Loading Informasi Partner ...');
            }
            dojote.callXhrJsonPost('/inventory/partner/', {c:'partnersider', id:pasId}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.partnerSider)) {
                    this.partnerSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newPartner');
            if (btnnew) {
                dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarPartner', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupPartner');
            if (btnlookup) {
                dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    accordUtil.openLookup([
                        {field:'par_nama', name:'Nama', type:'teks'},
                        {field:'par_alamat', name:'Alamat', type:'teks'}
                    ], dojo.hitch(this, function (params) {
                        this.performPencarian(false, params);
                        this.formPencarianPartner.lookupParam = params;
                    }));
                }))
            }
            var btnrefresh = dojo.byId('lookupPartner');
            if (btnrefresh) {
                dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performPencarian(false, this.formPencarianPartner.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showPartner');
            if (btnshow) {
                dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdPartner.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarPartner', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu partner dari daftar partner yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editPartner');
            if (btnedit) {
                dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdPartner.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarPartner', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu partner dari daftar partner yang tersedia', 'fatal')
                    }
                }))
            }
            if (this.formPencarianPartner.openArg.nocrud) {
                var display = (this.formPencarianPartner.openArg.nocrud) ? "none" : "inline-block";
                dojo.style(btnedit, 'display', display);
                dojo.style(btnnew, 'display', display);
                //dojo.style(btndel,'display',display);
            }
        },
        //========================================
        //Sub rutin Form Partner
        //========================================
        //
        prepareFormPartner:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                tabUtil.clearAll();
            }
            this.formPartner = tabUtil.putinTab('Partner Mgt', 'loading form partner');
            var param = {c:'formpartner'};
            if ('edit-show'.indexOf(arg.mode) != -1) {
                var param = dojo.mixin(param, {'id':arg.id})
            }
            dojote.callXhrJsonPost('/inventory/partner/', param, dojo.hitch(this, function (res) {
                if (tabUtil.cekTab(this.formPartner)) {
                    this.formPartner.set('content', res.html);
                    this.manageFormPartnerButton(arg.mode);
                    if (res.data) {
                        dijit.byId('formPartner').setFormValues(res.data)
                    }
                }
            }))
        },
        manageFormPartnerButton:function (mode) {
            dojo.connect(dojo.byId('btnSimpanPartner'), 'onclick', dojo.hitch(this, function () {
                dojote.callXhrJsonPost('/inventory/partner/', dojo.mixin(dijit.byId('formPartner').gatherFormValues(), {c:'simpanpartner'}),
                    dojo.hitch(this, function (res) {
                        this.formPartner.set('content', 'Penyimpanan data berhasil');
                        dojote.notify('Penyempanan data berhasil');
                    }))
            }));

            dojo.connect(dojo.byId('btnUpdatePartner'), 'onclick', dojo.hitch(this, function () {
                dojote.callXhrJsonPost('/inventory/partner/', dojo.mixin(dijit.byId('formPartner').gatherFormValues(), {c:'simpanpartner'}),
                    dojo.hitch(this, function (res) {
                        this.formPartner.set('content', 'Update data berhasil');
                        dojote.notify('Update data berhasil');
                    }))
            }))


            var btnToKeep = [
                {mode:'new', btn:'btnSimpanPartner'},
                {mode:'edit', btn:'btnUpdatePartner'},
                {mode:'del', btn:'btnHapusPartner'}
            ]
            btnToKeep.forEach(function (tpl) {
                if (tpl.mode != mode) {
                    dijit.byId(tpl.btn).destroy();
                }
            })
        },
        //========================================
        //Sub rutin Lookup Partner
        //========================================
        //
        prepareFormLookupPartner:function (destroy, invade) {
            if (invade) {
                dojote.clearSideMainPane();
            }
            if (!dojote.cekWidget(this.lookupForm)) {
                this.lookupForm = dojote.preparePortlet('Lookup', 2, 'Loading lookup partner');
            }
            var lovPartner = new lib.LovLookup({url:'/inventory/partner/'});
            lovPartner.set('lookupParam', {c:'lookuppartner'})
            this.lookupForm.set('content', lovPartner);
        }
    }

    singleton.init();
    return singleton;
})