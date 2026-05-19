import type { ComponentType } from "react";
import {
  View as RNView,
  Text as RNText,
  ScrollView as RNScrollView,
  Image as RNImage,
  TouchableOpacity as RNTouchableOpacity,
  TextInput as RNTextInput,
  FlatList as RNFlatList,
  type ViewProps,
  type TextProps,
  type ScrollViewProps,
  type ImageProps,
  type TouchableOpacityProps,
  type TextInputProps,
} from "react-native";

export const View = RNView as unknown as ComponentType<ViewProps>;
export const Text = RNText as unknown as ComponentType<TextProps>;
export const ScrollView = RNScrollView as unknown as ComponentType<ScrollViewProps>;
export const Image = RNImage as unknown as ComponentType<ImageProps>;
export const TouchableOpacity = RNTouchableOpacity as unknown as ComponentType<TouchableOpacityProps>;
export const TextInput = RNTextInput as unknown as ComponentType<TextInputProps>;
export const FlatList = RNFlatList as unknown as typeof RNFlatList;
