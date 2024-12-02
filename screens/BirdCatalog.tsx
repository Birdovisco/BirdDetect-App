import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { BIRDS } from "../config"; // Importing bird data from config.js

export default function BirdCatalog({ navigation }) {
  const renderItem = ({ item, index }) => (
      <TouchableOpacity
          onPress={() => navigation.navigate('BirdDetails', { recUri: null, lab: index })}
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
            data={BIRDS} // Use the imported bird data
            renderItem={renderItem}
            estimatedItemSize={100}
            keyExtractor={(_, index) => index.toString()} // Use index for key extraction
        />
      </View>
  );
}
