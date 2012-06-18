/**
 * Created by PyCharm.
 * User: User
 * Date: 6/16/12
 * Time: 6:21 AM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo",
    "dojo/_base/declare",
    "dojo/parser",
    "dojo/ready",
    "dijit/_WidgetBase" ,
    "dojo/dom-construct",
    "dijit/_Templated" ,
    "lib/dojote",
    "dojox/form/Manager" ,
    "dijit/form/Button" ,
    "dojox/grid/DataGrid",
    "dijit/_FocusMixin",
    'dojo/data/ObjectStore',
    'dojo/store/Memory'

], function (dojo, declare, parser, ready, _WidgetBase, c, _Templated, dojote) {

        declare("lib.Grediform", dojox.form.Manager, {

            postCreate:function () {
                this.inherited('postCreate', arguments);
                console.log('observer Grediform creation')
                this.buildWidget();
                this.show();
                if(this.btnSave && !this.btnSaveHandler)
                    this.btnSaveHandler=dojo.connect()
            },
            buildWidget:function () {
                this.divPanel = c.create('div', {}, this.domNode, 'last');
                this.btnSave = c.create('a', {innerHTML:'Save'}, this.divPanel, 'last');
                c.create('span', {innerHTML:'&nbsp;&nbsp;'}, this.divPanel, 'last');
                this.btnCancel = c.create('a', {innerHTML:'Cancel'}, this.divPanel, 'last');

            },
            hide:function () {
                dojo.style(this.domNode, 'display', 'none');
            },
            show:function () {
                dojo.style(this.domNode, 'display', 'block');
            }
        })
    }
)
