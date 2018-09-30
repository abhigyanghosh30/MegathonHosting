var MB_LIMIT = 50 * 1024 * 1024;

window.onload = function() {
    var $fileInput = this.document.getElementsByClassName(
            "custom-file-input"
        )[0],
        DEFAULT_LABEL = "Choose file",
        $fileInputLabel = $fileInput.nextElementSibling;

    $fileInput.oninput = function() {
        $fileInputLabel.innerHTML =
            this.value.replace(/.*[\/\\]/, "") || DEFAULT_LABEL;

        if(this.files[0].size > MB_LIMIT){
            alert("File upload of size above 50MB not allowed.");
            this.value = "";
            $fileInputLabel.innerHTML = DEFAULT_LABEL;
        }
    };
};
