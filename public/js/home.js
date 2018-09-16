function NotifyDelete(path)
    {
        if(confirm("Delete the file?")){
            	window.location = "/delete/"+path;
        }
    }