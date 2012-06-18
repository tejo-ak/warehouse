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
                this.prepareGreditor();
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
            prepareGrid:function () {
                var g = new lib.Greditor({structure:[
                    {field:'menu', name:'Menu', width:'100%'}
                ]}, 'dvgreditor');
                g.setJStore([{menu:'Menu Baru'},{menu:'Menu Baru'},{menu:'Menu Baru'},{menu:'Menu Baru'},{menu:'Menu Baru'},{menu:'Menu Baru'},{menu:'Menu Baru'},{menu:'Menu Lama'}])

            }
        }

        return singleton.init();
    }
)