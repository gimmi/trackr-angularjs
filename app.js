'use strict';

angular.module('app', []).config(['$routeProvider', function (rp) {
	rp.when('/search', { templateUrl: 'search.html', controller: 'appSearchCtrl' });
	rp.when('/new', { templateUrl: 'new.html', controller: 'appNewCtrl' });
	rp.when('/item/:id', { templateUrl: 'item.html', controller: 'appItemCtrl' });
	rp.otherwise({ redirectTo: '/search' });
}]);

angular.module('app').factory('appItemSvc', ['$q', '$http', function (q, http) {
	var itemsPromise = http.get('/items.json').then(function (resp) {
			return (resp.status === 200 ? resp.data : q.reject('HTTP ' + resp.status));
		});

	return {
		find: function (query) {
			return itemsPromise;
		},

		create: function (newItem) {
			return itemsPromise.then(function (items) {
				newItem.id = _(items).chain()
					.map(function (item) { return item.id; })
					.max()
					.value() + 1;
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

		update: function (id, commentText) {
			return this.get(id).then(function (item) {
				item.comments.push({ text: commentText, timestamp: new Date().toISOString() });
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

angular.module('app').controller('appSearchCtrl', ['$scope', 'appItemSvc', function (scope, ir) {
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

angular.module('app').controller('appNewCtrl', ['$rootScope', '$scope', 'appItemSvc', '$location', 'appItemSvc', function (rootScope, scope, ir, location, appItemSvc) {
	scope.model = {
		title: '',
		body: '',
		tags: ''
	};

	scope.submit = function () {
		var tags = _.chain(scope.model.tags.split(/[^\w\d\-]/))
			.compact()
			.uniq()
			.value();
		ir.create({ title: scope.model.title, body: scope.model.body, tags: tags }).then(function (item) {
			rootScope.$broadcast('app.flashMessage', 'Item created #' + item.id);
			location.path('/item/' + item.id).replace();
		}, function (err) {
			console.log(err);
		});
	};
}]);

angular.module('app').controller('appItemCtrl', ['$scope', 'appItemSvc', '$routeParams', '$rootScope', '$location', function (scope, ir, routeParams, rootScope, location) {
	var id = parseInt(routeParams.id, 10),
		setItem = function (item) {
			scope.id = item.id;
			scope.title = item.title;
			scope.tags = item.tags;
			scope.comments = item.comments;
		},
		handleError = function (error) {
			rootScope.$broadcast('app.flashMessage', 'Error wile working with item #' + id + '. ' + error);
			location.path('/').replace();
		};

	scope.newCommentText = '';

	scope.addComment = function () {
		ir.update(id, scope.newCommentText).then(setItem, handleError);
	};

	ir.get(id).then(setItem, handleError);
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

angular.module('app').directive('appTypeahead', ['appItemSvc', function (appItemSvc) {
	var tags = [];

	appItemSvc.getTags().then(function (value) {
		console.log("tags loaded");
		tags.push.apply(tags, value);
	});

	return function postLink(scope, element, attrs) {
		$(element).typeahead({ 
			source: tags,
			matcher: function (item) {
				var query = this.query.split(' ').pop() || '';
				return ~item.toLowerCase().indexOf(query.toLowerCase());
			},
			updater: function (item) {
				var query = this.query.split(' ');
				query.pop();
				query.push(item);
				return query.join(' ');
			}
		});
	};
}]);

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

angular.module('app').controller('appFlashMessageSvc', ['$scope', '$timeout', function (scope, timeout) {
	var timers = {};
	scope.messages = [];

	scope.$on('app.flashMessage', function (event, message) {
		scope.messages.push(message);
		timeout(function () { scope.messages.splice(0, 1); }, 5000);
	});
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
