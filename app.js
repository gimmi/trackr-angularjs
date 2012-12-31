'use strict';

angular.module('trackr', []).config(['$routeProvider', function (rp) {
	rp.when('/search', { templateUrl: 'search.html', controller: 'trackr.Search' });
	rp.when('/new', { templateUrl: 'new.html', controller: 'trackr.New' });
	rp.when('/item/:id', { templateUrl: 'item.html', controller: 'trackr.Item' });
	rp.otherwise({ redirectTo: '/search' });
}]);

angular.module('trackr').factory('trackr.itemRepository', ['$q', function (q) {
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

angular.module('trackr').controller('trackr.Search', ['$scope', 'trackr.itemRepository', function (scope, ir) {
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

angular.module('trackr').controller('trackr.New', ['$rootScope', '$scope', 'trackr.itemRepository', '$location', function (rootScope, scope, ir, location) {
	scope.title = '';
	scope.body = '';
	scope.tags = '';

	scope.submit = function () {
		ir.create({ title: scope.title, body: scope.body }).then(function (item) {
			rootScope.$broadcast('trackr.flashMessage', 'Item created #' + item.id);
			location.path('/item/' + item.id).replace();
		}, function (err) {
			console.log(err);
		});
	};
}]);

angular.module('trackr').controller('trackr.Item', ['$scope', 'trackr.itemRepository', '$routeParams', function (scope, ir, routeParams) {
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

angular.module('trackr').directive('trackrMarkdownEditor', function () {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			markdown: '=trackrMarkdownEditor'
		},
		templateUrl: 'markdowneditor.html',
		controller: 'trackr.MarkdownEditor'
	};
});

angular.module('trackr').controller('trackr.MarkdownEditor', ['$scope', 'trackr.markdownRenderer', function (scope, markdownRenderer) {
	scope.showPreview = false;
	scope.html = '';

	scope.editClick = function () {
		scope.showPreview = false;
	};

	scope.previewClick = function () {
		scope.showPreview = true;
		scope.html = markdownRenderer.toHtml(scope.markdown);
	};
}]);

angular.module('trackr').controller('trackr.FlashMessage', ['$scope', '$timeout', function (scope, timeout) {
	var timers = {};
	scope.messages = [];

	scope.$on('trackr.flashMessage', function (event, message) {
		scope.messages.push(message);
		timeout(function () { scope.messages.splice(0, 1); }, 5000);
	});
}]);

angular.module('trackr').factory('trackr.markdownRenderer', function () {
	return {
		toHtml: function (markdown) {
			return "__" + markdown;
		}
	};
});

angular.module('trackr').directive('trackrMarkdownRenderer', ['trackr.markdownRenderer', function (markdownRenderer) {
	return function postLink(scope, element, attrs) {
		scope.$watch(attrs.trackrMarkdownRenderer, function trackrMarkdownRendererWatchAction(value) {
			element.html(markdownRenderer.toHtml(value));
		});
	};
}]);
