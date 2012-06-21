/**
 * Created by PyCharm.
 * User: User
 * Date: 6/16/12
 * Time: 6:21 AM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo",
//    'dijit/registry',
    "dojo/_base/declare",
    "dojo/parser",
    "dojo/ready",
    "dijit/_WidgetBase" ,
    "dojo/dom-construct",
    "dijit/_TemplatedMixin" ,
    "lib/dojote",
    'lib/AccordUtil',
    "dijit/form/Button" ,
    "dijit/form/TextBox" ,
    "dojox/grid/DataGrid",
    "dijit/_FocusMixin",
    'dojo/data/ObjectStore',
    'dojo/store/Memory'

], function (dojo, declare, parser, ready, _WidgetBase, c, _Templated, dojote, accordUtil) {

        declare("lib.Greditor", [_WidgetBase, _Templated, dijit._FocusMixin], {
            widgetsInTemplate:true,
            structure:[],
//            templateString:"<div>" +
//                "<div class='greditorPanelContainer' style='border-top:1px solid #dedede; background-color: #efefef;margin: 0px;padding: 0px'>" +
//                "<span style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
//                "onMouseOut='this.style.color=\"black\"' onMouseOver='this.style.color=\"blue\"' " +
//                "class='btnTbh'>add</span> " +
//                "<a style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
//                "onMouseOut='this.style.color=\"black\"' onMouseOver='this.style.color=\"blue\"' " +
//                "class='btnHapus'>del</a>&nbsp;" +
//                "<span style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
//                "onMouseOut='this.style.color=\"black\"' onMouseOver='this.style.color=\"blue\"' " +
//                "class='btnSeek'>seek</span>&nbsp;" +
//                "<span style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
//                "onMouseOut='this.style.color=\"black\"' onMouseOver='this.style.color=\"blue\"' " +
//                "class='btnRefrez'>refresh</span>&nbsp;&nbsp;&nbsp;&nbsp;" +
//                "<a style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
//                "onMouseOut='this.style.color=\"black\"' onMouseOver='this.style.color=\"blue\"' " +
//                "class='btnPrev soriaprev'><img width='15px'  height='15px' src='../../site_media/img/spacer_crud.gif' alt='previous page'/></a>&nbsp;&nbsp;" +
//                "<input  style='width:30px' value='1' name='currentpage'>" +
//                "<span class='pagelabel'>of 0 pages &nbsp;&nbsp;</span> " +
//                "<a style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
//                "onMouseOut='this.style.color=\"black\"' onMouseOver='this.style.color=\"blue\"' " +
//                "class='btnNext sorianext'><img width='15px'  height='15px' src='../../site_media/img/spacer_crud.gif' alt='next page'/></a>&nbsp;&nbsp;" +
//                "</div>" +
//                "<div class='gridPan'></div>" +
//                "</div>",
            templateString:"<div>" +
                "<div class='greditorPanelContainer' style='border-top:1px solid #dedede; background-color: #efefef;margin: 0px;padding: 0px'>" +
                "<span style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
                "class='btnTbh greditoradd'><img class='centrimage' src='../../site_media/img/spacer_crud.gif' width='20px' height='20px' title='add' alt='tambah'></span> " +
                "<a style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
                "class='btnHapus greditordel'><img class='centrimage'  src='../../site_media/img/spacer_crud.gif' width='20px' height='20px'></a>&nbsp;" +
                "<span style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
                "class='btnSeek greditorseek'><img class='centrimage'  src='../../site_media/img/spacer_crud.gif' width='20px' height='20px'></span>&nbsp;" +
                "<span style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
                "class='btnRefrez greditorrefresh'><img class='centrimage'  src='../../site_media/img/spacer_crud.gif' width='20px' height='20px'></span>&nbsp;&nbsp;&nbsp;&nbsp;" +
                "<a style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
                "class='btnPrev greditorprev'><img class='centrimage'  src='../../site_media/img/spacer_crud.gif' width='20px' height='20px'></a>&nbsp;&nbsp;" +
                "<input  style='width:30px;' class='centrimage' value='1' name='currentpage'>" +
                "<span class='pagelabel'> of 0</span> " +
                "<a style='text-decoration: underline;font-weight: bold;cursor:pointer' " +
                "class='btnNext greditornext'><img class='centrimage'  src='../../site_media/img/spacer_crud.gif' width='20px' height='20px'></a>&nbsp;&nbsp;" +
                "</div>" +
                "<div class='gridPan'></div>" +
                "</div>",
            postCreate:function () {
                this.inherited('postCreate', arguments);
                this.buildWidget();
                this.grid = new dojox.grid.DataGrid({structure:this.structure,
                        store:new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:[]})})}
                    , this.dvGrid.id);
                this.grid.startup();
                this.btnAdd = dojo.query('.btnTbh', this.domNode)[0];
                this.btnDel = dojo.query('.btnHapus', this.domNode)[0];
                this.btnLookup = dojo.query('.btnSeek', this.domNode)[0];
                this.btnRefrez = dojo.query('.btnRefrez', this.domNode)[0];
                this.btnPrev = dojo.query('.btnPrev', this.domNode)[0];
                this.pagelabel = dojo.query('.pagelabel', this.domNode)[0];
                this.btnNext = dojo.query('.btnNext', this.domNode)[0];
                this.txtPage = dojote.byName('currentpage');
                if (!this.btnAddHandler)
                    this.btnAddHandler = dojo.connect(this.btnAdd, 'onclick', dojo.hitch(this, this.onAdd))
                if (!this.onKeyPressHandler)
                    this.onKeyPressHandler = dojo.connect(this.domNode, 'onkeypress', dojote.thitch(this, this.onTekan))
                var grediform = this.getGrediform();
                if (grediform && !this.onEditorEndHandler)
                    this.onEditorEnd = dojo.connect(grediform, 'onCancel', dojo.hitch(this, this.onEditorEnd));
                if (grediform && !this.onEditorSaveHandler)
                    this.onEditorEnd = dojo.connect(grediform, 'onSave', dojo.hitch(this, this.onEditorSave));
                if (dojote.cekWidget(this.grid) && !this.onGridClickHandler)
                    this.onGridClickHandler = dojo.connect(this.grid, 'onRowClick', dojo.hitch(this, this.onGridClickManager));
                if (dojote.cekWidget(this.grid) && !this.onGridDblClickHandler)
                    this.onGridDblClickHandler = dojo.connect(this.grid, 'onRowDblClick', dojo.hitch(this, this.onGridDblClickManager));
                if (!this.btnSeekHandler)
                    this.btnSeekHandler = dojo.connect(this.btnLookup, 'onclick', dojo.hitch(this, 'showLookup'))
                if (!this.btnNextHandler)
                    this.btnNextHandler = dojo.connect(this.btnNext, 'onclick', dojo.hitch(this, function () {
                        this.gotoPage(this.currentPage++)
                    }))
                if (!this.btnPrevHandler)
                    this.btnPrevHandler = dojo.connect(this.btnPrev, 'onclick', dojo.hitch(this, function () {
                        this.gotoPage(this.currentPage--)
                    }))
                if (!this.btnRefrezHandler)
                    this.btnRefrezHandler = dojo.connect(this.btnRefrez, 'onclick', dojo.hitch(this, function () {
                        this.gotoPage(this.currentPage)
                    }))
                this.switchPaging(this.withPaging);
                this.switchEditor(this.withEditor);
            },
            onGridDblClickManager:function (e) {
                clearTimeout(this.clickTimer);
                this.clickTimer = null;
                this.clickSession = false;
            },
            onGridClickManager:function (e) {
                var f = {};
                f['event'] = e
                f['grid'] = this.grid;
                f['row'] = this.grid.selection.getSelected()[0];
                this.dblClickDelay = 250;
                if (this.clickSession) {
                    clearTimeout(this.clickTimer);
                    this.clickTimer = null;
                    this.clickSession = false;
                    this.onGridDblClick(f);
                } else {
                    this.clickSession = true;
                    this.clickTimer = setTimeout(dojo.hitch(this, function (f) {
                        if (this.clickSession) {
                            this.onGridClick(f)
                        }
                        clearTimeout(this.clickTimer);
                        this.clickSession = false;
                        this.clickTimer = null;

                    }, f), this.dblClickDelay)
                }

            },
            onGridDblClick:function (f) {
            },
            onGridClick:function (f) {
                //default implementation of grid click: show sider
                this.prepareDetail({data:f.row})
            },
            prepareDetail:function (arg) {
                var arg = (arg) ? arg : {};
                if (this.detailerFilter && this.detailerFilter.length) {
                    if (!dojote.cekWidget(this.dtlPort)) {
                        this.dtlPort = dojote.preparePortlet('Detail', 2, 'loading detail ..')
                    }
//                    if (!dojote.cekWidget(this.detailView)) {
                    this.detailView = new lib.DetailView();
//                    }
                    this.detailView.set('data', dojote.jorder(arg.data, this.detailerFilter))
                    this.dtlPort.set('content', this.detailView);
                }

            },
            onEditorEnd:function () {
                this.editing = false;
            },
            onEditorSave:function (jvalue, form) {
                var jval = this.onBeforeEditorSave({data:jvalue, form:form});
                var svPar = dojo.mixin(jval.data, this.saveParam)
                console.log('svPar')
                console.log(svPar)
                if (this.url)
                    dojote.callXhrJsonPost(this.url, svPar, dojo.hitch(this, this.onAfterEditorSave));
            },
            onDel:function (e) {
                var jval = this.onBeforeDel(e);
                var delPar = dojo.mixin(e, this.delParam);
                if (this.url)
                    dojote.calXhrJsonPost(this.url, delPar, dojo.hitch(this, this.onAfterDel));
            },
            onBeforeDel:function (e) {
                return e;
            },
            onAfterEditorSave:function (e) {
                this.gotoPage(this.currentPage)
                //refresh grid by default
            },
            onAfterDel:function (e) {
                //refresh grid by default
            },
            onBeforeEditorSave:function (e) {
                return e;
            },
            editing:false,
            onAdd:function () {
                var gdf = this.getGrediform();
                if (gdf) {
                    this.editing = true;
                    gdf.show();
                    gdf.clear();
                }
            },
            onTekan:function (e) {

            },
            onPaging:function (page, size) {

            },
            onQuery:function (jparam) {

            },
            buildWidget:function () {
                this.gridPanel = dojo.query('.greditorPanelContainer', this.domNode)[0];
                this.gridPan = dojo.query('.gridPan', this.domNode)[0];
                //prepare grid
                var id = 'grid_' + dojote.getUuid().substr(0, 6).toLowerCase();
                this.dvGrid = c.create('div', {id:id,
                    style:{height:'100%'}}, this.gridPan, 'last');
            },
            setStore:function (store) {
                if (dojote.cekWidget(this.grid)) {
                    this.grid.setStore(store)
                }
            },
            setJStore:function (jstore) {
                if (dojote.cekWidget(this.grid)) {
                    this.grid.setStore(new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:jstore})}))
                }

            },
            queri:function (page) {
                //unset url to prevent from http requesting
                var needCount = (page) ? false : true;
                var page = (page) ? page : 1;//null page means initial query to page one
                this.queryId = dojote.getUuid()
                var par = dojo.mixin(this.param, {page:1, size:this.size, queryId:this.queryId})
                if (this.url)
                    dojote.callXhrJsonPost(this.url, this.param, dojo.hitch(this, function (e) {
                        if (e && e.data && this.queryId == e.queryId) {
                            this.setJStore(e.data);
                        }
                    }))
                if (needCount)
                    this.count();
            },
            count:function () {
                if (this.url)
                    dojote.callXhrJsonPost(this.url, dojo.mixin(this.param, {count:true}), dojo.hitch(this, function (e) {
                        if (e && e.count) {
                            this.rowCount = e.count;
                            this.pageCount = (this.rowCount - (this.rowCount % this.size) / this.size) + 1;
                            this.pagelabel.innerHTML = ' of ' + this.pageCount;
                            this.currentPage = 1
                        }
                    }))
            },
            gotoPage:function (page) {
                if (page > 0 && page <= this.pageCount) {
                    this.queri(page);
                }
            },
            getGrediform:function () {
                var gdf = dijit.byId(this.grediform);
                if (this.grediform && gdf) {
                    return gdf;
                }
                return null;
            },

            showLookup:function () {
                var au = accordUtil.openLookup(this.paramItems, dojo.hitch(this, function (param) {
                    this.param = param
                    this.queri();
                }), this.param);

            },
            grediform:null,
            _setGrediformAttr:function (grediform) {
                this._set('grediform', grediform);
            },
            detailerFilter:null,
            _setDetailerFilterAttr:function (detailerFilter) {
                this._set('detailerFilter', detailerFilter);
            },
            withEditor:true,
            _setWithEditorAttr:function (withEditor) {
                this._set('withEditor', withEditor);
                this.switchEditor(withEditor);

            },
            url:null,
            _setUrlAttr:function (url) {
                this._set('url', url);

            },
            //pagination size, default 20
            size:20,
            _setSizeAttr:function (size) {
                this._set('size', size);

            },
            //param untuk di tampilkan dalam lookup param
            paramItems:[],
            _setParamItemsAttr:function (paramItems) {
                this._set('paramItems', paramItems);

            },
            param:{},
            _setParamAttr:function (param) {
                this._set('param', param);

            },
            saveParam:{},
            _setSaveParamAttr:function (saveParam) {
                this._set('saveParam', saveParam);
            },
            delParam:{},
            _setDelParamAttr:function (delParam) {
                this._set('delParam', delParam);
            },
            mergeParam:function (param) {
                this.param = dojo.mixin(this.param, param);
            },
            mergeSaveParam:function (delParam) {
                this.delParam = dojo.mixin(this.delParam, delParam);
            },
            mergeDelParam:function (saveParam) {
                this.saveParam = dojo.mixin(this.saveParam, saveParam);
            },
            switchEditor:function (withEditor) {
                if (this.btnAdd)
                    dojo.style(this.btnAdd, 'display', (withEditor) ? 'inline-block' : 'none');
                if (this.btnDel)
                    dojo.style(this.btnDel, 'display', (withEditor) ? 'inline-block' : 'none');
                if (this.btnLookup)
                    dojo.style(this.btnLookup, 'display', (withEditor) ? 'inline-block' : 'none');
                if (this.btnRefrez)
                    dojo.style(this.btnRefrez, 'display', (withEditor) ? 'inline-block' : 'none');
            },
            withPaging:true,
            _setWithPagingAttr:function (withPaging) {
                this._set('withPaging', withPaging);
                this.switchPaging(withPaging);

            },
            switchPaging:function (withPaging) {
                if (this.btnPrev) {
                    dojo.style(this.btnPrev, 'display', (withPaging) ? 'inline-block' : 'none');
                    dojo.style(this.btnNext, 'display', (withPaging) ? 'inline-block' : 'none');
                    dojo.style(this.pagelabel, 'display', (withPaging) ? 'inline-block' : 'none');
                    dojo.style(this.txtPage, 'display', (withPaging) ? 'inline-block' : 'none');
                }

            }
        })
    }
)
