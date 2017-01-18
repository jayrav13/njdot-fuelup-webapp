require 'json'

# => /
#
# => Return web app UI.
get '/' do
	content_type :json
	{ :key1 => 'value1', :key2 => 'value2' }.to_json
end

get '/api/bridges' do
	content_type :json
	file = File.open('./files/bridges.json')
	return file
end

get '/api/stations' do
	content_type :json
	file = File.open('./files/stations.json')
	return file
end
