import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const baseWidth = 375;
const baseHeight = 812;

export const scale = (size: number) => (width / baseWidth) * size;
export const verticalScale = (size: number) => (height / baseHeight) * size;