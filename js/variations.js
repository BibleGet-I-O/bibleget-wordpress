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
			d: "M 5 16.4 L 8.6 16.4 L 8.6 19.9 L 6.8 19.2 L 5 19.9 L 5 16.4 L 5 16.4 Z"
		}), createElement('path', {
			d: "M 5.8 16.3 L 7.8 16.3 L 7.8 18.9 L 6.8 18.5 L 5.8 18.9 L 5.8 16.3 Z",
			style: {
				fill: "#ffffff"
			}
		})
	), createElement('g', {
		}, createElement('path', {
			d: "M 15 0.6 C 19 0.6 19.5 1 19.5 1.8 C 19.5 3.8 19 4.6 18.2 4.6 L 14.9 4.6 L 13.5 5.4 L 13.5 1.8 C 13.5 1 14.1 0.6 15 0.6 Z",
			style: {
				fill: "#ffffff",
				stroke: "#ffffff",
				strokeWidth: 1,
				strokeMiterlimit: 4,
				strokeDasharray: "none"
			}
		}), createElement('path', {
			d: "M 14.9 0.5 L 18.2 0.5 C 18.9 0.5 19.5 1.1 19.5 1.8 L 19.5 3.1 C 19.5 3.9 18.9 4.5 18.2 4.5 L 14.9 4.5 L 13.6 5.3 L 13.6 1.8 C 13.6 1.1 14.2 0.5 14.9 0.5 L 14.9 0.5 Z",
			style: {
				fill: "#ffffff",
				stroke: "#000000",
				strokeWidth: 0.8,
				strokeMiterlimit: 4,
				strokeDasharray: "none"
			}
		}), createElement('circle', {
			r: 0.3,
			cy: 2.5,
			cx: 15.3
		}), createElement('circle', {
			r: 0.3,
			cy: 2.5,
			cx: 16.5
		}), createElement('circle', {
			r: 0.3,
			cy: 2.5,
			cx: 17.7
		})
	), createElement('rect', {
		width: 4,
		height: 1.5,
		x: 15,
		y: 7,
		ry: 0.38,
		transform: "rotate(-30, 15, 7.75)",
		style: {
			fill: "#ffffff",
			stroke: "#000000",
			strokeWidth: 0.3,
			strokeLinecap: "round",
			strokeLinejoin: "miter",
			strokeMiterlimit: 4,
			strokeDasharray: "none"
		}
	}), createElement('rect', {
		width: 4.4,
		height: 1.5,
		x: 15.5,
		y: 9,
		ry: 0.38,
		style: {
			fill: "#ffffff",
			stroke: "#000000",
			strokeWidth: 0.3,
			strokeLinecap: "round",
			strokeLinejoin: "miter",
			strokeMiterlimit: 4,
			strokeDasharray: "none"
		}
	}), createElement('rect', {
		width: 4,
		height: 1.5,
		x: 15,
		y: 11,
		ry: 0.38,
		transform: "rotate(30, 15, 11.75)",
		style: {
			fill: "#ffffff",
			stroke: "#000000",
			strokeWidth: 0.3,
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
