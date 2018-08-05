import Vue from 'vue';
import tpl from './c-main.html';
import './c-main.css';

import introduce from './introduce/introduce.js';
import installation from './installation/installation.js';
import start from './start/start.js';
import standard from './standard/standard.js';

export default Vue.component('c-main', {
	template: tpl,
	components: {
		introduce,
		installation,
		start,
		standard
	},
	data() {
		return {};
	}
});