window.onload = function() {
    var $fileInput = this.document.getElementsByClassName(
            "custom-file-input"
        )[0],
        $fileInputLabel = $fileInput.nextElementSibling;

    $fileInput.oninput = function() {
        $fileInputLabel.innerHTML =
            this.value.replace(/.*[\/\\]/, "") || "Choose file";
    };
};
