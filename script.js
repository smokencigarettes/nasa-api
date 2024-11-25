import {create} from "./utilities/createElement.js";
import {qs} from "./utilities/querySelector.js";
import {convertDaysInMillis} from "./utilities/days-in-millis.js";
import {createFormattedDate} from "./utilities/formatted-date.js";
import {checkMediaType} from "./utilities/check-media-type.js";

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
let apiKey = "sXypXBTu3UnfWhDfqZ6HKxVx2ckxgm4drQzfc2BB";

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
  let reversedPictures = [...pictures].reverse();
  createContainers(reversedPictures[0]);
  previousPictures(reversedPictures.slice(1));
  galleryPictures = reversedPictures.slice(1);
  }
)


// MAIN PICTURE
function createContainers(reversedPictures){
  mainPicture.textContent = "";

  let img = create("img");
  let imgContent = checkMediaType(reversedPictures);
  img.src = imgContent;
  mainPicture.prepend(img);
  
  let mainDiv = create("div");
  mainDiv.classList.add("text-container");
  img.after(mainDiv);

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
  
    let img = create("img");
    let imgContent = checkMediaType(picture);
    img.src = imgContent;
    pictureContainer.append(img);
  })
}

// MODALE
let closebutton = qs("#close-button");
let pictureDetailsContainer = qs("#picture-details-container");

let showDetails = (picture) => {
  let pictureDetailsTitle = qs("#picture-title");
  let pictureDetailsImg = qs("#picture-img");
  let pictureDetailsDescription = qs("#picture-description");
  let pictureDetailsCopyright = qs("#picture-copyright");

  pictureDetailsTitle.textContent = picture.title;
  let imgContent = checkMediaType(picture);
  pictureDetailsImg.src = imgContent;
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

fetchCuriosityData().then(
  res =>{
    let marsWeatherData = [];
    for(let i=0; i<687; i++){
      marsWeatherData.push(res[i]);
    }
    return marsWeatherData;
  } 
)
.then(data => {
  let today = data[0];
  
  qs(".mars-today").innerHTML = `
  <h2>Curiosity Today!</h2>
  <p>This is my <strong>${today.sol}</strong> Martian Day!<p>
   <p>Today the weather is <strong>${today.atmo_opacity}</strong>, min temp is <strong>${today.min_temp}°</strong> and max temp is <strong>${today.max_temp}°</strong></p>
  `;

  google.charts.load("current", {"packages":["corechart"]});
  google.charts.setOnLoadCallback(() => {myChart(data)});
})

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

  let options = {
    title: "Mars weather from NASA's datas",
    hAxis: {
      title: "Sols"
    },
    vAxis: {
      title: "Celsius"
    },
    legend: {position: "bottom"}
  };

  let finalData = google.visualization.arrayToDataTable(chartData);

  let chart = new google.visualization.LineChart(qs("#mars-data"));
  chart.draw(finalData, options);
}