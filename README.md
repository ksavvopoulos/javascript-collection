javascript-collection
=====================

Spyreqs is a library that contains general purpose methods useful for interacting with<br>
the sharepoint lists and files.It is dependent on the jQuery.

The spyreqs library exposes to the window the spyreqs object which has three properties:<br>

<ul>
<li>1.The rest property which is an object that contains rest methods</li>
<li>2.The jsom property which is an object that contains jsom methods</li>
<li>3.The utils property which is an object that contains general purpose methods</li>
</ul>
<br>

Both spyreqs.rest and spyreqs.jsom contains methods that refers either to the <br>
Application scope or to the Host Site scope. If the method is for use in the App scope <br>
then it contains 'App' in its name otherwise it contains 'Host'. Because description, parameters and <br>
results of both app methods and host methods are identical for each case there will be <br>
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
	<ul>
	<li>string query (optional): the query to execute</li>
	</ul>
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
<ul>
	<li>string listTitle (required) : the title of the list to get</li>
	<li>string query (optional): the query to execute</li>
</ul>

**returns:**  a promise which when resolved contains an object the list.

```javascript
spyreqs.rest.getHostListByTitle(listTitle,query).then(function(data){
		var list = data.d;
		//do something with the list
});
```
<h3>spyreqs.rest.getAppListByTitle</h3>
**description:** gets a List from the Host Site. Parameters and return value same as spyreqs.rest.getHostListByTitle.

<h3>spyreqs.rest.getHostListItems</h3>
**description:** gets the Items of a List from the Host Site.<br>
**parameters:**
<ul>
	<li>string listTitle (required): the title of the list</li>
	<li>string query (optional): the query to execute on items</li>
</ul>
**returns:** a promise which when resolved contains an object with an array of the list items.

```javascript
spyreqs.rest.getHostListItems(listTitle,query).then(function(data){
		var items = data.d.results;
		//do something with the items
});
```
<h3>spyreqs.rest.getAppListItems</h3>
**description:** gets the Items from an App List. Parameters and return value same as spyreqs.rest.getHostListItems.

<h3>spyreqs.rest.getHostListFields</h3>

**description:** gets the Fields of a List from the Host Site. <br>
**parameters:**
<ul>
	<li>string listTitle (required): the title of the list</li>
	<li>string query (optional) : the query to execute on Items</li>
</ul>
**returns:** a promise which when resolved contains an object with an array of the list fields.

```javascript
spyreqs.rest.getHostListFields(listTitle,query).then(function(data){
		var fields = data.d.results;
		//do something with the fields
});
```
<h3>spyreqs.rest.getAppListFields</h3>

**description:** gets the Fields of an App List. Parameters and return value same as spyreqs.rest.getAppListFields.
<br>

<h3>spyreqs.rest.createHostList</h3>
**description:** creates a List to the Host Site. <br>
**parameters:**
<ul>
	<li>object list (required) : the list to create. the list object must have the properties
		<ul>
			<li>string Title : the list Title</li>
			<li>number Template : the list Template number(for a generic SP List 100) </li>
		</ul>
	</li>
</ul>
**returns:** A promise that is resolved when the list is succesfully created and contains the created list or rejected if an error occurs.

```javascript
var list={Title:"Demo",Template:100};

spyreqs.rest.createHostList(list).then(function(data){
	var createdList = data.d;
},function(error){
	//handle the error
});
```
<h3>spyreqs.rest.createAppList</h3>
**description:** creates an App List. Parameters and return value same as spyreqs.rest.createHostList.

<h3>spyreqs.rest.addHostListItem</h3>
**description:** adds an Item to a Host List. <br>
**parameters:** 
<ul> 
	<li>string listTitle (required): the title of the List to which the item should be added</li>
	<li>object item (required) : the item to add.The item object must have the properies 
		<ul>
			<li>string Title : the Title of the item</li>
			<li>objext __metadata: the metadata object must have the property 
				<ul>
					<li>string type : the type of the item</li>
				</ul>
			</li>
		</ul>
	</li>
