/**
 * Created by PyCharm.
 * User: jote
 * Date: 5/15/12
 * Time: 11:04 AM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo/_base/declare",
    "dojo/parser",
    "dojo/ready",
    "dijit/_WidgetBase" ,
    "dojo/dom-construct",
    "dijit/form/TextBox",
    "dojo/dom-style",
    "dijit/_Templated" ,
    "dijit/focus",
    "dojo/dom",
    "lib/dojote",
    "dijit/form/Button" ,
    "dojox/grid/DataGrid",
    "dijit/_FocusMixin",
    "lib/DetailView"

], function (declare, parser, ready, _WidgetBase, domConstruct, TextBox, domStyle, _Templated, focusUtil, dom, dojote) {

    declare("lib.LovLookup", [_WidgetBase, _Templated, dijit._FocusMixin], {
        // counter
        kataKunci:"",
        _setKataKunciAttr:function (kataKunci) {
            this._set('kataKunci', kataKunci);
        },
        widgetsInTemplate:true,
        templateString:"<div><div style=\"width:100%;\"> " +
            " <input dojoType='dijit.form.TextBox' tabindex='1' selectOnFocus='true' class='txtCari' intermediateChanges='true' " +
            " style=\"width: 70%\"/><button dojoType='dijit.form.Button' tabindex='-1'  class='btnCari' style='width: 20%'>Go</button>" +
            " </div><br/>" +
            " <table class='gdResult' style='height: 300px'  tabIndex='2'" +
            " dojoType='dojox.grid.DataGrid' region='top' minSize='20' splitter='true'" +
            " style=\"width:100%;height: 100px\">" +
            " <thead tabIndex='-1'><tr><th  tabIndex='-1' field='nama' width='100%'>Result</th></tr>" +
            " </thead></table></div>",
        postCreate:function () {
            this.inherited("postCreate", arguments)
            this.btnCari = dojo.query('[role="button"]', dojo.query(' .btnCari', this.domNode)[0])[0];
            this.txtCari = dijit.getEnclosingWidget(dojo.query(' .txtCari', this.domNode)[0]);
            this.gdResult = dijit.getEnclosingWidget(dojo.query(' .gdResult', this.domNode)[0]);
            if (this.gdResult) {
                dojo.connect(this.gdResult, 'onRowClick', dojo.hitch(this, function (e) {
                    dojo.stopEvent(e);
                    var items = e.grid.selection.getSelected();
                    if (items.length && items[0].id) {
                        var data = {row:items[0], grid:e.grid, nama:items[0].nama};
                        this.onRowSelected(data)
                    }
                }));
                dojo.connect(this.gdResult, 'onKeyPress', dojo.hitch(this, function (e) {
                    dojo.stopEvent(e);
                    if (e.altKey && '13' == e.keyCode) {
                        //alt enter
                        this.txtCari.focus();
                        dojo.query('input', this.txtCari.domNode)[0].select();
                    }
                    if ('27' == e.keyCode) {
                        this.onEscape();
                    }
                }))
            }
            dojo.connect(this.btnCari, 'onclick', dojo.hitch(this, function () {
                this.onLookup(this.url, {katakunci:this.txtCari.get('value')});
            }));
            dojote.onOk(this.txtCari, null, dojo.hitch(this, function () {
                this.onLookup(this.url, {katakunci:this.txtCari.get('value')});
            }))
            dojo.connect(this.txtCari, 'onKeyPress', dojo.hitch(this, function (e) {
                if ('27' == e.keyCode) {
                    this.onEscape();
                }
            }))
            this.restruct();
            if (this.lookupParam) {
                this.txtCari.set('value', this.kataKunci);
                this.onLookup(this.url, {katakunci:this.txtCari.get('value')});
            }

        },
        url:"",
        onEscape:function () {

        },
        focus:function () {
            this.inherited("focus", arguments)
            this.txtCari.focus();
        },
        onBlur:function () {
        },
        lookupParam:null,
        _setLookupParamAttr:function (lookupParam) {
            this._set('lookupParam', lookupParam);
            //this.onLookup(this.url, {katakunci:this.txtCari.getValue()});
        },
        //onLookup
        onLookup:function (url, param) {
            dojote.callXhrJsonPost(url, dojo.mixin(param, this.lookupParam), dojo.hitch(this, this.onResult))
        },
        onResult:function (data) {
            if (data) {
                var mem = new dojo.store.Memory({data:data});
                var str = new dojo.data.ObjectStore({objectStore:mem});
                if (!dojote.cekWidget(this.gdResult)) {
                    return;
                }
                this.gdResult.setStore(str);
                if (0 < this.gdResult.rowCount) {
                    var col = this.gdResult.layout.cells[0];
                    this.gdResult.focus.setFocusCell(col, 0);
                    this.gdResult.focus.focusGrid();
                }
            }
        },
        field:'nama',
        _setFieldAttr:function (field) {
            this._set('field', field);
            this.restruct();
        },
        formatter:null,
        _setFormatterAttr:function (fmt) {
            this._set('formatter', fmt);
            this.restruct();
        },
        restruct:function () {
            if (this.gdResult) {
                var struct = {field:'nama', name:'Result', width:'100%'};
                if (this.formatter) {
                    var struct = dojo.mixin(struct, {formatter:this.formatter});
                }
                if (this.field) {
                    struct.field = this.field;
                }
                this.gdResult.set('structure', [
                    struct
                ]);
            }
        },
        onRowSelected:function (row, idx) {
            //your implementation here
        }
    });
})
;