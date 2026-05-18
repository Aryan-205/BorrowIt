import type { ComponentType } from "react";
import {
  View as RNView,
  Text as RNText,
  ScrollView as RNScrollView,
  Image as RNImage,
  TouchableOpacity as RNTouchableOpacity,
  type ViewProps,
  type TextProps,
  type ScrollViewProps,
  type ImageProps,
  type TouchableOpacityProps,
} from "react-native";

export const View = RNView as unknown as ComponentType<ViewProps>;
export const Text = RNText as unknown as ComponentType<TextProps>;
export const ScrollView = RNScrollView as unknown as ComponentType<ScrollViewProps>;
export const Image = RNImage as unknown as ComponentType<ImageProps>;
export const TouchableOpacity = RNTouchableOpacity as unknown as ComponentType<TouchableOpacityProps>;