</ul>
**returns:** A promise that is resolved when the item is added and contains the added item or rejected if an error occurs
```javascript

var listTile="Demo",
	item = {
	Title:"DemoItem",
	__metadata:{
		type:"SP.Data.DemoListItem"
	}
};

spyreqs.rest.addHostListItem(listTitle,item).then(function(data){
	var addedItem = data.d;
},function(error){
	//handle the error
});
```

<h3>spyreqs.rest.addAppListItem</h3>
**description:** adds an App List Item. Parameters and return value same as spyreqs.rest.addAppListItem.

<h3>spyreqs.rest.deleteHostListItem</h3>
**description:** deletes an Item in a Host List. <br>
**parameters:** 
<ul>
	<li>string listTitle (required) : the title of the List</li>
	<li>string itemId (required) : the id of the Item to delete</li>
	<li>string etag (optional) : the etag property of the item. if not provided defaults to "*"</li>
</ul>
**returns:**A promise that is resolved when the item is deleted or rejected if the deletion fails.
```javascript

spyreqs.rest.deleteHostListItem(listTitle,itemId,"*").then(function(){
	//successfully deleted
},function(error){
	//handle the error
});
```
<h3>spyreqs.rest.deleteAppListItem</h3>
**description:** deletes an Item in an App List. Parameters and return value same as spyreqs.rest.deleteHostListItem.

<h3>spyreqs.rest.updateHostListItem</h3>
**description:** updates an item in a Host List. <br>
**parameters:**
<ul>
	<li>string listTitle (required) : the title of the List</li>
	<li>object item (required) : the item to update. Must have the properties
		<ul>
			<li>string Id : the guid of the item</li>
			<li>any property of the item you want to change</li>
			<li>object __metadata : the metadata object must have the properties
				<ul>
					<li>string type: the type of the object e.g. "SP.Data.DemoListItem"</li>
					<li>string etag (optional) : defaults to "*" </li>
				</ul>
			</li>
		</ul>
	</li>
</ul>
**returns:** A promise that is resolved when the item is updated or rejected if the update fails
```javascript

spyreqs.rest.updateHostListItem(listTitle,item).then(function(){
	//successfully updated
},function(error){
	//handle the error
});
```
<h3>spyreqs.rest.updateAppListItem</h3>
**description:** updates an Item in an App List. Parameters and return value same as spyreqs.rest.updateHostListItem.

<h3>spyreqs.rest.updateHostListField</h3>
**description:** updates a Field to a Host List. <br>
**parameters:** 
<ul>
	<li>string listTitle (required) : the Title of the List</li>
	<li>object field (required) : the field to update.The field object must have the properties
		<ul>
			<li>string Id:the guid of the field</li>
			<li>object __metadata: the metadata object must have the properties
				<ul>
					<li>string type (required): the type of the field e.g ""SP.Field""</li>
					<li>string etag (optional): defaults to "*"</li>
				</ul>
			</li>
		</ul>
	</li>
</ul>

<h3>spyreqs.rest.updateAppListField</h3>
**description:** updates a Field to an App List. Parameters and return value same as spyreqs.rest.updateHostListField.

<h3>spyreqs.rest.addHostListField</h3>
**description:** adds a Field to a Host List. <br>
**parameters:** 
<ul>
	<li>string listGuid (required) : the guid of the list</li>
	<li>string fieldType (optional) : the type of the field, defaults to the generic "SP.Field"</li>
	<li>object field (required) : the field to add. The object must have the properties
		<ul>
			<li>string Title : the title of the field</li>
			<li>number FieldTypeKind : <a href="http://msdn.microsoft.com/en-us/library/microsoft.sharepoint.client.fieldtype.aspx">documentation about FieldTypeKind</a></li>
			<li>boolean Required: if the field is required or not</li>
			<li>boolean EnforceUniqueValues</li>
			<li>string StaticName: the static name of the field</li>
		</ul>
	</li>
