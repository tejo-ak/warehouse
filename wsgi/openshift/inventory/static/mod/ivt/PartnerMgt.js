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
    'dijit/form/Select',
    'lib/CustomDatebox',
    'lib/CustomButton',
    'lib/CustomSelect',
    'lib/LookupParam'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            dojo.subscribe('onMenuPartner', dojo.hitch(this, 'prepareFormPartner'));
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
        }
    }
    singleton.init();
    return singleton;
})