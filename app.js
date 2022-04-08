// App logic

// General Functions

	// Check if element is checked
	let isChecked = function(x) {
		return document.getElementById(x).checked ? document.getElementById(x).value : false;
	};

	// Get Values of the checked items
	let getChecked = function(a) {
		let list = [];
		for (let i = 0; i < a.length; i++) {
			let v = isChecked(a[i]);
			if (v) list.push(v);
		}
		return list;
	};

	// Allow shorting based on 
	let sortHandler = function(item, mul = 1){
		return function(a, b) {
			if (a[item] < b[item]) return -1 * mul;
			if (a[item] > b[item]) return 1 * mul;
			return 0;
		}
	};

// Results Generation
	
	// Filter data based on selected options
	window.generateResults = function(nextUpdate, data) {
		let isOutdated = new Date().getTime() > new Date(nextUpdate).getTime();
		document.getElementById('nextUpdate').textContent = nextUpdate + ' ';
		let tag = document.createElement('span');
		tag.className = 'badge bg-' + (isOutdated ? 'danger' : 'success');
		tag.textContent = (isOutdated ? 'outdated' : 'up-to-date');
		document.getElementById('nextUpdate').appendChild(tag);
		
		let protocolFamily = getChecked([
			'option-protocolFamily-uaf',
			'option-protocolFamily-u2f',
			'option-protocolFamily-fido2'
		]);
		if (protocolFamily.length)
			data = data.filter(x => protocolFamily.includes(x.metadataStatement.protocolFamily));


		let statusReport = getChecked([
			"option-statusReport-NOT_FIDO_CERTIFIED",
			"option-statusReport-FIDO_CERTIFIED",
			"option-statusReport-USER_VERIFICATION_BYPASS",
			"option-statusReport-ATTESTATION_KEY_COMPROMISE",
			"option-statusReport-USER_KEY_REMOTE_COMPROMISE",
			"option-statusReport-USER_KEY_PHYSICAL_COMPROMISE",
			"option-statusReport-UPDATE_AVAILABLE",
			"option-statusReport-REVOKED",
			"option-statusReport-SELF_ASSERTION_SUBMITTED",
			"option-statusReport-FIDO_CERTIFIED_L1",
			"option-statusReport-FIDO_CERTIFIED_L1plus",
			"option-statusReport-FIDO_CERTIFIED_L2",
			"option-statusReport-FIDO_CERTIFIED_L2plus",
			"option-statusReport-FIDO_CERTIFIED_L3",
			"option-statusReport-FIDO_CERTIFIED_L3plus"
		]);
		if (statusReport.length)
			data = data.filter(x => statusReport.includes(x.statusReports.sort(sortHandler('effectiveDate', -1))[0].status));


		let cryptoStrength = getChecked([
			'option-cryptoStrength-128',
			'option-cryptoStrength-256',
			'option-cryptoStrength-512'
		]);
		if (cryptoStrength.length)
			data = data.filter(x => cryptoStrength.includes(x.metadataStatement.cryptoStrength + ''));


		let keyProtection = getChecked([
			'option-keyProtection-software',
			'option-keyProtection-hardware',
			'option-keyProtection-tee',
			'option-keyProtection-secure_element',
			'option-keyProtection-remote_handle'
		]);
		let keyProtectionMode = document.getElementById('option-keyProtection-mode').value;
		if (keyProtection.length) {
			if (keyProtectionMode == 'AND') {
				data = data.filter(x => {
					for (let i = keyProtection.length - 1; i >= 0; i--) {
						if (!x.metadataStatement.keyProtection.includes(keyProtection[i])) return false;
					}
					return true;
				});
			}
			else {
				data = data.filter(x => {
					for (let i = keyProtection.length - 1; i >= 0; i--) {
						if (x.metadataStatement.keyProtection.includes(keyProtection[i])) return true;
					}
					return false;
				});
			}
		}


		let matcherProtection = getChecked([
			'option-matcherProtection-software',
			'option-matcherProtection-tee',
			'option-matcherProtection-on_chip'
		]);
		let matcherProtectionMode = document.getElementById('option-matcherProtection-mode').value;
		if (matcherProtection.length) {
			if (keyProtectionMode == 'AND') {
				data = data.filter(x => {
					for (let i = matcherProtection.length - 1; i >= 0; i--) {
						if (!x.metadataStatement.matcherProtection.includes(matcherProtection[i])) return false;
					}
					return true;
				});
			}
			else {
				data = data.filter(x => {
					for (let i = matcherProtection.length - 1; i >= 0; i--) {
						if (x.metadataStatement.matcherProtection.includes(matcherProtection[i])) return true;
					}
					return false;
				});
			}
		}


		let userVerificationMethod = getChecked([
			'option-userVerificationMethod-presence_internal',
			'option-userVerificationMethod-fingerprint_internal',
			'option-userVerificationMethod-passcode_internal',
			'option-userVerificationMethod-voiceprint_internal',
			'option-userVerificationMethod-faceprint_internal',
			'option-userVerificationMethod-location_internal',
			'option-userVerificationMethod-eyeprint_internal',
			'option-userVerificationMethod-pattern_internal',
			'option-userVerificationMethod-handprint_internal',
			'option-userVerificationMethod-passcode_external',
			'option-userVerificationMethod-pattern_external',
			'option-userVerificationMethod-none',
			'option-userVerificationMethod-all'
		]);
		let userVerificationMethodMode = document.getElementById('option-userVerificationMethod-mode').value;
		if (userVerificationMethod.length) {
			if (userVerificationMethodMode == 'AND') {
				data = data.filter(x => {
					for (let k = userVerificationMethod.length - 1; k >= 0; k--) {
						let found = false;
						for (let i = x.metadataStatement.userVerificationDetails.length - 1; i >= 0; i--) {
							for (let j = x.metadataStatement.userVerificationDetails[i].length - 1; j >= 0; j--) {
								if (userVerificationMethod[k] == x.metadataStatement.userVerificationDetails[i][j].userVerificationMethod) {
									found = true;
									break;
								}
							}
							if (found) break;
						}
						if (!found) return false;
					}
					return true;
				});
			}
			else {
				data = data.filter(x => {
					for (let i = x.metadataStatement.userVerificationDetails.length - 1; i >= 0; i--) {
						for (let j = x.metadataStatement.userVerificationDetails[i].length - 1; j >= 0; j--) {
							if (userVerificationMethod.includes(x.metadataStatement.userVerificationDetails[i][j].userVerificationMethod)) return true;
						}	
					}
					return false;
				});
			}
		}

		
		console.log(data);
		document.getElementById('results').textContent = '(' + data.length + ')';
		
		let wrapper = document.getElementById('results-details');
		wrapper.innerHTML = '';
		data.forEach(x => {
			let authentication = document.createElement('tr');

			let id = document.createElement('td');
			let sm = document.createElement('small');
			if (x.attestationCertificateKeyIdentifiers) {
				x.attestationCertificateKeyIdentifiers.forEach(x => {
					sm.appendChild(document.createTextNode('[' + x + ']' + ' '));
				});
			}
			else {
				sm.textContent = '[' + (x.aaguid || x.aaid) + ']';
			}
			id.appendChild(sm);
			authentication.appendChild(id);

			let description = document.createElement('td');
			description.textContent = x.metadataStatement.description + ' ' + 'v' + x.metadataStatement.authenticatorVersion;
			authentication.appendChild(description);
			
			let icon_wrapper = document.createElement('td');
			if (x.metadataStatement.icon) {
				let icon = document.createElement('img');
				icon.setAttribute('height', '21');
				icon.src = x.metadataStatement.icon;
				icon_wrapper.appendChild(icon);
			}
			authentication.appendChild(icon_wrapper);

			wrapper.appendChild(authentication);
		});
	};


