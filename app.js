'use strict';

angular.module('app', []).config(['$routeProvider', function (rp) {
	rp.when('/items', { templateUrl: 'items.html', controller: 'appItemsCtrl' });
	rp.when('/items/new', { templateUrl: 'edit.html', controller: 'appEditCtrl' });
	rp.when('/items/:id', { templateUrl: 'item.html', controller: 'appItemCtrl' });
	rp.when('/items/:id/edit', { templateUrl: 'edit.html', controller: 'appEditCtrl' });
	rp.otherwise({ redirectTo: '/items' });
}]);

angular.module('app').factory('appServerSvc', ['$q', '$http', function (q, http) {
	var itemsPromise = http.get('items.json').then(function (resp) {
			return (resp.status === 200 ? resp.data : q.reject('HTTP ' + resp.status));
		});

	return {
		findItems: function (query) {
			return itemsPromise;
		},

		createItem: function (item) {
			item = angular.copy(item);
			return itemsPromise.then(function (items) {
				var newId = _(items).chain()
					.map(function (x) { return x.id; })
					.max()
					.value() + 1;
				_(item).extend({
					id: newId,
					comments: []
				});
				items.push(item);
				return angular.copy(item);
			});
		},

		updateItem: function (item) {
			item = angular.copy(item);
			return this._findItem(item.id).then(function (x) {
				_(x).extend(item);
				return angular.copy(x);
			});
		},

		getItem: function (id) {
			return this._findItem(id).then(function (item) { return angular.copy(item); });
		},

		createComment: function (itemId, text) {
			text = angular.copy(text);
			return this._findItem(itemId).then(function (item) {
				var comment = { 
					text: text, 
					timestamp: new Date().toISOString()
				};
				item.comments.push(comment);
				return angular.copy(comment);
			});
		},

		findTags: function () {
			return itemsPromise.then(function (items) {
				return _(items).chain()
					.map(function (x) { return angular.copy(x.tags); })
					.flatten()
					.compact()
					.uniq()
					.value();
			});
		},

		_findItem: function (id) {
			return itemsPromise.then(function (items) {
				var item = _(items).find(function (item) { return item.id === id; });
				return item || q.reject('item #' + id + ' not found');
			});
		}
	};
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

	var id = parseInt(routeParams.id, 10);

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
	var id = parseInt(routeParams.id, 10),
		handleError = function (error) { appFlashSvc.redirect('/', 'Error wile working with item #' + id + '. ' + error); };

	scope.newCommentText = '';

	scope.edit = function () {
		appFlashSvc.redirect('/items/' + id + '/edit');
	};

	scope.addComment = function () {
		appServerSvc.createComment(id, scope.newCommentText).then(function (comment) {
			scope.model.comments.push(comment);
			scope.newCommentText = '';
		}, handleError);
	};

	appServerSvc.getItem(id).then(function (item) {
		_(scope.model).extend(item);
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
			return getTags().pop() || '';
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
