function ehrsJsonAjax(jsonData, ajaxMethod, methodUrl, methodSuccessFunc, methodCompleteFunc) {
    if (!jsonData || (jsonData === null) || !ajaxMethod || (ajaxMethod === null)
    		|| !methodUrl || (methodUrl === null)) {
    	return false;
    }
    var jsonDataStr = jsonData;
    if (typeof jsonData != 'string' && ajaxMethod != 'GET') {
    	jsonDataStr = JSON.stringify(jsonData);
    }
    var shouldProcessData = (ajaxMethod == 'GET');
    $.ajax({
        type: ajaxMethod,
        url: methodUrl,
        cache: false,
        data: jsonDataStr,
        processData: shouldProcessData,
        dataType: 'json',
        contentType: 'application/json',
        timeout: 60000,
        success: methodSuccessFunc,
        complete: methodCompleteFunc,
        error: function(jqXHR, textStatus, errorThrown) {
        	if (console && (console !== null) && console.log && (console.log !== null)) {
                console.log('JSON AJAX method(' + ajaxMethod + ') - URL(' + methodUrl
                        + ') - Data(' + jsonDataStr + ') - Error Status: ' + jqXHR.status
                        + ' (' + jqXHR.statusText + ') - Error Thrown (' + errorThrown
                        + ') - Check the logs for possible server Exception.');
        	}
            if (methodSuccessFunc && $.isFunction(methodSuccessFunc)) {
                methodSuccessFunc({}, textStatus, jqXHR);
            }
        }
    });
}
function ehrsJsonAjaxGet(jsonData, getUrl, getSuccessFunc, getCompleteFunc) {
    ehrsJsonAjax(jsonData, 'GET', getUrl, getSuccessFunc, getCompleteFunc);
}
function ehrsJsonAjaxPost(jsonData, postUrl, postSuccessFunc, postCompleteFunc) {
    ehrsJsonAjax(jsonData, 'POST', postUrl, postSuccessFunc, postCompleteFunc);
}
function ehrsJsonAjaxPut(jsonData, putUrl, putSuccessFunc, putCompleteFunc) {
    ehrsJsonAjax(jsonData, 'PUT', putUrl, putSuccessFunc, putCompleteFunc);
}
function ehrsJsonAjaxDelete(jsonData, deleteUrl, deleteSuccessFunc, deleteCompleteFunc) {
    ehrsJsonAjax(jsonData, 'DELETE', deleteUrl, deleteSuccessFunc, deleteCompleteFunc);
}
function ehrsFormJsonAjax(formSelector, ajaxMethod, methodUrl, methodSuccessFunc, methodCompleteFunc) {
    if (!formSelector || (formSelector === null) || !ajaxMethod || (ajaxMethod === null)
            || !methodUrl || (methodUrl === null)) {
        return false;
    }
    var $formSelector = $(formSelector);
    if ($formSelector.is('form')) {
    	$formSelector = $formSelector.find('input,select,textarea');
    }
    var jsonData = JSON.stringify($formSelector.filter(function(index) {
    	var formElementOk = $(this).is('input');
    	formElementOk = formElementOk || $(this).is('select');
    	formElementOk = formElementOk || $(this).is('textarea');
    	return formElementOk;
    }).serializeJSON());
    ehrsJsonAjax(jsonData, ajaxMethod, methodUrl, methodSuccessFunc, methodCompleteFunc);
}
function ehrsFormJsonAjaxGet(formSelector, getUrl, getSuccessFunc, getCompleteFunc) {
	ehrsFormJsonAjax(formSelector, 'GET', getUrl, getSuccessFunc, getCompleteFunc);
}
function ehrsFormJsonAjaxPost(formSelector, postUrl, postSuccessFunc, postCompleteFunc) {
    ehrsFormJsonAjax(formSelector, 'POST', postUrl, postSuccessFunc, postCompleteFunc);
}
function ehrsFormJsonAjaxPut(formSelector, putUrl, putSuccessFunc, putCompleteFunc) {
    ehrsFormJsonAjax(formSelector, 'PUT', putUrl, putSuccessFunc, putCompleteFunc);
}
function ehrsFormJsonAjaxDelete(formSelector, deleteUrl, deleteSuccessFunc, deleteCompleteFunc) {
    ehrsFormJsonAjax(formSelector, 'DELETE', deleteUrl, deleteSuccessFunc, deleteCompleteFunc);
}
function ehrsResponseMeasurement(context, forceStart) {
    $.ajax({
        url: context + '/responseMeasurement',
        async: false,
        cache: false,
        data: {'forceStart': forceStart},
        dataType: 'html'
    }).done(function(html) {
    	if (!forceStart && console && (console !== null) && console.log && (console.log !== null)) {
    	    console.log('Response Measurement (ms): ' + html);
    	}
    });
}
function ehrsMemoryMeasurement(context) {
    $.ajax({
        url: context + '/memoryMeasurement',
        async: false,
        cache: false,
        dataType: 'html'
    }).done(function(html) {
    	if (console && (console !== null) && console.log && (console.log !== null)) {
       	    console.log(html);
    	}
    });
}
