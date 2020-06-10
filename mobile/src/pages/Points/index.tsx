import React, {useState, useEffect} from "react";
import { View , StyleSheet, TouchableOpacity, Text, ScrollView, Image, Alert} from "react-native";
import {Feather as Icon} from '@expo/vector-icons'
import Constants from 'expo-constants'
import {useNavigation, useRoute} from '@react-navigation/native'
import MapView, {Marker} from 'react-native-maps'
import {SvgUri} from 'react-native-svg'
import api from '../../services/api'
import * as Location from 'expo-location'

// Interfaces
interface Item {
  id: number,
  title : string,
  image_url: string
}

interface Points{
  id: number,
  name: string,
  image: string,
  latitude: number,
  longitude: number,
  image_url: string
}

interface Params{
  selectedUf: string,
  selectedCity: string
}

const Points = () => { 
    
    const navigation = useNavigation();
    const route = useRoute();
    const [itens,setItens] = useState<Item[]>([])
    const [selectedItens, setSelectedItens] = useState<number[]>([])
    const [initialPosition, setInitialPositiom] = useState<[number, number]>([0,0])
    const [points, setPoints] = useState<Points[]>([])
    const routeParams = route.params as Params

    useEffect(()=>{
      async function loadPositon() {
        const {status} = await Location.requestPermissionsAsync();

        if(status !== 'granted'){
          Alert.alert('Oppss...', 'Necessario sua permisão para obter localização')
          return;
        }

        const location = await Location.getCurrentPositionAsync();
        const {latitude, longitude} = location.coords;

        setInitialPositiom([
          latitude,
          longitude
        ])
      }
      loadPositon();
    }, [])

    useEffect(()=>{
      api.get('itens').then(
        res => {
          setItens(res.data);
        }
      );
    }, [])

    useEffect(()=>{
      api.get('points', {
        params : {
          city: routeParams.selectedCity,
          uf: routeParams.selectedUf,
          itens: selectedItens
        }
      }).then(
        res => {
          setPoints(res.data)
        }
      )
    }, [selectedItens])

    function handleNavigateBack(){
        navigation.goBack();
    }
    
    function handleNavigateToDetail(id: number){
      navigation.navigate('Detail', {point_id: id});
    }

    function handleSelectItem(id: number){
        
      const alreadySelected = selectedItens.findIndex(
          item => item === id
      )
      
      if(alreadySelected >= 0){
          const filteredItens = selectedItens.filter(
              item => item !== id
          )
        
          setSelectedItens(filteredItens);
      }else{
          setSelectedItens([...selectedItens, id]);
      }
  }
    

    return (
      <>
        <View style={styles.container}>
            <TouchableOpacity onPress={handleNavigateBack}>
                <Icon name="arrow-left" size={20} color="#34cb79"></Icon>
            </TouchableOpacity>

            <Text style={styles.title}> Bem vindo.</Text>
            <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

            <View style={styles.mapContainer}>
              {
                initialPosition[0] !== 0 && (
                  <MapView style={styles.map} initialRegion = {{
                    latitude: initialPosition[0],
                    longitude: initialPosition[1],
                    latitudeDelta: 0.014,
                    longitudeDelta:0.014
                  }}
                  >
                    {
                      points.map(
                        point => (
                          <Marker coordinate = {{
                            latitude: point.latitude,
                            longitude: point.longitude
                          }}
                            key = {String(point.id)}
                            style= {styles.mapMarker}
                            onPress = {()=>{handleNavigateToDetail(point.id)}}
                          > 
                          <View style={styles.mapContainer}>
                            <Image style={styles.mapMarkerImage}   source={{uri: point.image_url}} />
                            <Text style={styles.mapMarkerTitle} > {point.name}</Text>
                          </View>             
                          </Marker>
                        )
                      )
                    }
                  </MapView>
                )
              }
            </View>
        </View>

        <View style={styles.itemsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle = {{paddingHorizontal: 20}}
            >
            {
              itens.map(
                item => (
                  <TouchableOpacity 
                    key = {String(item.id)} 
                    style={[
                      styles.item,
                      selectedItens.includes(item.id) ? styles.selectedItem : {}
                    ]} 
                    onPress={()=>{handleSelectItem(item.id)}}>
                    <SvgUri width={42} height={42} uri = {item.image_url}></SvgUri>
                    <Text style={styles.itemTitle} >{item.title}</Text>
                  </TouchableOpacity>
                )
              )
            }
            </ScrollView>
        </View>
      </>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: "Ubuntu_700Bold",
    marginTop: 24,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 4,
    fontFamily: "Roboto_400Regular",
  },

  mapContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 16,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 100,
    height: 90,
    backgroundColor: "#34CB79",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
  },

  mapMarkerImage: {
    width: 90,
    height: 32,
    resizeMode: "cover",
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: "Roboto_400Regular",
    color: "#FFF",
    fontSize: 13,
    lineHeight: 15,
    backgroundColor: 'green',
    textAlign: 'center',
  },

  itemsContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#eee",
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "space-between",

    textAlign: "center",
  },

  selectedItem: {
    borderColor: "#34CB79",
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: "Roboto_400Regular",
    textAlign: "center",
    fontSize: 13,
  },
});
export default Points;
