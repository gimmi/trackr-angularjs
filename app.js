'use strict';

angular.module('app', []).config(['$routeProvider', function (rp) {
	rp.when('/search', { templateUrl: 'search.html', controller: 'app.Search' });
	rp.when('/new', { templateUrl: 'new.html', controller: 'app.New' });
	rp.when('/item/:id', { templateUrl: 'item.html', controller: 'app.Item' });
	rp.otherwise({ redirectTo: '/search' });
}]);

angular.module('app').factory('app.itemRepository', ['$q', function (q) {
	var count = 0,
		createItem = function (data) {
			count += 1;
			return {
				id: count,
				title: data.title || 'No title',
				body: data.body || '',
				tags: data.tags || [],
				comments: data.comments || []
			};
		},
		items = [
			createItem({ title: 'Title 1', body: 'Body 1', comments: [{ text: 'Comment 1', timestamp: '2012-12-30T08:35' }, { text: 'Comment 2', timestamp: '2012-12-30T08:35' }] }),
			createItem({ title: 'Title 2', body: 'Body 2', comments: [{ text: 'Comment 1', timestamp: '2012-12-30T08:35' }, { text: 'Comment 2', timestamp: '2012-12-30T08:35' }] }),
			createItem({ title: 'Title 3', body: 'Body 3', comments: [{ text: 'Comment 1', timestamp: '2012-12-30T08:35' }, { text: 'Comment 2', timestamp: '2012-12-30T08:35' }] })
		];

	return {
		find: function (query) {
			var deferred = q.defer();
			deferred.resolve(items);
			return deferred.promise;
		},

		create: function (item) {
			var deferred = q.defer();
			item = createItem(item);
			items.push(item);
			deferred.resolve(item);
			return deferred.promise;
		},

		get: function (id) {
			var i,
				item = null,
				deferred = q.defer();

			for (i = 0; i < items.length; i += 1) {
				if (items[i].id === id) {
					item = items[i];
				}
			}

			if (item) {
				deferred.resolve(item);
			} else {
				deferred.reject('not found');
			}

			return deferred.promise;
		},

		update: function (id, commentText) {
			return this.get(id).then(function (item) {
				item.comments.push({ text: commentText, timestamp: new Date().toISOString() });
				return item;
			});
		}
	};
}]);

angular.module('app').controller('app.Search', ['$scope', 'app.itemRepository', function (scope, ir) {
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

angular.module('app').controller('app.New', ['$rootScope', '$scope', 'app.itemRepository', '$location', function (rootScope, scope, ir, location) {
	scope.model = {
		title: '',
		body: '',
		tags: ''
	};

	scope.submit = function () {
		ir.create({ title: scope.model.title, body: scope.model.body }).then(function (item) {
			rootScope.$broadcast('app.flashMessage', 'Item created #' + item.id);
			location.path('/item/' + item.id).replace();
		}, function (err) {
			console.log(err);
		});
	};
}]);

angular.module('app').controller('app.Item', ['$scope', 'app.itemRepository', '$routeParams', function (scope, ir, routeParams) {
	var id = parseInt(routeParams.id, 10),
		setItem = function (item) {
			scope.id = item.id;
			scope.title = item.title;
			scope.tags = item.tags;
			scope.comments = item.comments;
		};

	scope.newCommentText = '';

	scope.addComment = function () {
		ir.update(id, scope.newCommentText).then(setItem);
	};

	ir.get(id).then(setItem);
}]);

angular.module('app').directive('appMarkdownEditor', function () {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			markdown: '=appMarkdownEditor'
		},
		templateUrl: 'markdowneditor.html',
		controller: 'app.MarkdownEditor'
	};
});

angular.module('app').controller('app.MarkdownEditor', ['$scope', 'app.markdownRenderer', function (scope, markdownRenderer) {
	scope.activeTab = 'edit';
	scope.html = '';

	scope.editActive = function () { return scope.activeTab === 'edit'; };
	scope.editClick = function () { scope.activeTab = 'edit'; };

	scope.previewActive = function () { return scope.activeTab === 'preview'; };
	scope.previewClick = function () { 
		scope.html = markdownRenderer.toHtml(scope.markdown);
		scope.activeTab = 'preview'; 
	};

	scope.helpActive = function () { return scope.activeTab === 'help'; };
	scope.helpClick = function () { scope.activeTab = 'help'; };
}]);

angular.module('app').controller('app.FlashMessage', ['$scope', '$timeout', function (scope, timeout) {
	var timers = {};
	scope.messages = [];

	scope.$on('app.flashMessage', function (event, message) {
		scope.messages.push(message);
		timeout(function () { scope.messages.splice(0, 1); }, 5000);
	});
}]);

angular.module('app').factory('app.markdownRenderer', function () {
	return {
		toHtml: function (markdown) {
			return "__" + markdown;
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
