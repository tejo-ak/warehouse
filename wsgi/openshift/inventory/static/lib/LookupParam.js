/**
 * Created by PyCharm.
 * User: jote
 * Date: 5/19/12
 * Time: 6:51 AM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo/_base/declare",
    "dojo/parser",
    "dojo/ready",
    "lib/dojote",
    "dijit/_WidgetBase" ,
    "dijit/form/TextBox",
    "dijit/_Templated",
    "lib/AccordUtil",
    "dijit/form/Button",
    "lib/CustomDatebox",
    "dojox/form/Manager",
    "dijit/_FocusMixin",
    "dijit/_Widget"
], function
    (declare, parser, ready, dojote, _WidgetBase, TextBox, _Templated, accordUtil) {
    declare("lib.LookupParam", [_WidgetBase, _Templated, dijit._FocusMixin ], {
//            Sample of Structure
            structure:[
                {field:'nama', name:'Nama', type:'teks'},
                {field:'tglLahir', name:'Tanggal Lahir', type:'tanggal'},
                {field:'tglLahir', name:'Tanggal Lahir', type:'tanggalRange'}
            ],
            initialParam:null,
//            structure:[ ],
            templateString:"<div><div class='lpContainer' dojoType='dojox.form.Manager' style='width:100%'></div></div>",
            widgetsInTemplate:true,
            postCreate:function () {
                this.inherited("postCreate", arguments);
                this.bag = dojo.query('.lpContainer', this.domNode)[0];
                this.formLookup = dijit.getEnclosingWidget(this.bag);
                this.buildStructure();
                dojo.connect(this.domNode, 'onkeypress', dojo.hitch(this, this.onKeyPress))
            },
            buildStructure:function () {
                if (this.structure && this.structure.length) {
                    var firstFocus = true;
                    var firstFocusObject = null;
                    this.structure.forEach(dojo.hitch(this, function (st, idx) {
                        if ('teks' == st.type) {
                            var lbl = dojo.doc.createElement('div');
                            lbl.innerHTML = st.name;
                            dojo.addClass(lbl, 'siderLabel');
                            dojo.addClass(lbl, st.field + 'Label');
                            this.bag.appendChild(lbl);
                            var txt = new dijit.form.TextBox({name:st.field});
                            dojo.style(txt.domNode, 'width', '95%');
                            this.bag.appendChild(txt.domNode);
                            if (firstFocus) {
                                firstFocusObject = txt;
                            }
                        } else if ('hidden' == st.type) {
                            var lbl = dojo.doc.createElement('div');
                            lbl.innerHTML = st.name;
                            dojo.addClass(lbl, 'siderLabel');
                            dojo.addClass(lbl, st.field + 'Label');
                            dojo.style(lbl, 'display', 'none');
                            this.bag.appendChild(lbl);
                            var txt = new dijit.form.TextBox({name:st.field, type:'hidden'});
                            dojo.style(txt.domNode, 'width', '95%');
                            this.bag.appendChild(txt.domNode);
                            if (firstFocus) {
                                firstFocusObject = txt;
                            }
                        } else if ('tanggal' == st.type) {
                            var lbl = dojo.doc.createElement('div');
                            lbl.innerHTML = st.name;
                            dojo.addClass(lbl, 'siderLabel');
                            dojo.addClass(lbl, st.field + 'Label');
                            this.bag.appendChild(lbl);
                            var txt = new lib.CustomDatebox({name:st.field });
                            txt.placeHolder = 'dari:';
                            dojo.style(txt.domNode, 'width', '95%');
                            txt.constraints = {datePattern:'dd-MMM-yyyy', selector:'date'}
                            this.bag.appendChild(txt.domNode);
                            if (firstFocus) {
                                firstFocusObject = txt;
                            }
                        } else if ('tanggalRange' == st.type) {
                            var lbl = dojo.doc.createElement('div');
                            lbl.innerHTML = st.name;
                            dojo.addClass(lbl, 'siderLabel');
                            dojo.addClass(lbl, st.field + 'Label');
                            this.bag.appendChild(lbl);
                            var txt = new lib.CustomDatebox({name:st.field + '_awal'});
                            txt.placeHolder = 'dari:';
                            dojo.style(txt.domNode, 'width', '95%');
                            txt.constraints = {datePattern:'dd-MMM-yyyy', selector:'date'}
                            this.bag.appendChild(txt.domNode);
                            var sd = dojo.doc.createElement('div');
                            sd.innerHTML = 's.d';
                            dojo.style(sd, 'textAlign', 'right');
                            dojo.addClass(sd, 'siderLabel');
                            dojo.addClass(sd, st.field + 'sd');
                            this.bag.appendChild(sd);
                            var txtAkhir = new lib.CustomDatebox({name:st.field + '_akhir'});
                            dojo.style(txtAkhir.domNode, 'width', '95%');
                            txtAkhir.constraints = {datePattern:'dd-MMM-yyyy', selector:'date'}
                            this.bag.appendChild(txtAkhir.domNode);
                            if (firstFocus) {
                                firstFocusObject = txt;
                            }
                        }
                        firstFocus = false;
                        var brs = dojo.doc.createElement('div');
                        dojo.style(brs, 'height', '8px');
                        this.bag.appendChild(brs);
                    }))
                    var btn = new dijit.form.Button({name:'btnGoLookup'});
                    dojo.addClass(btn.domNode, 'btnGoLookup');
                    btn.set('label', 'Go lookup!');
                    this.bag.appendChild(btn.domNode);
                    this.firstFocusObject = firstFocusObject;
                    this.btnGoLookup = dojo.query('[role="button"]', dojo.query(' .btnGoLookup', this.domNode)[0])[0];
                    dojo.connect(this.btnGoLookup, 'onclick', dojo.hitch(this, function () {
                        this.onLookup(this.formLookup.gatherFormValues());
                    }))

                }
            },
            setStructureAttr:function (structure) {
                this.structures = structure;
                dojote.killWidgetDescendant(this.formLookup);
                this.buildStructure()
            },
            onLookup:function (param) {
                //your implementation here
            },
            onEscape:function () {

                accordUtil.openMenu();
            },
            setValue:function (val) {
                if (!val) {
                    this.formLookup.reset();
                    return'';
                }
                this.formLookup.setFormValues(val)
            },
            onKeyPress:function (e) {
                if ('13' == e.keyCode) {
                    this.onLookup(this.formLookup.gatherFormValues());
                }
                if (e.altKey && '46' == e.keyCode) {
                    //alt del here
                    this.formLookup.reset();
                }
                if ('27' == e.keyCode) {
                    dojo.stopEvent(e);
                    this.btnGoLookup.focus();
                    setTimeout(this.onEscape, 50);

                }
            }
        }
    )
})