</ul>
**returns:** A promise that contains the added field

```javascript

spyreqs.rest.addHostListField(listGuid, field, fieldType).then(function(data){
	var field = data.d;
},function(error){
	//handle the error
});
```

<h3>spyreqs.rest.addAppListField</h3>
**description:** adds a Field to a Host List. Parameters and return value same as spyreqs.rest.addHostListField.

<h3>spyreqs.rest.getCurrentUser</h3>
**description:** gets the current user. <br>
**parameters:** empty <br>
**returns:** A promise that contains an object with info about the current user, like Email and Id
```javascript

spyreqs.rest.getCurrentUser().then(function(data){
	var currentUser = data.d;
},function(error){
	//handle the error
});
```

<h3>spyreqs.rest.getHostFile</h3>
**description:** gets a File from the Host Site.(not tested on binary files)<br>
**parameters:**
<ul>
	<li>string fileUrl: the relative file url</li>
</ul>
**returns:** A promise that contains the file.
```javascript

spyreqs.rest.getHostFile(fileUrl).then(function(data){
	var file = data;
},function(error){
	//handle the error
});
```

<h3>spyreqs.rest.getAppFile</h3>
**description:** gets a File from the App Site.(not tested on binary files)<br>
Parameters and return value same as spyreqs.rest.getHostFile.

<h3>spyreqs.rest.addHostFile</h3>
**description:** adds a File to the Host Site.(not tested on binary files)<br>
**parameters:**
<ul>
	<li>string folderPath: the relative url of the folder to which the file should be added</li>
	<li>string fileName</li>
	<li>file: the file to add</li>
</ul>
**returns:** A promise that contains the added file.
```javascript

spyreqs.rest.addHostFile(fileUrl).then(function(data){
	var file = data;
},function(error){
	//handle the error
});
```

<h3>spyreqs.rest.addAppFile</h3>
**description:** adds a File to the App Site.(not tested on binary files)<br>
Parameters and return value same as spyreqs.rest.addHostFile.

<h3>spyreqs.rest.getSiteUsers</h3>
**description:** gets all the users of the host Site<br>
**parameters:** empty <br>
**returns:** A promise that contains an array with the users of the site.
```javascript

spyreqs.rest.getSiteUsers(fileUrl).then(function(data){
	var siteUsers = data.d.results;
},function(error){
	//handle the error
});
```

<h2>spyreqs.jsom methods</h2>

<h3>spyreqs.jsom.checkHostList</h3>
**description:** checks wether a Host list exists or not. <br>
**parameters:**
<ul>
	<li>string listTitle:the list Title</li>
</ul>
**returns:** A promise that resolves to true if the list exists otherwise to false
```javascript
spyreqs.jsom.checkHostList(listTitle).then(function(data){
	var listExists = data;
});
```

<h3>spyreqs.jsom.checkAppList</h3>
**description:** checks wether an App list exists or not. Parameters and return value same as spyreqs.jsom.checkHostList.<br>

<h3>spyreqs.jsom.getHostListItems</h3>
**description:** gets the items of a Host List.<br>
**parameters:**
<ul>
	<li>string listTitle:the list Title</li>
	<li>string query : the query to execute</li>
</ul>
**returns:** A promise that contains a collection of the items
```javascript
var query = "<View><Query><Where><IsNotNull><FieldRef Name='ClassGuid'/></IsNotNull></Where></Query></View>";

spyreqs.jsom.getHostListItems(listTitle,query).then(function(resultCollection) { 
	var listItemEnumerator = resultCollection.getEnumerator(),
		out=" ";
	
	while (listItemEnumerator.moveNext()) {
		var oListItem = listItemEnumerator.get_current();
		out += oListItem.get_item('ClassStudentGroupID');
	}	
	alert(out);
},
function(error) {
	alert('getAppListItems request failed. ' +  error.args.get_message() + '\n' + error.args.get_stackTrace());
});
```

