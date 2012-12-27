'use strict';

angular.module('trackr', []).config(['$routeProvider', function(rp) {
	rp.when('/search', { templateUrl: 'search.html', controller: 'trackr.Search' });
	rp.when('/new', { templateUrl: 'new.html', controller: 'trackr.New' });
	rp.when('/item/:id', { templateUrl: 'item.html', controller: 'trackr.Item' });
	rp.otherwise({ redirectTo: '/search' });
}]);

angular.module('trackr').factory('trackr.itemRepository', ['$q', function (q) {
	var count = 4;
	var items = [
		{ id: 1, title: 'Title 1', body: 'Body 1' },
		{ id: 2, title: 'Title 2', body: 'Body 2' },
		{ id: 3, title: 'Title 3', body: 'Body 3' }
	];

	return {
		find: function (query) {
			var deferred = q.defer();
			deferred.resolve(items);
			return deferred.promise;
		},

		create: function (item) {
			var deferred = q.defer();
			item.id = count;
			count += 1;
			items.push(item);
			deferred.resolve(item);
			return deferred.promise;
		},

		get: function (id) {
			var i,
				item = null, 
				deferred = q.defer();

			for (i = 0; i < items.length; i++) {
				if(items[i].id === id) {
					item = items[i];
				}
			}

			if (item) {
				deferred.resolve(item);
			} else {
				deferred.reject('not found');
			}

			return deferred.promise;
		}
	};
}]);

angular.module('trackr').controller('trackr.Search', ['$scope', 'trackr.itemRepository', function(scope, ir) {
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

angular.module('trackr').controller('trackr.New', ['$scope', 'trackr.itemRepository', '$location', function(scope, ir, location) {
	scope.title = '';
	scope.body = '';
	scope.tags = '';
	scope.showPreview = false;

	scope.submit = function () {
		ir.create({ title: scope.title, body: scope.body }).then(function (item) {
			location.path('/item/' + item.id).replace();
		}, function (err) {
			console.log(err);
		});
	};

	scope.bodyChange = function () {
		scope.htmlPreview = scope.body;
	};

	scope.editClick = function () { scope.showPreview = false; };
	scope.previewClick = function () { scope.showPreview = true; };
}]);

angular.module('trackr').controller('trackr.Item', ['$scope', 'trackr.itemRepository', '$routeParams', function(scope, ir, routeParams) {
	var id = parseInt(routeParams.id, 10);

	ir.get(id).then(function (item) {
		scope.id = item.id;
		scope.title = item.title;
		scope.tags = item.tags;
	}, function (err) {
		console.log(err); 
	});
}]);

angular.module('trackr').directive('trackrMarkdownEditor', function () {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			markdown: '=trackrMarkdownEditor'
		},
		template: '<div>{{markdown}}</div>',
		link: function (scope, element, attrs) {
			console.log('link');
		}
	};
});