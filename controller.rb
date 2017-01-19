require 'json'

# => /
#
# => Return web app UI.
get '/' do
	erb :index
end

get '/api/bridges' do
	content_type :json
	file = File.open('./files/bridges.json')
	return file
end

get '/api/stations' do

	content_type :json
	file = File.open('./files/stations.json', 'rb').read

	if !params.key?('lat') or !params.key?('lng') then
		return file
	else
		data = JSON.parse(file)

		data.select{ |station| station["Latitude"] != nil and station["Longitude"] != nil }.map do |station|
			station["distance"] = distance [station["Latitude"], station["Longitude"]], [params['lat'].to_f, params['lng'].to_f]
		end

		data = data.sort_by { |station| station["distance"] }

		return data.to_json
	end

end

# => distance
#
# => https://gist.github.com/zulhfreelancer/15071f8678bcb38442648eda8dfcf387
def distance loc1, loc2
	rad_per_deg = Math::PI/180  # PI / 180
	rkm = 6371                  # Earth radius in kilometers
	rm = rkm * 1000             # Radius in meters

	dlat_rad = (loc2[0]-loc1[0]) * rad_per_deg  # Delta, converted to rad
	dlon_rad = (loc2[1]-loc1[1]) * rad_per_deg

	lat1_rad, lon1_rad = loc1.map {|i| i * rad_per_deg }
	lat2_rad, lon2_rad = loc2.map {|i| i * rad_per_deg }

	a = Math.sin(dlat_rad/2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad/2)**2
	c = 2 * Math::atan2(Math::sqrt(a), Math::sqrt(1-a))

	rm * c * 0.0006213712 # Distance in miles
end