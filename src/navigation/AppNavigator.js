// src/navigation/AppNavigator.js
import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import EventsScreen from "../screens/EventsScreen";
import IceCreamScreen from "../screens/IceCreamScreen";
import InStoreScreen from "../screens/InStoreScreen";
import OnlineStoreScreen from "../screens/OnlineStoreScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CartScreen from "../screens/CartScreen";
import ContactScreen from "../screens/ContactScreen";
import LoginScreen from "../screens/LoginScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import AdminRoot from "../screens/admin/AdminRoot";

const Stack = createStackNavigator();

// On web: flex:1 bounds the card to the viewport height.
// Do NOT use overflow:hidden here — it would clip the sidebar menu overlay.
// Each screen's own root View handles overflow instead.
const webCardStyle =
  Platform.OS === "web"
    ? { flex: 1, backgroundColor: "#FDF6ED" }
    : { backgroundColor: "#FDF6ED" };

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, cardStyle: webCardStyle }}
        initialRouteName="Home"
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="IceCream" component={IceCreamScreen} />
        <Stack.Screen name="InStore" component={InStoreScreen} />
        <Stack.Screen name="OnlineStore" component={OnlineStoreScreen} />
        <Stack.Screen name="Products" component={OnlineStoreScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="About" component={HomeScreen} />
        <Stack.Screen name="FAQ" component={ContactScreen} />
        <Stack.Screen
          name="Admin"
          component={AdminRoot}
          options={{
            cardStyle:
              Platform.OS === "web"
                ? { flex: 1, backgroundColor: "#0F1117" }
                : { backgroundColor: "#0F1117" },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
