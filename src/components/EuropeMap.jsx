import { useState } from "react";
import SvgComponent from "../components/SvgComponent"; // Importér din SVG som et React-komponent

export function EuropeMap() {
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState(null); 

  const handleMapClick = async (event) => {
    const target = event.target;
  
    if (target.tagName.toLowerCase() === "path" && target.id) {
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
            <strong>Befolkning:</strong> {countryInfo.population.toLocaleString()}
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
    </div>
  );
}
