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
    "lib/dojote",
    "dojox/form/Manager" ,
    "dijit/form/Button" ,
    "dojox/grid/DataGrid",
    "dijit/_FocusMixin",
    'dojo/data/ObjectStore',
    'dojo/store/Memory'

], function (dojo, declare, parser, ready, _WidgetBase, c, dojote) {

        declare("lib.Grediform", [dojox.form.Manager, dijit._FocusMixin], {

            postCreate:function () {
                this.inherited('postCreate', arguments);
                console.log('observer Grediform creation')
                this.buildWidget();
                if (this.develop)
                    this.show();
                else
                    this.hide();
                if (this.btnSave && !this.btnSaveHandler)
                    this.btnSaveHandler = dojo.connect(this.btnSave, 'onclick', dojo.hitch(this, function () {
                        this.onSave(this.gatherFormValues(), this);
                    }))
                if (this.btnCancel && !this.btnCancelHandler)
                    this.btnCancelHandler = dojo.connect(this.btnCancel, 'onclick', dojo.hitch(this, function () {
                        this.onCancel();
                    }))
                if (!this.onKeyPressHandler)
                    this.onKeyPressHandler = dojo.connect(this.domNode, 'onkeypress', dojote.thitch(this, this.onTekan))
            },
            onTekan:function (e) {
                if ('27' == e.keyCode) {
                    dojo.stopEvent(e);
                    this.onEscape();
                }

            },
            mouseEvent:{onMouseOver:'this.style.color="red"', onMouseOut:'this.style.color="black"'},
            buildWidget:function () {
                this.inherited('buildWidget', arguments);
                this.titlePanel = c.create('div', {innerHTML:this.judul, class:'judul',
                        style:{font:"11px verdana", fontWeight:"bold", backgroundColor:'#efefef'}},
                    this.domNode, 'first');
                this.divPanel = c.create('div', {style:{backgroundColor:'#efefef'}}, this.domNode, 'last');
                this.btnSave = c.create('a', dojo.mixin({innerHTML:'save', style:{cursor:'pointer', textDecoration:'underline'}
                }, this.mouseEvent), this.divPanel, 'last');
                c.create('span', {innerHTML:'&nbsp;&nbsp;'}, this.divPanel, 'last');
                this.btnCancel = c.create('a', dojo.mixin({innerHTML:'close', style:{cursor:'pointer', textDecoration:'underline'}}, this.mouseEvent), this.divPanel, 'last');
            },
            hide:function () {
                dojo.style(this.domNode, 'display', 'none');
            },
            show:function () {
                dojo.style(this.domNode, 'display', 'block');
                this.focusFirst();
            },
            judul:'Title',
            _setJudulAttr:function (judul) {
                this._set('judul', judul);
                if (this.titlePanel)
                    this.titlePanel.innerHTML = judul;

            },
            repeat:true,
            _setRepeatAttr:function (repeat) {
                this._set('repeat', repeat)
            },
            develop:false,
            _setDevelopAttr:function (develop) {
                this._set('develop', develop)
            },
            clear:function () {
                this.reset();
            },
            focusFirst:function () {
                var cds = this.getChildren();
                for (var i = 0; i < cds.length; i++) {
                    var e = cds[i];
                    var ti = (e.get) ? e.get('tabIndex') : e.tabIndex;
                    if ('0-1'.indexOf(ti) != -1) {
                        this.reset();
                        e.focus();
                        break;

                    }
                }
            },
            onSave:function (jvalue, form) {
                this.focusFirst();
                if (!this.repeat) {
                    this.onEscape();
                }
            }, onCancel:function () {
                this.reset();
                this.hide();

            }, onEscape:function () {
                this.onCancel();

            }
        })
    }
)
