'use strict';

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
				_(item).extend({
					id: Math.random().toString(36).substring(2),
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
