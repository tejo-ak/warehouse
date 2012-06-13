/**
 * Created by PyCharm.
 * User: jote
 * Date: 5/14/12
 * Time: 4:28 PM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo/parser",
    "dojo/_base/declare",
    "dijit/form/Button",
    "dojo/date/locale",
    "dojo/_base/lang"
], function (parser, declare, Button, locale, lang) {

    declare("lib.CustomButton", Button, {


        postCreate:function () {
            this.inherited(arguments);
            if (!this.onKeyPressHandler)
                this.onKeyPressHandler = dojo.connect(this, 'onKeyPress', dojo.hitch(this, function (e) {
                    if ('13' == e.keyCode) {
                        //this.onClick(e);
                        this.onOk();
                    }
                }))
        },
        onOk:function (e) {

        }
    });

})
;