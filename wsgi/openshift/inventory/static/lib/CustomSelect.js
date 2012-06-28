/**
 * Created by PyCharm.
 * User: jote
 * Date: 6/21/12
 * Time: 4:54 AM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo",
    "dojo/parser",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "lib/dojote",
    'dijit/form/Select',
    "dojo/date/locale",
    "dojo/_base/lang",
    "dojo/store/Memory"
], function (dojo, parser, declare, c, dojote, Select, locale, lang) {

    declare("lib.CustomSelect", Select, {

        url:'/inventory/referensi/',
        _setUrlAttr:function (url) {
            this._set('url', url);
        },
        param:{},
        _setParamAttr:function (param) {
            this._set('param', param);

        },
        mergeParam:function (param) {
            this.param = dojo.mixin(this.param, param)
        },
        field:'nama',
        _setFieldAttr:function (field) {
            this._set('field', field);
        },

        kode:'kode',
        _setKodeAttr:function (kode) {
            this._set('kode', kode);
        },
        kodeName:'kd_nama',
        _setKodeNameAttr:function (kodeName) {
            this._set('kodeName', kodeName);
        },
        kodeValue:'kd_nama',
        _setKodeValueAttr:function (kodeValue) {
            this._set('kodeValue', kodeValue);
        },
        grup:0,
        _setGrupAttr:function (grup) {
            this._set('grup', grup);
        },
        postCreate:function () {
            this.inherited('postCreate', arguments);
//            opt = c.create('option', {text:'...', value:''})
//            this.domNode.add(opt);
//
            if (this.url) {
                this.mergeParam({field:this.field, grup:this.grup, c:'referensi'});
                this.labelAttr = 'label';
                this.options = [
                    {value:'', label:'...', kode:""}
                ]
                ;
                dojote.callXhrJsonPost(this.url, this.param, dojo.hitch(this, function (e) {
                    if (e && e.data && e.data.length && e.data[0][this.field]) {
                        var imax = e.data.length;
                        var jdata = [];
                        jdata[0] = {value:'', label:'...'};
                        for (var i = 0; i < imax; i++) {
                            jdata[i + 1] = {value:'' + e.data[i].id, label:e.data[i][this.field]};
                            if (e.data[i][this.kode]) {
                                jdata[i + 1].kode = e.data[i][this.kode];
                            }
                        }
                        this.options = jdata;
                        this.built = true;
                        if (this.bufInitialValue) {
                            this.set('value', this.bufInitialValue);
                            this.setKode();
                        }
                    }
                }))
            } else {
                //no need remote source
                this.built = true;
            }
            this.kodeNode = c.create('input', {type:'hidden'}, this.domNode, 'last');
        },
        setKode:function () {
            var opts = this.getOptions();
            for (i = 0; i < opts.length; i++) {
                if (opts[i].selected && opts[i].kode) {
                    this.kodeValue = opts[i].kode;
                    this.kodeNode.value = opts[i].kode;
                    console.log('kode diset')
                    console.log(opts[i].kode)
                    return;
                } else {
                    this.kodeNode.value = "";
                    this.kodeValue = "";
                }
            }
        },
        _setValueAttr:function (value) {
            if (this.built) {
                this.inherited('_setValueAttr', arguments);
                this.setKode();
            } else {
                this.bufInitialValue = value;
            }

        }

    });

})
;