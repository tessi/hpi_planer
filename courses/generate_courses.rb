require 'rubygems'
require 'bundler/setup'
require 'nokogiri'
require 'open-uri'
require 'uri'
require 'erb'
require 'parallel'

$all_modules = %w(ITSE SAMT OSIS IST HCT BPET SSK-DT SSK-KO SSK-MA SSK-RE SSK-SK)

def get_uri_as_html(rel_uri)
  uri = URI.join("http://www.hpi.uni-potsdam.de/", rel_uri).to_s
  page = open(uri).read.chars.select{|i| i.valid_encoding?}.join
  Nokogiri::HTML(page)
end

def parse_single_course(c)
  # name
  name = c.content
  print "\tParsing '#{name}'...\n"

  html = get_uri_as_html(c['href'])

  # points
  td = html.css('td.tx-jshuniversity-pi1-singleView-HCell').find{|td| td.content.include?("ECTS Credit Points:")}
  ects_td = td.parent.css('td:last').first
  points_str = /[036]/.match(ects_td.content)
  points = points_str ? points_str[-1] : 0

  # type
  td = html.css('td:first').find{|td| td.content.include?("Lehrform:")}
  type_td = td.parent.css('td:last').first
  arr = []
  arr << ['V'] if type_td.content =~ /Vorlesung/
  arr << ['P'] if type_td.content =~ /Projekt/
  arr << ['S'] if type_td.content =~ /[sS]eminar/
  arr << ['Block'] if type_td.content =~ /Block/
  type = arr.join('/')

  # modules
  td = html.css('td:first').find{|td| td.content.include?("Kennung:")}
  modules_td = td.parent.css('td:last').first
  modules = $all_modules.select{|m| modules_td.content.include?(m)}

  {name: name, points: points, type: type, modules: modules}
end

def parse_courses(term, uri)
  print "Parsing #{term}...\n"
  ws2012 = get_uri_as_html(uri)
  master = ws2012.css('div.tx-jshuniversity-pi1-listrow')[1]
  courses = master.css('tr td:first a')
  Parallel.map courses do |c|
    course = parse_single_course(c)
    course[:term] = term
    course
  end
end

ws1213 = parse_courses('WS 12/13', '/studium/lehrangebot/itse.html')
ss12 = parse_courses('SS 12', '/studium/lehrangebot/lehrangebotsarchiv/lehrangebotsarchiv_ss_2012.html')
ws1112 = parse_courses('WS 11/12', '/studium/lehrangebot/lehrangebotsarchiv/lehrangebotsarchiv_ws_1112.html')
ss11 = parse_courses('SS 11', '/studium/lehrangebot/lehrangebotsarchiv/lehrangebotsarchiv_ss_2011.html')
ws1011 = parse_courses('WS 10/11', '/studium/lehrangebot/lehrangebotsarchiv/lehrangebotsarchiv_ws_1011.html')
courses = [ws1213, ss12, ws1112, ss11, ws1011].flatten

# generate js file
template = ERB.new <<-EOF
  window.courses = [
    <% courses.each do |course| %>
      {
        masterprojectgrade: null,
        masterthesisgrade: null,
        rows:[[
          "<%= course[:name] %><% if course[:type].length > 0 %> (<%= course[:type] %>)<% end %>",
          "<%= course[:term] %>",
          "<%= course[:points] %>",
          <% $all_modules.each do |m| %>
            {active: <%= course[:modules].include?(m) ? "true" : "false" %>, selected: false},
          <% end %>
          "2.7"
        ]]
      },
    <% end %>
  ];
EOF
File.write("../js/courses.js", template.result(binding))
