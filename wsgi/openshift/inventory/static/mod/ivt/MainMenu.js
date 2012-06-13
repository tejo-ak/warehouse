/**
 * Created by PyCharm.
 * User: jote
 * Date: 1/10/12
 * Time: 2:22 PM
 * To change this template use File | Settings | File Templates.
 */
define(['dojo',
    'dojo/parser',
    'lib/TabUtil',
    'lib/dojote',
    'dojo/data/ObjectStore',
    'dojo/store/Memory',
    'dojox/grid/DataGrid'
], function (dojo, parser, tabUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            this.renderMenu();
        },
        menuFormatter:function (value, idx) {
            var grup = this.gdMenu.getItem(idx).grup;
            var evt = this.gdMenu.getItem(idx).eventId;
            var cursor = (evt && '' != evt) ? ";cursor:pointer" : ";cursor:auto";
            if (grup) {
                return '<span style="font: 12px verdana;color:gray;' + cursor +
                    ';font-weight:bold">' + value + '</span>'
            } else {
                var html = '<table width="100%" cellpadding="0" cellspacing=""><tr>' +
                    '<td width="20px" valign="top">&nbsp</td><td valign="top">' +
                    '<li ' +
                    'style="display: inline-block;font: 10px verdana' + cursor + ';">' + value + '</li>' +
                    '</td></tr></table>'
                return html;
            }

        },
        renderMenu:function () {
            var menuPane = dijit.byId('menuPane');
//        menuPane.innerHTML = "<div style='width:100%' id='menuContent'></div>";

            var menuLayout = [
                {field:'menu', name:'Menu', width:'100%', formatter:dojo.hitch(this, this.menuFormatter) }
            ];
            var menuList = [
                { menu:'Home', menuId:'mn004', eventId:'', grup:true},
                { menu:'Welcome', menuId:'mn005', eventId:'onMenuHome', modul:'mod/ivt/StartApp'},
                { menu:'Barang MGT', menuId:'mn003', eventId:'', grup:true},
                { menu:'Register Barang', menuId:'mn001', eventId:'onMenuDaftarBarang',
                    modul:'mod/ivt/BarangMgt', arg:[
                    {mode:'new', layer:false}
                ]},
                { menu:'Upload Barang', menuId:'mn001', eventId:'onMenuUploadBarang', modul:'mod/ivt/BarangMgt', arg:[
                    {nocrud:true, sider:'sider', detail:'upload'}
                ]},
                { menu:'Browse Barang', menuId:'mn002', eventId:'onMenuPencarianBarang', modul:'mod/ivt/BarangMgt', arg:[
                    {nocrud:false, sider:'sider', detail:'view'}
                ]},
                { menu:'Supplier MGT', menuId:'mn003', eventId:'', grup:true},
                { menu:'Register Supplier', menuId:'mn001', eventId:'onMenuDaftarSupplier', modul:'mod/ivt/SupplierMgt', arg:[
                    {mode:'new', sider:'sider', detail:'view'}
                ]},
                { menu:'Browse Supplier', menuId:'mn002', eventId:'onMenuPencarianSupplier', modul:'mod/ivt/SupplierMgt', arg:[
                    {nocrud:false}
                ]},
                { menu:'Customer MGT', menuId:'mn003', eventId:'', grup:true},
                { menu:'Register Customer', menuId:'mn001', eventId:'onMenuDaftarCustomer', modul:'mod/ivt/CustomerMgt', arg:[
                    {mode:'new'}
                ]},
                { menu:'Browse Customer', menuId:'mn002', eventId:'onMenuPencarianCustomer', modul:'mod/ivt/CustomerMgt', arg:[
                    {nocrud:false}
                ]},
                { menu:'Inward WareHouse', menuId:'mn006', eventId:'', grup:true},
                { menu:'Purchase', menuId:'mn007', eventId:'onMenuRencanaPembelian', modul:'mod/ivt/PembelianMgt'},
                { menu:'Browse Purchase', menuId:'mn007', eventId:'onMenuBrosePembelian', modul:'mod/ivt/PembelianBrowse', arg:[
                    {nocrud:false, sider:'sider', detail:'view'}
                ]},
                { menu:'Mapping BC 2.3', menuId:'mn007', eventId:'onMenuBcdtMap', modul:'mod/ivt/BcdtMapMgt'},
                { menu:'Browse Mapping BC 2.3', menuId:'mn007', eventId:'onMenuBroseBcdtmap', modul:'mod/ivt/BcdtmapBrowse', arg:[
                    {nocrud:true, sider:'sider', detail:'edit', status:1}
                ]},
                { menu:'Browse Mapped BC 23', menuId:'mn007', eventId:'onMenuBroseBcdtmap', modul:'mod/ivt/BcdtmapBrowse', arg:[
                    {nocrud:true, sider:'sider', detail:'view', status:2}
                ]},
                { menu:'Outward WareHouse', menuId:'mn006', eventId:'', grup:true},
                { menu:'Mutasi WIP', menuId:'mn007', eventId:'onMenuMutasiWIP', modul:'mod/ivt/MutasiWipMgt'},
                { menu:'Browse Mutasi WIP', menuId:'mn007', eventId:'onMenuBrowseMutasi', modul:'mod/ivt/MutasiBrowse', arg:[
                    {nocrud:true, sider:'sider', detail:'edit', status:1}
                ]},
                { menu:'Konversi WIP', menuId:'mn007', eventId:'onMenuKonversi', modul:'mod/ivt/KonversiMgt'},
                { menu:'Browse Konversi Produksi', menuId:'mn007', eventId:'onMenuBrowseKonversi', modul:'mod/ivt/KonversiBrowse', arg:[
                    {nocrud:true, sider:'sider', detail:'edit', status:1}
                ]},
                { menu:'Stock Opname', menuId:'mn007', eventId:'onMenuOpname', modul:'mod/ivt/OpnameMgt'},
                { menu:'Browse Stock Opname', menuId:'mn007', eventId:'onMenuBrowseOpname', modul:'mod/ivt/OpnameBrowse', arg:[
                    {nocrud:true, sider:'sider', detail:'edit', status:1}
                ]},
                { menu:'Pengeluaran BC 2.5', menuId:'mn007', eventId:'onMenuPengeluaranPabean', modul:'mod/ivt/PengeluaranPabeanMgt', arg:[
                    {nocrud:true, sider:'sider', detail:'view', jenisDokumen:20, inventory_id:1}//represent BC 2.5
                ]},
                { menu:'Pengeluaran BC 2.7', menuId:'mn007', eventId:'onMenuPengeluaranPabean', modul:'mod/ivt/PengeluaranPabeanMgt', arg:[
                    {nocrud:true, sider:'sider', detail:'view', jenisDokumen:23, inventory_id:2}//represent BC 2.7 Outward
                ]},
                { menu:'Pemasukan BC 2.7', menuId:'mn007', eventId:'onMenuPemasukanPabean', modul:'mod/ivt/PemasukanPabeanMgt', arg:[
                    {nocrud:true, sider:'sider', detail:'view', jenisDokumen:22, inventory_id:1}//represent BC 2.5
                ]},
                { menu:'Browse Dokumen Pabean', menuId:'mn007', eventId:'onMenuBrowseDokumenPabean', modul:'mod/ivt/DokumenPabeanBrowse', arg:[
                    {nocrud:true, sider:'sider', detail:'view', jenisDokumen:20}
                ]},
                { menu:'Tools', menuId:'mn006', eventId:'', grup:true},
                { menu:'Penyesuaian', menuId:'mn007', eventId:'onMenuRegisterKunjungan', modul:'mod/ivt/BarangMgt'},
                { menu:'Report', menuId:'mn006', eventId:'', grup:true},
                { menu:'Buku Warehouse bulanan', menuId:'mn007', eventId:'onMenuLedgerBarang', modul:'mod/ivt/LedgerBarang', arg:[
                    {inventory_id:1}
                ]},
                { menu:'Buku WIP bulanan', menuId:'mn007', eventId:'onMenuLedgerBarang', modul:'mod/ivt/LedgerBarang', arg:[
                    {inventory_id:2}
                ]},
                { menu:'Ledger Finished', menuId:'mn007', eventId:'onMenuLedgerBarang', modul:'mod/ivt/BarangMgt', arg:[
                    {layer:true}
                ]},
                { menu:'Saldo Barang', menuId:'mn007', eventId:'onMenuSaldoBarang', modul:'mod/ivt/BarangMgt'}
            ];
            var menuStore = new dojo.store.Memory({data:[]});
            this.gdMenu = new dojox.grid.DataGrid({
                query:{}, store:new dojo.data.ObjectStore({objectStore:menuStore}),
                structure:menuLayout
            });
            this.gdMenu.canSort = function () {
                return false
            };
            menuPane.set('content', this.gdMenu);
            var menuStore = new dojo.store.Memory({data:menuList});
            this.gdMenu.setStore(new dojo.data.ObjectStore({objectStore:menuStore}));
            //dojo.style(this.gdMenu.domNode,'width','100%')
            dojo.connect(this.gdMenu, 'onRowClick', this.menuHandler);
        },
        menuHandler:function (e) {
            var items = e.grid.selection.getSelected();
            if (items.length && items[0].eventId) {
                var modul = items[0].modul;
                var arg = items[0].arg;
                if (modul && modul != '') {
                    require(['dojo', modul], function (dojo) {
                        dojo.publish(items[0].eventId, arg)
                    });
                }

            }
        }
    }
    singleton.init();
    return singleton;
})