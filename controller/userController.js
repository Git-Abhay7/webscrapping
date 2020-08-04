const cheerio = require("cheerio");
const axios = require("axios");
const colors = require("colors");
const fs = require("fs");
var GeoPoint = require("geopoint");
const airport = require("../airports.json")
const utils = require("../commonFunction/utils");
module.exports = {
  flipkartFetch: (req, res) => {
    axios
      .get(
        "https://www.flipkart.com/search?q=mobiles&sid=tyy%2C4io&as=on&as-show=on&otracker=AS_QueryStore_OrganicAutoSuggest_1_7_na_na_na&otracker1=AS_QueryStore_OrganicAutoSuggest_1_7_na_na_na&as-pos=1&as-type=HISTORY&suggestionId=mobiles%7CMobiles&requestId=c101808f-c71a-4609-b769-69471c4e9b5a"
      )
      .then((fetched) => {
        const $ = cheerio.load(fetched.data);
        var arr = [];
        let name = $('div[class="col col-7-12"]> div[class="_3wU53n"]').text();
        let rating = $('div[class="hGSR34"]').text();
        let img = $(
          "#container > div > div.t-0M7P._2doH3V > div._3e7xtJ > div._1HmYoV.hCUpcT > div:nth-child(2) > div:nth-child(2) > div > div > div > a > div._3SQWE6 > div._1OCn9C > div > div > img"
        ).attr("src");

        let price = $('div[class="_1uv9Cb"]>[class="_1vC4OE _2rQ-NK"]')
          .text()
          .trim()
          .split("₹");
        let discount = $('div[class="VGWI6T"]> span').text().split(" ");
        arr.push({
          name,
          rating,
          img,
          price,
          discount,
        });
        res.send({
          data: arr,
        });
      });
  },
  Urls: (req, res) => {
    axios
      .get(
        "https://www.flipkart.com/search?q=mobiles&sid=tyy%2C4io&as=on&as-show=on&otracker=AS_QueryStore_OrganicAutoSuggest_1_7_na_na_na&otracker1=AS_QueryStore_OrganicAutoSuggest_1_7_na_na_na&as-pos=1&as-type=HISTORY&suggestionId=mobiles%7CMobiles&requestId=c101808f-c71a-4609-b769-69471c4e9b5a"
      )
      .then((result) => {
        const $ = cheerio.load(result.data);
        const data = [];
        const name = $(
          'div[class="col col-7-12"]> div[class="_3wU53n"]'
        ).text();
        data.push(name);
        data.forEach((element) => {
          res.send(element.split(")"));
        });
      });
  },
  airportFetch: (req, res) => {
    axios.get("https://airport-authority.com/browse-IN").then((fetched) => {
      const $ = cheerio.load(fetched.data);
      var arr = [];
      let airportName = $('[class="center"]>a').text().split("Airport");
      let city = $("#search-results > tbody > tr > td:nth-child(1)")
        .text()
        .split(/(?=[A-Z][a-z])/);
      arr.push({
        airportName,
        city,
      });
      res.send({
        data: arr,
      });
    });
  },
  Distance: async (req, res) => {
    try {
      function toRadians(sec) {
        return ((sec * Math.PI) / 180 * 60 * 60)
      }
      var R = 6371e3;
      var lat1 = req.body.lat1;
      console.log(lat1)
      var lat2 = req.body.lat2;
      var lon1 = req.body.lon1;
      var lon2 = req.body.lon2;

      var φ1 = toRadians(lat1);
      var φ2 = toRadians(lat2);
      var Δφ = toRadians(Math.abs(lat2 - lat1));
      var Δλ = toRadians(Math.abs(lon2 - lon1));

      var a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      var c = await 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = await R * c;
      const D = await Math.round(d / 1000)
      res.status(utils.Success_Code.Success).send({
        distance: D,
      });
    } catch (error) {
      throw error;
    }
  },
  nearestAirport: (req, res) => {
    ////////////////////////////////////////////////////***function***//////////////////////////////////////
    function findDistance(LAT1, LAT2, LON1, LON2) {
      function toRadians(sec) {
        return ((sec * Math.PI) / 180 * 60 * 60)
      }
      var R = 6371e3;
      var lat1 = LAT1;
      var lat2 = LAT2;
      var lon1 = LON1;
      var lon2 = LON2;
      var φ1 = toRadians(lat1);
      var φ2 = toRadians(lat2);
      var Δφ = toRadians(Math.abs(lat2 - lat1));
      var Δλ = toRadians(Math.abs(lon2 - lon1));
      var a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      const D = Math.round(d)
      return D;
    }
    ///////////////////////////////////////////function to find Distance between Lat and Lon///////////////////////////////
    var arr = []
    for (i = 0; i < airport.length; i++) {
      for (j = 0; j < airport.length; j++) {
        const dis = findDistance(airport[i].Lat, airport[j].Lat, airport[i].Lon, airport[j].Lon)
        if (dis <= 100000 && dis != 0) {
          arr.push(airport[j])
        } else {
          j++;
        }
      }
      i++;
    }
    const sorted = arr.sort(function (a, b) {
      return a - b
    })
    if (arr != null) {
      res.status(utils.Success_Code.Success).send([sorted[0], sorted[1], sorted[2]])
    } else {
      res.status(utils.Error_Code.NotFound).send(utils.Error_Message.NoData)
    }
  }
}