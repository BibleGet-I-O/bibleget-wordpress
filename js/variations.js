const { registerBlockVariation } = wp.blocks;

registerBlockVariation(
	'bibleget/bible-quote',
	{
		name: 'bible-quote-inline',
		title: __( 'Inline Bible quote', 'bibleget-io' ),
		attributes: {
			POPUP: true
		},
		isActive: [ 'POPUP' ]
	}
);
