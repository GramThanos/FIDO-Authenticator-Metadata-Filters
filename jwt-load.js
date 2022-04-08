(function(){
	window.jwtData = false;

	// Decode
	// https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
	window.jwtDecode = function(source) {
		window.jwtData = ((token) => {
			var base64Url = token.split('.')[1];
			var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));

			return JSON.parse(jsonPayload);
		})(source);
	};
	
	// Load from source
	let loading_mutex = false;
	window.jwtDownload = function (source = 'https://mds.fidoalliance.org/') {
		if (loading_mutex) return;
		loading_mutex = true;
		if (document.getElementById('nextUpdate'))
			document.getElementById('nextUpdate').textContent = 'Loading ...';
		fetch(source)
		.then(response => response.text())
		.then((data) => {
			window.jwtDecode(data);
			loading_mutex = false;
			window.generateResults(window.jwtData.nextUpdate, window.jwtData.entries);
		});
	};

	// Load jwt
	window.jwtDownload();

})();
