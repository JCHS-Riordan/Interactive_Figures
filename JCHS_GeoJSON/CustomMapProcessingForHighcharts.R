##CREATING GEOJSON FILES FOR USE IN HIGHCHARTS##
#WRITTEN BY WAO 11/17/23

library(tigris)
library(geojsonsf)
library(sf)

##State map-----
us_states <- states(cb = TRUE, resolution = "20m") %>%
  shift_geometry() %>% 
  filter(NAME!="Puerto Rico")

us_states_simp <- st_simplify(us_states, preserveTopology = FALSE, dTolerance = 8000)

st_write(us_states_simp, "us_states.geojson") 

#change header in notepad at beginning of file: Highcharts.maps["countries/us/state20"] = 


##CBSA map------
us_cbsas <- core_based_statistical_areas(cb = TRUE, resolution = "20m", year=2021) %>%
  shift_geometry() %>% 
  mutate(territory = if_else(grepl(", PR|, VI", NAME), 1, 0)) %>% 
  filter(territory==0)

us_cbsas_simp <- st_simplify(us_cbsas, preserveTopology = FALSE, dTolerance = 8000)

st_write(us_cbsas_simp, "us_cbsas.geojson") 

#change header in notepad at beginning of file: Highcharts.maps["countries/us/cbsas21"] = 



##County map------
us_counties <- counties(cb = TRUE, resolution = "20m", year=2021) %>%
  shift_geometry() %>% 
  mutate(territory = if_else(grepl(", PR|, VI", NAME), 1, 0)) %>% 
  filter(territory==0)

us_counties_simp <- st_simplify(us_counties, preserveTopology = FALSE, dTolerance = 8000)

st_write(us_counties_simp, "us_counties.geojson") 

#change header in notepad at beginning of file: Highcharts.maps["countries/us/counties21"] = 