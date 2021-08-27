var braggingWords = [
	"humbled",
	"proud",
	"accomplished",
	"excited",
	"announce"
]


var detectBragging = function (text) {
	var textLower = text.toLowerCase();
	for (let i = 0; i < braggingWords.length; i++) {
		var braggingWord = braggingWords[i];
		if (textLower.includes(braggingWord)) {
			return true;
		}
	}
}


var attachedPosts = new Set();
var labelledPosts = new Set();




var labelPosts = function() {
	var posts = $(".feed-shared-update-v2__description-wrapper");


	// attempt 2 
	for (let i = 0; i < posts.length; i++) {
		var post = posts[i];
		if (!attachedPosts.has(i)) {
			var newDiv = document.createElement("div");
			newDiv.setAttribute("id", "bragging-container-" + i);
			post.prepend(newDiv);
			attachedPosts.add(i);
		}
	};


	$.get(chrome.runtime.getURL('/braggingElement.html'), function (data) {
		for (let i = 0; i < posts.length; i++) {
			var post = posts[i];
			if (!labelledPosts.has(i)) {
				var div = $("#bragging-container-" + i);
				div.html($.parseHTML(data));
				// add some IDs
				$(div).find(".custom-select").attr("id", "custom-select-" + i);
				$(div).find(".btn").attr("id", "bragging-submit-" + i);
				$(div).find(".bragging-feedback-form").attr("id", "bragging-feedback-form-" + i);

				// add functions
				$("#bragging-submit-" + i).click(function(data) {
					var selectedValue = $(data.target.parentElement.parentElement).find(".custom-select").children("option:selected").val();
					var post = data.target.closest(".feed-shared-update-v2__description-wrapper");
					var texts = post.getElementsByClassName("break-words");
					var text = "";
					if (texts.length > 0) {
						text = texts[0].innerText;
					}

					// TODO: send this to API
					console.log(selectedValue);
					console.log(text);
				})

				// don't do this again
				labelledPosts.add(i);
			}
		}
	});

}




window.onload = function() {
	var intervalID = window.setInterval(labelPosts, 500);


}