<h3>spyreqs.jsom.getAppListItems</h3>
**description:** gets the items of an App List. Parameters and return value same as spyreqs.jsom.getHostListItems.<br>

<h3>spyreqs.jsom.addHostListItem</h3>
**description:** adds an item to a Host List.<br>
**parameters:**
<ul>
	<li>string listTitle:the list Title</li>
	<li>object itemObj : the item to add</li>
</ul>
**returns:** A promise that contains the id of the created item
```javascript
spyreqs.jsom.addHostListItem("My List", {"Title":"my item", "Score":90})
	.then(function(itemId) {
		alert("item was added, id:"+itemId);
	},
    function(error) {
    	alert('addHostListItem request failed. ' +  error.args.get_message() + '\n' + error.args.get_stackTrace());
    });
```

<h3>spyreqs.jsom.addAppListItem</h3>
**description:** adds an item to an App List.Parameters and return value same as spyreqs.jsom.addHostListItem.

<h3>spyreqs.jsom.createHostList</h3>
**description:** creates a List to the Host Site.<br>
**parameters:**
<ul>
	<li>object listObj:the list to create</li>
</ul>
**returns:** A promise that contains the created List
```javascript
var listObj = {
	"title":"app_MainListName",	 
	"url":"app_MainListName", 
	"template" : "genericList",
	"description" : "this is a list", 
	fields : [	 
		{"Name":"userId", "Type":"Text", "Required":"true"},								
		{"Name":"score", "Type":"Number"}, 
		{"Name":"scoreFinal", "Type":"Number", "hidden":"true"},
		{"Name":"assginedTo", "Type":"User", "Required":"true"},
		{"Name":"dateAssgined", "Type":"DateTime"},								
		{"Name":"state", "Type":"Choice", "choices" : ["rejected", "approved", "passed", "proggress"]},
		{"Name":"comments", "Type":"Note"},								
		{"Name":"testLink", "Type":"URL"}
	]	 
};

spyreqs.jsom.createHostList(listObj)
	.then(function(data){
		//success
	},function(error){
		//error
	});	
```

<h3>spyreqs.jsom.createAppList</h3>
**description:** creates a List to the App Site.Parameters and return value same as spyreqs.jsom.createHostList.<br>

<h2>spyreqs.utils methods</h2>

<h3>spyreqs.utils.urlParamsObj</h3>
**description:** gets the url parameters. <br>
**parameters:** empty. <br>
**returns:**  an object with the url parameters as key, value
```javascript
//for example if the url is http://www.example.com?user=adam&email=adam@gmail.cmom
//then
var params = spyreqs.utils.urlParamsObj();
//params = {user:adam,email:adam@gmail.com}
```

<h3>spyreqs.utils.buildQueryString</h3>
**description:** builds a query string <br>
**parameters:**
<ul>
	<li>string str : the string to which the query string is added</li>
	<li>string param : the parameter to add to the query string</li>
	<li>string or number or boolean val : the value of the parameter to add to the query string</li>
</ul>
**returns:**  a query string

<h3>spyreqs.utils.say</h3>
**description:** a safe way to log to the console, because it checks first if there is the console<br>
and if it has the log method <br>
**parameters:**
<ul>
	<li>anything you want to log</li>
</ul>
**returns:** nothing

<h3>spyreqs.utils.getRegionalSettings</h3>
**description:** gets the Regional settings like DateFormat,localeId etc. <br>
**parameters:**
<ul>
	<li>string query:the query to execute</li>
</ul>
**returns:** A promise that contains an object with the regionalSettings
```javascript
spyreqs.utils.getRegionalSettings(query).then(function(data){
	var regionalSettings = data.d;
});
```
