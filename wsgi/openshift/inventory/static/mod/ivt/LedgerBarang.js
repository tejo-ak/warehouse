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
    'lib/LookupParam'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
            this.ledgerWarehouseFormType = "";
        },
        startup:function () {
            this.searchPasienHandle = dojo.subscribe('onMenuLedgerBarang', dojo.hitch(this, 'prepareFormLedger'));
        },
        initForm:function (arg) {


        },
        prepareFormLedger:function (arg) {
            //dojote.clearSideMainPane();
            var arg = (arg) ? arg : {};
            if (!arg.layer) {
                //tabUtil.clearAll();
            }
            if (!dojote.cekWidget(this.formLedger)) {
                this.formLedger = tabUtil.putinFirstTab('Form Ledger', 'loading form ledger');
                var param = {c:'formledger'};
                dojote.callXhrJsonPost('/inventory/report/', param, dojo.hitch(this, function (res) {
                        if (tabUtil.cekTab(this.formLedger)) {
                            this.formLedger.set('content', res.html);
                            //
                            //Inisiasi form ledgerWarehouse disini
                            //
                            dojote.dijitByName('tanggal').set('value', new Date())
                            this.initForm(arg);
                        }

                    }
                ))
            } else {
                this.initForm(arg);
            }

        }, initForm:function (arg) {
            dojote.dijitByName('inventory_id').set('value', arg.inventory_id);
            var brg = dojote.dijitByName('barang_nama', this.formLedger.domNode);
            if (!this.formLedger.onBrgResult)
                this.formLedger.onBrgResult = dojo.connect(brg, 'onLookupResult', dojo.hitch(this, function (e) {
                    this.formLedger.btnLedger.onClick('e');
                }));
            this.formLedger.btnLedger = dojote.dijitByName('btnShowLedger');
            if (!this.formLedger.btnLedgerClickHandler)
                this.formLedger.btnLedgerClickHandler = dojo.connect(
                    this.formLedger.btnLedger, 'onClick', dojo.hitch(this, function (e) {
                        var par = {
                            barang_id:dojote.dijitByName('barang_id').get('value'),
                            inventory_id:dojote.dijitByName('inventory_id').get('value'),
                            tanggal:dojote.dijitByName('tanggal').get('value'),
                            c:'taccount_bdi_form'
                        }
                        dojote.callXhrJsonPost('/inventory/report/', par, dojo.hitch(this, function (e) {
                            if (tabUtil.cekTab(this.formLedger)) {
                                var bowl = dojo.query('.ledger_bowl', this.formLedger.domNode)[0];
                                if (bowl)
                                    bowl.innerHTML = e.html
                            }
                        }))
                    })
                )
            if (dojote.dijitByName('barang_nama').getValueId()) {
                this.formLedger.btnLedger.onClick('e');
            }
        }
    }
        ;
    singleton.init();
    return singleton;
})

