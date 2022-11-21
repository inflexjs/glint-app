<template>
<!--	<cropper-component-->
<!--		:src="screenSrc"-->
<!--		alt="screenshot"-->
<!--		class="screenshot"-->
<!--		@change="change"-->
<!--	/>-->
	<div class="overlay">
		<cropper-component
			v-if="screenSrc"
			:image="screenSrc"
		/>
	</div>
</template>

<script>
import 'vue-advanced-cropper/dist/style.css';
import Cropper from "./Cropper.vue";
import {ipcRenderer} from "electron";
// import {Cropper} from 'vue-advanced-cropper'

export default {
	name: 'Overlay',
	components: {
		'cropper-component': Cropper
	},
	data() {
		return {
			screenSrc: ''
		}
	},
	methods: {
		change({ coordinates, canvas }) {
			console.log(coordinates, canvas);
		},
	},
	watch: {
		screenSrc(newValue, oldValue) {
			console.log(newValue, oldValue)
			console.log(typeof newValue)
		}
	},
	mounted() {
		ipcRenderer.on('screenshot:capture', (e, imageData) => {
			this.screenSrc = imageData
		})
	}
}
</script>

<style>
	.overlay {
		height: 100%;
		width: 100%;
	}
</style>
