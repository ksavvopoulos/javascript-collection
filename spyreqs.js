(function(window) {
    "use strict";
    var appUrl, hostUrl, queryParams,
        executor, baseUrl, targetStr,
        spyreqs, say, rest;

    if (typeof window.console !== 'undefined') {
        say = function(what) {
            window.console.log(what);
        };
    } else if ((typeof window.top !== 'undefined') && (typeof window.top.console !== 'undefined')) {
        say = function(what) {
            window.top.console.log(what);
        };
    } else if ((typeof window.opener !== 'undefined') && (typeof window.opener.console !== 'undefined')) {
        say = function(what) {
            window.opener.console.log(what);
        };
    } else {
        say = function() {
            //do nothing
        };
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

    function newContextInstance() {
        // for jsom use. Return an object with new instances for clear async requests
        var returnObj = {}, context, factory, appContextSite;

        context = new SP.ClientContext(appUrl);
        factory = new SP.ProxyWebRequestExecutorFactory(appUrl);
        context.set_webRequestExecutorFactory(factory);
        appContextSite = new SP.AppContextSite(context, hostUrl);

        returnObj.context = context;
        returnObj.factory = factory;
        returnObj.appContextSite = appContextSite;

        return returnObj;
    }

    function urlParamsObj() {
        // function returns an object with url parameters
        if (window.location.search) { // if there are params in URL
            var param_array = document.location.search.substring(1).split('&'),
                theLength = param_array.length,
                params = {},
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

    queryParams = urlParamsObj();
    appUrl = decodeURIComponent(queryParams.SPAppWebUrl);

    if (appUrl.indexOf('#') !== -1) {
        appUrl = appUrl.split('#')[0];
    }

    hostUrl = decodeURIComponent(queryParams.SPHostUrl);
    targetStr = "&@target='" + hostUrl + "'";
    baseUrl = appUrl + "/_api/SP.AppContextSite(@target)/";
    executor = new SP.RequestExecutor(appUrl); // for rest use

    /**
     * the rest object has methods that are not to be exposed and are used
     * only from the spyreqs.rest methods
     */
    rest = {
        createList: function(url, list) {
            var data = {
                "__metadata": {
                    type: "SP.List"
                },
                BaseTemplate: list.Template,
                Title: list.Title
            };

            return createAsync(url, data);
        },
        addListField: function(url, field, fieldType) {
            field.__metadata = {
                type: (typeof fieldType !== 'undefined') ? fieldType : 'SP.Field'
            };

            return createAsync(url, field);
        }
    };

    spyreqs = {
        rest: {
            /**
             * gets the Lists of the host Site
             * @param  {string} query [the query to execute example:"$filter=..."]
             * example of using the function
             * spyreqs.rest.getHostLists("$select=...").then(function(data){//doSomething with the data},function(error){//handle the error});
             */
            getHostLists: function(query) {
                var url = baseUrl + "web/lists?" + checkQuery(query) + targetStr;

                return getAsync(url);
            },
            getAppLists: function(query) {
                var url = appUrl + "/_api/web/lists?" + checkQuery(query);

                return getAsync(url);
            },
            /**
             * gets a List from the Host Site by the Title of the List
             * @param  {string} listTitle [the Title of the List]
             * @param  {string} query     [the query to execute]
             */
            getHostListByTitle: function(listTitle, query) {
                var url = baseUrl + "web/lists/getByTitle('" + listTitle + "')?" + checkQuery(query) + targetStr;

                return getAsync(url);
            },
            /**
             * gets the Items of a List from the Host Site
             * @param  {string} listTitle [The Title of the List]
             * @param  {string} query     [the query to execute]
             */
            getAppListByTitle: function(listTitle, query) {
                var url = appUrl + "/_api/web/lists/getByTitle('" + listTitle + "')?" + checkQuery(query);

                return getAsync(url);
            },
            getHostListItems: function(listTitle, query) {
                var url = baseUrl + "web/lists/getByTitle('" + listTitle + "')/Items?" + checkQuery(query) + targetStr;

                return getAsync(url);
            },
            getAppListItems: function(listTitle, query) {
                var url = appUrl + "/_api/web/lists/getByTitle('" + listTitle + "')/Items?" + checkQuery(query);

                return getAsync(url);
            },
            /**
             * gets the Fields of a List form the Host Site
             * @param  {string} listTitle [The Title of the List ]
             * @param  {string} query     [the query to execute]
             */
            getHostListFields: function(listTitle, query) {
                var url = baseUrl + "web/lists/getByTitle('" + listTitle + "')/Fields?" + checkQuery(query) + targetStr;

                return getAsync(url);
            },
            getAppListFields: function(listTitle, query) {
                var url = appUrl + "/_api/web/lists/getByTitle('" + listTitle + "')/Fields?" + checkQuery(query);

                return getAsync(url);
            },
            /**
             * create a List at the Host Site
             * @param  {object} list [the list to create. Must have the properties 'Template' and 'Title']
             */
            createHostList: function(list) {
                var url = baseUrl + "web/lists?" + targetStr;

                return rest.createList(url, list);
            },
            createAppList: function(list) {
                var url = appUrl + "/_api/web/lists?";

                return rest.createList(url, list);
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
            addAppListItem: function(listTitle, item) {
                var url = appUrl + "/_api/web/lists/getByTitle('" + listTitle + "')/Items?";

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
            deleteAppListItem: function(listTitle, itemId, etag) {
                var url = appUrl + "/_api/web/lists/getByTitle('" + listTitle + "')/Items(" + itemId + ")?";

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
            updateAppListItem: function(listTitle, item) {
                var url = appUrl + "/_api/web/lists/getByTitle('" + listTitle + "')/Items(" + item.Id + ")?";

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

                return rest.addListField(url, field, fieldType);
            },
            addAppListField: function(listGuid, field, fieldType) {
                var url = appUrl + "/_api/web/lists(guid'" + listGuid + "')/Fields?";

                return rest.addListField(url, field, fieldType);
            }
        },
        jsom: {
            checkHostList: function(listObj) {
                // This function checks if list.Title exists.
                /* syntax example: 
                spyreqs.jsom.checkHostList({ "Title":listName }).then(
                    function(listExistsBool) { alert(listExistsBool); // true or false },
                    function(error) { alert('checkHostList request failed. ' +  error.args.get_message() + '\n' + error.args.get_stackTrace() ); }
                );  
                */
                var web, collectionList,
                    defer = new $.Deferred(),
                    c = newContextInstance();

                web = c.appContextSite.get_web();
                collectionList = web.get_lists();
                // this will only load Title, no other list properties
                c.context.load(collectionList, 'Include(Title)');
                c.context.executeQueryAsync(success, fail);

                function success() {
                    var listInfo = '',
                        answerBool = false,
                        listEnumerator = collectionList.getEnumerator();

                    while (listEnumerator.moveNext()) {
                        var oList = listEnumerator.get_current();
                        if (oList.get_title() == listObj.Title) {
                            answerBool = true;
                            break;
                        }
                    }
                    defer.resolve(answerBool);
                }

                function fail(sender, args) {
                    var error = {
                        sender: sender,
                        args: args
                    };
                    defer.reject(error);
                }

                return defer.promise();
            },
            getHostListByTitle: function(listTitle, query) {
                // NOT READY            
                var web, theList, defer = new $.Deferred(),
                    c = newContextInstance();

                web = c.appContextSite.get_web();
                theList = web.get_lists().getByTitle(listObj.Title);
                context.load(theList);
                context.executeQueryAsync(success, fail);

                function success() {
                    var result = theList.get_title() + ' created.';
                    alert(result);
                }

                function fail(sender, args) {
                    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                }
            },
            addHostListItem: function(listTitle, itemObj) {
                /* example: 
                spyreqs.jsom.addHostListItem("My List", {"Title":"my item", "Score":90}).then(
                    function(itemId) { alert("item was added, id:"+itemId); },
                    function(error) { alert('addHostListItem request failed. ' +  error.args.get_message() + '\n' + error.args.get_stackTrace() ); }
                );  
                */
                var web, theList, theListItem, prop, itemCreateInfo,
                    defer = new $.Deferred(),
                    c = newContextInstance();

                web = c.appContextSite.get_web();
                theList = web.get_lists().getByTitle(listTitle);
                itemCreateInfo = new SP.ListItemCreationInformation();
                theListItem = theList.addItem(itemCreateInfo);
                for (prop in itemObj) {
                    theListItem.set_item(prop, itemObj[prop]);
                }
                theListItem.update();
                c.context.load(theListItem);
                c.context.executeQueryAsync(success, fail);

                function success() {
                    defer.resolve(theListItem.get_id());
                }

                function fail(sender, args) {
                    var error = {
                        sender: sender,
                        args: args
                    };
                    defer.reject(error);
                }

                return defer.promise();
            },
            createHostList: function(listObj) {
                // NOT READY
                // use listObj.TemplateName (string) OR listObj.Type (int) to define list template
                var web, listCreationInfo,
                    listTemplates, templateId,
                    newList, listType;

                web = appContextSite.get_web();
                listCreationInfo = new SP.ListCreationInformation();
                listCreationInfo.set_title(listObj.Title);

                if (typeof listObj.TemplateName !== 'undefined') {
                    // prefer TemplateName if exists
                    listTemplates = web.get_listTemplates();
                    templateId = listTemplates.getByName(listObj.TemplateName);
                    listType = templateId;
                } else if (typeof listObj.Type !== 'undefined') {
                    listType = listObj.Type;
                } else {
                    // use generic list id
                    listType = 100;
                }

                listCreationInfo.set_templateType(listType);
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
                // NOT READY
                var web, webCreationInfo, newWeb;

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
        },
        utils: {
            urlParamsObj: urlParamsObj,
            say: say
        }
    };

    // liberate scope...
    window.spyreqs = spyreqs;
}(window));