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

## References

On Chrome, follow the below steps to confirm that NJ Fuel Up has location access: https://support.google.com/chrome/answer/142065

If the permission level is not "Allow", simply delete the entry and refresh the page. Select "Allow" when prompted.

## Credits

This Sinatra app was built using the following Sinatra boilerplate: https://github.com/karlcoelho/sinatra-boilerplate