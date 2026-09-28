require 'json'

# => /
#
# => Return web app UI.
get '/' do
	erb :index
end

get '/api/bridges' do
	content_type :json

	if !params.key?('q') then
		return settings.bridges_json
	else
		query = params['q'].strip

		data = settings.bridges.select { |bridge|
			bridge["STR NO"].include? query
		}

		return data.to_json
	end

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

# => Bridge coordinates
#
# => files/bridges.json stores coordinates as packed degrees-minutes-seconds
# => (DD.MMSSss, per the "ddmmss.ss" column names), e.g. 40.453661 is
# => 40°45'36.61". A few records are already decimal degrees: any with
# => minutes >= 60, plus these three, whose digits look like DMS with
# => overflowing seconds but which only land in the right place as decimal.
DECIMAL_BRIDGES = ['1227158', '1237159', '122B516']
NJ_LATITUDES = 38.9..41.4
NJ_LONGITUDES = -75.6..-73.85

# => Split a packed DD.MMSSss value into [degrees, minutes, seconds].
def dms_parts value
	degrees, fraction = format('%.6f', value.abs).split('.')
	[degrees.to_i, fraction[0, 2].to_i, fraction[2, 4].to_i / 100.0]
end

def dms_to_decimal value
	degrees, minutes, seconds = dms_parts value
	sign = value < 0 ? -1 : 1
	sign * (degrees + minutes / 60.0 + seconds / 3600.0)
end

# => Decimal [latitude, longitude] for a bridge, or [nil, nil] when the
# => source values don't decode to a point in New Jersey.
def bridge_coordinates bridge
	lat, lng = bridge["Latitude ddmmss.ss"], bridge["Longitude ddmmss.ss"]
	return [nil, nil] if lat.nil? or lng.nil?

	decimal = DECIMAL_BRIDGES.include?(bridge["STR NO"]) || [lat, lng].any? { |value| dms_parts(value)[1] >= 60 }
	lat, lng = dms_to_decimal(lat), dms_to_decimal(lng) unless decimal

	return [nil, nil] unless NJ_LATITUDES.cover?(lat) and NJ_LONGITUDES.cover?(lng)
	[lat.round(6), lng.round(6)]
end

# => Load bridges once at boot, adding decimal "Latitude" / "Longitude".
bridges = JSON.parse(File.read('./files/bridges.json')).each do |bridge|
	bridge["Latitude"], bridge["Longitude"] = bridge_coordinates bridge
end
set :bridges, bridges
set :bridges_json, bridges.to_json
