import Vue from 'vue';
import './index.css';

import cHeader from 'c-header/c-header.js';
import cMain from 'c-main/c-main.js';

new Vue({
	el: '#app',
	components: {
		cHeader,
		cMain
	}
})
