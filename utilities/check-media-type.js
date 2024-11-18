export function checkMediaType(reversedPictures){
  if(reversedPictures.media_type === "image"){
    return reversedPictures.url;
  }else{
    return reversedPictures.thumbnail_url;
  }
}