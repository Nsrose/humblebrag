var API_URL = 'https://humblebrag-1b57a-default-rtdb.firebaseio.com/LabelledData.json';

var braggingWords = [
	"humbled",
	"proud",
	"accomplished",
	"excited",
	"announce",
	"honored",
	"fortunate",
	"thrilled",
];

var sellingWords = [
	"comment below",
	"share this post",
	"sign up",
	"link below"
];




var detectBragging = function (text) {
	var textLower = text.toLowerCase();
	for (let i = 0; i < braggingWords.length; i++) {
		var braggingWord = braggingWords[i];
		if (textLower.includes(braggingWord)) {
			return true;
		}
	}
}




function getRandomToken() {
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    return hex;
}


function sendLabelledData(clientID, selectedValue, text) {
	var data = JSON.stringify({
		"clientID": clientID,
		"label" : parseInt(selectedValue),
		"text" : text
	})

	$.ajax({
		type: "POST",
		url: API_URL,
		data: data,
		success: function(data, status) {
			console.log(status);
		}
	})

}




var getClientAndSendData = function(selectedValue, text) {
	
	//TODO fix this part to get a real ClientID that persists in local storage and replace this line:
	sendLabelledData(getRandomToken(), selectedValue, text);


	// chrome.storage.sync.get('userid', function(items) {
 //    var userid = items.userid;
	//     if (userid) {
	//         sendLabelledData(userid);
	//     } else {
	//         userid = getRandomToken();
	//         chrome.storage.sync.set({userid: userid}, function() {
	//             sendLabelledData(userid);
	//         });
	//     };
	//     sendLabelledData(userid, selectedValue, text);
	// });
}





var labelPosts = function() {
	var posts = $(".feed-shared-update-v2__description-wrapper");

	$.get(chrome.runtime.getURL('/braggingElement.html'), function (data) {
		for (let i = 0; i < posts.length; i++) {
			var post = posts[i];
			// debugger;

			// first check if we already put a label on this post 
			if ($(post).find("#bragging-container-" + i).length == 0) {
				var newDiv = document.createElement("div");
				newDiv.setAttribute("id", "bragging-container-" + i);
				post.prepend(newDiv);
				var div = $("#bragging-container-" + i);	

				div.html($.parseHTML(data));
				// add some IDs to this specific div
				$(div).find(".custom-select").attr("id", "custom-select-" + i);
				$(div).find(".btn").attr("id", "bragging-submit-" + i);
				$(div).find(".bragging-feedback-form").attr("id", "bragging-feedback-form-" + i);
				$(div).find(".feedback-cta").attr("id", "feedback-cta-" + i);
				$(div).find(".feedback-confirmed").attr("id", "feedback-confirmed-" + i);

				// add functions
				$("#bragging-submit-" + i).click(function(data) {
					var selectedValue = $(data.target.parentElement.parentElement).find(".custom-select").children("option:selected").val();
					var post = data.target.closest(".feed-shared-update-v2__description-wrapper");
					var texts = post.getElementsByClassName("break-words");
					var text = "";
					if (texts.length > 0) {
						text = texts[0].innerText;
					}

					getClientAndSendData(selectedValue, text);
					// hide the feedback form now
					$("#bragging-container-" + i).find(".bragging-feedback").addClass("hidden");
					$("#feedback-cta-" + i).addClass("hidden");
					$("#feedback-confirmed-" + i).removeClass("hidden");
				});

				$("#feedback-cta-" + i).click(function() {
					$("#bragging-container-" + i).find(".bragging-feedback").removeClass("hidden");
				});


				// Show the predicted label
				var texts = post.getElementsByClassName("break-words");
				if (texts.length > 0) {
					var text = texts[0].innerText;
					if (detectBragging(text)) {
						$("#bragging-container-" + i).find(".bragging-label-true").removeClass("hidden");
					} else {
						$("#bragging-container-" + i).find(".bragging-label-false").removeClass("hidden");
					}
				}
			}

		}
	});

}




window.onload = function() {
	var intervalID = window.setInterval(labelPosts, 500);


}


