/**
 * Created by PyCharm.
 * User: User
 * Date: 6/25/12
 * Time: 3:58 PM
 * To change this template use File | Settings | File Templates.
 */
define(["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.widget.rotator.Slide");
    (function (d) {
        var bawah = 0, kanan = 1, atas = 2, kiri = 3;

        function slodet(dirrection, myElement) {
            var _a = myElement.node = myElement.next.node, r = myElement.rotatorBox, m = dirrection % 2, s = (m ? r.w : r.h) * (dirrection < 2 ? -1 : 1);
            d.style(_a, {display:"", zIndex:(d.style(myElement.current.node, "zIndex") || 1) + 1});
            if (!myElement.properties) {
                myElement.properties = {};
            }
            myElement.properties[m ? "left" : "top"] = {start:s, end:0};
            return d.animateProperty(myElement);
        }

        ;
        d.mixin(dojox.widget.rotator, {
            slideDown:function (_b) {
                return slodet(bawah, _b);
            }, slideRight:function (_c) {
                return slodet(kanan, _c);
            }, slideUp:function (_d) {
                return slodet(atas, _d);
            }, slideLeft:function (_e) {
                return slodet(kiri, _e);
            }});
    })(dojo);
}); 
