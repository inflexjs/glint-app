<template>
	<div
		class="cropper"
		@mousemove="showDescriptionMessage"
	>
		<p
			v-if="description.isShow"
			:style="descriptionStyles"
			class="cropper__description"
		>Нажмите чтобы выделить область</p>
		<div class="cropper__image-wrapper">
			<img
				:src="image"
				alt="screenshot"
				class="cropper__image">
		</div>
		<div class="cropper__foreground"></div>
		<div
			:style="boxStyles"
			ref="box"
			class="cropper__box"
			@mousedown.stop="startBoxMoving"
			@mouseup.stop="stopBoxMoving"
			@mousemove.stop="boxMoving"
		>
			<div class="cropper__review">
				<img
					:src="image"
					:style="reviewStyles"
					alt="screenshot">
			</div>
			<div class="cropper__resize">
				<div
					class="cropper__line cropper__line--top"
					@mouseup.stop="stopResizeBox('top')"
					@mousedown.stop="startResizeBox('top')"
					@mousemove.stop="resizeBox('top', $event)"
				></div>
				<div
					class="cropper__line cropper__line--right"
					@mouseup="stopResizeBox"
					@mousedown="startResizeBox"
					@mousemove="resizeBox"
				></div>
				<div
					class="cropper__line cropper__line--bottom"
					@mouseup="stopResizeBox"
					@mousedown="startResizeBox"
					@mousemove="resizeBox"
				></div>
				<div
					class="cropper__line cropper__line--left"
					@mouseup="stopResizeBox"
					@mousedown="startResizeBox"
					@mousemove="resizeBox"
				></div>
			</div>
			<div class="cropper__rectangle cropper__rectangle--top-left"></div>
			<div class="cropper__rectangle cropper__rectangle--top"></div>
			<div class="cropper__rectangle cropper__rectangle--top-right"></div>
			<div class="cropper__rectangle cropper__rectangle--right"></div>
			<div class="cropper__rectangle cropper__rectangle--bottom-right"></div>
			<div class="cropper__rectangle cropper__rectangle--bottom"></div>
			<div class="cropper__rectangle cropper__rectangle--bottom-left"></div>
			<div class="cropper__rectangle cropper__rectangle--left"></div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Cropper",
	props: {
		image: {
			type: String
		}
	},
	data() {
		return {
			description: {
				isShow: true,
				styles: {
					top: 0,
					left: 0,
				}
			},
			box: {
				isMoving: false,
				shiftX: 0,
				shiftY: 0,
				height: 0,
				width: 0,
				styles: {
					top: 0,
					left: 0,
					right: 0,
					bottom: 0
				},
				line: {
					top: {
						isMoving: false
					}
				}
			}
		}
	},
	computed: {
		boxStyles() {
			return {
				top: `${this.box.styles.top}px`,
				left: `${this.box.styles.left}px`,
				right: `${this.box.styles.right}px`,
				bottom: `${this.box.styles.bottom}px`
			}
		},
		reviewStyles() {
			return {
				transform: `translate(${-this.box.styles.left}px,${-this.box.styles.top}px)`
			}
		},
		descriptionStyles() {
			return {
				top: `${this.description.styles.top + 10}px`,
				left: `${this.description.styles.left}px`
			}
		}
	},
	methods: {
		getCoords(element) {
			const box = element.getBoundingClientRect();
			return {
				top: box.top + scrollY,
				left: box.left + scrollX
			};
		},
		startBoxMoving(event) {
			const coords = this.getCoords(this.$refs.box)
			
			this.box.shiftX = event.pageX - coords.left
			this.box.shiftY = event.pageY - coords.top
			
			this.box.isMoving = true
			this.description.isShow = false
		},
		stopBoxMoving() {
			this.box.isMoving = false
		},
		boxMoving(event) {
			if (!this.box.isMoving) return
			console.log('mox moving')
			this.box.styles.top = event.pageY - this.box.shiftY
			this.box.styles.left = event.pageX - this.box.shiftX
			this.box.styles.right = (event.pageX - this.box.shiftX) + this.$refs.box.offsetWidth
			this.box.styles.bottom = (event.pageY - this.box.shiftY) + this.$refs.box.offsetHeight

		},
		startResizeBox(line) {
			switch (line) {
				case 'top':
					console.log('start top')
					this.box.line.top.isMoving = true
					break
			}
		},
		stopResizeBox(line) {
			switch (line) {
				case 'top':
					console.log('stop top')
					this.box.line.top.isMoving = false
					break
			}
		},
		resizeBox(line, event) {
			switch (line) {
				case 'top':
					if (!this.box.line.top.isMoving) return
					this.box.styles.top = `${event.pageY}px`
					break
			}
		},
		showDescriptionMessage(event) {
			if (!this.description.isShow) return
			this.description.styles.top = event.clientY
			this.description.styles.left = event.clientX
		}
	}
}
</script>

