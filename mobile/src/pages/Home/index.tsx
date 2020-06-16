import React,{useEffect, useState, ChangeEvent} from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, ImageBackground,Text,Image, StyleSheet} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';


interface IBGEUFResponse {
  sigla:string;
  nome:string;
}

interface IBGECidadeResponse {
  nome:string;
}


const Home = () => {
  const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
  const [cidades, setCidades] = useState<IBGECidadeResponse[]>();
  const [uf, setSelectedUf] = useState('0');
  const [city,setSelectedCity] = useState("0");

  const naviagtion = useNavigation();

  function handleNavigateToPoints() {
      naviagtion.navigate('Points',{
        uf,
        city
      });
  }

  useEffect(() => {
      axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(response => {
          setUfs(response.data);
      });
  },[])

  useEffect(() =>{
      if(uf == '0'){
          return;
      }
      axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(response => {
          setCidades(response.data);
      });
  },[uf])

    function handleSelectUf(event:ChangeEvent<HTMLSelectElement>){
        const uf = String(event);
        setSelectedUf(uf);
    }

    function handleSelectCity(event:ChangeEvent<HTMLSelectElement>){
        const city = String(event);
        setSelectedCity(city);
    }


    return ( 
        <ImageBackground 
        source={require('../../assets/home-background.png')} 
        style={styles.container}
        imageStyle={{width:274,height:368}}
        >
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')}/>  
                <Text style={styles.title}>Seu marcketplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coletas de form eficiente.</Text>
            </View>

            <View style={styles.footer}>
                <RNPickerSelect 
                    placeholder={{
                      label:'Selecione um estado',
                      value:null
                    }}
                    onValueChange={handleSelectUf}
                    items={ufs.map(uf => (
                        {key:`${uf.sigla}`, label:`${uf.nome} (${uf.sigla})`,value:uf.sigla}
                    ))}
                />

                <RNPickerSelect 
                    placeholder={{
                      label:'Selecione uma cidade',
                      value:null
                    }}
                    onValueChange={handleSelectCity}
                    items={cidades?cidades.map(cidade => (
                        {key:`${cidade.nome}`, label:`${cidade.nome}`,value:cidade.nome}
                    )):[]}
                />

    
                <RectButton style={styles.button} onPress={handleNavigateToPoints}>
                    <View style={styles.buttonIcon}>
                        <Icon name="arrow-right" color="#FFF"/>
                    </View>
                    <Text style={styles.buttonText}>Entrar</Text>
                </RectButton>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });
export default Home;