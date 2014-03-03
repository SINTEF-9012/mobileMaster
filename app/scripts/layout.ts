(() => {
	var jwindow = $(window);

	var ttop = $("#layout-top"),
		tbottom = $("#layout-bottom"),
		tslidder = $("#layout-slidder"),
		tbottomContent = tbottom.children();

	function layout() {
		var height = window.innerHeight - tslidder.height();
		ttop.height(height);
		tbottom.height(height);
	}

	layout();

	document.addEventListener('resize', layout);

	var startY = 0, currentY = 0, scrollTopStart = 0, diffA = 0, diffB = 0;

	function stopIt() {
		document.removeEventListener('mousemove', documentMouseMoveListener);
		document.removeEventListener('mouseup', stopIt);

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

	function nan(e) {
		e.preventDefault();
	}


	function documentMouseMoveListener(e) {
		var y = e.clientY;

		if (y === currentY) return;

		diffB = diffA;
		diffA = currentY - y;

		currentY = y;

		window.scrollTo(0, scrollTopStart + startY - currentY);
	}

	tslidder.on('mousedown', (e) => {
		startY = e.clientY;
		scrollTopStart = jwindow.scrollTop();
		e.preventDefault();

		document.addEventListener('mousemove', documentMouseMoveListener);
		document.addEventListener('mouseup', stopIt);
	});

	var t = 0;
	document.addEventListener('scroll', ()=> {
		if (t !== 0) {
			window.clearTimeout(t);
		}
		t = window.setTimeout(() => {
			tbottom.children().height(Math.max(0, jwindow.scrollTop()));
			jwindow.trigger('layout-scroll-end');
		},100);
	});

	document.addEventListener('gesturechange', ()=> {});
})(); 