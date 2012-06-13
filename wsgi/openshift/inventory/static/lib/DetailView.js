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
    "dijit/_Templated" ,
    "dojo/dom",
    "dijit/form/Button" ,
    "dojox/grid/DataGrid",
    "dijit/_FocusMixin"

], function (declare, parser, ready, _WidgetBase, domConstruct, _Templated, dom) {

    declare("lib.DetailView", [_WidgetBase, _Templated, dijit._FocusMixin], {
        // counter
        data:{},
        _setDataAttr:function (data) {
            this._set('data', data);
            this.build();
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
                    var lbl = dojo.doc.createElement("div");
                    dojo.addClass(lbl, 'siderLabel');
                    lbl.innerHTML = dt;
                    this.dvContainer.appendChild(lbl);
                    var val = dojo.doc.createElement("div");
                    val.innerHTML = this.data[dt];
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