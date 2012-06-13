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
    'lib/LookupParam',
    'mod/ivt/OpnameMgt'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            dojo.subscribe('onMenuBrowseOpname', dojo.hitch(this, 'prepareFormBrowseOpname'));
        },

        //========================================
        //Sub rutin browse Opname
        //========================================
        //
        prepareFormBrowseOpname:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formBrowseOpname)) {
                this.formBrowseOpname = tabUtil.putinFirstTab('Lookup Opname', 'loading form browse opname,...');
                this.formBrowseOpname.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performBrowse(false, this.formBrowseOpname.lookupParam);
                }));
                dojote.callXhrPost('/inventory/opname/', {c:'formbrowseopname'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formBrowseOpname)) {
                        this.formBrowseOpname.set('content', res);
                        this.prepareGridHasilBrowse()
                        this.performBrowse(false, {par_status:arg.status})
                        this.formBrowseOpname.status = arg.status
                        this.manageCrudButton();
                        this.formBrowseOpname.openArg = arg;
                        console.log('observer arg')
                        console.log(arg)
                    }
                }))
                this.formBrowseOpname.openArg = arg;
            } else {
                if (this.formBrowseOpname.status != arg.status) {
                    //status berubah, perlu query ulang
                    this.performBrowse(false, {par_status:arg.status});
                    this.formBrowseOpname.lookupParam = {par_status:arg.status};
                    this.formBrowseOpname.status = arg.status
                }
                dojote.clearSideMainPane();
                this.formBrowseOpname.openArg = arg;
                tabUtil.closeAfterTab(this.formBrowseOpname);
                this.manageCrudButton();
                this.selectGrid();
            }
        },
        selectGrid:function () {
            if (dojote.cekWidget(this.gdHasilBrowse)) {
                this.onGdHasilBrowseRowClick({grid:this.gdHasilBrowse});
            }
        },
        onGdHasilBrowseRowClick:function (e) {
            var items = e.grid.selection.getSelected();
            if (items.length && items[0] && items[0].id) {
                if ('sider' == this.formBrowseOpname.openArg.sider) {
                }
                //this.prepareOpnameSider(items[0].id)
                else if ('saldo' == this.formBrowseOpname.openArg.sider) {
                }
                //this.prepareSaldoOpnameSider(items[0].id)
            }
        },
        onGdHasilBrowseRowDblClick:function (e) {
            var items = e.grid.selection.getSelected();
            var mode = (1 == items[0].status) ? "edit" : (2 == items[0].status) ? "view" : "";
            if (items.length && items[0].id) {
                if ('edit-view'.indexOf(mode) != -1)
                    dojo.publish('onMenuOpname', [
                        {layer:true, id:items[0].id, mode:mode}
                    ])

            }
        },
        prepareGridHasilBrowse:function () {
            if (!dojote.cekWidget(this.gdHasilBrowse)) {
                var opnameLayout = [
                    {field:'nomor', name:'Nomor Opname', width:'80%', formatter:dojo.hitch(this, function (val, idx) {
                        var brs = this.gdHasilBrowse.getItem(idx);
                        return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                            val + '</div><div>' +
                            ((brs.tanggal) ? dojote.toDate(brs.tanggal) : '-') + '</div>';
                    })} ,
                    {field:'status', name:'Status', width:'20%', formatter:dojo.hitch(function (val, idx) {
                        return (1 == val) ? 'Draft' : (2 == val) ? 'Finished' : '';
                    }) }

                ];
                this.gdHasilBrowse = new dojox.grid.DataGrid({
                    store:null, id:'gdHasilBrowse',
                    structure:opnameLayout
                }, dojo.query('.dicBrowse')[0]);

                this.gdHasilBrowse.startup();
                if (!this.formBrowseOpname.gdResultClick)
                    this.formBrowseOpname.gdResultClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowClick', dojo.hitch(this, this.onGdHasilBrowseRowClick));
                if (!this.formBrowseOpname.gdResultDblClick)
                    this.formBrowseOpname.gdResultDblClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowDblClick', dojo.hitch(this, this.onGdHasilBrowseRowDblClick));

            }
        },
        performBrowse:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'browseopname', init:true, n:30} :
                dojo.mixin(param, {c:'browseopname', n:30});
            dojote.callXhrJsonPost('/inventory/opname/',
                param,
                dojo.hitch(this, this.renderHasilBrowse))
        },
        renderHasilBrowse:function (data) {
            var psOs = new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:data.data})});
            if (dojote.cekWidget(this.gdHasilBrowse)) {
                var menuStore = new dojo.store.Memory({data:data.data});
                this.gdHasilBrowse.setStore(new dojo.data.ObjectStore({objectStore:menuStore}));
            }
        },
        formatListOpname:function (val, idx) {
            var brs = this.gdHasilBrowse.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.alamat + '</div>';
        },

        prepareOpnameSider:function (id) {
            if (!dojote.cekWidget(this.opnameSider)) {
                this.opnameSider = dojote.preparePortlet('Opname', 2, 'Loading Informasi  Opname ...');
            }
            dojote.callXhrJsonPost('/inventory/opname/', {c:'opnamesider', id:id}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.opnameSider)) {
                    this.opnameSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newOpname');
            //check if the event already connected, don;t connect it twice
            if (btnnew && !this.formBrowseOpname.btnNewClick) {
                this.formBrowseOpname.btnNewClick = dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarOpname', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupOpname');
            if (btnlookup && !this.btnLookupClick) {
                this.formBrowseOpname.btnLookupClick = dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    var prm = accordUtil.openLookup([
                        {field:'par_nomor', name:'Nomor', type:'teks'},
                        {field:'par_tanggal', name:'Tanggal', type:'tanggalRange'},
                        {field:'par_status', name:'status', type:'hidden'}
                    ], dojo.hitch(this, function (params) {
                        this.performBrowse(false, params);
                        this.formBrowseOpname.lookupParam = params;
                    }));
                    prm.setValue(dojo.mixin(this.formBrowseOpname.lookupParam, {par_status:this.formBrowseOpname.status}))
                }))
            }
            var btnrefresh = dojo.byId('lookupOpname');
            if (btnrefresh && !this.formBrowseOpname.btnrefreshClick) {
                this.formBrowseOpname.btnrefreshClick = dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performBrowse(false, this.formBrowseOpname.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showOpname');
            if (btnshow && !this.formBrowseOpname.btnShowClick) {
                this.formBrowseOpname.btnShowClick = dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarOpname', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu opname dari daftar opname yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editOpname');
            if (btnedit && !this.formBrowseOpname.btnEditClick) {
                this.formBrowseOpname.btnEditClick = dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarOpname', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu opname dari daftar opname yang tersedia', 'fatal')
                    }
                }))
            }
            var display = (this.formBrowseOpname.openArg.nocrud) ? "none" : "inline-block";
            dojo.style(btnedit, 'display', display);
            dojo.style(btnnew, 'display', display);
            //dojo.style(btndel,'display',display);
        }
    }
    singleton.init();
    return singleton;
})