export function checkMediaType(picture){
  if(picture.media_type === "image"){
    return picture.url;
  } else if (picture.media_type === "video") {
    // Fallback ad un'immagine segnaposto se manca thumbnail_url
    return picture.thumbnail_url || "https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg";
  }
  return picture.url;
}

/*
export function checkMediaType(reversedPictures){
  if(reversedPictures.media_type === "image" || "video"){
    return reversedPictures.url;
  }
    else if (reversedPictures.media_type === "video"){
    return reversedPictures.url;
  }
    else{
    return reversedPictures.thumbnail_url;
  }
}
*/