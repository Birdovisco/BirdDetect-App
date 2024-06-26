import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";

const names = ['Skowronek', 'Krzyżówka', 'Gęś białoczelna', 'Gęś zbożowa',
  'Jerzyk', 'Mewa śmieszka', 'Gołąb miejski', 'Grzywacz', 'Gawron', 
  'Kawka', 'Kukułka', 'Modraszka', 'Oknówka', 'Łyska', 'Sójka',
  'Słowik szary', 'Słowik rdzawy', 'Sroka', 'Brzegówka', 'Kowalik'];

const namesLatin = ['Alauda arvensis', 'Anas platyrhynchos', 'Anser albifrons',
  'Anser fabalis', 'Apus apus', 'Chroicocephalus ridibundus',
  'Columba livia forma urbana', 'Columba palumbus', 'Corvus frugilegus', 
  'Corvus monedula', 'Cuculus canorus', 'Cyanistes caeruleus', 'Delichon urbicum',
  'Fulica atra', 'Garrulus glandarius', 'Luscinia luscinia', 'Luscinia megarhynchos',
  'Pica pica', 'Riparia riparia', 'Sitta europaea'];

const photos = [require('../assets/birdPhotos/skowronek.jpg'), 
  require('../assets/birdPhotos/krzyżówka.jpg'), 
  require('../assets/birdPhotos/gęś białoczelna.jpg'),
  require('../assets/birdPhotos/gęś zbożowa.jpg'),
  require('../assets/birdPhotos/jerzyk.jpg'),
  require('../assets/birdPhotos/mewa śmieszka.jpg'),
  require('../assets/birdPhotos/gołąb miejski.jpg'),
  require('../assets/birdPhotos/grzywacz.jpg'),
  require('../assets/birdPhotos/gawron.jpg'),
  require('../assets/birdPhotos/kawka.jpg'),
  require('../assets/birdPhotos/kukułka.jpg'),
  require('../assets/birdPhotos/modraszka.jpg'),
  require('../assets/birdPhotos/oknówka.jpg'),
  require('../assets/birdPhotos/łyska.jpg'),
  require('../assets/birdPhotos/sójka.jpg'),
  require('../assets/birdPhotos/słowik szary.jpg'),
  require('../assets/birdPhotos/słowik rdzawy.jpg'),
  require('../assets/birdPhotos/sroka.jpg'),
  require('../assets/birdPhotos/brzegówka.jpg'),
  require('../assets/birdPhotos/kowalik.jpg')];

export default function Detect({navigation}) {

  const birds = names.map((name, index) => ({
    name,
    latinName: namesLatin[index],
    photo: photos[index],
    index,
  }));

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BirdDetails', { recUri: null, lab: item.index })}
      className="flex-row items-center p-4 my-2 bg-white rounded-lg shadow"
    >
      <Image source={item.photo} className="w-12 h-12 rounded-full mr-4" />
      <View className="flex-1">
        <Text className="text-lg font-bold">{item.name}</Text>
        <Text className="text-sm text-gray-600">{item.latinName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-4">
      <FlashList
        data={birds}
        renderItem={renderItem}
        estimatedItemSize={100}
        keyExtractor={item => item.index.toString()}
      />
    </View>
  );
}
