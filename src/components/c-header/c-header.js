import Vue from 'vue';
import tpl from './c-header.html';
import './c-header.css';

export default Vue.component('c-header', {
	template: tpl,
	data() {
		return {
			menu: [{
				id: 20180801,
				name: '介绍',
				url: '#introduce',
				children: []
			}, {
				id: 20180802,
				name: '安装',
				url: '#installation',
				children: []
			}, {
				id: 20180803,
				name: '起步',
				url: '#start',
				children: []
			}, {
				id: 20180804,
				name: '工程结构',
				url: '#standard',
				children: [{
					id: 201808040,
					name: 'build',
					url: '#buildFolder', 
					children: []
				}, {
					id: 201808041,
					name: 'config',
					url: '#configFolder', 
					children: []
				}, {
					id: 201808042,
					name: 'dist',
					url: '#distFolder', 
					children: []
				}, {
					id: 201808048,
					name: 'src',
					url: '#srcFolder', 
					children: []
				}, {
					id: 201808043,
					name: 'other',
					url: '#otherFile', 
					children: []
				}]
			}]
		};
	}
});