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
    'mod/ivt/BcdtMapMgt'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            dojo.subscribe('onMenuBroseBcdtmap', dojo.hitch(this, 'prepareFormBrowseBcdtmap'));
        },

        //========================================
        //Sub rutin browse Bcdtmap
        //========================================
        //
        prepareFormBrowseBcdtmap:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formBrowseBcdtmap)) {
                this.formBrowseBcdtmap = tabUtil.putinFirstTab('Lookup Bcdtmap', 'loading form browse bcdtmap,...');
                this.formBrowseBcdtmap.set('onAfterLayered', dojo.hitch(this, function (t) {
                    this.performBrowse(false, this.formBrowseBcdtmap.lookupParam);
                }));
                dojote.callXhrPost('/inventory/bcdt/', {c:'formbrowsebcdtmap'}, dojo.hitch(this, function (res) {
                    if (tabUtil.cekTab(this.formBrowseBcdtmap)) {
                        this.formBrowseBcdtmap.set('content', res);
                        this.prepareGridHasilBrowse()
                        this.performBrowse(false, {par_status:arg.status})
                        this.formBrowseBcdtmap.status = arg.status
                        this.manageCrudButton();
                        this.formBrowseBcdtmap.openArg = arg;
                    }
                }))
                this.formBrowseBcdtmap.openArg = arg;
            } else {
                if (this.formBrowseBcdtmap.status != arg.status) {
                    //status berubah, perlu query ulang
                    this.performBrowse(false, {par_status:arg.status});
                    this.formBrowseBcdtmap.lookupParam = {par_status:arg.status};
                    this.formBrowseBcdtmap.status = arg.status
                }
                dojote.clearSideMainPane();
                this.formBrowseBcdtmap.openArg = arg;
                tabUtil.closeAfterTab(this.formBrowseBcdtmap);
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
                if ('sider' == this.formBrowseBcdtmap.openArg.sider) {
                }
                //this.prepareBcdtmapSider(items[0].id)
                else if ('saldo' == this.formBrowseBcdtmap.openArg.sider) {
                }
                //this.prepareSaldoBcdtmapSider(items[0].id)
            }
        },
        onGdHasilBrowseRowDblClick:function (e) {
            var items = e.grid.selection.getSelected();
            if (items.length && items[0].id) {
                if ('edit-view'.indexOf(this.formBrowseBcdtmap.openArg.detail) != -1)
                    dojo.publish('onMenuBcdtMap', [
                        {layer:true, id:items[0].id, mode:this.formBrowseBcdtmap.openArg.detail}
                    ])

            }
        },
        prepareGridHasilBrowse:function () {
            if (!dojote.cekWidget(this.gdHasilBrowse)) {
                var bcdtmapLayout = [
                    {field:'car', name:'CAR', width:'80%', formatter:dojo.hitch(this, function (val, idx) {
                        var brs = this.gdHasilBrowse.getItem(idx);
                        return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                            val + '</div><div>No. ' + ((brs.nomor != null) ? brs.nomor : '-') + '&nbsp;-&nbsp' +
                            ((brs.tanggal) ? dojote.toDate(brs.tanggal) : '-' ) + '</div>';
                    })} ,
                    {field:'status', name:'Status', width:'20%', formatter:dojo.hitch(function (val, idx) {
                        return (1 == val) ? 'Draft' : (2 == val) ? 'Mapped' : '';
                    }) }

                ];
                this.gdHasilBrowse = new dojox.grid.DataGrid({
                    store:null, id:'gdHasilBrowse',
                    structure:bcdtmapLayout
                }, dojo.query('.dicBrowse')[0]);

                this.gdHasilBrowse.startup();
                if (!this.formBrowseBcdtmap.gdResultClick)
                    this.formBrowseBcdtmap.gdResultClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowClick', dojo.hitch(this, this.onGdHasilBrowseRowClick));
                if (!this.formBrowseBcdtmap.gdResultDblClick)
                    this.formBrowseBcdtmap.gdResultDblClick = dojo.connect(
                        this.gdHasilBrowse, 'onRowDblClick', dojo.hitch(this, this.onGdHasilBrowseRowDblClick));

            }
        },
        performBrowse:function (init, param) {
            var param = (param) ? param : {};
            var param = (init) ? {c:'browsebcdtmap', init:true, n:30} :
                dojo.mixin(param, {c:'browsebcdtmap', n:30});
            dojote.callXhrJsonPost('/inventory/bcdt/',
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
        formatListBcdtmap:function (val, idx) {
            var brs = this.gdHasilBrowse.getItem(idx);
            return '<div style="font:11px verdana;font-weight: bold;text-decoration: underline">' +
                val + '</div><div>' + brs.alamat + '</div>';
        },

        prepareBcdtmapSider:function (id) {
            if (!dojote.cekWidget(this.bcdtmapSider)) {
                this.bcdtmapSider = dojote.preparePortlet('Bcdtmap', 2, 'Loading Informasi  Bcdtmap ...');
            }
            dojote.callXhrJsonPost('/inventory/bcdt/', {c:'bcdtmapsider', id:id}, dojo.hitch(this, function (res) {
                if (dojote.cekWidget(this.bcdtmapSider)) {
                    this.bcdtmapSider.set('content', res.html);
                }
            }))
        },
        manageCrudButton:function () {

            var btnnew = dojo.byId('newBcdtmap');
            //check if the event already connected, don;t connect it twice
            if (btnnew && !this.formBrowseBcdtmap.btnNewClick) {
                this.formBrowseBcdtmap.btnNewClick = dojo.connect(btnnew, 'onclick', dojo.hitch(this, function (e) {
                    dojo.publish('onMenuDaftarBcdtmap', [
                        {mode:'new', layer:true}
                    ])
                }))
            }
            var btnlookup = dojo.byId('lookupBcdtmap');
            if (btnlookup && !this.btnLookupClick) {
                this.formBrowseBcdtmap.btnLookupClick = dojo.connect(btnlookup, 'onclick', dojo.hitch(this, function (e) {
                    var prm = accordUtil.openLookup([
                        {field:'par_car', name:'CAR', type:'teks'},
                        {field:'par_nomor', name:'Nomor', type:'teks'},
                        {field:'par_tanggal', name:'Tanggal', type:'tanggalRange'},
                        {field:'par_status', name:'status', type:'hidden'}
                    ], dojo.hitch(this, function (params) {
                        this.performBrowse(false, params);
                        this.formBrowseBcdtmap.lookupParam = params;
                    }));
                    prm.setValue(dojo.mixin(this.formBrowseBcdtmap.lookupParam, {par_status:this.formBrowseBcdtmap.status}))
                }))
            }
            var btnrefresh = dojo.byId('lookupBcdtmap');
            if (btnrefresh && !this.formBrowseBcdtmap.btnrefreshClick) {
                this.formBrowseBcdtmap.btnrefreshClick = dojo.connect(btnrefresh, 'onclick', dojo.hitch(this, function (e) {
                    this.performBrowse(false, this.formBrowseBcdtmap.lookupParam);
                }))
            }
            var btnshow = dojo.byId('showBcdtmap');
            if (btnshow && !this.formBrowseBcdtmap.btnShowClick) {
                this.formBrowseBcdtmap.btnShowClick = dojo.connect(btnshow, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarBcdtmap', [
                            {mode:'show', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu bcdtmap dari daftar bcdtmap yang tersedia', 'fatal')
                    }
                }))
            }
            var btnedit = dojo.byId('editBcdtmap');
            if (btnedit && !this.formBrowseBcdtmap.btnEditClick) {
                this.formBrowseBcdtmap.btnEditClick = dojo.connect(btnedit, 'onclick', dojo.hitch(this, function (e) {
                    var seleksi = this.gdHasilBrowse.selection.getSelected();
                    if (seleksi.length) {
                        var id = seleksi[0].id;
                        dojo.publish('onMenuDaftarBcdtmap', [
                            {mode:'edit', id:id, layer:true}
                        ])
                    } else {
                        dojote.notify('Anda belum memilih salah satu bcdtmap dari daftar bcdtmap yang tersedia', 'fatal')
                    }
                }))
            }
            var display = (this.formBrowseBcdtmap.openArg.nocrud) ? "none" : "inline-block";
            dojo.style(btnedit, 'display', display);
            dojo.style(btnnew, 'display', display);
            //dojo.style(btndel,'display',display);
        }
    }
    singleton.init();
    return singleton;
})