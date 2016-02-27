
// createJsonResponse: API response based on http://labs.omniti.com/labs/jsend 
function createJsonResponse(error, data){
  
	var response = {};

	// check for an error
	if (!error) {
		response.status = 'success';
	} else {
		response.status = 'error';
		response.message = error;
	}

	response.data = data;

	return response;

}
exports.createJsonResponse = createJsonResponse;
