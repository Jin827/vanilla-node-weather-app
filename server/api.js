const OpenWeatherMapHelper = require("openweathermap-node");
const helper = new OpenWeatherMapHelper(
    {
        APPID:  process.env.WEATHER_MAP_API_KEY,
        units: "metric"
    }
);


const googleMapsClient = require('@google/maps').createClient({
  key:  process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});


const DarkSky = require('dark-sky');
const darksky = new DarkSky( process.env.DARKSKY_API_KEY);


module.exports = {
    
    getUserlocation: (position) => {
        const lat = position.lat;
        const lng = position.lng;
        
        return new Promise(function(resolve, reject) {
        
            return helper.getCurrentWeatherByGeoCoordinates(lat, lng, (err, currentWeather) => {
                if(err){
                    reject(Error("Error"));
                }
                else{
                    resolve({
                        "cityName": currentWeather.name,
                        "cityLatitude": lat,
                        "cityLongitude": lng
                    });
                }
            })
        })
        .catch(err => console.log(err))
    },
    
    getCoordinatesForCity: (cityName) => {
        
        return googleMapsClient.geocode({address: cityName }).asPromise()
            .then(response => response.json )
            .then(data => {
                const {
                    geometry,
                    address_components
                } = data.results[0]

                return {
                    cityName: address_components[0].long_name,
                    cityLatitude: geometry.location.lat,
                    cityLongitude: geometry.location.lng
                };
            })
            .catch(err => console.log(err))
        
    },
    
    getWeatherData: (cityInfo) => {
        
        const {
            cityName,
            cityLatitude,
            cityLongitude
        } = cityInfo
        
        return darksky
            .options({
                latitude: cityLatitude,
                longitude: cityLongitude,
                units: 'ca',
                language: 'en',
                exclude: ['minutely', 'hourly', 'alerts', 'flags']
            })
            .get()
            .then(data => {
                return {
                    cityName: cityName,
                    weather: data.currently,
                    daily: data.daily.data
                };
            })
            .catch(err => console.log(err))
    }
    
    
} 


