/**
 * Created by PyCharm.
 * User: jote
 * Date: 5/22/12
 * Time: 2:51 AM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo/parser",
    "dojo/_base/declare",
    "dijit/form/TextBox",
    "dojo/date/locale",
    "dojo/_base/lang",
    "lib/LovLookup",
    "lib/dojote",
    "lib/LovLookup",
    "lib/DetailView"
], function (parser, declare, TextBox, locale, lang, LovLookup, dojote) {

    declare("lib.LookupTextbox", TextBox, {

        widgetsInTemplate:true,
        postCreate:function () {
            this.inherited(arguments);
            dojo.connect(this, 'onKeyPress', dojo.hitch(this, this.onTekan));
            this.inputField = dojo.query('.dijitInputField', this.domNode)[0];
            this.getIdControl();
            this.setDefaultBackground();
            dojo.connect(this, 'onDblClick', dojo.hitch(this, function (e) {
                this.openLookup()
            }))
        },
        detailerLabelClass:'siderLabel',
        _setDetailerLabelClass:function (detailerLabelClass) {
            this._setDetailerLabelClass(detailerLabelClass);
        },
        idName:'',
        _setIdNameAttr:function (idName) {
            this._set('idName', idName);
        },
        idField:'',
        _setIdFieldAttr:function (idField) {
            this._set('idField', idField);
        },
        getIdControl:function () {
            if (this.idName) {
                var ctlId = dojote.dijitByName(this.idName);
                if (ctlId) {
                    if (!this.onIdControlValueChange)
                        this.onIdControlValueChange = dojo.connect(ctlId, '_setValueAttr', dojo.hitch(this, function (e) {
                            if (!this.internalIdSet)
                                this.setValueId(ctlId.get('value'));
                        }))
                    return ctlId;
                }
            }
            return null;
        },
        detailer:"",
        buildDetailer:function () {
            if (!this.detailer) {
                return;
            }
            if (!dojote.cekWidget(this.detailerObj)) {
                var divDetailer = dojo.byId(this.detailer);
                if (divDetailer) {
//                    divDetailer.id = dojote.getUuid().substring(0, 6);
//                    this._set('detailer', divDetailer.id)
                    //detailer has not been initiated;
//                    var dvdt = dojo.doc.createElement('div');
//                    dvdt.id = dojote.getUuid().substring(0, 6);
//                    dojo.style(dvdt, 'width', '100%');
//                    divDetailer.appendChild(dvdt)
                    var dv = new lib.DetailView({labelClass:this.detailerLabelClass}, this.detailer);
                    this.detailerObj = dv;
                    return this.detailerObj;
                }
            } else {
                return this.detailerObj;
            }
        },
        _setDetailerAttr:function (detailer) {
            this._set('detailer', detailer)
        },
        onTekan:function (e) {
            //dojo.stopEvent(e);
//            this.inherited(arguments);
            if ('40' == e.keyCode) {
                //alt panah bawah here,. implement lookup show
                this.openLookup();
            }
            if (e.altKey && '46' == e.keyCode) {
                //alt del here
                this.clearValue();
            }
            if ('27' == e.keyCode) {
                //esc key here
                this.closeLookup();
            }
            if ('13' == e.keyCode) {
                //esc key here dojo.stopEvent(e);
                if (!this.lookingup) {
                    this.openLookup(this.get('value'));
                }
            }
        },
        lookingup:false,
        onFocus:function () {
            //this.inherited(arguments);
            dojo.style(this.inputField, 'backgroundColor', 'transparent');
            if (!this.isValid) {
                this.selectOnClick = false;
                this.isValid = true;

            }
        },
        onBlur:function () {
            this.inherited(arguments);
            if (!this.lookingup) {
                this.validate();
            }
        },
        destroy:function () {
            var dv = this.buildDetailer();
            if (dv) {
                dv.destroy();
            }
            this.inherited('destroy', arguments);

        },
        clearValue:function () {
            var dv = this.buildDetailer();
            if (dv) {
                dv.clear();
            }
            var idCtl = this.getIdControl();
            if (idCtl) {
                this.internalIdSet = true;
                idCtl.value = ""
                this.internalIdSet = false;
            }
            this.set('value', '');
        },
        isValid:true,
        onInvalid:function () {
            this.selectOnClick = true;
            this.isValid = false;
            dojo.style(this.inputField, 'backgroundColor', 'yellow');
            dojote.notify('Nilai teksbox tidak valid')
            this.clearValue();

        },
        result:{},
        setDefaultBackground:function () {
            dojo.style(this.inputField, 'backgroundColor', '#deff89');
        },
        field:'nama',
        validate:function () {
            this.setDefaultBackground();
            var val = this.get('value');
            if (val && '' != val) {
                if (this.result) {
                    var nama = this.result[this.field];
                    if (nama != val) {
                        this.onInvalid();
                    } else {
                        this.isValid = true;
                    }
                } else {
                    this.onInvalid();
                }
            } else {
                //blank value
                //reset result
                this.result = {};
                this.isValid = true;
                var dv = this.buildDetailer();
                if (dv) {
                    dv.clear();
                }

            }


        },
        openLookup:function (val) {
            this.lookingup = true;
            if (!dojote.cekWidget(this.lookupPortlet)) {
                this.lookupPortlet = dojote.preparePortlet('Lookup', 2, 'Loading Lookup');
                var par = {url:this.lookupUrl, lookupParam:this.lookupParam};
                if (val && '' != val) {
                    var par = dojo.mixin(par, {kataKunci:val});
                }
                this.lookup = new lib.LovLookup(par);
                this.lookupPortlet.set('content', this.lookup);
                this.lookup.txtCari.focus();
                dojo.connect(this.lookup, 'onEscape', dojote.thitch(this, function () {
//                    setTimeout(dojo.hitch(this, function () {
                    this.closeLookup();
                    this.focus();
//                    }), 50)

                }));
                dojo.connect(this.lookup, 'onBlur', dojo.hitch(this, function () {
                    this.closeLookup();
                }));
                dojo.connect(this.lookup, 'onRowSelected', dojo.hitch(this, function (e) {
                    this.onLookupResult(e);
                    this.closeLookup();
                    dojote.thitch(this, function () {
                        dojo.query('input', this.domNode)[0].focus();
                    })();
                }));
            }
        },
        setValueId:function (value) {
            if (this.lookupParam && this.lookupUrl && value && '' != value) {
                var par = dojo.mixin({id:value}, this.lookupParam)
                dojote.callXhrJsonPost(this.lookupUrl, par, dojo.hitch(this, function (e) {
                    if (e && e.length) {
                        this.onLookupResult({row:e [0]});
                    }
                }))
            } else {
                this.clearValue();
            }
        },
        getValueId:function () {
            var idCtl = this.getIdControl();
            if (idCtl) {
                return idCtl.get('value');
            }
        },
        internalIdSet:false,
        onLookupResult:function (e) {
            this.result = e.row;
            var dv = this.buildDetailer();
            this.set('value', e.row[this.field]);
            if (dv) {
                dv.clear();
                dv.set('data', this.onShowDetail(e.row))
            }
            var idCtl = this.getIdControl()
            if (idCtl) {
                //prevent firing on set value event
                this.internalIdSet = true;
                idCtl.set('value', e.row[this.idField]);
                this.internalIdSet = false;
            }
        },
        detailFilter:"",
        _setDetailFilterAttr:function (detailFilter) {
            this._set('detailFilter', detailFilter);
        },
        onShowDetail:function (data) {
            if (this.detailFilter) {
                var data = dojote.jorder(data, this.detailFilter.split(","));
            }
            return data;
        },
        closeLookup:function () {
            if (dojote.cekWidget(this.lookupPortlet)) {
                this.lookup.destroy();
                this.lookupPortlet.destroy();
            }
            this.lookingup = false;
        },
        lookupUrl:'',
        _setLookupUrlAttr:function (lookupUrl) {
            this._set('lookupUrl', lookupUrl);
        },
        lookupParam:{},
        _setLookupParamAttr:function (lookupParam) {
            this._set('lookupParam', lookupParam);
        }

    });

});