// Listeners
	
	// On option change, re-generate results
	([
		'option-protocolFamily-uaf',
		'option-protocolFamily-u2f',
		'option-protocolFamily-fido2',

		"option-statusReport-NOT_FIDO_CERTIFIED",
		"option-statusReport-FIDO_CERTIFIED",
		"option-statusReport-USER_VERIFICATION_BYPASS",
		"option-statusReport-ATTESTATION_KEY_COMPROMISE",
		"option-statusReport-USER_KEY_REMOTE_COMPROMISE",
		"option-statusReport-USER_KEY_PHYSICAL_COMPROMISE",
		"option-statusReport-UPDATE_AVAILABLE",
		"option-statusReport-REVOKED",
		"option-statusReport-SELF_ASSERTION_SUBMITTED",
		"option-statusReport-FIDO_CERTIFIED_L1",
		"option-statusReport-FIDO_CERTIFIED_L1plus",
		"option-statusReport-FIDO_CERTIFIED_L2",
		"option-statusReport-FIDO_CERTIFIED_L2plus",
		"option-statusReport-FIDO_CERTIFIED_L3",
		"option-statusReport-FIDO_CERTIFIED_L3plus",

		'option-cryptoStrength-128',
		'option-cryptoStrength-256',
		'option-cryptoStrength-512',

		'option-keyProtection-software',
		'option-keyProtection-hardware',
		'option-keyProtection-tee',
		'option-keyProtection-secure_element',
		'option-keyProtection-remote_handle',
		'option-keyProtection-mode',

		'option-matcherProtection-software',
		'option-matcherProtection-tee',
		'option-matcherProtection-on_chip',
		'option-matcherProtection-mode',

		'option-userVerificationMethod-presence_internal',
		'option-userVerificationMethod-fingerprint_internal',
		'option-userVerificationMethod-passcode_internal',
		'option-userVerificationMethod-voiceprint_internal',
		'option-userVerificationMethod-faceprint_internal',
		'option-userVerificationMethod-location_internal',
		'option-userVerificationMethod-eyeprint_internal',
		'option-userVerificationMethod-pattern_internal',
		'option-userVerificationMethod-handprint_internal',
		'option-userVerificationMethod-passcode_external',
		'option-userVerificationMethod-pattern_external',
		'option-userVerificationMethod-none',
		'option-userVerificationMethod-all',
		'option-userVerificationMethod-mode'
	]).forEach(x => {
		document.getElementById(x).addEventListener('change', () => {
			generateResults(window.jwtData.nextUpdate, window.jwtData.entries);
		}, false);
	});

	// On clear click, uncheck options
	[... document.getElementsByClassName('clear-options')].forEach(x => {
		x.addEventListener('click', function(){
			[... this.parentNode.parentNode.getElementsByTagName('input')].forEach(x => {
				if (x.checked) x.checked = false;
			});
			generateResults(window.jwtData.nextUpdate, window.jwtData.entries);
		}, false);
	});

	// On page load, generate results
	window.addEventListener('load', () => {
		if (window.jwtData) generateResults(window.jwtData.nextUpdate, window.jwtData.entries);
	});

	// Load latest file
	let loading_mutex = false;
	document.getElementById('load-latest-jwt').addEventListener('click', () => {
		window.jwtDownload();
	}, false);
