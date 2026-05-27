import {create} from "./utilities/createElement.js";
import {qs} from "./utilities/querySelector.js";
import {convertDaysInMillis} from "./utilities/days-in-millis.js";
import {createFormattedDate} from "./utilities/formatted-date.js";
import {checkMediaType} from "./utilities/check-media-type.js";
import {apiKey} from "./config.js";

// FRECCE MODALE
let prevArrow = qs("#prev");
let nextArrow = qs("#next");
let currentIndex = 0;
let galleryPictures = [];

// ESTRAZIONE DATE
let endMillis = Date.now();
let daysMillis = convertDaysInMillis(16);
let startMillis = endMillis - daysMillis;

let start_date = createFormattedDate(startMillis);
let end_date = createFormattedDate(endMillis);

// let astronomyPictures = "./NASA-API/mock/astronomy-pictures.json";
let astronomyPictures = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${start_date}&end_date=${end_date}&thumbs=true`;


let mainPicture = qs("#main-picture");
let picturesContainer = qs(".pictures-container");


// ESTRAZIONE DATI
let fetchPictures = () => {
  let pictures = fetch(astronomyPictures)
  .then(res => {
    if(res.ok){
      return res.json()
    }else{
      throw new Error(res.status)
    }
  })
  .catch(
    error => {
      mainPicture.textContent = error;
    }
  );
  return pictures;
}

fetchPictures()
.then(pictures => {
  if (pictures && pictures.length > 0) {
    let reversedPictures = [...pictures].reverse();
    createContainers(reversedPictures[0], qs("#main-picture"));
    previousPictures(reversedPictures.slice(1));
    galleryPictures = reversedPictures.slice(1);
    console.log(galleryPictures);
  }
})




/*

async function fetchValidPictures(startMillis, endMillis) {
  let start_date = createFormattedDate(startMillis);
  let end_date = createFormattedDate(endMillis);
  let apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${start_date}&end_date=${end_date}&thumbs=true`;

  try {
    let response = await fetch(apiUrl);
    if (!response.ok) {
      if (response.status === 400) {
        return fetchValidPictures(startMillis, endMillis - convertDaysInMillis(1)); // Scala indietro di un giorno
      }
      throw new Error(`Errore API: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Errore nel recupero delle immagini:", error);
    return []; // RESTITUISCE SEMPRE UN ARRAY
  }
}


fetchValidPictures(startMillis, endMillis).then(pictures => {
  if (!pictures || pictures.length === 0) {  // Controlla se è vuoto o undefined
    mainPicture.textContent = "Impossibile recuperare le immagini.";
    return;
  }
  let reversedPictures = [...pictures].reverse();
  createContainers(reversedPictures[0]);
  previousPictures(reversedPictures.slice(1));
  galleryPictures = reversedPictures.slice(1);
});

*/


// MAIN PICTURE
function createContainers(reversedPictures, container){
  if (!container) return;
  container.textContent = "";

  let imgContent = checkMediaType(reversedPictures);
  let mediaElement;

  let videoUrl = reversedPictures.url || "";
  
  // Conversione URL YouTube in formato embed se necessario
  if (videoUrl.includes("youtube.com/watch?v=")) {
    videoUrl = videoUrl.replace("watch?v=", "embed/");
  } else if (videoUrl.includes("youtu.be/")) {
    videoUrl = videoUrl.replace("youtu.be/", "www.youtube.com/embed/");
  }

  let isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") || videoUrl.includes("youtube-nocookie.com");
  let isVimeo = videoUrl.includes("vimeo.com");
  let isEmbeddableVideo = reversedPictures.media_type === "video" && (isYouTube || isVimeo);
  let isMP4 = videoUrl.endsWith(".mp4");

  if (isEmbeddableVideo) {
    mediaElement = create("iframe");
    mediaElement.src = videoUrl;
    mediaElement.setAttribute("allowfullscreen", "");
    mediaElement.style.width = "50%";
    mediaElement.style.aspectRatio = "16/9";
    mediaElement.style.border = "none";
    mediaElement.style.paddingRight = "var(--s2)";
  } else if (isMP4) {
    mediaElement = create("video");
    mediaElement.src = videoUrl;
    mediaElement.controls = true;
    mediaElement.style.width = "50%";
    mediaElement.style.aspectRatio = "16/9";
    mediaElement.style.paddingRight = "var(--s2)";
  } else {
    mediaElement = create("img");
    mediaElement.src = imgContent || "";
  }

  container.prepend(mediaElement);
  
  // Click per ingrandire/aprire modale
  mediaElement.addEventListener("click", () => {
    showDetails(reversedPictures);
  });
  
  let mainDiv = create("div");
  mainDiv.classList.add("text-container");
  mediaElement.after(mainDiv);

  let title = create("h3");
  mainDiv.prepend(title);
  title.prepend(reversedPictures.title);
  
  let description = create("p");
  description.classList.add("paragraph");
  title.after(description);
  description.prepend(reversedPictures.explanation);
  
  let copyright = create("p");
  copyright.classList.add("copyright");

  if(reversedPictures.copyright){
    copyright.textContent = `Copyright: ${reversedPictures.copyright}`;
  }else{
    copyright.style.display = "none";
  }

  description.after(copyright);
}


// PREVIOUS PICTURES
function previousPictures(reversedPictures){
  picturesContainer.textContent = "";
  
  reversedPictures.forEach((picture, index) =>{
    let pictureContainer = create("div");
    pictureContainer.classList.add("picture-container");
    picturesContainer.append(pictureContainer);
    
    pictureContainer.addEventListener("click", () => {
      showDetails(picture);
      currentIndex = index;
      showSlide(galleryPictures);
    })
  
    let mediaElementThumbnail;
    let imgContent = checkMediaType(picture);

    if (picture.media_type === "video" && picture.url.endsWith(".mp4")) {
      mediaElementThumbnail = create("video");
      mediaElementThumbnail.src = picture.url;
      mediaElementThumbnail.muted = true;
      mediaElementThumbnail.preload = "metadata";
      mediaElementThumbnail.style.width = "100%";
      mediaElementThumbnail.style.height = "100%";
      mediaElementThumbnail.style.objectFit = "cover";
    } else {
      mediaElementThumbnail = create("img");
      mediaElementThumbnail.src = imgContent;
    }
    
    pictureContainer.append(mediaElementThumbnail);
  })
}

// MODALE
let closebutton = qs("#close-button");
let pictureDetailsContainer = qs("#picture-details-container");

let showDetails = (picture) => {
  let pictureDetailsTitle = qs("#picture-title");
  let pictureDetailsImg = qs("#picture-img");
  let pictureDetailsVideo = qs("#picture-video");
  let pictureDetailsDescription = qs("#picture-description");
  let pictureDetailsCopyright = qs("#picture-copyright");

  pictureDetailsTitle.textContent = picture.title;
  let imgContent = checkMediaType(picture);
  let videoUrl = picture.url || "";

  // Conversione URL YouTube in formato embed
  if (videoUrl.includes("youtube.com/watch?v=")) {
    videoUrl = videoUrl.replace("watch?v=", "embed/");
  } else if (videoUrl.includes("youtu.be/")) {
    videoUrl = videoUrl.replace("youtu.be/", "www.youtube.com/embed/");
  }

  let isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") || videoUrl.includes("youtube-nocookie.com");
  let isVimeo = videoUrl.includes("vimeo.com");
  let isEmbeddableVideo = picture.media_type === "video" && (isYouTube || isVimeo);
  let pictureDetailsVideoTag = qs("#picture-video-tag");
  if (!pictureDetailsVideoTag) {
      pictureDetailsVideoTag = create("video");
      pictureDetailsVideoTag.id = "picture-video-tag";
      pictureDetailsVideoTag.style.display = "none";
      pictureDetailsVideoTag.controls = true;
      pictureDetailsImg.after(pictureDetailsVideoTag);
  }

  let isMP4 = videoUrl.endsWith(".mp4");

  if (isEmbeddableVideo) {
    pictureDetailsImg.style.display = "none";
    pictureDetailsVideoTag.style.display = "none";
    pictureDetailsVideo.src = videoUrl;
    pictureDetailsVideo.style.display = "block";
  } else if (isMP4) {
    pictureDetailsImg.style.display = "none";
    pictureDetailsVideo.style.display = "none";
    pictureDetailsVideoTag.src = videoUrl;
    pictureDetailsVideoTag.style.display = "block";
  } else {
    pictureDetailsVideo.style.display = "none";
    pictureDetailsVideoTag.style.display = "none";
    pictureDetailsVideo.src = "about:blank";
    pictureDetailsVideoTag.src = "";
    pictureDetailsImg.src = imgContent || "";
    pictureDetailsImg.style.display = "block";
  }

  pictureDetailsDescription.textContent = picture.explanation;
  pictureDetailsCopyright.textContent = picture.copyright;

  pictureDetailsContainer.style.display = "flex";
}

function showSlide(reversedPictures) {
  showDetails(reversedPictures[currentIndex]);
  nextArrow.style.display = "flex";
  prevArrow.style.display = "flex";

  if (currentIndex === 0) {
    prevArrow.style.display = "none";
  }

  if (currentIndex === reversedPictures.length - 1) {
    nextArrow.style.display = "none";
  }
}

prevArrow.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex = currentIndex - 1;
  }
  showSlide(galleryPictures);
});

nextArrow.addEventListener("click", () => {
  if (currentIndex < galleryPictures.length - 1) {
    currentIndex = currentIndex + 1;
  }
  showSlide(galleryPictures);
});

closebutton.addEventListener("click", () =>{
  pictureDetailsContainer.style.display = "none";
})

window.addEventListener("keydown", (e) =>{
  if(e.key === "Escape"){
    pictureDetailsContainer.style.display = "none";
  }
})

window.addEventListener("click", (e) =>{
  if(e.target === pictureDetailsContainer){
    pictureDetailsContainer.style.display = "none";
  }
})


// DATI DA MARTE
let curiosityData = "https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json";

let fetchCuriosityData = () =>{
  let data = fetch(curiosityData)
  .then(res => res.json())
  .then(data => data.soles);
  return data;
}

fetchCuriosityData().then(data => {
  if (!data || data.length === 0) {
    let msg = `<h2>Curiosity Today!</h2><p>Impossibile caricare i dati meteo di Marte.</p>`;
    qs(".original-chart.mars-today").innerHTML = msg;
    qs(".test-chart.mars-today").innerHTML = msg;
    return;
  }
  
  let marsWeatherData = data.slice(0, 687);
  let today = marsWeatherData[0];
  
  let content = `
  <h2>Curiosity Today!</h2>
  <p>This is my <strong>${today.sol}</strong> Martian Day!<p>
   <p>Today the weather is <strong>${today.atmo_opacity}</strong>, min temp is <strong>${today.min_temp}°</strong> and max temp is <strong>${today.max_temp}°</strong></p>
  `;
  qs(".mars-today").innerHTML = content;

  google.charts.load("current", {"packages":["corechart"]});
  google.charts.setOnLoadCallback(() => {
    myChart([...marsWeatherData]);
  });
})
.catch(error => {
    let msg = `<h2>Curiosity Today!</h2><p>Errore nel caricamento dei dati: ${error.message}</p>`;
    qs(".mars-today").innerHTML = msg;
});

function myChart(weatherData){

  let formattedData = weatherData.map(data => {
    return [data.sol, +data.min_temp, +data.max_temp];
  })
  
  let chartData = [
    ["Sols", "Min", "Max"]
  ];
  
  formattedData.reverse();
  for(let data of formattedData){
    chartData.push(data);
  }

  // ESTETICA MARZIANA E LAYOUT ESPANSO
  let options = {
    title: "Mars weather from NASA's datas",
    titleTextStyle: { color: '#682C05', fontSize: 16, bold: true },
    hAxis: { 
      title: "Sols",
      titleTextStyle: { color: '#682C05', italic: false, bold: true },
      textStyle: { color: '#682C05', bold: true }
    },
    vAxis: { 
      title: "Celsius",
      titleTextStyle: { color: '#682C05', italic: false, bold: true },
      textStyle: { color: '#682C05', bold: true }
    },
    legend: { 
      position: "bottom",
      textStyle: { color: '#682C05', bold: true }
    },
    colors: ['#1E88E5', '#D84315'], // Blu per le minime, Arancione marziano per le massime
    // Layout allargato a prescindere dallo schermo
    chartArea: { left: 70, right: 15 }
  };

  let data = google.visualization.arrayToDataTable(chartData);

  // Usiamo qs per coerenza con il tuo codice originale
  let chart = new google.visualization.LineChart(qs("#mars-data"));
  chart.draw(data, options);

  window.addEventListener("resize", () => {
    chart.draw(data, options);
  });
}