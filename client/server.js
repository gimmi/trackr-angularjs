'use strict';

angular.module('app').factory('appServerSvc', ['$q', '$http', function (q, http) {
	var itemsPromise = http.get('items.json').then(function (resp) {
			return (resp.status === 200 ? resp.data : q.reject('HTTP ' + resp.status));
		});

	return {
		findItems: function (query) {
			return http.get('/api/items').then(function(ret) {
				if (ret.status !== 200) {
					throw new Error('HTTP ' + ret.status);
				}
				return ret.data;
			});
		},

		createItem: function (item) {
			return http.post('/api/items', item).then(function(ret) {
				if (ret.status !== 201) {
					throw new Error('HTTP ' + ret.status);
				}
				var headers = ret.headers();
				return http.get(headers.location);
			}).then(function(ret) {
				if (ret.status !== 200) {
					throw new Error('HTTP ' + ret.status);
				}
				return ret.data;
			});
		},

		updateItem: function (item) {
			return http.put('/api/items/' + item._id, item).then(function (ret) {
				if (ret.status !== 200) {
					throw new Error('HTTP ' + ret.status);
				}
				return item;
			});
		},

		getItem: function (id) {
			return http.get('/api/items/' + id).then(function (ret) {
				if (ret.status !== 200) {
					throw new Error('HTTP ' + ret.status);
				}
				return ret.data;
			});
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
