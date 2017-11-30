import Liveness from './components/liveness/liveness';

( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		module.exports = global.Liveness =  global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "Liveness requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		global.Liveness = factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

"use strict";

return Liveness;
} );
