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
		d: "M 5 17 L 18 17 L 18 19 L 5 19 C 3.34 19 2 17.66 2 16 L 2 4 C 2 2.34 3.34 1 5 1 L 18 1 L 18 15 L 5 15 C 4.45 15 4 15.45 4 16 C 4 16.55 4.45 17 5 17 Z M 11.519 13.469 L 11.5 6.9 L 14.5 6.8 C 15 6.5 15 5.986 15 5.75 C 15 5.514 15 5.1 14.5 4.8 L 11.5 4.8 L 11.5 2.5 C 11.2 2 10.78 2 10.5 2 C 10.22 2 9.8 2 9.5 2.5 L 9.5 4.8 L 6.5 4.8 C 6 5.1 6 5.514 6 5.75 C 6 5.986 6 6.5 6.5 6.8 L 9.5 6.8 L 9.5 13.5 C 9.8 14 10.22 14 10.5 14 C 10.78 14 11.2 14 11.5 13.5 L 11.519 13.469 Z"
	}), createElement('g', {
		}, createElement('path', {
			d: "M 5.7 16.4 L 7.5 16.4 L 7.5 19.9 L 6.5 19.23 L 5.5 19.9 L 5.5 16.4 L 5.7 16.4 Z"
		}), createElement('path', {
			d: "M 6 16.3 L 7 16.3 L 7 19.1 L 6.5 18.7 L 6 19.1 L 6 16.3 Z",
			style: {
				fill: "#ffffff"
			}
		})
	), createElement('g', {
		}, createElement('path', {
			d: "m 15.168,0.09 h 3.335 c 0.756,0 1.364,0.609 1.364,1.366 v 1.366 c 0,0.757 -0.608,1.366 -1.364,1.366 h -3.335 l -1.364,0.84 c 0,0 -4.45e-4,-1.827 -4.45e-4,-2.206 V 1.457 c 0,-0.757 0.608,-1.366 1.364,-1.366 z",
			style: {
				fill: "#ffffff",
				stroke: "#ffffff",
				strokeWidth: 0.8,
				strokeMiterlimit: 4,
				strokeDasharray: "none"
			}
		}), createElement('path', {
			d: "m 15.177,0.171 h 3.231 c 0.732,0 1.322,0.59 1.322,1.322 v 1.322 c 0,0.732 -0.59,1.322 -1.322,1.322 H 15.177 L 13.856,4.95 c 0,0 -4.31e-4,-1.769 -4.31e-4,-2.135 V 1.493 c 0,-0.732 0.59,-1.322 1.322,-1.322 z",
			style: {
				fill: "#ffffff",
				stroke: "#000000",
				strokeWidth: 0.5,
				strokeMiterlimit: 4,
				strokeDasharray: "none"
			}
		}), createElement('circle', {
			r: 0.1,
			cy: 2.23,
			cx: 15.92,
			style: {
				fill:"#000000"
			}
		}), createElement('circle', {
			r: 0.1,
			cy: 2.23,
			cx: 16.92,
			style: {
				fill:"#000000"
			}
		}), createElement('circle', {
			r: 0.1,
			cy: 2.23,
			cx: 17.92,
			style: {
				fill:"#000000"
			}
		})
	), createElement('rect', {
		width: 3.3,
		height: 1,
		x: 16.5,
		y: 6.2,
		ry: 0.38,
		transform: "rotate(-30, 16.5, 6.6)",
		style: {
			fill: "#ffffff",
			stroke: "#000000",
			strokeWidth: 0.2,
			strokeLinecap: "round",
			strokeLinejoin: "miter",
			strokeMiterlimit: 4,
			strokeDasharray: "none"
		}
	}), createElement('rect', {
		width: 3.8,
		height: 1,
		x: 15.6,
		y: 8.7,
		ry: 0.38,
		style: {
			fill: "#ffffff",
			stroke: "#000000",
			strokeWidth: 0.2,
			strokeLinecap: "round",
			strokeLinejoin: "miter",
			strokeMiterlimit: 4,
			strokeDasharray: "none"
		}
	}), createElement('rect', {
		width: 3.3,
		height: 1,
		x: 16.5,
		y: 11.6,
		ry: 0.38,
		transform: "rotate(30, 16.5, 12.1)",
		style: {
			fill: "#ffffff",
			stroke: "#000000",
			strokeWidth: 0.2,
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
