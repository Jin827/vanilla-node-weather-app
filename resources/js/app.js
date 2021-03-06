
(function () {
    const IS_DEBUG_MODE = !!~location.href.indexOf('localhost');
    const BACKEND_HOST = IS_DEBUG_MODE ? 'http://localhost:3000' : 'https://jh-weather.herokuapp.com';
 
    const app = document.querySelector('#app');

    const cityForm = app.querySelector('.city-form');
    const cityInput = cityForm.querySelector('.city-input');

    const conHeader = app.querySelector('.contents-header');
    const currentSummary = app.querySelector('.current-summary');
    const currentRight = app.querySelector('.current-right');
    const currentLeft = app.querySelector('.current-left');
    const dailyList = app.querySelector('.daily-list');

    const weatherData = [
        ['clear-day', 'day-sunny'], 
        ['clear-night', 'night-clear'], 
        ['rain', 'rain'], 
        ['snow', 'snow'], 
        ['sleet', 'sleet'], 
        ['wind', 'windy'], 
        ['fog', 'fog'], 
        ['cloudy', 'cloudy'], 
        ['partly-cloudy-day', 'day-cloudy'], 
        ['partly-cloudy-night', 'night-partly-cloudy'], 
        ['hail', 'hail'], 
        ['thunderstorm', 'thunderstorm'], 
        ['tornado', 'tornado']
    ];
    
    function getCurrentWeatherIcon(icon) {

        const wIcon = document.createElement('li');
        wIcon.innerHTML = '<i></i>';
        currentSummary.appendChild(wIcon);
   
        weatherData.forEach(i => {
            if ( icon === i[0] ) {
                return wIcon.setAttribute('class', `c-icon wi wi-${i[1]}`);
            }
        })
    }

    function displayCurrentWeather(result) {

        const {
            apparentTemperature,
            pressure,
            humidity,
            summary,
            temperature,
            uvIndex,
            windSpeed,
            visibility
        } = result.weather;

        const headerData = [
            [conHeader,'H3', result.cityName, ' '], 
            [conHeader, 'p',summary, ' '], 
            [currentSummary, 'p', temperature + ' °C', 'w-temperature'], 
        ];

        const currentData = [
            [currentLeft,'FEELS LIKE', apparentTemperature, ' °'], 
            [currentLeft, 'HUMIDITY', humidity, ' %'], 
            [currentLeft, 'WIND', windSpeed, ' Km/h'], 
            [currentRight, 'UV INDEX', uvIndex, ' of 10'], 
            [currentRight, 'PRESSURE', pressure, ' hPa'],
            [currentRight, 'VISIBILITY', visibility, ' Km'],
        ];

        // div .contents-header && .current-summary
        headerData.forEach(i => {
        
            const d = document.createElement(i[1]);
            d.appendChild(document.createTextNode(i[2]));
            d.setAttribute('class', i[3]);
            i[0].appendChild(d);
        })

        // div .current-list
        currentData.forEach(i => {
       
            const d = document.createElement('li');
            d.innerHTML = `<span class="current-span">${i[1]}</span> <br>` + `${i[2]}` + `${i[3]}`;
            i[0].appendChild(d);
        })

        // weather list border line
        document.getElementById('current-list').style.borderTop = "1px solid #333";
        document.getElementById('current-list').style.borderBottom = "1px solid #333";
    }

    function getDates(unixTime) {
        
        // Convert Unix Time
        const timeStamp = unixTime
        const d = new Date(timeStamp * 1000)
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saterday', 'Sunday']

        const dayName = days[d.getDay()]

        // To get 'Mon', 'Tue'..
        //const dayName = d.toString().split(' ')[0];

        const date = document.createElement('li');
        date.appendChild(document.createTextNode(dayName));

        dailyList.appendChild(date);
    }

    function getDailyWeatherIcon(icon) {

        const dIcon = document.createElement('li');
        dIcon.innerHTML = '<i></i>';
        dailyList.appendChild(dIcon);

        weatherData.forEach(i => {
            if ( icon === i[0] ) {
                return dIcon.setAttribute('class', `d-icon wi wi-${i[1]}`);
            }
        })
    }

    function displayDailySummary(result) {

        const dailyWeather = result.daily
            .map(data => {
                return {
                    time: data.time,
                    icon: data.icon,
                    tempMax: data.apparentTemperatureMax,
                    tempMin: data.apparentTemperatureMin
                }
            })
            .forEach(data => {

                getDates(data.time);
                getDailyWeatherIcon(data.icon);

                // div .daily-list
                const tempData = [
                    [dailyList, 'li', data.tempMax, 'max-temp'], 
                    [dailyList,'li', data.tempMin, 'min-temp']  
                ];
        
                tempData.forEach(i => {
                
                    const d = document.createElement(i[1]);
                    d.appendChild(document.createTextNode(i[2]));
                    d.setAttribute('class', i[3]);
                    i[0].appendChild(d);
                })
            })
    }

    function getBackgroundImgByTemperature(result) {

        const {
            temperature
        } = result.weather;

        const backgroundImg = document.getElementById('section-weather');

        if (temperature > 20) {
            return backgroundImg.style.backgroundImage = "url('resources/img/clear-sky-min.jpeg')";
        }
        if (temperature > 0) {
            return backgroundImg.style.backgroundImage = "url('resources/img/cloud-min.jpeg')";
        }
        if (temperature <= 0) {
            return backgroundImg.style.backgroundImage = "url('resources/img/snow-min.jpeg')";
        }

    }

    function createCORSRequest(method, url) {
		let xhr = new XMLHttpRequest();
		if ('withCredentials' in xhr) {
			// XHR for Chrome/Firefox/Opera/Safari.
			xhr.open(method, url, true);
		} else if (typeof XDomainRequest != 'undefined') {
			// XDomainRequest for IE.
			xhr = new XDomainRequest();
			xhr.open(method, url);
		} else {
			// CORS not supported.
			xhr = null;
		}
		return xhr;
    }
    
    function xhrPostRequest(cityInfo) {
        
        return new Promise(function(resolve, reject) {
            const xhr = createCORSRequest('POST', cityInfo.url);

            if (!xhr) {
				alert('CORS not supported');
				return;
			}
            
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(Error(xhr.statusText));
                }
            };
            xhr.onerror = function () {
                reject(Error('Network Error'));
				alert('Woops, there was an error making the request.');
            };
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(cityInfo.data);
        })
    }

    function getUserPosition() {
   
        return new Promise(function (resolve, reject) {
            const options = {
                maximumAge: 0
              };

            navigator.geolocation.getCurrentPosition(resolve, reject, options);
            
            function reject (err) {
                alert("Oops! There is a problem with Geolocation API connection. Please use the website search engine.");
                console.warn(`ERROR(${err.code}): ${err.message}`);
            } 
        });
        
    }

    function displayWeather(result) {
        
        const classes = [cityInput, conHeader, currentSummary, currentRight, currentLeft, dailyList];
        const data = JSON.parse(result);
        
        // clear the input box && the weather contents for new search
        classes.forEach(i => i.innerHTML = '');
    
        const promises = [
            getCurrentWeatherIcon(data.weather.icon),
            displayCurrentWeather(data),
            displayDailySummary(data),
            getBackgroundImgByTemperature(data)
        ]
        Promise.all(promises)
    }
    
    function geolocationService() {
        
        getUserPosition()
            .then(result => { 
                const data = JSON.stringify({
                    "lat": result.coords.latitude,
                    "lng": result.coords.longitude
                })
                return {
                    data: data,
                    url: `${BACKEND_HOST}/geolocation`
                };
            })
            .then(xhrPostRequest)
            .then(displayWeather)
            .catch(error => console.log("Something went wrong!"))
    }
 
    function askPermissionForGeolocationService() {
        const permission = confirm("Allow this website to know your location ?");
        if ( permission ) geolocationService();
    }

    window.onload = askPermissionForGeolocationService;
    
    cityForm.addEventListener('submit', function (e) {
        
        e.preventDefault();

        const city = cityInput.value;
        const data = JSON.stringify({"city" : city});
        const obj = {
            data: data,
            url: `${BACKEND_HOST}/search`
        } 

        if (!city) {
            alert("Please enter a city name")
        } else {   
            xhrPostRequest(obj)
                .then(displayWeather)
                .catch(error => console.log("Something went wrong!"))
        }

        cityInput.value = "";
    });

})();
