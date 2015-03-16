/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.service('filetypeIdentificationService', function() {

	var isPictureRegex = /(bmp|png|jpeg|jpg|gif|tiff|webp)$/i;
	var isVideoRegex = /(3gb|3g2|h261|h263|h264|jpgv|mp4|mpv4|mpg4|mpeg|mpg|mpe|mv1|mv2|ogv|qt|mov|webm|flv|mkv|mk3d|wm|wmv|avi|movie)$/i;

	this.isMedia = (path: string) => isPictureRegex.test(path) || isVideoRegex.test(path);
	this.isPicture = (path: string) => isPictureRegex.test(path);
	this.isVideo = (path: string) => isVideoRegex.test(path);
});
