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
	"new role",
	"✅",
];

var sellingWords = [
	"comment below",
	"share this post",
	"sign up",
	"link below",
	"subscribe to",
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

var detectSelling = function (text) {
	var textLower = text.toLowerCase();
	for (let i = 0; i < sellingWords.length; i++) {
		var sellingWord = sellingWords[i];
		if (textLower.includes(sellingWord)) {
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


function sendLabelledData(clientID, text, feedbackType, feedbackLabel, extensionLabel) {
	var data = JSON.stringify({
		"clientID": clientID,
		"label" : parseInt(feedbackLabel),
		"text" : text,
		"feedbackType": feedbackType,
		"extensionLabel" : extensionLabel
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




var getClientAndSendData = function(text, feedbackType, feedbackLabel, extensionLabel) {
	
	//TODO fix this part to get a real ClientID that persists in local storage and replace this line:
	sendLabelledData(getRandomToken(), text, feedbackType, feedbackLabel, extensionLabel);


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


function revealHideButtons(post) {
	var body = $(post).find(".break-words");
	body.css("filter", "blur(4px)");

	$(post).find(".reveal-button").removeClass("hidden");
	$(post).find(".reveal-button").unbind().click(function(data) {
		var post= data.currentTarget.closest(".feed-shared-update-v2__description-wrapper")
		$(post).find(".break-words").css("filter", "blur(0)")
		$(this).addClass("hidden");
		$(post).find(".hide-button").removeClass("hidden");
	})
	$(post).find('.hide-button').unbind().click(function(data) {
		var post= data.currentTarget.closest(".feed-shared-update-v2__description-wrapper")
		$(post).find(".break-words").css("filter", "blur(4px)")
		$(this).addClass("hidden");
		$(post).find(".reveal-button").removeClass("hidden");
	})

}




var labelPosts = function() {
	var posts = $(".feed-shared-update-v2__description-wrapper");

	$.get(chrome.runtime.getURL('/reality_check.html'), function (data) {
		for (let i = 0; i < posts.length; i++) {
			var post = posts[i];

			// first check if we already put a label on this post 
			if ($(post).find(".reality-check-container").length == 0) {
				var newDiv = document.createElement("div");
				newDiv.setAttribute("id", "reality-check-container-" + i);
				post.prepend(newDiv);
				var div = $("#reality-check-container-" + i);	

				div.html($.parseHTML(data));
				// add some IDs to this specific div
				$(div).find(".bragging-container").attr("id", "bragging-container-" + i);
				$(div).find(".selling-container").attr("id", "selling-container-" + i);

	
		

				// add functions
				$(".feedback-element").unbind().click(function(data) {
					// debugger;
					var post = data.currentTarget.closest(".feed-shared-update-v2__description-wrapper");
					var texts = post.getElementsByClassName("break-words");
					var text = "";
					if (texts.length > 0) {
						text = texts[0].innerText;
					}
					
					// which type of feedback is this for -- Bragging, Selling, or another one?
					var parentRealityItem = data.currentTarget.closest(".reality-item");
					var feedbackType = null;

					if (parentRealityItem.classList.contains("bragging-container")) {
						feedbackType = "bragging";
						
					} else if (parentRealityItem.classList.contains("selling-container")) {
						feedbackType = "selling";
					}

					// What did the Extension label this as?
					var extensionLabel = null;
					if (!$(parentRealityItem).find(".reality-check-label-true")[0].classList.contains("hidden")) {
						extensionLabel = true;
					} else {
						extensionLabel = false;
					}



					// Tell if it was accurate or not
					var feedbackLabel = 0;
					if (data.currentTarget.classList.contains("feedback-inaccurate")) {
						feedbackLabel = -1;
					} else {
						feedbackLabel = 1;
					}

					getClientAndSendData(text, feedbackType, feedbackLabel, extensionLabel);

					var feedbackRow = data.currentTarget.closest(".feedback-row");
					$(feedbackRow).find(".feedback-element-thanks").removeClass("hidden");
					$(feedbackRow).find(".feedback-accurate").addClass("hidden");
					$(feedbackRow).find(".feedback-inaccurate").addClass("hidden");
				});




				// Show the predicted labels for each type
				var texts = post.getElementsByClassName("break-words");

				if (texts.length > 0) {
					var text = texts[0].innerText;
					
					if (detectBragging(text)) {
						$("#bragging-container-" + i).find(".bragging-label-true").removeClass("hidden");
						revealHideButtons(post);
						
					} else {
						$("#bragging-container-" + i).find(".bragging-label-false").removeClass("hidden");
					}

					if (detectSelling(text)) {
						$("#selling-container-" + i).find(".selling-label-true").removeClass("hidden");
						revealHideButtons(post);
					} else {
						$("#selling-container-" + i).find(".selling-label-false").removeClass("hidden");
					}

					
					

				}
			}

		}
	});

}




window.onload = function() {
	var intervalID = window.setInterval(labelPosts, 500);


}


