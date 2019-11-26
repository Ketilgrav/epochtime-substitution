import OptionsSync from 'webext-options-sync';

export default new OptionsSync({
	defaults: {
		SECONDS: false,
		MILLI: false,
		MICRO: true,
		NANO: false,
		ENABLE: true,
		ISOFORMAT: false
	},
	migrations: [
		OptionsSync.migrations.removeUnused
	],
	logging: true
});
