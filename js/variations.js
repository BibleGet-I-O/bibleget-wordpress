const { registerBlockVariation } = wp.blocks;
const { __ } = wp.i18n;
const { createElement } = wp.element;

const biblePopupIcon = createElement('svg', {
		'aria-hidden': 'true',
		focusable: 'false',
		width: 20,
		height: 20,
		role: 'img',
		'viewBox': '0 0 20 20',
		xmlns: "http://www.w3.org/2000/svg"
	}, createElement('rect', {
		x: 0,
		fill: "none",
		width: 20,
		height: 20
	}), createElement('path', {
		d: "m 15,10 h -4 v 2 h 1 l 1,1 v -1 h 2 z m -5,2 H 9 v 2 H 5 v -4 h 5 z m -2,1 v 1 l 1,-1 z",
		style: {
			fill: "#000000"
		}
	}), createElement('path', {
		d: "m 5,17 h 13 v 2 H 5 C 3.34,19 2,17.66 2,16 V 4 C 2,2.34 3.34,1 5,1 H 18 V 15 H 5 c -0.55,0 -1,0.45 -1,1 0,0.55 0.45,1 1,1 z m 6,-3.5 V 6.25 h 3.5 c 0.235702,0 0.5,-0.2642977 0.5,-0.5 0,-0.2357023 -0.264298,-0.5 -0.5,-0.5 H 11 V 2.5 C 11,2.22 10.78,2 10.5,2 10.22,2 10,2.22 10,2.5 V 5.25 H 6.5 C 6.2642977,5.25 6,5.5142977 6,5.75 6,5.9857023 6.2642977,6.25 6.5,6.25 H 10 v 7.25 c 0,0.28 0.22,0.5 0.5,0.5 0.28,0 0.5,-0.22 0.5,-0.5 z"
	}), createElement('g', {
			transform: "translate(-1)"
		}, createElement('path', {
			d: "m 5.75,16.425 h 1.5 v 3.5 L 6.5,19.225 5.75,19.925 Z"
		}), createElement('path', {
			d: "m 6,16.325 h 1 v 3.1 L 6.5,18.925 6,19.425 Z",
			style: {
				fill: "#ffffff",
				strokeWidth: 0.756
			}
		})
	), createElement('g', {
		}, createElement('path', {
			d: "m 15.168293,0.0909007 h 3.334838 c 0.755795,0 1.364252,0.60910246 1.364252,1.3657007 v 1.3657005 c 0,0.7565981 -0.608457,1.3657006 -1.364252,1.3657006 h -3.334838 l -1.363807,0.8398426 c 0,0 -4.45e-4,-1.8272441 -4.45e-4,-2.2055432 V 1.4566014 c 0,-0.75659824 0.608456,-1.3657007 1.364252,-1.3657007 z",
			style: {
				fill: "#ffffff",
				stroke: "#ffffff",
				strokeWidth: 0.2,
				strokeMiterlimit: 4,
				strokeDasharray: "none"
			}
		}), createElement('path', {
			d: "m 15.177478,0.17135863 h 3.231335 c 0.732337,0 1.321909,0.5895716 1.321909,1.32190947 v 1.3219094 c 0,0.7323378 -0.589572,1.3219094 -1.321909,1.3219094 H 15.177478 L 13.856,4.95 c 0,0 -4.31e-4,-1.7686536 -4.31e-4,-2.1348225 V 1.4932681 c 0,-0.73233787 0.589571,-1.32190947 1.321909,-1.32190947 z",
			style: {
				fill: "#ffffff",
				stroke: "#000000",
				strokeWidth: 0.2,
				strokeMiterlimit: 4,
				strokeDasharray: "none"
			}
		}), createElement('circle', {
			r: 0.073,
			cy: 2.23,
			cx: 15.92,
			style: {
				fill:"#000000"
			}
		}), createElement('circle', {
			r: 0.073,
			cy: 2.23,
			cx: 16.92,
			style: {
				fill:"#000000"
			}
		}), createElement('circle', {
			r: 0.073,
			cy: 2.23,
			cx: 17.92,
			style: {
				fill:"#000000"
			}
		})
	), createElement('rect', {
		width: 3.3,
		height: 0.8,
		x: 16.5,
		y: 6.2,
		ry: 0.38,
		transform: "rotate(-30, 16.5, 6.6)",
		style: {
			fill: "#ffffff",
			stroke: "#000000",
			strokeWidth: 0.06,
			strokeLinecap: "round",
			strokeLinejoin: "miter",
			strokeMiterlimit: 4,
			strokeDasharray: "none"
		}
	}), createElement('rect', {
		width: 3.8,
		height: 0.8,
		x: 15.6,
		y: 8.7,
		ry: 0.38,
		style: {
			fill: "#ffffff",
			stroke: "#000000",
			strokeWidth: 0.06,
			strokeLinecap: "round",
			strokeLinejoin: "miter",
			strokeMiterlimit: 4,
			strokeDasharray: "none"
		}
	}), createElement('rect', {
		width: 3.3,
		height: 0.8,
		x: 16.5,
		y: 11.6,
		ry: 0.38,
		transform: "rotate(30, 16.5, 12.1)",
		style: {
			fill: "#ffffff",
			stroke: "#000000",
			strokeWidth: 0.06,
			strokeLinecap: "round",
			strokeLinejoin: "miter",
			strokeMiterlimit: 4,
			strokeDasharray: "none"
		}
	})
);


registerBlockVariation(
	'bibleget/bible-quote',
	{
		name: 'bible-quote-inline',
		title: __( 'Inline Bible quote', 'bibleget-io' ),
		icon: biblePopupIcon,
		attributes: {
			POPUP: true
		},
		isActive: [ 'POPUP' ]
	}
);
