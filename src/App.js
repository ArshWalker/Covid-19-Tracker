import React, { useState, useEffect } from "react";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import Footer from "./Footer";
import "./App.css";

// https://disease.sh/v3/covid-19/countries
function App() {
  const [countries, setCountries] = useState([]); // drop down all countries
  const [country, setCountry] = useState("worldwide"); //which country we selected def worldwide
  const [countryInfo, setCountryInfo] = useState({}); // single country selected to fetch data from url
  const [tableData, setTableData] = useState([]); // for the table
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 }); // just the center of pacific ocean
  const [mapZoom, setMapZoom] = useState(3); // just 3 scroll back zoom
  const [mapCountries, setMapCountries] = useState([]); // for the circle & popups
  const [casesType, setCasesType] = useState("cases"); // for changing the map when rec death are toggle

  // this useEffect is for fetching the data for all countries(worldwide)
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  // this useEffect is for dropdown menu
  useEffect(() => {
    // the code will run once per
    // component load 1 time not again
    const getCountriesData = async () => {
      // async --> send a request, wait for it, do something.
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);

          setMapCountries(data); // for circle charts
          setCountries(countries);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    // console.log("check", countryCode);

    // https://disease.sh/v3/covid-19/all
    // https://disease.sh/v3/covid-19/countries/{COUNTRY_CODE}

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    //note the `` commas
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // replacing worldwide with selecetd country
        setCountry(countryCode);

        //all of the data.... from the country response
        setCountryInfo(data);

        // showing the particular country on change
        // store this in array
        countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);

        // setMapCenter([data.countryInfo.lat, data.countryInfo.long]);

        //zoom a little bit more in the
        setMapZoom(3);
      });
  };

  // console.log("country Info", countryInfo);
  return (
    <div>
      <div className="app">
        {/* Header*/}
        <div className="app__left">
          <div className="app__header">
            {/* Title + select input dropdown field*/}

            <h1>COVID-19 TRACKER</h1>
            <FormControl className="app__dropdown">
              <Select
                variant="outlined"
                onChange={onCountryChange}
                value={country}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem>

                {countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))}
                {/* <MenuItem value="worldwide">Worldwide</MenuItem>
            <MenuItem value="worldwide">Option 2</MenuItem>
            <MenuItem value="worldwide">Option 3</MenuItem>
            <MenuItem value="worldwide">Option 4</MenuItem> */}
              </Select>
            </FormControl>
          </div>

          {/* InfoBoxs*/}
          {/* InfoBoxs*/}
          {/* InfoBoxs*/}

          <div className="app__stats">
            {/* InfoBoxs title= corona virus cases*/}
            <InfoBox
              isRed
              active={casesType === "cases"}
              onClick={(e) => setCasesType("cases")}
              title="🦠 Coronavirus Cases 🦠"
              cases={prettyPrintStat(countryInfo.todayCases)}
              total={prettyPrintStat(countryInfo.cases)}
            ></InfoBox>
            {/* InfoBoxs title= corona virus recovered*/}
            <InfoBox
              active={casesType === "recovered"}
              onClick={(e) => setCasesType("recovered")}
              title="🏥 Recovered 🏥 "
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              total={prettyPrintStat(countryInfo.recovered)}
            ></InfoBox>
            {/* InfoBoxs title = deaths*/}
            <InfoBox
              isGrey
              active={casesType === "deaths"}
              onClick={(e) => setCasesType("deaths")}
              title="💀 Deaths 💀 "
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              total={prettyPrintStat(countryInfo.deaths)}
            ></InfoBox>
          </div>

          {/* map*/}
          <Map
            casesType={casesType}
            countries={mapCountries}
            center={mapCenter}
            zoom={mapZoom}
          />
        </div>
        <Card className="app__right" style={{ backgroundColor: "#f8e9a1" }}>
          <CardContent>
            <h3>Live Cases by Country</h3>
            {/* table*/}
            <Table countries={tableData}></Table>
            <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType}></LineGraph>
            {/* graph*/}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

export default App;
