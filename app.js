'use strict';

angular.module('app', []).config(['$routeProvider', function (rp) {
	rp.when('/items', { templateUrl: 'items.html', controller: 'appItemsCtrl' });
	rp.when('/items/new', { templateUrl: 'edit.html', controller: 'appEditCtrl' });
	rp.when('/items/:id', { templateUrl: 'item.html', controller: 'appItemCtrl' });
	rp.otherwise({ redirectTo: '/items' });
}]);

angular.module('app').factory('appItemSvc', ['$q', '$http', function (q, http) {
	var itemsPromise = http.get('items.json').then(function (resp) {
			return (resp.status === 200 ? resp.data : q.reject('HTTP ' + resp.status));
		});

	return {
		find: function (query) {
			return itemsPromise;
		},

		create: function (newItem) {
			return itemsPromise.then(function (items) {
				var newId = _(items).chain()
					.map(function (item) { return item.id; })
					.max()
					.value() + 1;
				_(newItem).extend({
					id: newId,
					comments: []
				});
				items.push(newItem);
				return newItem;
			});
		},

		get: function (id) {
			return itemsPromise.then(function (items) {
				var item = _(items).find(function (item) { return item.id === id; });
				return item || q.reject('not found');
			});
		},

		comment: function (id, text) {
			return this.get(id).then(function (item) {
				item.comments.push({ text: text, timestamp: new Date().toISOString() });
				return item;
			});
		},

		getTags: function () {
			return itemsPromise.then(function (items) {
				return _(items).chain()
					.map(function (item) { return item.tags; })
					.flatten()
					.compact()
					.uniq()
					.value();
			});
		}
	};
}]);

angular.module('app').controller('appItemsCtrl', ['$scope', 'appItemSvc', function (scope, ir) {
	scope.query = '';

	scope.results = [];

	scope.search = function () {
		ir.find(scope.query).then(function (items) {
			scope.results = items;
		}, function (err) {
			console.log(err);
		});
	};
}]);

angular.module('app').controller('appEditCtrl', ['$scope', 'appItemSvc', 'appFlashSvc', function (scope, appItemSvc, appFlashSvc) {
	scope.model = {
		title: '',
		body: '',
		tags: []
	};

	scope.submit = function () {
		appItemSvc.create(scope.model).then(function (item) {
			appFlashSvc.redirect('/items/' + item.id, 'Item created #' + item.id);
		}, function (err) {
			appFlashSvc.redirect('/', 'error while creating item: ' + err);
		});
	};
}]);

angular.module('app').controller('appItemCtrl', ['$scope', 'appItemSvc', '$routeParams', 'appFlashSvc', function (scope, appItemSvc, routeParams, appFlashSvc) {
	scope.model = {
		id: 0,
		title: '',
		tags: [],
		body: '',
		comments: []
	};
	var id = parseInt(routeParams.id, 10),
		setItem = function (item) {
			_(scope.model).extend(item);
		},
		handleError = function (error) {
			appFlashSvc.redirect('/', 'Error wile working with item #' + id + '. ' + error);
		};

	scope.newCommentText = '';

	scope.edit = function () {
		console.log('edit');
	};

	scope.addComment = function () {
		appItemSvc.comment(id, scope.newCommentText).then(setItem, handleError);
	};

	appItemSvc.get(id).then(setItem, handleError);
}]);

angular.module('app').directive('appTagsEditor', ['appItemSvc', function (appItemSvc) {
	var tags = [];

	appItemSvc.getTags().then(function (value) { tags.push.apply(tags, value); });

	return {
		require: 'ngModel',
		link: function postLink(scope, element, attrs, ngModelCtrl) {
			var ngModelCtrlSetViewValue = ngModelCtrl.$setViewValue;

			ngModelCtrl.$setViewValue = function (value) {
				ngModelCtrlSetViewValue.call(ngModelCtrl, value.split(' '));
			};

			ngModelCtrl.$render = function() {
				element.val(ngModelCtrl.$viewValue.join(' '));
			};

			var getLastWord = function (tags) { return tags.split(' ').pop() || ''; };

			element.typeahead({
				source: tags,
				matcher: function (item) {
					var word = getLastWord(this.query);
					return ~item.toLowerCase().indexOf(word.toLowerCase());
				},
				updater: function (item) {
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
		}
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
			rootScope.$broadcast('app.flashMessage', message);
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
