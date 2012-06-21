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
    "dojo/dom-struct",
    "lib/dojote",
    "dijit/form/Select",
    "dojo/date/locale",
    "dojo/_base/lang"
], function (dojo, parser, declare, c, dojote, Select, locale, lang) {

    declare("lib.CustomButton", Button, {

        url:null,
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
        postCreate:function () {
            this.inherited(arguments);
            c.create('option', {innerHTML:'...', value:''}, this.domNode)
            if (this.url) {
                this.mergeParam({field:this.field});
//populate option here
                dojote.callXhrJsonPost(this.url, this.param, dojo.hitch(this, function (e) {
                    if (e && e.data && e.data.length && e.data[0][field]) {
                        var imax = e.data.length;
                        for (i == 0; i < imax; i++) {
                            c.create('option', {innerHTML:e.data[i][field], value:''}, this.domNode, 'last')
                        }

                    }
                }))
            }
        },
        _setValueAttr:function (e) {

        }
    });

})
;