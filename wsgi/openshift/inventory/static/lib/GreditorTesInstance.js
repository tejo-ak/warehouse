/**
 * Created by PyCharm.
 * User: User
 * Date: 6/16/12
 * Time: 6:24 AM
 * To change this template use File | Settings | File Templates.
 */
define(['dojo',
    'dojo/parser',
    'dijit/registry',
    'lib/TabUtil',
    'lib/AccordUtil',
    'lib/dojote',
    'dojox/form/Manager',
    'dijit/form/TextBox',
    'lib/CustomDatebox',
    'lib/LookupParam',
    'lib/CustomGrid',
    'lib/Greditor',
    'lib/Grediform',
    'lib/CustomButton'
], function (dojo, parser, dijit, tabUtil, accordUtil, dojote) {
        var singleton = {
            init:function () {
                this.startup();
                return this;
            },
            startup:function () {
                dojo.subscribe('onMenuGreditor', dojo.hitch(this, 'prepareGreditor'));
            },
            prepareGreditor:function () {
                if (!dojote.cekWidget(this.formGreditor)) {
                    dojote.callXhrGet('/site_media/lib/GreditorTesHtml.html', {}, dojo.hitch(this, function (e) {
                        this.formGreditor = tabUtil.putinFirstTab('Greditor', e)
                        this.prepareGrid();
                    }))

                } else {
                    tabUtil.closeAfterTab(this.formGreditor);
                    this.prepareGrid();
                }
            },
            buildForm:function (arg) {
                arg = (arg) ? arg : {};

            },
            prepareGrid:function () {
                var g = new lib.Greditor({structure:[
                    {field:'menu', name:'Menu', width:'100%'}
                ], grediform:'formItemEditor', detailerFilter:['menu'], withEditor:true,
                    saveParam:{c:'simpandokumen'},
                    paramItems:[
                        {field:'nama', name:'Nama', type:'teks'},
                        {field:'c', name:'c', type:'hidden'},
                        {field:'id', name:'id', type:'hidden'}
                    ] }, 'dvgreditor');
                g.setJStore([
                    {menu:'Menu Baru'},
                    {menu:'Menu Baru'},
                    {menu:'Menu Baru'},
                    {menu:'Menu Baru'},
                    {menu:'Menu Baru'},
                    {menu:'Menu Baru'},
                    {menu:'Menu Baru'},
                    {menu:'Menu Lama'}
                ]);
                if (!this.greditorOnBeforeEditorSaveHandler)
                    this.greditorOnBeforeEditorSaveHandler = dojo.connect(
                        g, 'onBeforeEditorSave', dojo.hitch(this, function (e) {
                            console.log('observer client before save');
                            console.log(e.data);
                            console.log(e.form);
                            e.data['tambahanclient'] = 'ini dari client lhooo';
                            g.mergeSaveParam({save:true});
                            return e;
                        })
                    )
                g.mergeParam({id:23, c:'browsedpdokumen', nama:'Tejo'});
                if (!this.gDblClickHandler)
                    this.gDblClickHandler = dojo.connect(g, 'onGridDblClick', dojo.hitch(this, function (e) {
                        console.log('this is grid double click handler from client code')
                    }))
                if (!this.gClickHandler)
                    this.gClickHandler = dojo.connect(g, 'onGridClick', dojo.hitch(this, function (e) {
                        console.log('this is grid single click handler from client code')
                    }))

            }
        }

        return singleton.init();
    }
)