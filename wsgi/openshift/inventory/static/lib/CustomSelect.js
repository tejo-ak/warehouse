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
    "dijit/form/Select",
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
                    {value:'', label:'...'}
                ];
                dojote.callXhrJsonPost(this.url, this.param, dojo.hitch(this, function (e) {
                    if (e && e.data && e.data.length && e.data[0][this.field]) {
                        var imax = e.data.length;
                        var jdata = [];
                        jdata[0] = {value:'', label:'...'};
                        for (var i = 0; i < imax; i++) {
                            jdata[i + 1] = {value:'' + e.data[i].id, label:e.data[i][this.field]};
                        }
                        this.options = jdata;
                        this.built = true;
                        if (this.bufInitialValue) {
                            console.log('re asign selected value')
                            this.set('value', this.bufInitialValue);
                        }
                    }
                }))
            } else {
                //no need remote source
                this.built = true;
            }
        },
        _setValueAttr:function (value) {
            console.log('observer on set value')
            console.log(this.built)
            if (this.built) {
                this.inherited('_setValueAttr', arguments);
            } else {
                this.bufInitialValue = value;
            }

        }

    });

})
;