<style lang="scss">
	$line-padding: 3px;
	$line-indent: 4px;
	$line-size: 4px;
	$rectangle-indent: 3px;
	
	$description-z-index: 5;
	
	.cropper {
		position: relative;
		
		&__image-wrapper {
			height: 100%;
			width: 100%;
			overflow: hidden;
		}
		&__image {
			user-select: none;
			max-width: 100%;
			image-rendering: high-quality;
		}
		&__foreground{
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			opacity: 0.5;
			background-color: #000000;
		}
		&__description {
			position: absolute;
			padding: 4px 8px;
			background: linear-gradient(180deg, #F4B001 0%, #FFB800 50%, #D39800 100%);
			border-radius: 4px;
			color: #2F2F2F;
			font-size: 14px;
			font-weight: 500;
			z-index: $description-z-index;
		}
		&__box {
			position: absolute;
			top: 50%;
			left: 50%;
			height: 300px;
			width: 300px;
		}
		&__review {
			position: absolute;
			top: 0;
			left: 0;
			height: 100%;
			width: 100%;
			overflow: hidden;
			& img {
				position: absolute;
				top: 0;
				left: 0;
				pointer-events: none;
				transform-origin: center;
				user-select: none;
			}
		}
		&__resize {
			position: absolute;
			height: 100%;
			width: 100%;
			border-color: #5A5A5A;
			border-style: dashed;
			border-width: 1px;
			cursor: move;
			box-sizing: border-box;
			z-index: 2;
		}
		&__line {
			position: absolute;
			z-index: 1;
			box-sizing: border-box;
			&--top {
				height: $line-size;
				padding: $line-padding 0;
				top: -($line-indent);
				left: 0;
				right: 0;
				cursor: row-resize;
			}
			&--right {
				width: $line-size;
				padding: 0 $line-padding;
				top: 0;
				right: -($line-indent);
				bottom: 0;
				cursor: col-resize;
			}
			&--bottom {
				height: $line-size;
				padding: $line-padding 0;
				bottom: -($line-indent);
				left: 0;
				right: 0;
				cursor: row-resize;
			}
			&--left {
				width: $line-size;
				padding: 0 $line-padding;
				top: 0;
				left: -($line-indent);
				bottom: 0;
				cursor: col-resize;
			}
		}
		&__rectangle {
			position: absolute;
			background: linear-gradient(180deg, #FFB800 0%, #D39800 100%);
			width: 6px;
			height: 6px;
			z-index: 2;
			&--top-left {
				top: -($rectangle-indent);
				left: -($rectangle-indent);
				cursor: nw-resize;
			}
			&--top {
				top: -($rectangle-indent);
				left: 50%;
				transform: translateX(-50%);
				cursor: n-resize;
			}
			&--top-right {
				top: -($rectangle-indent);
				right: -($rectangle-indent);
				cursor: ne-resize;
			}
			&--right {
				right: -($rectangle-indent);
				top: 50%;
				transform: translateY(-50%);
				cursor: e-resize;
			}
			&--bottom-right {
				bottom: -($rectangle-indent);
				right: -($rectangle-indent);
				cursor: se-resize;
			}
			&--bottom {
				bottom: -($rectangle-indent);
				left: 50%;
				transform: translateX(-50%);
				cursor: s-resize;
			}
			&--bottom-left {
				bottom: -($rectangle-indent);
				left: -($rectangle-indent);
				cursor: sw-resize;
			}
			&--left {
				left: -($rectangle-indent);
				top: 50%;
				transform: translateY(-50%);
				cursor: w-resize;
			}
		}
	}
</style>
