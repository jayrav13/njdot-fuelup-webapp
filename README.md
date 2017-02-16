# NJ Fuel Up Web App

NJ Fuel Up is a mobile-first web application that helps NJ state employees navigate to key operational landmarks such as gas stations and bridges throughout the state, build specifically to serve the NJ Department of Transportation.

To get started with building this application, simply do the following:

```bash
git@github.com:jayrav13/njdot-fuelup-webapp.git
cd njdot-fuelup-webapp/
bundle install
foreman run web # or heroku local
```

If you do not have `foreman` or `heroku` installed, you may also do:

```bash
bundle exec rackup -p 5000
```

## Sample Requests

Bridges:

```bash
# All

$ cURL \
  -i \
  -X GET \
  https://njfuelup.herokuapp.com/api/bridges

[
  {
    "Owner": "State Routes",
    "Route": 1,
    "STR NO": "902153",
    "Structure Name": "SECAUCUS RD OVER US 1&9 (TONNELLE AVE)",
    "MP xxxx.xxx": 0.480,
    "Latitude ddmmss.ss": 40.453661,
    "Longitude ddmmss.ss": -74.030396,
    "County": "HUDSON",
    "Municipality": "North Bergen township"
  },
  ...
]

# Query

$ cURL \
  -i \
  -X GET \
  https://njfuelup.herokuapp.com/api/bridges?q=1400900

[
  {
    "Owner": "County",
    "Route": 9014,
    "STR NO": "1400900",
    "Structure Name": "CR 513 (GREEN POND RD) / HIBERNIA BRK",
    "MP xxxx.xxx": 48.25,
    "Latitude ddmmss.ss": 40.56415,
    "Longitude ddmmss.ss": -74.29367,
    "County": "MORRIS",
    "Municipality": "Rockaway township"
  }
]
```

Stations

```bash
# All

$ cURL \
  -i \
  -X GET \
  https://njfuelup.herokuapp.com/api/stations

[
  {
    "Name": "Buena DOT",
    "Latitude": 39.51554447,
    "Longitude": -74.92849165,
    "Address": "Rt. 40 near Catherine Avenue",
    "City": "Buena",
    "State": "NJ",
    "County": "Atlantic",
    "Hours": "7:45 AM - 3:45 PM",
    "Phone Number": "609-697-1136",
    "Type of Gas": "Unleaded / Diesel"
  },
  ...
]

# Order By Distance

$ cURL \
  -i \
  -X GET \
  https://njfuelup.herokuapp.com/api/stations?lat=40&lng=-74

[
  {
    "Name": "Wall Twp. DOT",
    "Latitude": 40.12265214,
    "Longitude": -74.07707522,
    "Address": "2436 Paynters Road",
    "City": "Wall Township",
    "State": "NJ",
    "County": "Monmouth",
    "Hours": "24 Hours",
    "Phone Number": "732-528-7339",
    "Type of Gas": "Unleaded / Diesel",
    "distance": 9.403639883127456
  },
  ...
]
```

## References

On Chrome, follow the below steps to confirm that NJ Fuel Up has location access: https://support.google.com/chrome/answer/142065

If the permission level is not "Allow", simply delete the entry and refresh the page. Select "Allow" when prompted.

## Credits

This Sinatra app was built using the following Sinatra boilerplate: https://github.com/karlcoelho/sinatra-boilerplate