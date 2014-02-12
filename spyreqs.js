(function(window) {
    "use strict";
    var appUrl, hostUrl, executor,
        context, factory, queryParams,
        baseUrl, targetStr,
        spyreqs;

    function urlParamsObj() {
        // function returns an object with url parameters
        if (window.location.search) { // if there are params in URL
            var param_array = document.location.search.substring(1).split('&'),
                params = {},
                theLength = param_array.length,
                i = 0,
                x;

            for (; i < theLength; i++) {
                x = param_array[i].toString().split('=');
                params[x[0]] = x[1];
            }
            return params;
        }
        return null;
    }

    function getQueryStringParameter(param) {
        /* usage if this is not recomended when we need more than one param,
    since it calls URLparamsObj for every param asked */
        var a = urlParamsObj();
        if (a === null) {
            return null;
        }
        return a.param;
    }

    function getAsync(url) {
        var defer = new $.Deferred();

        executor.executeAsync({
            url: url,
            method: "GET",
            dataType: "json",
            headers: {
                Accept: "application/json;odata=verbose"
            },
            success: function(data) {
                defer.resolve(JSON.parse(data.body));
            },
            fail: function(error) {
                defer.reject(error);
            }
        });

        return defer.promise();
    }

    function deleteAsync(url, etag) {
        var defer = new $.Deferred();

        executor.executeAsync({
            url: url,
            method: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-HTTP-Method": "DELETE",
                "If-Match": etag
            },
            success: function(data) {
                //data.body is an empty string
                defer.resolve(data);
            },
            fail: function(error) {
                defer.reject(error);
            }
        });

        return defer.promise();
    }

    function updateAsync(url, data) {
        var defer = new $.Deferred();

        executor.executeAsync({
            url: url,
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-HTTP-Method": "MERGE",
                "If-Match": data.__metadata.etag
            },
            success: function(data) {
                //data.body is an empty string
                defer.resolve(data);
            },
            fail: function(error) {
                defer.reject(error);
            }
        });

        return defer.promise();

    }

    function createAsync(url, data) {
        var defer = new $.Deferred();

        executor.executeAsync({
            url: url,
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose"
            },
            success: function(data) {
                defer.resolve(JSON.parse(data.body));
            },
            fail: function(error) {
                defer.reject(error);
            }
        });

        return defer.promise();
    }

    /**
     * checks if the query argument is a string and if it is not returns an empty string
     * @param  {string} query [the query to execute]
     * @return {string}       [the input query or an empty string]
     */
    function checkQuery(query) {
        if (typeof query === 'undefined' || (typeof query !== 'string' && !(query instanceof String))) {
            return '';
        }

        return query;
    }

    // get an object with queryString params and their values
    queryParams = urlParamsObj();

    appUrl = decodeURIComponent(queryParams.SPAppWebUrl);
    if (appUrl.indexOf('#') !== -1) {
        appUrl = appUrl.split('#')[0];
    }

    hostUrl = decodeURIComponent(queryParams.SPHostUrl);

    targetStr = "&@target='" + hostUrl + "'";
    baseUrl = appUrl + "/_api/SP.AppContextSite(@target)/";

    executor = new SP.RequestExecutor(appUrl);
    context = SP.ClientContext.get_current();
    factory = SP.ProxyWebRequestExecutorFactory(appUrl);

    spyreqs = {
        rest: {
            /**
             * gets the Lists of the host Site
             * @param  {string} query [the query to execute example:"$filter=..."]
             * example of using the function
             * spyreqs.rest.getHostLists("$select=...").then(function(data){//doSomething with the data},function(error){//handle the error});
             */
            getHostLists: function(query) {
                var url;

                query = checkQuery(query);
                url = baseUrl + "web/lists?" + query + targetStr;

                return getAsync(url);
            },
            /**
             * gets a List from the Host Site by the Title of the List
             * @param  {string} listTitle [the Title of the List]
             * @param  {string} query     [the query to execute]
             */
            getHostListByTitle: function(listTitle, query) {
                var url;

                query = checkQuery(query);
                url = baseUrl + "web/lists/getByTitle('" + listTitle + "')?" + query + targetStr;

                return getAsync(url);
            },
            /**
             * gets the Items of a List from the Host Site
             * @param  {string} listTitle [The Title of the List]
             * @param  {string} query     [the query to execute]
             */
            getHostListItems: function(listTitle, query) {
                var url;

                query = checkQuery(query);
                url = baseUrl + "web/lists/getByTitle('" + listTitle + "')/Items?" + query + targetStr;

                return getAsync(url);
            },
            /**
             * gets the Fields of a List form the Host Site
             * @param  {string} listTitle [The Title of the List ]
             * @param  {string} query     [the query to execute]
             */
            getHostListFields: function(listTitle, query) {
                var url;

                query = checkQuery(query);
                url = baseUrl + "web/lists/getByTitle('" + listTitle + "')/Fields?" + query + targetStr;

                return getAsync(url);
            },
            /**
             * create a List at the Host Site
             * @param  {object} list [the list to create. Must have the properties 'Template' and 'Title']
             */
            createHostList: function(list) {
                var data,
                    url = baseUrl + "web/lists?" + targetStr;

                data = {
                    "__metadata": {
                        type: "SP.List"
                    },
                    BaseTemplate: list.Template,
                    Title: list.Title
                };

                return createAsync(url, data);
            },
            /**
             * adds an item to a Host List
             * @param {string} listTitle [The Title of the List]
             * @param {object} item      [the item to create. Must have the properties Title and __metadata.
             * __metadata must be an object with property type and value "SP.Data.LessonsListItem"]
             */
            addHostListItem: function(listTitle, item) {
                var url = baseUrl + "web/lists/getByTitle('" + listTitle + "')/Items?" + targetStr;

                return createAsync(url, item);
            },
            /**
             * deletes an item from List from the Host Site
             * @param  {string} listTitle [The Title of the List]
             * @param  {string} itemId    [the id of the item]
             * @param  {string} etag      [the etag value of the item's __metadata object]
             */
            deleteHostListItem: function(listTitle, itemId, etag) {
                var url = baseUrl + "web/lists/getByTitle('" + listTitle + "')/Items(" + itemId + ")?" + targetStr;

                return deleteAsync(url, etag);
            },
            /**
             * updates an item in a Host List
             * @param  {string} listTitle [the title of the Host List]
             * @param  {object} item      [the item to update. Must have the properties Id and __metadata]
             */
            updateHostListItem: function(listTitle, item) {
                var url = baseUrl + "web/lists/getByTitle('" + listTitle + "')/Items(" + item.Id + ")?" + targetStr;

                return updateAsync(url, item);
            },
            /**
             * adds a field to a Host List
             * @param {string} listGuid [the guid of the list]
             * @param {object} field    [the field to add]
             * @param {string} fieldType [otional fieldType.If not provided defaults to SP.Field]
             * field must have the properties :
             *      'Title': 'field title',
             *      'FieldTypeKind': FieldType value,{int}
             *      'Required': true/false,
             *      'EnforceUniqueValues': true/false,
             *      'StaticName': 'field name'
             * information about FieldTypeKind :
             *     http://msdn.microsoft.com/en-us/library/microsoft.sharepoint.client.fieldtype.aspx
             */
            addHostListField: function(listGuid, field, fieldType) {
                var url = baseUrl + "web/lists(guid'" + listGuid + "')/Fields?" + targetStr;

                field['__metadata'] = {
                    type: (typeof fieldType !== 'undefined') ? fieldType : 'SP.Field'
                };

                return createAsync(url, field);
            }
        },
        csom: {
            createHostList: function(list) {
                var appContextSite,
                    web, listCreationInfo, newList;

                context.set_webRequestExecutorFactory(factory);
                appContextSite = new SP.AppContextSite(context, hostUrl);

                web = appContextSite.get_web();

                listCreationInfo = new SP.ListCreationInformation();
                listCreationInfo.set_title(list.Title);
                listCreationInfo.set_templateType(list.Type);

                newList = web.get_lists().add(listCreationInfo);

                context.load(newList);
                context.executeQueryAsync(success, fail);

                function success() {
                    var result = newList.get_title() + ' created.';
                    alert(result);
                }

                function fail(sender, args) {
                    alert('Request failed. ' + args.get_message() +
                        '\n' + args.get_stackTrace());
                }
            },
            createHostSite: function(webToCreate) {
                var appContextSite,
                    web, webCreationInfo, newWeb;

                context.set_webRequestExecutorFactory(factory);
                appContextSite = new SP.AppContextSite(context, hostUrl);

                web = appContextSite.get_web();

                webCreationInfo = new SP.WebCreationInformation();
                webCreationInfo.set_title(webToCreate.Title);
                webCreationInfo.set_webTemplate(webToCreate.Template);
                webCreationInfo.set_url(webToCreate.Url);
                webCreationInfo.set_language(webToCreate.language);
                webCreationInfo.set_useSamePermissionsAsParentSite(webToCreate.inheritPerms);

                newWeb = web.get_webs().add(webCreationInfo);

                context.load(newWeb);

                context.executeQueryAsync(success, fail);

                function success() {
                    var result = newWeb.get_title() + ' created.';
                    alert(result);
                }

                function fail(sender, args) {
                    alert('Request failed. ' + args.get_message() +
                        '\n' + args.get_stackTrace());
                }
            }
        }
    };

    window.spyreqs = spyreqs;

}(window));