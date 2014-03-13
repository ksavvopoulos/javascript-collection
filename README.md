javascript-collection
=====================

Spyreqs is a library that contains general purpose methods useful for interacting with<br>
the sharepoint lists and files.It is dependent only on the jQuery and the SP.RequestExecutor<br>
which if not present spyreqs will attempt to fetch on its own. 

The spyreqs library exposes to the window the spyreqs object which has three properties:<br>

<ul>
<li>1.The rest property which is an object that contains rest methods</li>
<li>2.The jsom property which is an object that contains jsom methods</li>
<li>3.The utils property which is an object that contains general purpose methods</li>
</ul>
<br>

Both spyreqs.rest and spyreqs.jsom contains methods that refers either to the <br>
Application scope or to the Host Site scope. If the method is for use in the App scope <br>
then it contains 'App' in its name otherwise it contains 'Host'. Because use, arguments and <br>
reults of both app methods and host methods are identical for each case there will be <br>
documentation for one of them. All spyreqs.rest and spyreqs.jsom methods return jQuery promises <br>
which are compatible with Q promises library and the subset of Q contained in Angular Framework.

<h2>spyreqs.rest methods</h2>
For all the Rest methods the query argument is optional and compliant with the OData query operators.
<br>
You can use $filter,$select and so on.
<a href="http://msdn.microsoft.com/en-us/library/gg309461.aspx">Full documentation</a><br>

<h3>spyreqs.rest.getHostLists</h3>

**description:** gets all the Lists from the Host Site that the App was installed.<br>
**parameters:** 
	*string query (optional): the query to execute<br>
**returns:** a promise which when resolved contains an object with an array of lists.

```javascript
spyreqs.rest.getHostLists(query).then(function(data){
		var lists = data.d.results;
		//do something with the lists
});
```
<h3>spyreqs.rest.getAppLists</h3>
**description:** gets all the app Lists. Parameters and return value same as spyreqs.rest.getHostLists.

<h3>spyreqs.rest.getHostListByTitle</h3>
**description:** gets a List from the Host Site.<br>
**parameters:**
	*string listTitle (required) : the title of the list to get
	*string query (optional): the query to execute
<br>
**returns:**  a promise which when resolved contains an object the list. 
```javascript
spyreqs.rest.getHostListByTitle(listTitle,query).then(function(data){
		var list = data.d;
		//do something with the list
});
```
<h3>spyreqs.rest.getAppListByTitle<h3>
**description:** gets a List from the Host Site. Parameters and return value same as spyreqs.rest.getHostListByTitle.

<h3>spyreqs.rest.getHostListItems</h3>
**description:** gets the Items of a List from the Host Site.
**parameters:** 
	*string listTitle (required): the title of the list
	*string query (optional): the query to execute on items
**returns:** a promise which when resolved contains an object with an array of the list items.
```javascript
spyreqs.rest.getHostListItems(listTitle,query).then(function(data){
		var items = data.d.results;
		//do something with the items
});
```

<h3>spyreqs.rest.getAppListItems</h3>
**description:** gets the Items from an App List. Parameters and return value same as spyreqs.rest.getHostListItems.