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
	file = File.open('./files/stations.json')
	return file
end
