/// <reference path="./../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />

(() => {
	var jwindow = $(window);

	var ttop = $("#layout-top"),
		tbottom = $("#layout-bottom"),
		tslidder = $("#layout-slidder"),
		statusbar = $('#status-bar');

	function layout() {
		var height = window.innerHeight - tslidder.height()-statusbar.height();
		ttop.height(height);
		$('#layout-supertop').height(height);
		ttop.css('margin-top', statusbar.height());
		tbottom.children('#view-bottom').height(Math.max(0, jwindow.scrollTop()));
		tbottom.height(height);
	}

	layout();

	jwindow.on('resize', layout);

	var startY = 0, currentY = 0, scrollTopStart = 0, diffA = 0, diffB = 0;

	function stopIt() {
		document.removeEventListener('mousemove', documentMouseMoveListener);
		document.removeEventListener('mouseup', stopIt);
		return;

		// start inertia

		var speed = diffA + diffB;

		if (speed > 20 || speed < -20) {
			if (speed > 100 || speed < -100) {
				speed *= 2.5; // some boost
			}
			animate(speed*1.75, 1);
		}

		diffA = 0;
		diffB = 0;
	}

	function animate(move, op) {
		var dir = Math.round(move * 0.15);
		window.scrollBy(0, dir);
		move -= dir;
		if (dir > 1 || dir < -1) {
			window.requestAnimationFrame(() => {
				animate(move, op + 1);
			});
		}
	}

	var getHeight = (element: JQuery) : number => {
		var height : number = element.outerHeight(true);
		if (height === 0) {
			element.children().each((index, content: Element)=> {
				height += getHeight($(content));
			});
		}
		return height;
	};

	var jbody = $(document.body);
	jwindow.on('layout-scroll-bottom', ()=> {
		jbody.animate({ scrollTop: tbottom.offset().top }, 500);
	}).on('layout-scroll-element', (e: JQueryEventObject, element?) => {
		if (element) {
			jbody.animate({ scrollTop: $(element).offset().top }, 500);
		}
	}).on('layout-scroll-bottom-content', () => {
		var height = getHeight($('#view-bottom > *'));

		jbody.animate({ scrollTop: height}, 500);
	}).on('layout-scroll-top', () => {
		jbody.animate({ scrollTop: 0 }, 500);
	});

	function documentMouseMoveListener(e) {
		var y = e.clientY;

		if (y === currentY) return;

		diffB = diffA;
		diffA = currentY - y;

		currentY = y;

		window.scrollTo(0, scrollTopStart + startY - currentY);
	}

	tslidder.on('mousedown', (e) => {
		diffA = diffB = 0;
		startY = e.clientY;
		scrollTopStart = jwindow.scrollTop();
		e.preventDefault();

		document.addEventListener('mousemove', documentMouseMoveListener);
		document.addEventListener('mouseup', stopIt);
	});

	var t = 0;
	document.addEventListener('scroll', ()=> {
//		$('#map').height(ttop.height()-jwindow.scrollTop());
		if (t !== 0) {
			window.clearTimeout(t);
		}
		t = window.setTimeout(() => {
			var s = jwindow.scrollTop();
			tbottom.children('#view-bottom').height(Math.max(0, jwindow.scrollTop()));
			jwindow.trigger('layout-scroll-end');

//			if (s == 0) {
//				$('#layout-supertop').show();
//				$('#layout-bottom').hide();
////				window.scrollTo(0, jwindow.height());
//			} else if (s > 500) {
//				$('#layout-bottom').show();
//				$('#layout-supertop').hide();
//			}
//
			
		},42);
	});

	document.addEventListener('gesturechange', () => { });

	// Agressive workaround for the ipad scrolling on inputs
	/*$(document).on('focus', 'input', (e)=> {
		var scroll = jwindow.scrollTop();
		if (scroll > jwindow.height()) {
			window.setImmediate(()=> jwindow.scrollTop(scroll));
		}
	});*/
})(); 