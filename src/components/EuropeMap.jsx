import { useState, useEffect } from "react";
import SvgComponent from "../components/SvgComponent"; // Importér din SVG som et React-komponent

export function EuropeMap() {
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState(null); // State til at holde data for vejret
  const [userLocation, setUserLocation] = useState(null); // State til at holde brugerens placering
  const apiKey = import.meta.env.VITE_SOME_KEY; // API nøgle for vejr api. |

  // Hent brugerens position ved hjælp af geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  const handleMapClick = async (event) => {
    const target = event.target;
    if (target.tagName.toLowerCase() === "path" && target.id) { // Tjekker at det er en path element og at det har et id.
      const countryId = target.id;

      if (selectedCountryId) {
        const prevSelected = document.getElementById(selectedCountryId);
        if (prevSelected) {
          prevSelected.style.fill = "silver"; // Sætter faven tilbage til den original farve
        }
      }

      target.style.fill = "red";
      setSelectedCountryId(countryId);

      try {
        setLoading(true);
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha/${countryId}`
        );
        if (!response.ok) {
          throw new Error("Fejl fra API");
        }
        const data = await response.json();
        setCountryInfo(data[0]);
       
        // Når vi nu ved hovedstaden, hent vejret:
       // const apiKey = import.meta.env.VITE_WEATHER_API_KEY; 
        console.log(apiKey)
        if (data[0].capital?.[0]) {
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${data[0].capital[0]}&APPID=${apiKey}&units=metric`
          );
          if (!weatherResponse.ok) {
            throw new Error("Fejl fra vejr-API");
          }
          const weatherData = await weatherResponse.json();
          setWeatherInfo(weatherData);
        }
        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Færdig med at load data fra API, vi kan nu vise data.
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <SvgComponent
        onClick={handleMapClick}
        style={{
          cursor: "pointer",
          backgroundColor: "#eef2f5",
          width: "100%",
          height: "100%",
        }}
      />

      {loading && <p>Indlæser data fra API</p>}

      {countryInfo && (
        <div style={{ marginTop: "20px" }}>
          <h2>{countryInfo.name.common}</h2>
          <p>
            <strong>Befolkning:</strong>{" "}
            {countryInfo.population.toLocaleString()}
          </p>
          <p>
            <strong>Hovedstad:</strong> {countryInfo.capital?.[0]}
          </p>
          
          <img
            src={countryInfo.flags.svg}
            alt={`Flag ${countryInfo.name.common}`}
            width={100}
          />
        </div>
      )}

      {weatherInfo && (
        <div style={{ marginTop: "20px" }}>
          <h3>Vejret i {weatherInfo.name}</h3>
          <p>
            <strong>Temperatur:</strong> {weatherInfo.main.temp}°C
          </p>
          <p>
            <strong>Beskrivelse:</strong> {weatherInfo.weather[0].description}
          </p>
          <img
            src={`https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`}
            alt={weatherInfo.weather[0].description}
          />
        </div>
      )}

      {userLocation && (
        <div style={{ marginTop: "20px" }}>
          <h3>Din nuværende placering</h3>
          <p>
            <strong>Breddegrad:</strong> {userLocation.latitude}
          </p>
          <p>
            <strong>Længdegrad:</strong> {userLocation.longitude}
          </p>
        </div>
      )}
    </div>
  );
}
