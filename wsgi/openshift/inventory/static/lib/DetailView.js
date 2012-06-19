/**
 * Created by PyCharm.
 * User: jote
 * Date: 5/22/12
 * Time: 11:52 AM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo/_base/declare",
    "dojo/parser",
    "dojo/ready",
    "dijit/_WidgetBase" ,
    "dojo/dom-construct",
    "dijit/_TemplatedMixin" ,
    "lib/dojote",
    "dijit/form/Button" ,
    "dojox/grid/DataGrid",
    "dijit/_FocusMixin"

], function (declare, parser, ready, _WidgetBase, domConstruct, _Templated, dojote) {

    declare("lib.DetailView", [_WidgetBase, _Templated, dijit._FocusMixin], {
        // counter
        data:{},
        _setDataAttr:function (data) {
            this._set('data', data);
            this.build();
        },
        labelClass:'siderLabel',
        _setLabelClassAttr:function (labelClass) {
            this._set('labelClass', labelClass);
        },
        def:"",
        widgetsInTemplate:true,
        templateString:"<div><div class='dvContainer'></div></div>",
        postCreate:function () {
            this.inherited("postCreate", arguments);
            this.dvContainer = dojo.query('.dvContainer', this.domNode)[0];
            this.build();
        },
        build:function () {
            this.clear();
            if (this.data) {
                for (dt in this.data) {
                    var label, isi;
                    if (dt.indexOf('+') != -1) {
                        var lbl = dt.split('+')
                        label = (lbl[0]) ? lbl[0] : '' + '&nbsp;' + (lbl[1]) ? lbl[1] : '';
                        isi =(this.data[lbl[0]])?this.data[lbl[0]]:'' + '&nbsp;' + (this.data[lbl[1]])?this.data[lbl[1]]:'';
                    } else {
                        label = dt;
                        isi = this.data[dt];
                    }
                    var lbl = dojo.doc.createElement("div");
                    dojo.addClass(lbl, this.labelClass);
                    lbl.innerHTML = label;
                    this.dvContainer.appendChild(lbl);
                    var val = dojo.doc.createElement("div");
                    val.innerHTML = isi;
                    this.dvContainer.appendChild(val);
                    var brs = dojo.doc.createElement('div');
                    dojo.style(brs, 'height', '8px');
                    this.dvContainer.appendChild(brs);
                }
            }
        },
        clear:function (message) {
            var message = (message) ? message : "";
            if (this.dvContainer) {
                this.dvContainer.innerHTML = message;
            }
        }

    });
})
;