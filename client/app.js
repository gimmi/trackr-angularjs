'use strict';

angular.module('app', []).config(['$routeProvider', function (rp) {
	rp.when('/items', { templateUrl: 'items.html', controller: 'appItemsCtrl' });
	rp.when('/items/new', { templateUrl: 'edit.html', controller: 'appEditCtrl' });
	rp.when('/items/:id', { templateUrl: 'item.html', controller: 'appItemCtrl' });
	rp.when('/items/:id/edit', { templateUrl: 'edit.html', controller: 'appEditCtrl' });
	rp.otherwise({ redirectTo: '/items' });
}]);

angular.module('app').controller('appItemsCtrl', ['$scope', 'appServerSvc', function (scope, ir) {
	scope.query = '';

	scope.results = [];

	scope.search = function () {
		ir.findItems(scope.query).then(function (items) {
			scope.results = items;
		}, function (err) {
			console.log(err);
		});
	};
}]);

angular.module('app').controller('appEditCtrl', ['$scope', 'appServerSvc', 'appFlashSvc', '$routeParams', function (scope, appServerSvc, appFlashSvc, routeParams) {
	scope.model = {
		title: '',
		body: '',
		tags: []
	};

	var id = routeParams.id;

	if (id) {
		appServerSvc.getItem(id).then(function (item) { 
			_(scope.model).extend(item);
		}, function (err) { 
			appFlashSvc.redirect('/', 'error while loading item: ' + err); 
		});
	}

	scope.submit = function () {
		var saveFn = id ? appServerSvc.updateItem : appServerSvc.createItem;
		saveFn.call(appServerSvc, scope.model).then(function (item) {
			appFlashSvc.redirect('/items/' + item.id, 'Item saved');
		}, function (err) {
			appFlashSvc.redirect('/', 'error while saving item: ' + err);
		});
	};
}]);

angular.module('app').controller('appItemCtrl', ['$scope', 'appServerSvc', '$routeParams', 'appFlashSvc', function (scope, appServerSvc, routeParams, appFlashSvc) {
	scope.model = {
		id: 0,
		title: '',
		tags: [],
		body: '',
		comments: []
	};
	var id = routeParams.id,
		handleError = function (error) { appFlashSvc.redirect('/', 'Error wile working with item #' + id + '. ' + error); };

	scope.newCommentBody = '';

	scope.edit = function () {
		appFlashSvc.redirect('/items/' + id + '/edit');
	};

	scope.addComment = function () {
		appServerSvc.createComment(id, scope.newCommentBody).then(function (comment) {
			scope.model.comments.push(comment);
			scope.newCommentBody = '';
		}, handleError);
	};

	appServerSvc.getItem(id).then(function (item) {
		_(scope.model).extend(item);
		return appServerSvc.getComments(id);
	}).then(function (comments) {
		scope.model.comments = comments;
	}, handleError);
}]);

// see http://stackoverflow.com/a/12947995/66629
angular.module('app').directive('appArrayModel', function () {
	return {
		require: 'ngModel',
		link: function postLink(scope, element, attrs, ngModelCtrl) {
			ngModelCtrl.$parsers.push(function (text) {
				return (text || '').match(/[^ ]+/g);
			});

			ngModelCtrl.$formatters.push(function (ary) {
				return (ary || []).join(' ');
			});
		}
	}	
});

angular.module('app').directive('appTagsEditor', ['$sniffer', 'appServerSvc', function (sniffer, appServerSvc) {
	var tags = [];

	appServerSvc.findTags().then(function (value) { tags.push.apply(tags, value); });

	return function postLink(scope, element, attrs) {
		var getTags = function (text) { 
			return (text || '').match(/[^ ]+/g) || []; 
		};
		var getLastWord = function (tags) {
			return getTags(tags).pop() || '';
		};

		element.typeahead({
			source: tags,
			matcher: function (item) {
				var word = getLastWord(this.query);
				return ~item.toLowerCase().indexOf(word.toLowerCase());
			},
			updater: function (item) {
				if (sniffer.hasEvent('input')) { // See https://github.com/twitter/bootstrap/issues/7747
					setTimeout(function () { element.trigger('input'); }, 0);
				}
				var query = this.query.split(' ');
				query.pop();
				query.push(item);
				return query.join(' ');
			},
			highlighter: function (item) {
				var word = getLastWord(this.query);
				return item.replace(word, '<strong>' + word + '</strong>');
			}
		});
	};
}]);

angular.module('app').directive('appMarkdownEditor', function () {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			markdown: '=appMarkdownEditor'
		},
		templateUrl: 'markdowneditor.html',
		controller: 'appMarkdownEditorCtrl'
	};
});

angular.module('app').controller('appMarkdownEditorCtrl', ['$scope', 'app.markdownRenderer', function (scope, mr) {
	scope.activeTab = 'edit';
	scope.html = '';

	scope.editActive = function () { return scope.activeTab === 'edit'; };
	scope.editClick = function () { scope.activeTab = 'edit'; };

	scope.previewActive = function () { return scope.activeTab === 'preview'; };
	scope.previewClick = function () { 
		scope.html = mr.toHtml(scope.markdown);
		scope.activeTab = 'preview'; 
	};

	scope.helpActive = function () { return scope.activeTab === 'help'; };
	scope.helpClick = function () { scope.activeTab = 'help'; };
}]);

angular.module('app').controller('appFlashMessageCtrl', ['$scope', '$timeout', function (scope, timeout) {
	var timers = {};
	scope.messages = [];

	scope.$on('app.flashMessage', function (event, message) {
		scope.messages.push(message);
		timeout(function () { scope.messages.splice(0, 1); }, 5000);
	});
}]);

angular.module('app').factory('appFlashSvc', ['$rootScope', '$location', function (rootScope, location) {
	return {
		redirect: function (path, message) {
			if (message) {
				rootScope.$broadcast('app.flashMessage', message);	
			}
			location.path(path).replace();
		}
	};
}]);

angular.module('app').factory('app.markdownRenderer', function () {
	var md = new Showdown.converter();
	return {
		toHtml: function (markdown) {
			return md.makeHtml(markdown);
		}
	};
});

angular.module('app').directive('appMarkdownRenderer', ['app.markdownRenderer', function (markdownRenderer) {
	return function postLink(scope, element, attrs) {
		scope.$watch(attrs.appMarkdownRenderer, function appMarkdownRendererWatchAction(value) {
			element.html(markdownRenderer.toHtml(value));
		});
	};
}]);
